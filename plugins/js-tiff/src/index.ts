import { Buffer } from "buffer";
import utif, { IFD, TiffTag } from "utif2";
import { Bitmap, DecodeFramesOptions, Format } from "@jimp/types";
import { writeTiff } from "./writer.js";

export interface DecodeTiffOptions {
  /**
   * Largest image, in megapixels, that will be decoded.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

/** Byte size of each TIFF field type that utif2 reads */
const TYPE_SIZES: Record<number, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  8: 2,
  9: 4,
  10: 8,
  11: 4,
  12: 8,
  13: 4,
};
/** SubIFDs, Exif, GPS and Fuji IFD pointers, which utif2 follows */
const SUB_IFD_TAGS = [330, 34665, 34853, 61440];
const DNG_PRIVATE_DATA_TAG = 50740;
const MAX_IFD_DEPTH = 16;
const MAX_BITS_PER_PIXEL = 128;

/**
 * utif2's decode reads every tag value into an array and follows the IFD
 * chain without checking either against the file. Tags can claim billions
 * of values, and an IFD that points back to itself never stops. Walk the IFDs
 * the same way utif2 does and reject those before decoding.
 *
 * In a valid file the IFDs and their values don't overlap, so together they
 * can't be larger than the file.
 */
function validateIfds(data: Buffer) {
  if (data.length < 8) {
    throw new Error("Invalid TIFF file: header is truncated");
  }

  const isLE = data[0] === 0x49 && data[1] === 0x49;
  const isBE = data[0] === 0x4d && data[1] === 0x4d;

  if (!isLE && !isBE) {
    throw new Error("Invalid TIFF file: unknown byte order");
  }

  // utif2 reads past the end of the file as zeros
  const byte = (offset: number) => data[offset] ?? 0;
  const readUint16 = (offset: number) =>
    isLE
      ? byte(offset) | (byte(offset + 1) << 8)
      : (byte(offset) << 8) | byte(offset + 1);
  const readUint32 = (offset: number) =>
    isLE
      ? (readUint16(offset) + readUint16(offset + 2) * 0x10000) >>> 0
      : (readUint16(offset) * 0x10000 + readUint16(offset + 2)) >>> 0;
  const visited = new Set<number>();
  let declaredBytes = 0;

  const addDeclaredBytes = (bytes: number) => {
    declaredBytes += bytes;

    if (declaredBytes > data.length) {
      throw new Error(
        "Invalid TIFF file: IFDs declare more data than the file holds"
      );
    }
  };

  function validateIfd(offset: number, depth: number) {
    if (depth > MAX_IFD_DEPTH) {
      throw new Error("Invalid TIFF file: IFDs are nested too deeply");
    }

    if (visited.has(offset)) {
      throw new Error(
        `Invalid TIFF file: IFD at offset ${offset} is referenced more than once`
      );
    }

    visited.add(offset);

    const count = readUint16(offset);

    addDeclaredBytes(2 + count * 12 + 4);

    for (let i = 0; i < count; i++) {
      const entry = offset + 2 + i * 12;
      const tag = readUint16(entry);
      const type = readUint16(entry + 2);
      const valueCount = readUint32(entry + 4);
      const size = TYPE_SIZES[type];

      if (!size) {
        // utif2 stops reading the IFD at a leading unknown type, otherwise skips it
        if (i === 0 && valueCount !== 0) {
          return;
        }

        continue;
      }

      const isInline = valueCount * size <= 4;
      const valueOffset = isInline ? entry + 8 : readUint32(entry + 8);

      if (!isInline) {
        addDeclaredBytes(valueCount * size);
      }

      if (tag === DNG_PRIVATE_DATA_TAG) {
        if (type !== 1 && type !== 7) {
          throw new Error(`Invalid TIFF file: tag ${tag} has type ${type}`);
        }

        // The data starts with the offset of a possible IFD
        const bytes = Buffer.alloc(4);

        for (let j = 0; j < Math.min(4, valueCount); j++) {
          bytes[j] = byte(valueOffset + j);
        }

        const ifdOffset = isLE ? bytes.readUInt32LE(0) : bytes.readUInt32BE(0);

        if (readUint16(ifdOffset) < 300) {
          validateIfd(ifdOffset, depth + 1);
        }
      } else if (SUB_IFD_TAGS.includes(tag)) {
        if (type !== 3 && type !== 4 && type !== 13) {
          throw new Error(`Invalid TIFF file: tag ${tag} has type ${type}`);
        }

        for (let j = 0; j < valueCount; j++) {
          validateIfd(
            type === 3
              ? readUint16(valueOffset + j * 2)
              : readUint32(valueOffset + j * 4),
            depth + 1
          );
        }
      }
    }
  }

  let offset = readUint32(4);

  while (true) {
    const count = readUint16(offset);
    const firstType = readUint16(offset + 4);

    // utif2 stops at an IFD that doesn't look like one
    if (count !== 0 && (firstType < 1 || firstType > 13)) {
      break;
    }

    validateIfd(offset, 0);
    offset = readUint32(offset + 2 + count * 12);

    if (offset === 0) {
      break;
    }
  }
}

function getDimensionValue(dimension: number | Uint8Array | TiffTag) {
  if (typeof dimension === "number") {
    return dimension;
  }

  if (dimension instanceof Uint8Array) {
    return dimension[0];
  }

  if (typeof dimension[0] === "string") {
    return parseInt(dimension[0]);
  }

  return dimension[0];
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function getTagValue(page: IFD, tag: number) {
  const value = page[`t${tag}`];
  return value === undefined ? undefined : getDimensionValue(value);
}

/**
 * utif2's decodeImage allocates height * ceil(width * bitsPerPixel / 8) bytes
 * for the decompressed data, and for tiled images a buffer the size of a tile.
 * Check those sizes before decoding.
 */
function validatePage(
  data: Buffer,
  page: IFD,
  width: number | undefined,
  height: number | undefined,
  maxResolutionInMP: number
) {
  const maxPixels = maxResolutionInMP * 1_000_000;

  if (!isPositiveInteger(width) || !isPositiveInteger(height)) {
    throw new Error(`Invalid TIFF dimensions ${width}x${height}`);
  }

  if (width * height > maxPixels) {
    throw new Error(
      `TIFF dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  // Mirrors how utif2's decodeImage works out the bits per pixel
  const compression = getTagValue(page, 259) ?? 1;
  const bitsPerSample = getTagValue(page, 258) ?? 1;
  const stripByteCount = getTagValue(page, 279);
  const rowsPerStrip = getTagValue(page, 278);
  let bitsPerPixel = bitsPerSample * (getTagValue(page, 277) ?? 1);

  if (
    compression === 1 &&
    stripByteCount !== undefined &&
    rowsPerStrip !== undefined &&
    getTagValue(page, 262) === 32803
  ) {
    bitsPerPixel = Math.round((stripByteCount * 8) / (width * rowsPerStrip));
  }

  if (getTagValue(page, 50885) === 4) {
    bitsPerPixel = bitsPerSample * 3;
  }

  if (!isPositiveInteger(bitsPerPixel) || bitsPerPixel > MAX_BITS_PER_PIXEL) {
    throw new Error(`Unsupported TIFF bits per pixel ${bitsPerPixel}`);
  }

  if (page.t322 !== undefined) {
    const tileWidth = getTagValue(page, 322);
    const tileHeight = getTagValue(page, 323);

    if (!isPositiveInteger(tileWidth) || !isPositiveInteger(tileHeight)) {
      throw new Error(`Invalid TIFF tile size ${tileWidth}x${tileHeight}`);
    }

    if (tileWidth * tileHeight > maxPixels) {
      throw new Error(
        `TIFF tile size ${tileWidth}x${tileHeight} exceeds the maximum resolution of ${maxResolutionInMP} megapixels`
      );
    }
  } else if (
    compression === 1 &&
    height * Math.ceil((width * bitsPerPixel) / 8) > data.length
  ) {
    throw new Error(
      `TIFF data is too short for an uncompressed image of ${width}x${height} at ${bitsPerPixel} bits per pixel`
    );
  }
}

const PHOTOMETRIC_CMYK = 5;

/**
 * utif2's toRGBA8 reads `window.UDOC` for CMYK images, which throws in Node.
 * Convert them here instead, with the same naive formula ImageMagick uses when
 * there's no color profile. utif2 has already decoded 16 bit samples to
 * little endian.
 */
function cmykToRGBA8(page: IFD) {
  const bitsPerSample = getTagValue(page, 258) ?? 1;
  const samplesPerPixel = getTagValue(page, 277) ?? 1;

  if (bitsPerSample !== 8 && bitsPerSample !== 16) {
    throw new Error(
      `Unsupported CMYK TIFF bits per sample ${bitsPerSample}, only 8 and 16 are supported`
    );
  }

  if (samplesPerPixel < 4) {
    throw new Error(
      `Invalid CMYK TIFF: expected at least 4 samples per pixel, got ${samplesPerPixel}`
    );
  }

  const data = page.data;
  const bytesPerSample = bitsPerSample / 8;
  const max = 2 ** bitsPerSample - 1;
  const scale = 255 / (max * max);
  const hasAlpha = samplesPerPixel > 4;
  const area = page.width * page.height;
  const rgba = new Uint8Array(area * 4);

  const sample = (index: number) =>
    bytesPerSample === 1
      ? data[index]!
      : data[index * 2]! | (data[index * 2 + 1]! << 8);

  for (let i = 0; i < area; i++) {
    const offset = i * samplesPerPixel;
    const k = max - sample(offset + 3);

    rgba[i * 4] = Math.round((max - sample(offset)) * k * scale);
    rgba[i * 4 + 1] = Math.round((max - sample(offset + 1)) * k * scale);
    rgba[i * 4 + 2] = Math.round((max - sample(offset + 2)) * k * scale);
    rgba[i * 4 + 3] = hasAlpha
      ? Math.round((sample(offset + 4) * 255) / max)
      : 255;
  }

  return rgba;
}

/** The width and height of a page, as decoded by utif2 */
function getPageSize(page: IFD) {
  if (!page.t256) {
    throw new Error("No image width found in TIFF");
  }

  if (!page.t257) {
    throw new Error("No image height found in TIFF");
  }

  return {
    width: getDimensionValue(page.t256),
    height: getDimensionValue(page.t257),
  };
}

/** Decode the pixels of a page that has passed validatePage */
function decodePage(data: Buffer, page: IFD): Bitmap {
  const { width, height } = getPageSize(page);

  utif.decodeImage(data, page);

  const rgba =
    getTagValue(page, 262) === PHOTOMETRIC_CMYK
      ? cmykToRGBA8(page)
      : utif.toRGBA8(page);

  return {
    data: Buffer.from(rgba),
    width,
    height,
  } as Bitmap;
}

/** Read the IFDs of the first `maxPages` pages and check their sizes */
function readPages(data: Buffer, maxResolutionInMP: number, maxPages: number) {
  validateIfds(data);

  // Maker notes aren't needed, and utif2 parses them without the checks above
  const ifds = (
    utif.decode as (
      buffer: Buffer,
      options: { parseMN: boolean; debug: boolean }
    ) => IFD[]
  )(data, { parseMN: false, debug: false });
  const pages = ifds.slice(0, maxPages);

  if (!pages[0]) {
    throw new Error("No page found in TIFF");
  }

  let pixels = 0;

  for (const page of pages) {
    const { width, height } = getPageSize(page);

    validatePage(data, page, width, height, maxResolutionInMP);
    pixels += width! * height!;

    if (pixels > maxResolutionInMP * 1_000_000) {
      throw new Error(
        `TIFF pages together exceed the maximum resolution of ${maxResolutionInMP} megapixels. Decode fewer pages with maxFrames, or raise maxResolutionInMP`
      );
    }
  }

  return pages;
}

export default function tiff() {
  return {
    mime: "image/tiff",
    encode: (bitmap) => {
      const tiff = utif.encodeImage(bitmap.data, bitmap.width, bitmap.height);
      return Buffer.from(tiff);
    },
    decode: (data, { maxResolutionInMP = 100 }: DecodeTiffOptions = {}) =>
      // Only the first page is returned, so only decode that one
      decodePage(data, readPages(data, maxResolutionInMP, 1)[0]!),
    /**
     * Decode every page of a multi-page TIFF. Pages can have different sizes.
     * `maxResolutionInMP` limits the size of all pages together.
     */
    decodeFrames: (
      data,
      { maxResolutionInMP = 100 }: DecodeTiffOptions = {},
      { maxFrames = Infinity }: DecodeFramesOptions = {}
    ) => ({
      frames: readPages(data, maxResolutionInMP, maxFrames).map((page) => ({
        bitmap: decodePage(data, page),
      })),
    }),
    /**
     * Encode a multi-page TIFF with a page for each frame. Pages can have
     * different sizes, and are stored as uncompressed RGBA.
     */
    encodeFrames: (frames) => {
      if (frames.length === 0) {
        throw new Error("Can't encode a TIFF without pages");
      }

      for (const { bitmap } of frames) {
        if (bitmap.width <= 0 || bitmap.height <= 0) {
          throw new Error(
            `Invalid TIFF dimensions ${bitmap.width}x${bitmap.height}`
          );
        }
      }

      const tiff = writeTiff(frames.map(({ bitmap }) => bitmap));

      return Buffer.from(tiff.buffer, tiff.byteOffset, tiff.byteLength);
    },
  } satisfies Format<"image/tiff", undefined, DecodeTiffOptions>;
}
