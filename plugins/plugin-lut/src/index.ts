import { JimpClass, JimpClassSchema } from "@jimp/types";
import { z } from "zod";

import { applyLutTable, LutSchema, type Lut, type LutTable } from "./lut.js";

export { parseCubeLut } from "./cube.js";
export type { Lut };

const LutOptionsSchema = z.object({
  /**
   * How much of the graded image to use, from 0 (the original image) to 1
   * (the LUT's colors). Values outside 0-1 are clamped. (default 1)
   */
  strength: z.number().optional(),
});

export type LutOptions = z.infer<typeof LutOptionsSchema>;

/**
 * Read a Hald CLUT image as a LUT, in place. A level `L` Hald image is
 * L³ × L³ pixels, and holds a LUT with L² points per axis in the same order
 * as a .cube file: red changes fastest, then green, then blue.
 */
function haldTable(image: JimpClass): LutTable {
  const { width, height, data } = image.bitmap;
  const level = Math.round(Math.cbrt(width));

  if (width !== height || level ** 3 !== width || level < 2) {
    throw new Error(
      `A Hald CLUT image must be square, with a side of level³ pixels, like 512 × 512 for level 8. This one is ${width} × ${height}.`,
    );
  }

  return {
    size: level * level,
    data,
    channels: 4,
    scale: 1 / 255,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
  };
}

export const methods = {
  /**
   * Color grades the image with a 3D LUT (lookup table), like a "look" or
   * film emulation from a photo or video editor. Each pixel's color is
   * looked up in the LUT with tetrahedral interpolation. Alpha is unchanged.
   *
   * The LUT can be:
   *
   * - a LUT from a `.cube` file, read with `parseCubeLut`
   * - a Hald CLUT image, such as one from a film emulation pack: a square
   *   PNG of L³ × L³ pixels, like 512 × 512 for level 8
   *
   * Pass `strength` to blend the graded colors with the original ones.
   * @param lut the LUT, from `parseCubeLut` or a Hald CLUT image
   * @param options.strength how much of the graded image to use, from 0 to 1 (default 1)
   * @example
   * ```ts
   * import { readFile } from "node:fs/promises";
   * import { Jimp, parseCubeLut } from "jimp";
   *
   * const image = await Jimp.read("test/image.jpg");
   * const film = parseCubeLut(await readFile("film.cube", "utf8"));
   *
   * image.lut(film);
   *
   * // A Hald CLUT image, at half strength
   * const hald = await Jimp.read("film-hald.png");
   *
   * image.lut(hald, { strength: 0.5 });
   * ```
   */
  lut<I extends JimpClass>(
    image: I,
    lut: Lut | JimpClass,
    options: LutOptions = {},
  ) {
    const { strength = 1 } = LutOptionsSchema.parse(options);
    const amount = Math.min(1, Math.max(0, strength));
    let table: LutTable;

    if (typeof lut === "object" && lut !== null && "bitmap" in lut) {
      table = haldTable(JimpClassSchema.parse(lut) as JimpClass);

      // Grading a Hald image with itself would read pixels already changed
      if (table.data === image.bitmap.data) {
        table.data = Uint8Array.from(image.bitmap.data);
      }
    } else {
      const parsed = LutSchema.parse(lut);

      table = {
        size: parsed.size,
        data: parsed.data,
        channels: 3,
        scale: 1,
        domainMin: parsed.domainMin ?? [0, 0, 0],
        domainMax: parsed.domainMax ?? [1, 1, 1],
      };
    }

    if (amount > 0) {
      applyLutTable(image, table, amount);
    }

    return image;
  },
};
