import type { BitDepth, ColorType } from "./constants.js";

/** The IHDR chunk: how the image's pixels are stored */
export interface PngHeader {
  width: number;
  height: number;
  /** Bits per sample, or per palette index */
  depth: BitDepth;
  colorType: ColorType;
  /** Whether the pixels are stored in Adam7 interlaced order */
  interlace: boolean;
}

/** An RGBA palette entry, with 8-bit samples */
export type PaletteColor = [r: number, g: number, b: number, a: number];

/** The pHYs chunk: the intended pixel size or aspect ratio */
export interface PhysicalDimensions {
  /** Pixels per unit, horizontally */
  x: number;
  /** Pixels per unit, vertically */
  y: number;
  /**
   * "meter" if `x` and `y` are pixels per meter. "unknown" if they only give
   * the aspect ratio.
   */
  unit: "unknown" | "meter";
}

/**
 * A text chunk. Encoding writes tEXt, zTXt when `compressed`, or iTXt when the
 * text isn't Latin-1 or has a `language` or `translatedKeyword`.
 */
export interface PngText {
  /** 1-79 Latin-1 characters, e.g. "Title", "Author", "Description" */
  keyword: string;
  text: string;
  /** Whether the text is (or should be) zlib compressed */
  compressed?: boolean;
  /** The language of the text, as a BCP 47 tag like "en-GB" (iTXt only) */
  language?: string;
  /** The keyword, in the text's language (iTXt only) */
  translatedKeyword?: string;
}

/** The iCCP chunk: an ICC colour profile */
export interface IccProfile {
  /** The profile's name, 1-79 Latin-1 characters */
  name: string;
  /** The profile, uncompressed */
  data: Uint8Array;
}

/**
 * The sRGB chunk's rendering intent: 0 perceptual, 1 relative colorimetric,
 * 2 saturation, 3 absolute colorimetric
 */
export type RenderingIntent = 0 | 1 | 2 | 3;

/** Metadata stored in ancillary chunks, which encode() can also write */
export interface PngMetadata {
  /** The gAMA chunk: the image's gamma, e.g. 0.45455 for 1 / 2.2 */
  gamma?: number;
  /** The sRGB chunk: the pixels are sRGB, rendered with this intent */
  srgb?: RenderingIntent;
  iccProfile?: IccProfile;
  physical?: PhysicalDimensions;
  /** tEXt, zTXt and iTXt chunks, in file order */
  text?: PngText[];
  /** The eXIf chunk: EXIF data, starting with the TIFF header */
  exif?: Uint8Array;
}

export interface DecodedPng<Data extends Uint8Array | Uint16Array = Uint8Array>
  extends PngHeader, PngMetadata {
  /**
   * The pixels, row by row, as R, G, B, A samples. 8 bits each, or 16 with
   * `outputDepth: 16`.
   */
  data: Data;
  /** The palette of palette images, with the tRNS alpha applied */
  palette?: PaletteColor[];
  /**
   * The tRNS colour of grayscale and colour images: pixels with this gray
   * value, or these R, G, B values, are transparent. The samples are at the
   * image's bit depth.
   */
  transparentColor?: number[];
  text: PngText[];
}

export interface DecodeOptions {
  /**
   * Check the CRC of each chunk. A wrong CRC in a chunk the image needs is an
   * error, while chunks with only metadata are skipped.
   * @default true
   */
  checkCRC?: boolean;
  /**
   * The bit depth of the decoded samples. 16 returns a Uint16Array, which
   * keeps the full precision of 16-bit images.
   * @default 8
   */
  outputDepth?: 8 | 16;
}

/** An RGBA image to encode */
export interface ImageData<Data extends Uint8Array | Uint16Array = Uint8Array> {
  width: number;
  height: number;
  /**
   * The pixels, row by row, as R, G, B, A samples: 8 bits each in a
   * Uint8Array (or Buffer), 16 in a Uint16Array
   */
  data: Data;
}

export interface EncodeOptions extends PngMetadata {
  /**
   * The colour type to write. By default the smallest one that stores the
   * image without loss: grayscale if every pixel is gray, a palette if there
   * are 256 colours or fewer, and an alpha channel only if a pixel isn't
   * opaque.
   */
  colorType?: ColorType;
  /**
   * Bits per sample (or palette index). By default the smallest that's
   * lossless for the colour type. 16 needs 16-bit input to be lossless.
   */
  bitDepth?: BitDepth;
  /**
   * The filter for each line, or the filters to choose from. AUTO picks the
   * best of all five for each line. By default AUTO, or NONE for palette and
   * low bit depth images, as filters rarely help them.
   */
  filterType?: number | number[];
  /** @default 9 */
  deflateLevel?: number;
  /** zlib's strategy, e.g. 3 (Z_RLE) or 0 (Z_DEFAULT_STRATEGY) @default 3 */
  deflateStrategy?: number;
  /**
   * Split the compressed data into IDAT chunks of at most this many bytes.
   * By default it's one chunk, which is smallest.
   */
  idatChunkSize?: number;
  /**
   * With a colour type without alpha, blend transparent pixels with this
   * background colour. 8-bit samples for 8-bit output, 16-bit for 16-bit.
   * @default white
   */
  background?: { red: number; green: number; blue: number };
  /** Write the image interlaced (Adam7). Bigger, but it can show early. */
  interlace?: boolean;
}
