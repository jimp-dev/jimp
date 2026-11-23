import { JimpClass } from "@jimp/types";
import { limit255 } from "@jimp/utils";
import { methods as color } from "@jimp/plugin-color";
import { z } from "zod";

const ThresholdOptionsSchema = z.object({
  /**
   * A number auto limited between 0 - 255, or "otsu" to pick it from the
   * image with Otsu's method (see `otsuThreshold`)
   */
  max: z.union([z.number().min(0).max(255), z.literal("otsu")]),
  /** A number auto limited between 0 - 255 (default 255)  */
  replace: z.number().min(0).max(255).optional(),
  /** A boolean whether to apply greyscale beforehand (default true)  */
  autoGreyscale: z.boolean().optional(),
});

export type ThresholdOptions = z.infer<typeof ThresholdOptionsSchema>;

const OtsuThresholdOptionsSchema = ThresholdOptionsSchema.pick({
  autoGreyscale: true,
});

export type OtsuThresholdOptions = z.infer<typeof OtsuThresholdOptionsSchema>;

/**
 * Computes the `max` that Otsu's method picks for `threshold`.
 *
 * Builds a 256-bin histogram of the luminance `threshold` compares (Rec. 709
 * greyscale when `autoGreyscale` is true, otherwise the red channel) and
 * picks the split that maximises the between-class variance.
 *
 * - Each pixel counts in proportion to its alpha: fully transparent pixels
 *   are ignored and a pixel at alpha 128 counts about half as much as an
 *   opaque one.
 * - The result is ready to pass as `max`: pixels below it are kept and pixels
 *   at or above it are replaced. It is one more than the level scikit-image's
 *   `threshold_otsu` and OpenCV's `THRESH_OTSU` report, since those return the
 *   highest value of the dark class.
 * - When several splits tie, the lowest is used, as in those libraries.
 * - If there are fewer than two distinct luminance values to separate
 *   (a uniform image, or one with no visible pixels), returns 255, so
 *   `threshold` keeps every pixel below 255 unchanged.
 *
 * @example
 * ```ts
 * import { Jimp, otsuThreshold } from "jimp";
 *
 * const image = await Jimp.read("test/image.png");
 * const level = otsuThreshold(image);
 *
 * image.threshold({ max: level });
 * ```
 */
export function otsuThreshold<I extends JimpClass>(
  image: I,
  options: OtsuThresholdOptions = {},
) {
  const { autoGreyscale = true } = OtsuThresholdOptionsSchema.parse(options);
  const { data } = image.bitmap;
  const histogram = new Array<number>(256).fill(0);

  image.scan((_, __, idx) => {
    const alpha = data[idx + 3]!;

    if (alpha === 0) {
      return;
    }

    // Flooring matches what greyscale() leaves when it writes into the Buffer
    const grey = autoGreyscale
      ? Math.floor(
          0.2126 * data[idx]! +
            0.7152 * data[idx + 1]! +
            0.0722 * data[idx + 2]!,
        )
      : data[idx]!;

    histogram[limit255(grey)]! += alpha;
  });

  let total = 0;
  let totalSum = 0;

  for (let i = 0; i < 256; i++) {
    total += histogram[i]!;
    totalSum += i * histogram[i]!;
  }

  let darkWeight = 0;
  let darkSum = 0;
  let bestVariance = 0;
  let bestLevel = 255;

  // A split at `t` puts luminance 0..t in the dark class
  for (let t = 0; t < 255; t++) {
    darkWeight += histogram[t]!;
    darkSum += t * histogram[t]!;

    const lightWeight = total - darkWeight;

    if (darkWeight === 0 || lightWeight === 0) {
      continue;
    }

    const meanDiff = darkSum / darkWeight - (totalSum - darkSum) / lightWeight;
    const variance = darkWeight * lightWeight * meanDiff * meanDiff;

    if (variance > bestVariance) {
      bestVariance = variance;
      bestLevel = t + 1;
    }
  }

  return bestLevel;
}

export const methods = {
  /**
   * Applies a minimum color threshold to a grayscale image.
   * Converts image to grayscale by default.
   *
   * Pixels with a value below `max` are kept and the rest are set to
   * `replace`. Pass `max: "otsu"` to choose `max` from the image's histogram
   * with Otsu's method; see `otsuThreshold` for how it is computed.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.threshold({ max: 150 });
   * image.threshold({ max: "otsu" });
   * ```
   */
  threshold<I extends JimpClass>(image: I, options: ThresholdOptions) {
    const parsed = ThresholdOptionsSchema.parse(options);
    let { replace = 255 } = parsed;
    const { autoGreyscale = true } = parsed;

    replace = limit255(replace);

    if (autoGreyscale) {
      color.greyscale(image);
    }

    const max =
      parsed.max === "otsu"
        ? otsuThreshold(image, { autoGreyscale: false })
        : limit255(parsed.max);

    image.scan((_, __, idx) => {
      const grey =
        image.bitmap.data[idx]! < max ? image.bitmap.data[idx]! : replace;

      image.bitmap.data[idx] = grey;
      image.bitmap.data[idx + 1] = grey;
      image.bitmap.data[idx + 2] = grey;
    });

    return image;
  },
};
