// The pngjs-compatible sync API: PNG.sync.read and PNG.sync.write
import type { BufferLike } from "./buffer.js";
import { toBuffer, toUint8Array } from "./buffer.js";
import { ALLOWED_BIT_DEPTHS, CHANNELS, ColorType } from "./constants.js";
import type { BitDepth } from "./constants.js";
import { getDecodedInfo } from "./decode.js";
import { validateImage, writePng } from "./encode.js";
import { buildPalette, chooseFormat, getPixelStats } from "./pack.js";
import type { Palette, PixelSource } from "./pack.js";
import { decodePixels } from "./pixels.js";
import { readPng } from "./read.js";
import type {
  IccProfile,
  PaletteColor,
  PhysicalDimensions,
  PngText,
  RenderingIntent,
} from "./types.js";

/** The color types pngjs accepts for its input and output */
export type LegacyColorType = 0 | 2 | 3 | 4 | 6;

export interface ParserOptions {
  /**
   * Check the CRC of each chunk
   * @default true
   */
  checkCRC?: boolean | undefined;
  /**
   * Keep the samples at the image's bit depth instead of scaling them to 8
   * bits. 16-bit images decode to a Uint16Array.
   */
  skipRescale?: boolean | undefined;
  /**
   * Decode palette images to one palette index per pixel instead of RGBA.
   * The palette is in `palette`.
   */
  keepIndexed?: boolean | undefined;
}

export interface PackerOptions {
  /** zlib's compression level, 0-9 @default 9 */
  deflateLevel?: number | undefined;
  /** zlib's strategy, e.g. 3 (Z_RLE) or 0 (Z_DEFAULT_STRATEGY) @default 3 */
  deflateStrategy?: number | undefined;
  /** Split the image data into IDAT chunks of at most this many bytes */
  idatChunkSize?: number | undefined;
  /**
   * The background that transparent pixels are blended with when the output
   * has no alpha channel, at the output bit depth
   * @default white
   */
  bgColor?: { red: number; green: number; blue: number } | undefined;
  /**
   * Bits per sample of the input and output. 16-bit input has one sample
   * per 2 bytes, in the platform's byte order (a Uint16Array's bytes).
   * Palette (3) and grayscale (0) output can also be 1, 2 or 4 bits.
   * @default 8
   */
  bitDepth?: BitDepth | undefined;
  /**
   * The output colour type. 3 writes a palette, which needs 256 colours or
   * fewer.
   * @default 6
   */
  colorType?: LegacyColorType | undefined;
  /** The input colour type. @default 6 */
  inputColorType?: Exclude<LegacyColorType, 3> | undefined;
  /**
   * With `inputColorType` 6: whether the input has 4 samples per pixel
   * (RGBA) or 3 (RGB).
   * @default true
   */
  inputHasAlpha?: boolean | undefined;
  /** Size of the chunks the deflate stream emits @default 32768 */
  deflateChunkSize?: number | undefined;
  /**
   * Creates the deflate stream that `pack()` compresses with, e.g.
   * `zlib.createDeflate`. By default `pack()` compresses synchronously, with
   * zlib in Node.js and pako in browsers.
   */
  deflateFactory?: DeflateFactory | undefined;
  /** -1 for automatic, a filter type 0-4, or a list to choose from @default -1 */
  filterType?: number | number[] | undefined;
}

/** A Node.js-style deflate stream, as zlib.createDeflate makes */
export interface DeflateStream {
  on(event: "data", listener: (chunk: Uint8Array) => void): unknown;
  on(event: "end", listener: () => void): unknown;
  on(event: "error", listener: (error: Error) => void): unknown;
  end(data: Uint8Array): unknown;
}

export type DeflateFactory = (options: {
  chunkSize?: number;
  level?: number;
  strategy?: number;
}) => DeflateStream;

export interface Metadata {
  width: number;
  height: number;
  depth: BitDepth;
  interlace: boolean;
  /** Whether the image is a palette image */
  palette: boolean;
  /** Whether the image has colour */
  color: boolean;
  /** Whether the image has an alpha channel or tRNS transparency */
  alpha: boolean;
  /** Samples per pixel */
  bpp: 1 | 2 | 3 | 4;
  colorType: LegacyColorType;
}

export interface PNGWithMetadata extends Omit<Metadata, "palette"> {
  data: BufferLike;
  /** The gAMA chunk's gamma, 0 if there isn't one */
  gamma: number;
  /** The palette of palette images, `false` for other images */
  palette: PaletteColor[] | false;
  /** The tRNS colour of grayscale and colour images */
  transColor?: number[];
  srgb?: RenderingIntent;
  iccProfile?: IccProfile;
  physical?: PhysicalDimensions;
  text: PngText[];
  exif?: Uint8Array;
}

export function getMetadata(
  header: {
    width: number;
    height: number;
    depth: BitDepth;
    colorType: ColorType;
    interlace: boolean;
  },
  hasTransparency: boolean,
): Metadata {
  const { colorType } = header;

  return {
    width: header.width,
    height: header.height,
    depth: header.depth,
    interlace: header.interlace,
    palette: colorType === ColorType.PALETTE,
    color: (colorType & 2) !== 0,
    alpha: (colorType & 4) !== 0 || hasTransparency,
    bpp: CHANNELS[colorType] as Metadata["bpp"],
    colorType,
  };
}

export function legacyRead(
  input: Uint8Array | ArrayBuffer | string,
  options: ParserOptions = {},
): PNGWithMetadata {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : toUint8Array(input);
  const file = readPng(bytes, { checkCRC: options.checkCRC !== false });
  const indexed =
    options.keepIndexed && file.header.colorType === ColorType.PALETTE;
  const data = decodePixels(
    {
      ...file.header,
      palette: file.palette,
      transparentColor: file.transparentColor,
    },
    file.idat,
    indexed ? "indexed" : options.skipRescale ? "raw" : 8,
  );
  const info = getDecodedInfo(file);

  return {
    ...info,
    ...getMetadata(file.header, file.trns !== undefined),
    data: (data instanceof Uint8Array ? toBuffer(data) : data) as BufferLike,
    gamma: file.gamma ?? 0,
    palette: file.palette ?? false,
    transColor: file.transparentColor,
  };
}

/** An image to write: what a PNG instance or PNG.sync.read result has */
export interface LegacyImage {
  width: number;
  height: number;
  data: Uint8Array | Uint16Array;
  gamma?: number;
}

const INPUT_COLOR_TYPES = [0, 2, 4, 6];
const OUTPUT_COLOR_TYPES = [0, 2, 3, 4, 6];

/** Reads 16-bit samples in the platform's byte order */
function asUint16Array(data: Uint8Array | Uint16Array) {
  if (data instanceof Uint16Array) {
    return data;
  }

  // A Buffer from Node's pool may start at an odd offset, so copy it then
  if (data.byteOffset % 2 === 0) {
    return new Uint16Array(data.buffer, data.byteOffset, data.byteLength >> 1);
  }

  return new Uint16Array(data.slice().buffer, 0, data.byteLength >> 1);
}

/**
 * Converts the input pixels to RGBA, which the encoder takes. pngjs only
 * reads input as RGBA unless `inputColorType` or `inputHasAlpha` says
 * otherwise.
 */
function toRgba(
  image: LegacyImage,
  inputColorType: number,
  inputHasAlpha: boolean,
  sixteenBit: boolean,
): PixelSource {
  const { width, height } = image;
  const input = sixteenBit ? asUint16Array(image.data) : image.data;
  const max = sixteenBit ? 65535 : 255;
  let channels = CHANNELS[inputColorType as ColorType];

  // pngjs: RGBA input without alpha is RGB
  if (inputColorType === 6 && !inputHasAlpha) {
    channels = 3;
  }

  if (input.length < width * height * channels) {
    throw new Error(
      `Not enough pixel data: a ${width}x${height} image needs ${width * height * channels} samples, got ${input.length}`,
    );
  }

  if (channels === 4) {
    return { width, height, data: input, depth: sixteenBit ? 16 : 8 };
  }

  const length = width * height;
  const data = sixteenBit
    ? new Uint16Array(length * 4)
    : new Uint8Array(length * 4);

  for (let p = 0, i = 0, o = 0; p < length; p++, i += channels, o += 4) {
    switch (channels) {
      case 1:
        data[o] = data[o + 1] = data[o + 2] = input[i]!;
        data[o + 3] = max;
        break;
      case 2:
        data[o] = data[o + 1] = data[o + 2] = input[i]!;
        data[o + 3] = input[i + 1]!;
        break;
      default:
        data[o] = input[i]!;
        data[o + 1] = input[i + 1]!;
        data[o + 2] = input[i + 2]!;
        data[o + 3] = max;
    }
  }

  return { width, height, data, depth: sixteenBit ? 16 : 8 };
}

/** Everything needed to write a PNG, short of compressing it */
export function prepareLegacyWrite(
  image: LegacyImage,
  options: PackerOptions = {},
) {
  const {
    colorType = 6,
    inputColorType = 6,
    inputHasAlpha = true,
    bitDepth = 8,
  } = options;

  if (!OUTPUT_COLOR_TYPES.includes(colorType)) {
    throw new Error(
      `option color type:${colorType} is not supported at present`,
    );
  }

  if (!INPUT_COLOR_TYPES.includes(inputColorType)) {
    throw new Error(
      `option input color type:${inputColorType} is not supported at present`,
    );
  }

  if (![1, 2, 4, 8, 16].includes(bitDepth)) {
    throw new Error(`option bit depth:${bitDepth} is not supported at present`);
  }

  const sixteenBit = bitDepth === 16;
  const source = toRgba(image, inputColorType, inputHasAlpha, sixteenBit);

  validateImage(source);

  let depth: BitDepth = bitDepth;
  let palette: Palette | undefined;

  if (colorType === ColorType.PALETTE) {
    const stats = getPixelStats(source);

    // Without a bitDepth, use the smallest that indexes every colour
    depth = chooseFormat(source, stats, colorType, options.bitDepth).depth;
    palette = buildPalette(stats.colors!);
  } else if (!ALLOWED_BIT_DEPTHS[colorType as ColorType].includes(bitDepth)) {
    throw new Error(
      `option bit depth:${bitDepth} is not supported for color type ${colorType}`,
    );
  }

  const max = sixteenBit ? 65535 : 255;
  const bg: { red?: number; green?: number; blue?: number } =
    options.bgColor ?? {};

  return {
    source,
    header: {
      width: image.width,
      height: image.height,
      depth,
      colorType: colorType as ColorType,
      interlace: false,
    },
    pack: {
      background: {
        red: bg.red ?? max,
        green: bg.green ?? max,
        blue: bg.blue ?? max,
      },
      palette,
    },
    metadata: { gamma: image.gamma || undefined },
  };
}

export function legacyWrite(
  image: LegacyImage,
  options: PackerOptions = {},
): BufferLike {
  const { source, header, pack, metadata } = prepareLegacyWrite(image, options);

  return toBuffer(writePng(source, header, pack, metadata, options));
}
