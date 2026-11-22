import * as BMP from "bmp-ts";

import { scan } from "@jimp/utils";
import { Bitmap, Format } from "@jimp/types";

export type { BmpColor } from "bmp-ts";
export { BmpCompression } from "bmp-ts";

type Pretty<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
      ? Pretty<T[K]>
      : T[K];
};

export type EncodeOptions = Pretty<
  Partial<
    Pick<
      BMP.BmpImage,
      | "palette"
      | "colors"
      | "importantColors"
      | "hr"
      | "vr"
      | "reserved1"
      | "reserved2"
    >
  >
>;

export interface DecodeBmpOptions {
  toRGBA?: boolean;
  /**
   * Largest image, in megapixels, that will be decoded.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

const FILE_HEADER_SIZE = 14;
const SUPPORTED_BIT_DEPTHS = [1, 4, 8, 16, 24, 32];

/**
 * bmp-ts allocates width * height * 4 bytes straight from the header, so
 * check the header before handing the data to it.
 */
function validateHeader(data: Buffer, maxResolutionInMP: number) {
  if (data.length < FILE_HEADER_SIZE + 20) {
    throw new Error("Invalid BMP file: header is truncated");
  }

  const headerSize = data.readUInt32LE(14);
  const width = data.readInt32LE(18);
  // Negative heights mean the rows are stored top-down
  const height = Math.abs(data.readInt32LE(22));
  const bitDepth = data.readUInt16LE(28);
  const compression = data.readUInt32LE(30);

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid BMP dimensions ${width}x${height}`);
  }

  if (!SUPPORTED_BIT_DEPTHS.includes(bitDepth)) {
    throw new Error(`Unsupported BMP bit depth ${bitDepth}`);
  }

  if (width * height > maxResolutionInMP * 1_000_000) {
    throw new Error(
      `BMP dimensions ${width}x${height} exceed the maximum resolution of ${maxResolutionInMP} megapixels`
    );
  }

  const available = data.length - FILE_HEADER_SIZE - headerSize;
  const isRle =
    (compression === BMP.BmpCompression.BI_RLE8 && bitDepth === 8) ||
    (compression === BMP.BmpCompression.BI_RLE4 && bitDepth === 4);

  if (isRle) {
    // A single run-length code is 2 bytes and expands to at most 255 pixels
    if (width * height > Math.ceil(Math.max(available, 0) / 2) * 255) {
      throw new Error(
        `BMP data is too short for an RLE image of ${width}x${height}`
      );
    }
  } else {
    // Rows are padded to 4 bytes, except that the last row's padding can be missing
    const stride = Math.ceil((width * bitDepth) / 32) * 4;
    const required = stride * (height - 1) + Math.ceil((width * bitDepth) / 8);

    if (required > available) {
      throw new Error(
        `BMP data is too short for an image of ${width}x${height} at ${bitDepth} bits per pixel`
      );
    }
  }
}

function encode(image: Bitmap, options: EncodeOptions = {}) {
  scan(
    { bitmap: image },
    0,
    0,
    image.width,
    image.height,
    function (_, __, index) {
      const red = image.data[index + 0]!;
      const green = image.data[index + 1]!;
      const blue = image.data[index + 2]!;
      const alpha = image.data[index + 3]!;

      image.data[index + 0] = alpha;
      image.data[index + 1] = blue;
      image.data[index + 2] = green;
      image.data[index + 3] = red;
    }
  );

  return BMP.encode({ ...image, ...options }).data;
}

function decode(
  data: Buffer,
  { maxResolutionInMP = 100, ...options }: DecodeBmpOptions = {}
) {
  validateHeader(data, maxResolutionInMP);

  const result = BMP.decode(data, options);

  scan(
    { bitmap: result },
    0,
    0,
    result.width,
    result.height,
    function (_, __, index) {
      // const alpha = result.data[index + 0]!;
      const blue = result.data[index + 1]!;
      const green = result.data[index + 2]!;
      const red = result.data[index + 3]!;

      result.data[index + 0] = red;
      result.data[index + 1] = green;
      result.data[index + 2] = blue;
      result.data[index + 3] = 0xff;
    }
  );

  return result as Bitmap;
}

export function msBmp() {
  return {
    mime: "image/x-ms-bmp",
    encode,
    decode,
  } satisfies Format<"image/x-ms-bmp">;
}

export default function bmp() {
  return {
    mime: "image/bmp",
    encode,
    decode,
  } satisfies Format<"image/bmp">;
}
