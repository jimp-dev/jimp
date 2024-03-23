import JPEG from "jpeg-js";
import { Format } from "@jimp/types";

export interface JPEGOptions {
  quality?: number;
}

export default function jpeg() {
  return {
    mime: "image/jpeg",
    encode: (bitmap, { quality = 100 }: JPEGOptions = {}) =>
      JPEG.encode(bitmap, quality).data,
    decode: (data) => JPEG.decode(data),
  } satisfies Format<"image/jpeg">;
}
