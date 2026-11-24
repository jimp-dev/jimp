import { toBytes, type JpegData } from "./decode.js";
import { type ChromaSubsampling, encodeImage } from "./encoder/encoder.js";

export type { ChromaSubsampling };

export interface RawImageData<T = JpegData> {
  width: number;
  height: number;
  /**
   * Pixels row by row: RGBA (4 bytes per pixel, alpha is ignored), RGB (3) or
   * greyscale (1). The layout is told apart by the length.
   */
  data: T;
}

export interface EncodeJpegOptions {
  /**
   * 1 (smallest, worst) to 100 (largest, best), scaling the quantization
   * tables of the JPEG standard like libjpeg does.
   * @default 75
   */
  quality?: number;
  /**
   * How much to reduce the resolution of the colour (chroma) channels, which
   * the eye is less sensitive to: not at all (4:4:4), by half horizontally
   * (4:2:2) or by half both ways (4:2:0). By default 4:2:0 below quality 90
   * and 4:4:4 from 90, like sharp. Greyscale images have no chroma.
   */
  chromaSubsampling?: ChromaSubsampling;
  /**
   * Build Huffman tables for the image instead of using the example tables
   * of the JPEG standard, like libjpeg's `optimize_coding`. The file is
   * usually 5-15% smaller with the same pixels, but the image is transformed
   * before it's written, which takes more memory.
   * @default true
   */
  optimizeHuffman?: boolean;
  /**
   * Write a progressive JPEG, which browsers show at a low quality first and
   * refine as it downloads, with libjpeg's default scans. It's usually a few
   * percent smaller too, but takes more memory and time to encode and
   * decode. Its Huffman tables are always optimized.
   * @default false
   */
  progressive?: boolean;
  /** Text to write in COM segments, one per string. */
  comments?: string[];
  /**
   * EXIF data to write in an APP1 segment. If it doesn't start with "Exif",
   * "Exif\0" is written first, so the `exifBuffer` of a decoded JPEG can be
   * passed back in.
   */
  exif?: JpegData;
}

function channelCount(width: number, height: number, length: number) {
  const pixels = width * height;

  for (const channels of [4, 3, 1] as const) {
    if (length === pixels * channels) {
      return channels;
    }
  }

  // Like jpeg-js, extra bytes after RGBA pixels are ignored
  if (length > pixels * 4) {
    return 4;
  }

  throw new RangeError(
    `Expected ${pixels * 4} (RGBA), ${pixels * 3} (RGB) or ${pixels} (greyscale) bytes of pixel data for a ${width}x${height} image, got ${length}`,
  );
}

function checkDimension(name: string, value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 65535
  ) {
    throw new RangeError(
      `The ${name} of a JPEG must be an integer from 1 to 65535, got ${String(value)}`,
    );
  }
}

/**
 * Encodes pixels as a JPEG. Throws a `TypeError` or `RangeError` for input
 * that can't be encoded, instead of writing a broken JPEG.
 */
export function encodeJpeg(
  image: RawImageData,
  options: EncodeJpegOptions = {},
): Uint8Array {
  if (!image || typeof image !== "object") {
    throw new TypeError("Expected an image with width, height and data");
  }

  const { width, height } = image;

  checkDimension("width", width);
  checkDimension("height", height);

  const data = toBytes(image.data, "image data");
  const quality = options.quality ?? 75;

  if (typeof quality !== "number" || Number.isNaN(quality)) {
    throw new TypeError(
      `Expected the quality to be a number, got ${String(quality)}`,
    );
  }

  // Like jpeg-js, clamp to 1..100
  const clamped = Math.min(Math.max(Math.round(quality), 1), 100);
  const subsampling =
    options.chromaSubsampling ?? (clamped >= 90 ? "4:4:4" : "4:2:0");

  if (!["4:4:4", "4:2:2", "4:2:0"].includes(subsampling)) {
    throw new RangeError(
      `Expected chromaSubsampling to be "4:4:4", "4:2:2" or "4:2:0", got ${String(subsampling)}`,
    );
  }

  return encodeImage(
    { width, height, data, channels: channelCount(width, height, data.length) },
    {
      quality: clamped,
      subsampling,
      optimizeHuffman: options.optimizeHuffman ?? true,
      progressive: options.progressive ?? false,
      comments: options.comments,
      exif:
        options.exif === undefined
          ? undefined
          : toBytes(options.exif, "EXIF data"),
    },
  );
}
