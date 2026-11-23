import * as BMP from "bmp-ts";

import { scan } from "@jimp/utils";
import { Bitmap, Format } from "@jimp/types";

export { BmpCompression } from "bmp-ts";

/** The bit depths Jimp can write */
const BIT_DEPTHS = [16, 24, 32];

/**
 * Options for the BMP that is written. Jimp writes uncompressed BMPs without
 * a palette.
 */
export interface EncodeOptions {
  /**
   * Bits per pixel:
   * - 24 writes 8 bits each of red, green and blue.
   * - 16 writes 5 bits each of red, green and blue, for a smaller file with
   *   less colour precision.
   * - 32 writes 8 bits each of red, green, blue and alpha. BMPs are written
   *   over the image's background, so the alpha is always opaque.
   *
   * 1, 4 and 8-bit BMPs, which need a palette, aren't supported yet, see
   * https://github.com/jimp-dev/jimp/issues/633.
   * @default 24
   */
  bitPP?: 16 | 24 | 32;
  /** Horizontal resolution, in pixels per metre */
  hr?: number;
  /** Vertical resolution, in pixels per metre */
  vr?: number;
  /** Stored in the reserved bytes of the file header, which readers ignore */
  reserved1?: number;
  /** Stored in the reserved bytes of the file header, which readers ignore */
  reserved2?: number;
}

export interface DecodeBmpOptions {
  toRGBA?: boolean;
  /**
   * Largest image, in megapixels, that will be decoded.
   * Larger images are rejected before any pixel memory is allocated.
   * @default 100
   */
  maxResolutionInMP?: number;
}

function encode(
  image: Bitmap,
  { bitPP = 24, hr, vr, reserved1, reserved2 }: EncodeOptions = {}
) {
  if (!BIT_DEPTHS.includes(bitPP)) {
    throw new Error(
      `Unsupported BMP bit depth ${bitPP}, use ${BIT_DEPTHS.join(", ")}`
    );
  }

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

  // Only pass the supported options, so a stray palette can't reach bmp-ts
  return BMP.encode({
    data: image.data,
    width: image.width,
    height: image.height,
    bitPP,
    hr,
    vr,
    reserved1,
    reserved2,
  }).data;
}

function decode(data: Buffer, options?: DecodeBmpOptions) {
  const result = BMP.decode(data, options);

  // bmp-ts only decodes alpha for 16 and 32 bit images, and makes it 0xff
  // when the header has no alpha mask. Other bit depths leave it at 0.
  const hasAlpha = result.bitPP === 16 || result.bitPP === 32;

  scan(
    { bitmap: result },
    0,
    0,
    result.width,
    result.height,
    function (_, __, index) {
      const alpha = result.data[index + 0]!;
      const blue = result.data[index + 1]!;
      const green = result.data[index + 2]!;
      const red = result.data[index + 3]!;

      result.data[index + 0] = red;
      result.data[index + 1] = green;
      result.data[index + 2] = blue;
      result.data[index + 3] = hasAlpha ? alpha : 0xff;
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
