import {
  type ChromaSubsampling,
  decodeJpeg,
  type DecodeJpegOptions as JpegDecodeOptions,
  encodeJpeg,
} from "@jimp/jpeg-js";
import { Format } from "@jimp/types";

export interface JPEGOptions {
  /**
   * 1 (smallest file, worst quality) to 100 (largest, best).
   * @default 100
   */
  quality?: number;
  /**
   * How much to reduce the resolution of the colour channels, which the eye
   * is less sensitive to: not at all (`"4:4:4"`), by half horizontally
   * (`"4:2:2"`) or by half both ways (`"4:2:0"`, which makes photos much
   * smaller). By default `"4:2:0"` below quality 90 and `"4:4:4"` from 90.
   */
  chromaSubsampling?: ChromaSubsampling;
  /**
   * Write a progressive JPEG, which browsers show at a low quality first and
   * refine as it downloads. It's usually a few percent smaller, but slower
   * to encode and decode.
   * @default false
   */
  progressive?: boolean;
  /**
   * Write the EXIF data of the JPEG the image was read from (camera make and
   * model, resolution, date, GPS location, ...). Orientation is set to 1, as
   * the pixels were already rotated on read, unless the image was read with
   * `exifRotate: false`, which keeps the original orientation. The pixel
   * dimensions are updated to the image's current size and the embedded
   * thumbnail is dropped.
   *
   * Off by default, as EXIF can contain private data such as the location.
   * @default false
   */
  exif?: boolean;
  /**
   * Write the image's ICC colour profile, e.g. Display P3 for iPhone photos.
   * Jimp core adds it after encoding. Pass `false` to write sRGB without a
   * profile instead: the colours are converted to sRGB first, so they still
   * look right.
   * @default true
   */
  icc?: boolean;
}

export type DecodeJpegOptions = Pick<
  JpegDecodeOptions,
  | "colorTransform"
  | "formatAsRGBA"
  | "tolerantDecoding"
  | "allowTruncated"
  | "maxResolutionInMP"
  | "maxMemoryUsageInMB"
>;

/** Wraps bytes in a Buffer without copying them. */
function toBuffer(data: Uint8Array) {
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

export default function jpeg() {
  return {
    mime: "image/jpeg",
    encode: (
      bitmap,
      { quality = 100, chromaSubsampling, progressive }: JPEGOptions = {},
    ) =>
      toBuffer(encodeJpeg(bitmap, { quality, chromaSubsampling, progressive })),
    decode: (data, options?: DecodeJpegOptions) => {
      const image = decodeJpeg(data, options);

      return { ...image, data: toBuffer(image.data) };
    },
  } satisfies Format<"image/jpeg">;
}
