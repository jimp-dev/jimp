import { JimpClass, JimpClassSchema } from "@jimp/types";
import { z } from "zod";

const MaskOptionsObjectSchema = z.object({
  src: JimpClassSchema,
  /** the x position to draw the image */
  x: z.number().optional(),
  /** the y position to draw the image */
  y: z.number().optional(),
});

const MaskOptionsSchema = z.union([JimpClassSchema, MaskOptionsObjectSchema]);

export type MaskOptions = z.infer<typeof MaskOptionsSchema>;

/**
 * The Y row of babl's sRGB to XYZ matrix (Bradford-adapted to D50), which is
 * what GIMP uses when it turns an sRGB colour into a greyscale mask.
 */
const LUMINANCE_RED = 0.2224879;
const LUMINANCE_GREEN = 0.7169038;
const LUMINANCE_BLUE = 0.0606083;

const SRGB_TO_LINEAR = Array.from({ length: 256 }, (_, value) => {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
});

function linearToSrgb(value: number) {
  const v =
    value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;

  return Math.min(255, Math.max(0, Math.round(v * 255)));
}

/**
 * The 8-bit grey value of a mask pixel. Grey pixels are used as they are.
 * Colour pixels are converted the way GIMP converts an sRGB image to
 * greyscale: the luminance of the linear-light colour, encoded back to sRGB.
 */
function maskGrey(r: number, g: number, b: number) {
  if (r === g && g === b) {
    return r;
  }

  return linearToSrgb(
    LUMINANCE_RED * SRGB_TO_LINEAR[r]! +
      LUMINANCE_GREEN * SRGB_TO_LINEAR[g]! +
      LUMINANCE_BLUE * SRGB_TO_LINEAR[b]!,
  );
}

export const methods = {
  /**
   * Masks this image with another image: each pixel's alpha is multiplied by the
   * mask pixel's grey value times the mask pixel's alpha, both out of 255.
   *
   * - A white, opaque mask pixel leaves the image pixel unchanged, and a black or
   *   fully transparent one makes it fully transparent.
   * - Grey mask pixels are used as they are, so a mask value of 128 on an opaque
   *   image gives an alpha of 128.
   * - Colour mask pixels are first turned into grey the way GIMP converts an sRGB
   *   image to greyscale (linear-light luminance, encoded back to sRGB).
   * - The mask is placed with its top left corner at `x`, `y`. Parts of the mask
   *   outside the image are ignored, and parts of the image the mask doesn't
   *   cover are left unchanged.
   *
   * GIMP stores layer masks as linear light, so a mask that looks 50% grey in
   * GIMP keeps about 22% of the layer, while jimp keeps 50%. To get GIMP's
   * result, convert the mask's grey values from sRGB to linear first.
   * @param options the mask image, or an object with the mask image and its position
   * @param options.src the source Jimp instance
   * @param options.x the horizontal position to blit the image
   * @param options.y the vertical position to blit the image
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   * const mask = await Jimp.read("test/mask.png");
   *
   * image.mask(mask);
   *
   * // or position the mask
   * image.mask({ src: mask, x: 10, y: 10 });
   * ```
   */
  mask<I extends JimpClass>(image: I, options: MaskOptions) {
    MaskOptionsSchema.parse(options);

    let src: JimpClass;
    let x: number;
    let y: number;

    if ("bitmap" in options) {
      src = options as unknown as JimpClass;
      x = 0;
      y = 0;
    } else {
      src = options.src as unknown as JimpClass;
      x = options.x ?? 0;
      y = options.y ?? 0;
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const w = image.bitmap.width;
    const h = image.bitmap.height;
    const startX = Math.max(0, -x);
    const startY = Math.max(0, -y);
    const endX = Math.min(src.bitmap.width, w - x);
    const endY = Math.min(src.bitmap.height, h - y);
    const { data } = src.bitmap;

    for (let sy = startY; sy < endY; sy++) {
      for (let sx = startX; sx < endX; sx++) {
        const idx = src.getPixelIndex(sx, sy);
        const dstIdx = image.getPixelIndex(x + sx, y + sy);
        const grey = maskGrey(data[idx]!, data[idx + 1]!, data[idx + 2]!);
        const alpha = image.bitmap.data[dstIdx + 3]!;

        // Round like GIMP does; 255 * 255 is odd, so this never lands on .5
        image.bitmap.data[dstIdx + 3] = Math.round(
          (alpha * grey * data[idx + 3]!) / (255 * 255),
        );
      }
    }

    return image;
  },
};
