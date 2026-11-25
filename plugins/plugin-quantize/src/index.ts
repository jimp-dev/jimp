import { Buffer } from "buffer";
import { JimpClass } from "@jimp/types";
import {
  applyPaletteSync,
  buildPaletteSync,
  distance,
  palette as paletteQuantizers,
  utils,
} from "image-q";
import { z } from "zod";

const QuantizeOptionsSchema = z
  .object({
    /** The number of colors, at least 1 (2 for rgbquant). Default 256 */
    colors: z.number().min(1, "colors must be at least 1").optional(),
    colorDistanceFormula: z
      .union([
        z.literal("cie94-textiles"),
        z.literal("cie94-graphic-arts"),
        z.literal("ciede2000"),
        z.literal("color-metric"),
        z.literal("euclidean"),
        z.literal("euclidean-bt709-noalpha"),
        z.literal("euclidean-bt709"),
        z.literal("manhattan"),
        z.literal("manhattan-bt709"),
        z.literal("manhattan-nommyde"),
        z.literal("pngquant"),
      ])
      .optional(),
    paletteQuantization: z
      .union([
        z.literal("neuquant"),
        z.literal("neuquant-float"),
        z.literal("rgbquant"),
        z.literal("wuquant"),
      ])
      .optional(),
    imageQuantization: z
      .union([
        z.literal("nearest"),
        z.literal("riemersma"),
        z.literal("floyd-steinberg"),
        z.literal("false-floyd-steinberg"),
        z.literal("stucki"),
        z.literal("atkinson"),
        z.literal("jarvis"),
        z.literal("burkes"),
        z.literal("sierra"),
        z.literal("two-sierra"),
        z.literal("sierra-lite"),
      ])
      .optional(),
  })
  .refine(
    (options) =>
      options.paletteQuantization !== "rgbquant" ||
      options.colors === undefined ||
      options.colors >= 2,
    { message: "colors must be at least 2 for rgbquant", path: ["colors"] },
  );

export type QuantizeOptions = z.infer<typeof QuantizeOptionsSchema>;

const PaletteOptionsSchema = z.object({
  /**
   * The most pixels to look at. Larger images are sampled on an even grid,
   * so the time taken doesn't grow with the image. Default 10000; pass
   * `image.width * image.height` to look at every pixel.
   */
  sampleSize: z.number().min(1, "sampleSize must be at least 1").optional(),
});

export type PaletteOptions = z.infer<typeof PaletteOptionsSchema>;

const PaletteCountSchema = z
  .number()
  .int("count must be a whole number")
  .min(1, "count must be at least 1")
  .max(256, "count must be at most 256");

/** One color of an image's palette, and how much of the image it covers */
export interface PaletteColor {
  /** The color, as an opaque RGBA hex number like `getPixelColor` returns */
  color: number;
  /**
   * The share of the image this color covers, from 0 to 1, counting
   * partially transparent pixels by their alpha. The weights of a palette
   * add up to 1.
   */
  weight: number;
}

const DEFAULT_SAMPLE_SIZE = 10_000;

/**
 * The bits of each channel Wu's quantizer sorts colors by. Its tables have
 * `(2 ** bits + 1) ** 4` cells, so the default of 5 bits takes about 80ms to
 * set up whatever the image size. 4 bits takes a few, and the colors aren't
 * rounded to it: each is the mean of the pixels in its cluster.
 */
const CLUSTER_BITS = 4;

/**
 * How many clusters `dominantColor` groups the image into. One cluster would
 * average every color into a muddy one; a few keep the main color apart from
 * the rest, without splitting a gradient into slivers that each look small.
 */
const DOMINANT_COLOR_CLUSTERS = 5;

/**
 * The visible pixels on an even grid of at most `sampleSize` points, as RGBA
 * bytes
 */
function samplePixels(image: JimpClass, sampleSize: number) {
  const { width, height, data } = image.bitmap;
  const step = Math.max(1, Math.sqrt((width * height) / sampleSize));
  const samples = new Uint8Array(
    Math.ceil(width / step) * Math.ceil(height / step) * 4,
  );
  let length = 0;

  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) {
      const idx = (width * Math.floor(y) + Math.floor(x)) << 2;

      if (data[idx + 3]! > 0) {
        samples[length++] = data[idx]!;
        samples[length++] = data[idx + 1]!;
        samples[length++] = data[idx + 2]!;
        samples[length++] = data[idx + 3]!;
      }
    }
  }

  return samples.subarray(0, length);
}

/**
 * Opaque copies of the pixels for Wu's quantizer, which counts every pixel
 * it's given the same: up to 4 copies of each, by alpha, so the clusters are
 * weighted by alpha. Every pixel gets at least one, so even faint colors can
 * have a cluster instead of tinting a nearby one.
 */
function toClusterPoints(samples: Uint8Array) {
  const copies = (i: number) => Math.ceil(samples[i + 3]! / 64);
  let length = 0;

  for (let i = 0; i < samples.length; i += 4) {
    length += copies(i) * 4;
  }

  const bytes = new Uint8Array(length);
  let j = 0;

  for (let i = 0; i < samples.length; i += 4) {
    for (let n = copies(i); n > 0; n--) {
      bytes[j++] = samples[i]!;
      bytes[j++] = samples[i + 1]!;
      bytes[j++] = samples[i + 2]!;
      bytes[j++] = 255;
    }
  }

  return utils.PointContainer.fromUint8Array(bytes, length / 4, 1);
}

function getPalette(
  image: JimpClass,
  count: number,
  { sampleSize = DEFAULT_SAMPLE_SIZE }: PaletteOptions,
): PaletteColor[] {
  const samples = samplePixels(image, sampleSize);

  if (samples.length === 0) {
    return [];
  }

  const quantizer = new paletteQuantizers.WuQuant(
    new distance.EuclideanBT709(),
    count,
    CLUSTER_BITS,
  );
  quantizer.sample(toClusterPoints(samples));

  const clusters = quantizer.quantizeSync().getPointContainer().getPointArray();

  // Match every pixel to its nearest cluster, by the same brightness-weighted
  // distance as image-q's default. Each cluster's color is then the mean of
  // its pixels, and its weight their total alpha, so faint pixels count less.
  const sums = clusters.map(
    () => [0, 0, 0, 0] as [number, number, number, number],
  );

  for (let i = 0; i < samples.length; i += 4) {
    const r = samples[i]!;
    const g = samples[i + 1]!;
    const b = samples[i + 2]!;
    const alpha = samples[i + 3]! / 255;
    let nearest = 0;
    let nearestDistance = Infinity;

    clusters.forEach((cluster, c) => {
      const d =
        0.2126 * (r - cluster.r) ** 2 +
        0.7152 * (g - cluster.g) ** 2 +
        0.0722 * (b - cluster.b) ** 2;

      if (d < nearestDistance) {
        nearest = c;
        nearestDistance = d;
      }
    });

    const sum = sums[nearest]!;
    sum[0] += r * alpha;
    sum[1] += g * alpha;
    sum[2] += b * alpha;
    sum[3] += alpha;
  }

  // Clusters can end up with the same mean, or none of the pixels
  let total = 0;
  const weights = new Map<number, number>();

  for (const [r, g, b, weight] of sums) {
    if (weight === 0) {
      continue;
    }

    const color =
      ((Math.round(r / weight) << 24) |
        (Math.round(g / weight) << 16) |
        (Math.round(b / weight) << 8) |
        0xff) >>>
      0;

    weights.set(color, (weights.get(color) ?? 0) + weight);
    total += weight;
  }

  return [...weights]
    .map(([color, weight]) => ({ color, weight: weight / total }))
    .sort((a, b) => b.weight - a.weight);
}

export const methods = {
  /**
   * Image color number reduction.
   *
   * The palette is built from RGBA colors, so alpha is quantized along with
   * the color channels and soft edges snap to the palette's alpha values.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.quantize({ colors: 16 });
   * ```
   */
  quantize<I extends JimpClass>(image: I, options: QuantizeOptions) {
    const {
      colors,
      colorDistanceFormula,
      paletteQuantization,
      imageQuantization,
    } = QuantizeOptionsSchema.parse(options);

    // image-q reads the whole backing ArrayBuffer, so pass a copy that
    // starts at offset 0 instead of a view into a possibly pooled Buffer
    const inPointContainer = utils.PointContainer.fromUint8Array(
      new Uint8Array(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height,
    );

    const palette = buildPaletteSync([inPointContainer], {
      colors,
      colorDistanceFormula,
      paletteQuantization,
    });
    const outPointContainer = applyPaletteSync(inPointContainer, palette, {
      colorDistanceFormula,
      imageQuantization,
    });

    image.bitmap.data = Buffer.from(outPointContainer.toUint8Array());

    return image;
  },

  /**
   * The main colors of the image, most common first, with the share of the
   * image each one covers. Doesn't change the image.
   *
   * Transparent pixels don't count, and partially transparent ones count by
   * their alpha, so a logo on a transparent background gives the logo's
   * colors. Large images are sampled, see `sampleSize`.
   * @param count The most colors to return, from 1 to 256. There are fewer
   * if the image has fewer colors, and none if it's fully transparent.
   * @returns The colors, as opaque RGBA hex numbers, and their weights, which
   * add up to 1
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.palette(3);
   * // [
   * //   { color: 0x1b2a4eff, weight: 0.62 },
   * //   { color: 0xe8c07aff, weight: 0.25 },
   * //   { color: 0xf4f1eaff, weight: 0.13 },
   * // ]
   * ```
   */
  palette<I extends JimpClass>(
    image: I,
    count: number,
    options: PaletteOptions = {},
  ): PaletteColor[] {
    return getPalette(
      image,
      PaletteCountSchema.parse(count),
      PaletteOptionsSchema.parse(options),
    );
  },

  /**
   * The color that covers most of the image, as an opaque RGBA hex number.
   * Doesn't change the image.
   *
   * Transparent pixels don't count, and partially transparent ones count by
   * their alpha, so a logo on a transparent background gives the logo's
   * color. Large images are sampled, see `sampleSize`.
   * @returns The color, or `undefined` if the image is fully transparent
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.dominantColor(); // 0x1b2a4eff
   * ```
   */
  dominantColor<I extends JimpClass>(
    image: I,
    options: PaletteOptions = {},
  ): number | undefined {
    return getPalette(
      image,
      DOMINANT_COLOR_CLUSTERS,
      PaletteOptionsSchema.parse(options),
    )[0]?.color;
  },
};
