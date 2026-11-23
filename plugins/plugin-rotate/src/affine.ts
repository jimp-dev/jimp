import { Buffer } from "buffer";
import { ResizeStrategy } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { z } from "zod";

import { createSampler, drawOverBackground, snapToInteger } from "./sample.js";

/** a * d - b * c is zero, or too small to tell from zero */
function isSingular([a, b, c, d]: readonly number[]) {
  const ad = a! * d!;
  const bc = b! * c!;
  return (
    Math.abs(ad - bc) <=
    Math.max(Math.abs(ad), Math.abs(bc)) * 8 * Number.EPSILON
  );
}

const AffineOptionsSchema = z.object({
  /**
   * The transform, as `[a, b, c, d, e, f]` in the order of CSS's `matrix()`.
   * Each point of the image moves to `x' = a * x + c * y + e` and
   * `y' = b * x + d * y + f`, with the origin at the centre of the image and
   * y pointing down.
   */
  matrix: z
    .tuple([
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
      z.number(),
    ])
    .readonly()
    .refine((matrix) => !isSingular(matrix), {
      message:
        "The matrix can't be inverted (a * d - b * c is 0), so it would flatten the image into a line or a point",
    }),
  /**
   * How to sample the pixels. The nearest pixel is taken by default, which
   * keeps hard edges. A `ResizeStrategy` interpolates the pixels, for smooth
   * edges and lines.
   */
  mode: z.nativeEnum(ResizeStrategy).optional(),
  /**
   * Whether to resize the canvas to fit the transformed image. `true` (the
   * default) makes the canvas the size of the transformed image's bounding
   * box, so `e` and `f` have no effect. `false` keeps the width and height of
   * the image, and crops whatever is transformed outside of it.
   */
  fit: z.boolean().optional(),
});

export type AffineOptions = z.infer<typeof AffineOptionsSchema>;

const SkewAngleSchema = z
  .number()
  .refine((deg) => Math.abs(Math.cos((deg * Math.PI) / 180)) > 1e-10, {
    message:
      "Skew angles can't be 90 degrees (or 90 plus a multiple of 180), it would make the image infinitely long",
  });

const SkewOptionsSchema = z.object({
  /** the number of degrees to skew the image along the x axis, like CSS's `skewX()` */
  x: SkewAngleSchema.optional(),
  /** the number of degrees to skew the image along the y axis, like CSS's `skewY()` */
  y: SkewAngleSchema.optional(),
  /** How to sample the pixels, like `affine`'s `mode` */
  mode: AffineOptionsSchema.shape.mode,
  /** Whether to resize the canvas to fit the skewed image, like `affine`'s `fit` */
  fit: AffineOptionsSchema.shape.fit,
});

export type SkewOptions = z.infer<typeof SkewOptionsSchema>;

export function affine<I extends JimpClass>(image: I, options: AffineOptions) {
  const { matrix, mode, fit = true } = AffineOptionsSchema.parse(options);
  const [a, b, c, d, e, f] = matrix;

  if (a === 1 && b === 0 && c === 0 && d === 1 && (fit || (!e && !f))) {
    return image;
  }

  const srcW = image.bitmap.width;
  const srcH = image.bitmap.height;
  const det = a * d - b * c;
  // the inverse, which maps the destination back onto the source
  const ia = d / det;
  const ib = -b / det;
  const ic = -c / det;
  const id = a / det;
  // the rounding error of the coordinates grows with the size of the image
  // and of the numbers in the matrix
  const tolerance =
    (srcW + srcH + Math.abs(e) + Math.abs(f)) *
    Math.max(1, ...[a, b, c, d, ia, ib, ic, id].map(Math.abs)) *
    Number.EPSILON *
    8;

  // the source point of the centre of the top left pixel of a w x h canvas,
  // whose centre is the point (originX, originY) of the transformed image
  const sourceOrigin = (w: number, h: number, originX = 0, originY = 0) => {
    const px = 0.5 - w / 2 + originX - e;
    const py = 0.5 - h / 2 + originY - f;
    return [
      ia * px + ic * py + srcW / 2,
      ib * px + id * py + srcH / 2,
    ] as const;
  };
  // how far a coordinate is from a whole number: the edges between pixels
  // are at whole numbers, and their centres at half pixels
  const fromWhole = (n: number) => {
    const t = snapToInteger(n, tolerance);
    return Math.abs(t - Math.round(t));
  };

  let w = srcW;
  let h = srcH;
  let [sourceX0, sourceY0] = sourceOrigin(w, h);

  if (fit) {
    // the bounding box of the transformed image, which is centred on (e, f)
    const boxW = Math.max(
      1,
      Math.ceil(Math.abs(a) * srcW + Math.abs(c) * srcH - tolerance),
    );
    const boxH = Math.max(
      1,
      Math.ceil(Math.abs(b) * srcW + Math.abs(d) * srcH - tolerance),
    );
    let best = -1;

    // A canvas a pixel wider or taller moves the samples by half a pixel. Like
    // rotate, use it if that moves the samples off the edges between source
    // pixels, where the nearest pixel is a coin toss and the image would look
    // shifted, towards their centres. Score each size by the sample closest
    // to an edge, around the centre of the image.
    for (const [cw, ch] of [
      [boxW, boxH],
      [boxW + 1, boxH],
      [boxW, boxH + 1],
      [boxW + 1, boxH + 1],
    ] as const) {
      const [sx, sy] = sourceOrigin(cw, ch, e, f);
      let score = Infinity;

      for (let y = (ch >> 1) - 2; y <= (ch >> 1) + 2; y++) {
        for (let x = (cw >> 1) - 2; x <= (cw >> 1) + 2; x++) {
          score = Math.min(
            score,
            fromWhole(sx + ia * x + ic * y),
            fromWhole(sy + ib * x + id * y),
          );
        }
      }

      if (score > best + tolerance) {
        best = score;
        w = cw;
        h = ch;
        sourceX0 = sx;
        sourceY0 = sy;
      }
    }

    drawOverBackground(image);
  }

  // if every destination pixel lands on the centre of a source pixel, as it
  // does for flips, right angle rotations and whole pixel translations,
  // interpolating would only blur the image, so take the nearest pixel
  const exact =
    [ia, ib, ic, id].every((n) => {
      const t = snapToInteger(n, tolerance);
      return t % 1 === 0 && Math.abs(t) <= 1;
    }) &&
    fromWhole(sourceX0) === 0.5 &&
    fromWhole(sourceY0) === 0.5;

  const dstBuffer = Buffer.alloc(w * h * 4);
  const sample = createSampler(image, exact ? undefined : mode);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sourceX = snapToInteger(sourceX0 + ia * x + ic * y, tolerance);
      const sourceY = snapToInteger(sourceY0 + ib * x + id * y, tolerance);

      sample(sourceX, sourceY, dstBuffer, (w * y + x) << 2);
    }
  }

  image.bitmap.data = dstBuffer;
  image.bitmap.width = w;
  image.bitmap.height = h;

  return image;
}

/** tan of an angle in degrees, exact for multiples of 45 degrees */
function tan(deg: number) {
  return snapToInteger(Math.tan((deg * Math.PI) / 180), Number.EPSILON * 4);
}

export function skew<I extends JimpClass>(image: I, options: SkewOptions) {
  const { x = 0, y = 0, mode, fit } = SkewOptionsSchema.parse(options);

  return affine(image, { matrix: [1, tan(y), tan(x), 1, 0, 0], mode, fit });
}
