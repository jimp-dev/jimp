import * as BMP from "bmp-ts";
import { buildPaletteSync, utils } from "image-q";

import { cssColorToHex, scan } from "@jimp/utils";
import { Bitmap, Format } from "@jimp/types";

export { BmpCompression } from "bmp-ts";

/** The bit depths Jimp can write */
const BIT_DEPTHS = [1, 4, 8, 16, 24, 32];

/** Options for the BMP that is written. Jimp writes uncompressed BMPs. */
export interface EncodeOptions {
  /**
   * Bits per pixel:
   * - 24 writes 8 bits each of red, green and blue.
   * - 16 writes 5 bits each of red, green and blue, for a smaller file with
   *   less colour precision.
   * - 32 writes 8 bits each of red, green, blue and alpha. BMPs are written
   *   over the image's background, so the alpha is always opaque.
   * - 1, 4 and 8 write an index into a palette of up to 2, 16 or 256
   *   colours, see `palette`.
   * @default 24
   */
  bitPP?: 1 | 4 | 8 | 16 | 24 | 32;
  /**
   * The colours of a 1, 4 or 8-bit BMP, as RGBA hex numbers or CSS colours,
   * up to 2, 16 or 256 of them. Each pixel is written as the nearest palette
   * colour. Alpha is ignored. Not used for 16, 24 and 32-bit BMPs.
   *
   * Without a palette, an image that has few enough colours is written with
   * exactly those colours. Otherwise:
   * - 1-bit BMPs are black and white: pixels whose Rec. 709 luminance is
   *   over half are white. `image.dither({ type: "floyd-steinberg" })`
   *   before writing gives a better result.
   * - 4 and 8-bit BMPs get a palette of the image's most important colours
   *   (image-q's Wu quantizer) and pixels aren't dithered.
   *   `image.quantize({ colors: 16 })` before writing dithers the image.
   */
  palette?: (number | string)[];
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

function toBmpColor(color: number): BMP.BmpColor {
  return {
    red: (color >>> 16) & 0xff,
    green: (color >>> 8) & 0xff,
    blue: color & 0xff,
    quad: 0,
  };
}

/** The palette of a 1, 4 or 8-bit BMP, as 0xRRGGBB colours */
function getPalette(
  image: Bitmap,
  bitPP: number,
  palette?: EncodeOptions["palette"],
) {
  const maxColors = 2 ** bitPP;

  if (palette) {
    if (palette.length < 1 || palette.length > maxColors) {
      throw new Error(
        `A ${bitPP}-bit BMP palette needs 1 to ${maxColors} colours, got ${palette.length}`,
      );
    }

    return palette.map((color) => cssColorToHex(color) >>> 8);
  }

  const colors = new Set<number>();

  for (let i = 0; i < image.data.length && colors.size <= maxColors; i += 4) {
    colors.add(
      (image.data[i]! << 16) | (image.data[i + 1]! << 8) | image.data[i + 2]!,
    );
  }

  if (colors.size <= maxColors) {
    return [...colors].sort((a, b) => a - b);
  }

  if (bitPP === 1) {
    return undefined;
  }

  // image-q reads the whole backing ArrayBuffer, so pass a copy that
  // starts at offset 0 instead of a view into a possibly pooled Buffer
  const points = utils.PointContainer.fromUint8Array(
    new Uint8Array(image.data),
    image.width,
    image.height,
  );

  return buildPaletteSync([points], { colors: maxColors })
    .getPointContainer()
    .getPointArray()
    .map(({ r, g, b }) => (r << 16) | (g << 8) | b);
}

function encode(
  image: Bitmap,
  { bitPP = 24, palette, hr, vr, reserved1, reserved2 }: EncodeOptions = {},
) {
  if (!BIT_DEPTHS.includes(bitPP)) {
    throw new Error(
      `Unsupported BMP bit depth ${bitPP}, use ${BIT_DEPTHS.join(", ")}`,
    );
  }

  const colors = bitPP <= 8 ? getPalette(image, bitPP, palette) : undefined;
  // 1-bit images with more than 2 colours become black and white
  const blackAndWhite = bitPP === 1 && !colors;

  scan(
    { bitmap: image },
    0,
    0,
    image.width,
    image.height,
    function (_, __, index) {
      let red = image.data[index + 0]!;
      let green = image.data[index + 1]!;
      let blue = image.data[index + 2]!;
      const alpha = image.data[index + 3]!;

      if (blackAndWhite) {
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

        red = green = blue = luminance > 127.5 ? 0xff : 0;
      }

      image.data[index + 0] = alpha;
      image.data[index + 1] = blue;
      image.data[index + 2] = green;
      image.data[index + 3] = red;
    },
  );

  // Only pass the supported options, so stray header fields can't reach bmp-ts
  return BMP.encode({
    data: image.data,
    width: image.width,
    height: image.height,
    bitPP,
    palette: (blackAndWhite ? [0, 0xffffff] : colors)?.map(toBmpColor),
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
    },
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
