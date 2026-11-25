import { Buffer } from "buffer";
import * as BMP from "bmp-ts";
import png, { PNGColorType } from "@jimp/js-png";
import { methods as resize } from "@jimp/plugin-resize";
import { Bitmap, Format, JimpClass } from "@jimp/types";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
/** The 6-byte ICONDIR is followed by a 16-byte ICONDIRENTRY per image */
const DIRECTORY_SIZE = 6;
const ENTRY_SIZE = 16;
/** The largest width and height a directory entry can store */
const MAX_SIZE = 256;
/** The bit depths bmp-ts decodes */
const BIT_DEPTHS = [1, 4, 8, 16, 24, 32];
/** Channels per PNG colour type */
const PNG_CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

/** An image in an ICO (or CUR) file */
export interface IcoEntry {
  /** Position in the file, which the `index` decode option takes */
  index: number;
  width: number;
  height: number;
  /** Bits per pixel */
  bitDepth: number;
  /** Whether the image is stored as a PNG or a BMP */
  format: "png" | "bmp";
}

interface Entry extends IcoEntry {
  data: Buffer;
}

export interface DecodeIcoOptions {
  /**
   * Decode the image at this position in the file. `readIcoEntries` lists
   * the images.
   */
  index?: number;
  /**
   * Decode the image whose longest side best fits this size: the smallest
   * image at least this big, or the largest image if they're all smaller.
   * Of images the same size, the one with the most bits per pixel is used.
   */
  size?: number;
  /**
   * Largest image, in megapixels, that will be decoded. Checked against the
   * chosen image's own header before it's decoded.
   * @default Infinity
   */
  maxResolutionInMP?: number;
}

export interface EncodeIcoOptions {
  /**
   * Write an image for each size, scaled to fit in a square of that size,
   * e.g. `[16, 32, 48, 256]`. Sizes are clamped to 1-256.
   * By default the ICO holds just the image, scaled down to fit in 256x256
   * if it's larger.
   */
  sizes?: number[];
}

function isPng(data: Buffer) {
  return (
    data.length >= PNG_SIGNATURE.length &&
    PNG_SIGNATURE.equals(data.subarray(0, PNG_SIGNATURE.length))
  );
}

function readEntries(data: Buffer): Entry[] {
  const type = data.length >= DIRECTORY_SIZE ? data.readUInt16LE(2) : 0;

  // Type 1 is an icon and type 2 a cursor, which only adds a hotspot
  if (data.length < DIRECTORY_SIZE || data.readUInt16LE(0) !== 0 || !type) {
    throw new Error("Invalid ICO file: it doesn't start with an ICO header");
  }

  if (type > 2) {
    throw new Error(`Invalid ICO file: unknown image type ${type}`);
  }

  const count = data.readUInt16LE(4);

  if (count === 0) {
    throw new Error("Invalid ICO file: it contains no images");
  }

  if (DIRECTORY_SIZE + count * ENTRY_SIZE > data.length) {
    throw new Error(
      `Invalid ICO file: the directory of ${count} images is truncated`,
    );
  }

  return Array.from({ length: count }, (_, index) => {
    const entry = DIRECTORY_SIZE + index * ENTRY_SIZE;
    const size = data.readUInt32LE(entry + 8);
    const offset = data.readUInt32LE(entry + 12);

    if (offset + size > data.length) {
      throw new Error(
        `Invalid ICO file: image ${index} is past the end of the file`,
      );
    }

    const image = data.subarray(offset, offset + size);

    // The directory's sizes can't describe images larger than 256 pixels, and
    // its bit depth is often 0, so read them from the image itself
    if (isPng(image)) {
      if (image.length < 26) {
        throw new Error(`Invalid ICO file: image ${index} is truncated`);
      }

      return {
        index,
        width: image.readUInt32BE(16),
        height: image.readUInt32BE(20),
        bitDepth: image[24]! * (PNG_CHANNELS[image[25]!] ?? 1),
        format: "png",
        data: image,
      };
    }

    if (image.length < 40) {
      throw new Error(`Invalid ICO file: image ${index} is truncated`);
    }

    return {
      index,
      width: image.readInt32LE(4),
      // The height covers both the colours and the transparency mask
      height: Math.floor(image.readInt32LE(8) / 2),
      bitDepth: image.readUInt16LE(14),
      format: "bmp",
      data: image,
    };
  });
}

/**
 * List the images in an ICO or CUR file, to pick one to decode with the
 * `index` decode option.
 * @example
 * ```ts
 * import { Jimp } from "jimp";
 * import { readIcoEntries } from "@jimp/js-ico";
 *
 * const icons = await Promise.all(
 *   readIcoEntries(buffer).map(({ index }) =>
 *     Jimp.read(buffer, { "image/x-icon": { index } })
 *   )
 * );
 * ```
 */
export function readIcoEntries(data: Buffer | Uint8Array): IcoEntry[] {
  const buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);

  return readEntries(buffer).map(
    ({ index, width, height, bitDepth, format }) => ({
      index,
      width,
      height,
      bitDepth,
      format,
    }),
  );
}

/** Whether `a` has more pixels, or as many and more bits per pixel */
function isLarger(a: Entry, b: Entry) {
  const pixels = a.width * a.height - b.width * b.height;
  return pixels > 0 || (pixels === 0 && a.bitDepth > b.bitDepth);
}

function pickEntry(entries: Entry[], { index, size }: DecodeIcoOptions) {
  if (index !== undefined) {
    const entry = entries[index];

    if (!entry) {
      throw new Error(
        `ICO image index ${index} is out of range, the file has ${entries.length} images`,
      );
    }

    return entry;
  }

  const side = (entry: Entry) => Math.max(entry.width, entry.height);
  const largeEnough =
    size === undefined ? [] : entries.filter((entry) => side(entry) >= size);

  if (largeEnough.length === 0) {
    return entries.reduce((a, b) => (isLarger(b, a) ? b : a));
  }

  return largeEnough.reduce((best, entry) => {
    const difference = side(entry) - side(best);
    return difference < 0 ||
      (difference === 0 && entry.bitDepth > best.bitDepth)
      ? entry
      : best;
  });
}

/**
 * A BMP in an ICO has no file header and is followed by a 1 bit mask, where
 * set bits are transparent. Its height counts the rows of both.
 */
function decodeBmp({ data, index, width, height, bitDepth }: Entry): Bitmap {
  if (!BIT_DEPTHS.includes(bitDepth)) {
    throw new Error(`Unsupported BMP bit depth ${bitDepth}`);
  }

  const headerSize = data.readUInt32LE(0);
  const compression = data.readUInt32LE(16);
  const colors = data.readUInt32LE(32);
  // Mirror how bmp-ts finds the end of the header and palette
  const masks =
    headerSize === 40 && compression === BMP.BmpCompression.BI_BIT_FIELDS
      ? 12
      : headerSize === 40 &&
          compression === BMP.BmpCompression.BI_ALPHA_BIT_FIELDS
        ? 16
        : 0;
  const paletteLength =
    bitDepth <= 8 || colors > 0 ? colors || 1 << bitDepth : 0;
  const pixelOffset = headerSize + masks + paletteLength * 4;

  if (pixelOffset > data.length) {
    throw new Error(`Invalid ICO file: image ${index} is truncated`);
  }

  const stride = Math.ceil((width * bitDepth) / 32) * 4;
  const maskOffset = pixelOffset + stride * height;
  const maskStride = Math.ceil(width / 32) * 4;

  // bmp-ts reads BMP files, so give it a file header and the real height
  const file = Buffer.alloc(14 + data.length);

  file.write("BM", 0, "latin1");
  file.writeUInt32LE(file.length, 2);
  file.writeUInt32LE(14 + pixelOffset, 10);
  data.copy(file, 14);
  file.writeInt32LE(height, 14 + 8);

  const bitmap = BMP.decode(file, { toRGBA: true });
  let hasAlpha = false;

  // bmp-ts ignores the alpha byte of 32 bit pixels without an alpha mask, but
  // in an ICO it is the alpha
  if (bitDepth === 32) {
    for (let y = 0; y < height; y++) {
      const row = pixelOffset + (height - 1 - y) * stride;

      for (let x = 0; x < width; x++) {
        const alpha = data[row + x * 4 + 3]!;

        bitmap.data[(y * width + x) * 4 + 3] = alpha;
        hasAlpha ||= alpha !== 0;
      }
    }
  }

  // Use the mask for images without alpha, including 32 bit images whose
  // alpha is all 0. Pixels the mask inverts, rather than hides, are made
  // transparent too. Without a mask the image is opaque.
  if (!hasAlpha) {
    for (let y = 0; y < height; y++) {
      const row = maskOffset + (height - 1 - y) * maskStride;

      for (let x = 0; x < width; x++) {
        const byte = row + (x >> 3);
        const transparent =
          byte < data.length && (data[byte]! >> (7 - (x & 7))) & 1;

        bitmap.data[(y * width + x) * 4 + 3] = transparent ? 0 : 0xff;
      }
    }
  }

  return { data: bitmap.data, width, height };
}

function decode(data: Buffer, options: DecodeIcoOptions = {}): Bitmap {
  const entry = pickEntry(readEntries(data), options);
  const { maxResolutionInMP } = options;

  if (
    maxResolutionInMP !== undefined &&
    Math.abs(entry.width * entry.height) > maxResolutionInMP * 1_000_000
  ) {
    throw new Error(
      `ICO dimensions ${entry.width}x${Math.abs(entry.height)} exceed the maximum resolution of ${maxResolutionInMP} megapixels`,
    );
  }

  return entry.format === "png" ? png().decode(entry.data) : decodeBmp(entry);
}

/** Scale the image to fit in a square of the given size */
function scaleToFit(bitmap: Bitmap, size: number): Bitmap {
  const scale = size / Math.max(bitmap.width, bitmap.height);

  if (scale === 1) {
    return bitmap;
  }

  // Resize a copy, the bitmap is the image's own
  const image = { bitmap: { ...bitmap, data: Buffer.from(bitmap.data) } };

  resize.resize(image as JimpClass, {
    w: Math.max(1, Math.round(bitmap.width * scale)),
    h: Math.max(1, Math.round(bitmap.height * scale)),
  });

  return image.bitmap;
}

function encode(bitmap: Bitmap, { sizes }: EncodeIcoOptions = {}) {
  const images = sizes?.length
    ? [
        ...new Set(
          sizes.map((size) =>
            Math.min(Math.max(Math.round(size), 1), MAX_SIZE),
          ),
        ),
      ].map((size) => scaleToFit(bitmap, size))
    : [
        Math.max(bitmap.width, bitmap.height) > MAX_SIZE
          ? scaleToFit(bitmap, MAX_SIZE)
          : bitmap,
      ];
  // Older versions of Windows only read 32 bit RGBA PNGs in icons
  const pngs = images.map((image) =>
    png().encode(image, { colorType: PNGColorType.COLOR_ALPHA }),
  );
  const directory = Buffer.alloc(DIRECTORY_SIZE + images.length * ENTRY_SIZE);
  let offset = directory.length;

  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);

  images.forEach((image, index) => {
    const entry = DIRECTORY_SIZE + index * ENTRY_SIZE;
    const data = pngs[index]!;

    // 0 means 256
    directory[entry] = image.width % MAX_SIZE;
    directory[entry + 1] = image.height % MAX_SIZE;
    // Planes and bits per pixel
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([directory, ...pngs]);
}

/** The same format for the `image/vnd.microsoft.icon` MIME type */
export function msIcon() {
  return {
    mime: "image/vnd.microsoft.icon",
    hasAlpha: true,
    encode,
    decode,
  } satisfies Format<"image/vnd.microsoft.icon">;
}

/**
 * Reads ICO and CUR files and writes ICO files. Images are written as PNGs.
 */
export default function ico() {
  return {
    mime: "image/x-icon",
    hasAlpha: true,
    encode,
    decode,
  } satisfies Format<"image/x-icon">;
}
