import * as BMP from "bmp-ts";

import { scan } from "@jimp/utils";
import { Bitmap, Format } from "@jimp/types";

type EncodeOptions = Partial<
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
>;

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

function decode(data: Buffer) {
  const result = BMP.decode(data);

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