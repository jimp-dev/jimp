import JPEG from "jpeg-js";
import { Format } from "@jimp/types";

export interface JPEGOptions {
  quality?: number;
}

export interface DecodeJpegOptions {
  useTArray?: false;
  colorTransform?: boolean;
  formatAsRGBA?: boolean;
  tolerantDecoding?: boolean;
  maxResolutionInMP?: number;
  maxMemoryUsageInMB?: number;
}

const EOI_MARKER = Buffer.from([0xff, 0xd9]);

/**
 * Some encoders omit the trailing EOI (end of image) marker. Image viewers
 * tolerate this, but jpeg-js throws "marker was not found", so append the
 * marker when it's missing. The caller's buffer is never modified.
 */
function ensureEoiMarker(data: Buffer) {
  const length = data.length;

  if (
    length >= 2 &&
    data[length - 2] === EOI_MARKER[0] &&
    data[length - 1] === EOI_MARKER[1]
  ) {
    return data;
  }

  return Buffer.concat([data, EOI_MARKER], length + 2);
}

export default function jpeg() {
  return {
    mime: "image/jpeg",
    encode: (bitmap, { quality = 100 }: JPEGOptions = {}) =>
      JPEG.encode(bitmap, quality).data,
    decode: (data, options?: DecodeJpegOptions) =>
      JPEG.decode(ensureEoiMarker(data), options),
  } satisfies Format<"image/jpeg">;
}
