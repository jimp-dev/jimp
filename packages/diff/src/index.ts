import { methods } from "@jimp/plugin-resize";
import { JimpClass, RGBColor } from "@jimp/types";
import { clone, cssColorToHex, getColorSpace, intToRGBA } from "@jimp/utils";
import pixelMatch from "pixelmatch";
import { z } from "zod";

const THRESHOLD_ERROR = "threshold must be a number between 0 and 1";

const ColorSchema = z.union([
  z.number(),
  z.string(),
  z.object({
    r: z.number().min(0).max(255),
    g: z.number().min(0).max(255),
    b: z.number().min(0).max(255),
  }),
]);

/**
 * A hex number (0xRRGGBBAA), a CSS color, or an `{ r, g, b }` object.
 * Alpha is ignored: pixels are always drawn opaque.
 */
export type DiffColor = z.infer<typeof ColorSchema>;

const DiffOptionsSchema = z.object({
  /** Matching threshold, 0 to 1. Smaller values make the comparison more sensitive. Defaults to 0.1. */
  threshold: z
    .number(THRESHOLD_ERROR)
    .min(0, THRESHOLD_ERROR)
    .max(1, THRESHOLD_ERROR)
    .optional(),
  /**
   * Opacity of the original image in the unchanged pixels of the output,
   * 0 (pure white) to 1 (the original brightness), clamped to that range.
   * Defaults to 0.1.
   */
  alpha: z.number().optional(),
  /** Count anti-aliased pixels as differences instead of detecting and ignoring them. Defaults to false. */
  includeAA: z.boolean().optional(),
  /** The color of anti-aliased pixels in the output. Defaults to yellow (0xffff00ff). */
  aaColor: ColorSchema.optional(),
  /** The color of different pixels in the output. Defaults to red (0xff0000ff). */
  diffColor: ColorSchema.optional(),
  /**
   * The color of pixels that are darker in `img2` than in `img1`, to tell
   * added and removed parts apart. Defaults to `diffColor`.
   */
  diffColorAlt: ColorSchema.optional(),
  /**
   * Draw only the different pixels on a transparent background (a mask),
   * instead of over a faded copy of `img1`. Anti-aliased pixels aren't drawn.
   * Defaults to false.
   */
  diffMask: z.boolean().optional(),
});

export type DiffOptions = z.infer<typeof DiffOptionsSchema>;

function toRGBTuple(
  color: DiffColor,
  image: JimpClass,
): [number, number, number] {
  const { r, g, b }: RGBColor =
    typeof color === "object"
      ? color
      : intToRGBA(cssColorToHex(color, getColorSpace(image)));

  return [Math.round(r), Math.round(g), Math.round(b)];
}

/**
 * Diffs two images and returns
 * @param img1 A Jimp image to compare
 * @param img2 A Jimp image to compare
 * @param options Options for the comparison and the output image, or the threshold as a number
 * @param options.threshold A number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 * @param options.alpha The opacity of `img1` in unchanged pixels, 0 (white) to 1 (default: 0.1)
 * @param options.includeAA Count anti-aliased pixels as differences instead of ignoring them (default: false)
 * @param options.aaColor The color of anti-aliased pixels (default: yellow)
 * @param options.diffColor The color of different pixels (default: red)
 * @param options.diffColorAlt The color of pixels that are darker in `img2` (default: `diffColor`)
 * @param options.diffMask Draw only the differences, on a transparent background (default: false)
 * @returns An object with the following properties:
 * - percent: The proportion of different pixels (0-1), where 0 means the two images are pixel identical
 * - image: A Jimp image showing differences
 * @example
 * ```ts
 * import { Jimp, diff } from "jimp";
 *
 * const image1 = await Jimp.read("test/image.png");
 * const image2 = await Jimp.read("test/image.png");
 *
 * const result = diff(image1, image2);
 *
 * result.percent; // 0.5
 * result.image; // a Jimp image showing differences
 *
 * // Only the differences, on a transparent background
 * const mask = diff(image1, image2, {
 *   threshold: 0.2,
 *   diffMask: true,
 *   diffColor: "lime",
 * });
 * ```
 */
export function diff<I extends JimpClass>(
  img1: I,
  img2: I,
  options: DiffOptions | number = {},
) {
  const {
    threshold = 0.1,
    alpha = 0.1,
    includeAA = false,
    aaColor,
    diffColor,
    diffColorAlt,
    diffMask = false,
  } = DiffOptionsSchema.parse(
    typeof options === "number" ? { threshold: options } : options,
  );

  let bmp1 = img1.bitmap;
  let bmp2 = img2.bitmap;

  if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
    if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
      // img1 is bigger
      bmp1 = methods.resize(clone(img1), {
        w: bmp2.width,
        h: bmp2.height,
      }).bitmap;
    } else {
      // img2 is bigger (or they are the same in area)
      bmp2 = methods.resize(clone(img2), {
        w: bmp1.width,
        h: bmp1.height,
      }).bitmap;
    }
  }

  // Without diffMask pixelmatch paints every pixel, so the starting color only
  // shows through a mask, where it should be transparent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diff = new (img1 as any).constructor({
    width: bmp1.width,
    height: bmp1.height,
    color: 0x00000000,
  });

  const numDiffPixels = pixelMatch(
    bmp1.data,
    bmp2.data,
    diff.bitmap.data,
    diff.bitmap.width,
    diff.bitmap.height,
    {
      threshold,
      alpha: Math.min(Math.max(alpha, 0), 1),
      includeAA,
      diffMask,
      ...(aaColor !== undefined && { aaColor: toRGBTuple(aaColor, diff) }),
      ...(diffColor !== undefined && {
        diffColor: toRGBTuple(diffColor, diff),
      }),
      ...(diffColorAlt !== undefined && {
        diffColorAlt: toRGBTuple(diffColorAlt, diff),
      }),
    },
  );

  return {
    percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
    image: diff,
  };
}
