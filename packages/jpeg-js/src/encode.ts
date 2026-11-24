import { toBytes, type JpegData } from "./decode.js";
import { encodeBaseline } from "./encoder/encoder.js";

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

  return encodeBaseline(
    { width, height, data, channels: channelCount(width, height, data.length) },
    {
      // Like jpeg-js, clamp to 1..100
      quality: Math.min(Math.max(Math.round(quality), 1), 100),
      comments: options.comments,
      exif:
        options.exif === undefined
          ? undefined
          : toBytes(options.exif, "EXIF data"),
    },
  );
}
