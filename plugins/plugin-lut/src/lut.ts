import { JimpClass } from "@jimp/types";
import { z } from "zod";

import { MAX_CUBE_SIZE } from "./cube.js";

const RgbSchema = z.tuple([z.number(), z.number(), z.number()]);

export const LutSchema = z
  .object({
    /** The name of the LUT, from a .cube file's `TITLE` */
    title: z.string().optional(),
    /** How many points the LUT has along each of red, green and blue */
    size: z.number().int().min(2).max(MAX_CUBE_SIZE),
    /**
     * The input red, green and blue (0 to 1) that map to the first point of
     * each axis (default `[0, 0, 0]`)
     */
    domainMin: RgbSchema.optional(),
    /**
     * The input red, green and blue (0 to 1) that map to the last point of
     * each axis (default `[1, 1, 1]`)
     */
    domainMax: RgbSchema.optional(),
    /**
     * The output red, green and blue of each point, usually from 0 to 1:
     * `size`³ × 3 numbers, with red changing fastest, then green, then blue,
     * as in a .cube file. A plain array works too, e.g. from JSON.
     */
    data: z.custom<Float32Array | Float64Array | number[]>(
      (value) =>
        value instanceof Float32Array ||
        value instanceof Float64Array ||
        Array.isArray(value),
      "data must be a Float32Array, a Float64Array or an array of numbers",
    ),
  })
  .superRefine((lut, ctx) => {
    if (lut.data.length !== lut.size ** 3 * 3) {
      ctx.addIssue({
        code: "custom",
        path: ["data"],
        message: `data must have size³ × 3 = ${lut.size ** 3 * 3} numbers, got ${lut.data.length}`,
      });
    }

    const min = lut.domainMin ?? [0, 0, 0];
    const max = lut.domainMax ?? [1, 1, 1];

    if (min.some((value, c) => !(value < max[c]!))) {
      ctx.addIssue({
        code: "custom",
        path: ["domainMax"],
        message: "domainMin must be less than domainMax in each channel",
      });
    }
  });

/**
 * A 3D LUT: a grid of colors that each input color is looked up in. Make one
 * from a .cube file with `parseCubeLut`.
 */
export type Lut = z.infer<typeof LutSchema>;

/** A LUT's grid, read in place from a `Lut` or a Hald image's pixels */
export interface LutTable {
  /** Points along each axis */
  size: number;
  /** The grid's values */
  data: ArrayLike<number>;
  /** How many values each point takes in `data`: 3 for RGB, 4 for RGBA */
  channels: number;
  /** Multiplies a value in `data` to get an output from 0 to 1 */
  scale: number;
  domainMin: readonly number[];
  domainMax: readonly number[];
}

/** For each 8-bit input of one channel: the grid point below it, and how far it is past it */
function axis(size: number, min: number, max: number) {
  const index = new Int32Array(256);
  const fraction = new Float32Array(256);

  for (let value = 0; value < 256; value++) {
    const t = Math.min(1, Math.max(0, (value / 255 - min) / (max - min)));
    const position = t * (size - 1);
    // The last point has no point after it, so use the cell below it
    const below = Math.min(Math.floor(position), size - 2);

    index[value] = below;
    fraction[value] = position - below;
  }

  return { index, fraction };
}

/**
 * Maps every pixel of the image through the LUT with tetrahedral
 * interpolation, and blends the result with the original by `strength`.
 * Alpha is unchanged.
 */
export function applyLutTable(
  image: JimpClass,
  table: LutTable,
  strength: number,
) {
  const { size, data: grid, channels, scale } = table;
  const red = axis(size, table.domainMin[0]!, table.domainMax[0]!);
  const green = axis(size, table.domainMin[1]!, table.domainMax[1]!);
  const blue = axis(size, table.domainMin[2]!, table.domainMax[2]!);
  // The distance in `grid` to the next point along each axis
  const dr = channels;
  const dg = channels * size;
  const db = channels * size * size;
  const pixels = image.bitmap.data;
  const output = scale * 255;

  for (let idx = 0; idx < pixels.length; idx += 4) {
    const r = pixels[idx]!;
    const g = pixels[idx + 1]!;
    const b = pixels[idx + 2]!;
    const fr = red.fraction[r]!;
    const fg = green.fraction[g]!;
    const fb = blue.fraction[b]!;
    const p0 = red.index[r]! * dr + green.index[g]! * dg + blue.index[b]! * db;

    // Tetrahedral interpolation: the cell around the color is split into six
    // tetrahedra by its diagonal, and the color is a weighted sum of the four
    // corners of the one it's in. Walking from the cell's first corner to its
    // last along the axes in order of their fractions, largest first, visits
    // those corners.
    //
    // f1 >= f2 >= f3 are the fractions in that order, and s1 and s2 the steps
    // along the first two axes.
    let f1 = fb;
    let f2 = fg;
    let f3 = fr;
    let s1 = db;
    let s2 = dg;

    if (fr >= fg) {
      if (fg >= fb) {
        f1 = fr;
        s1 = dr;
        f2 = fg;
        s2 = dg;
        f3 = fb;
      } else if (fr >= fb) {
        f1 = fr;
        s1 = dr;
        f2 = fb;
        s2 = db;
        f3 = fg;
      } else {
        f1 = fb;
        s1 = db;
        f2 = fr;
        s2 = dr;
        f3 = fg;
      }
    } else if (fr >= fb) {
      f1 = fg;
      s1 = dg;
      f2 = fr;
      s2 = dr;
      f3 = fb;
    } else if (fg >= fb) {
      f1 = fg;
      s1 = dg;
      f2 = fb;
      s2 = db;
      f3 = fr;
    }

    const p1 = p0 + s1;
    const p2 = p1 + s2;
    const p3 = p0 + dr + dg + db;
    const w0 = 1 - f1;
    const w1 = f1 - f2;
    const w2 = f2 - f3;

    for (let c = 0; c < 3; c++) {
      const graded =
        (grid[p0 + c]! * w0 +
          grid[p1 + c]! * w1 +
          grid[p2 + c]! * w2 +
          grid[p3 + c]! * f3) *
        output;
      const original = pixels[idx + c]!;
      const value = original + (graded - original) * strength;

      pixels[idx + c] = value <= 0 ? 0 : value >= 255 ? 255 : Math.round(value);
    }
  }
}
