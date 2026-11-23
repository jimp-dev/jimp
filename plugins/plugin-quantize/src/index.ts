import { Buffer } from "buffer";
import { JimpClass } from "@jimp/types";
import { applyPaletteSync, buildPaletteSync, utils } from "image-q";
import z from "zod";

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
};
