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

/**
 * bmp-ts reads the pixel data immediately after the header and palette and
 * ignores the file header's pixel data offset (bfOffBits). When there are
 * extra bytes between the palette and the pixel data, every row is shifted,
 * so the right edge of each row shows up at the left of the next one.
 * Remove the gap so the pixel data starts where bmp-ts expects it.
 */
function removePixelDataGap(data: Buffer): Buffer {
  const offset = data.readUInt32LE(10);
  const headerSize = data.readUInt32LE(14);

  if (headerSize < 40) {
    return data;
  }

  const bitPP = data.readUInt16LE(28);
  const compression = data.readUInt32LE(30);
  const colors = data.readUInt32LE(46);

  // Position where bmp-ts starts reading pixels.
  let end = 14 + headerSize;
  if (headerSize === 40 && (compression === 3 || compression === 6)) {
    end += 12; // color masks
  }
  if (headerSize === 40 && compression === 6) {
    end += 4; // alpha mask
  }
  if (bitPP <= 8 || colors > 0) {
    end += 4 * (colors === 0 ? 1 << bitPP : colors);
  }

  if (offset <= end || offset > data.length) {
    return data;
  }

  return Buffer.concat([data.subarray(0, end), data.subarray(offset)]);
}

function decode(data: Buffer, options?: DecodeBmpOptions) {
  const result = BMP.decode(removePixelDataGap(data), options);

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
