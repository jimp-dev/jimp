import type { JimpClass } from "@jimp/types";
import {
  ColorSchema,
  getColorSpace,
  gradientTable,
  GradientStopsSchema as StopsSchema,
  normalizeStops,
  pixelNoise,
  resolveColor,
  type Color,
  type GradientStop,
  type GradientStops,
} from "@jimp/utils";
import { z } from "zod";

export { ColorSchema, type Color, type GradientStop, type GradientStops };

/**
 * Add noise smaller than one level to each pixel before it's rounded, so a
 * smooth gradient doesn't show bands of flat color. The noise is the same
 * every time. Defaults to `false`: it makes PNGs of large gradients a lot
 * bigger, and JPEG and WebP at normal qualities smooth it away (add a little
 * `grain` for those).
 */
const DitherSchema = z.boolean().optional();

const LinearGradientSchema = z.object({
  type: z.literal("linear"),
  /** the x of the gradient's start, in image pixels */
  x1: z.number(),
  /** the y of the gradient's start */
  y1: z.number(),
  /** the x of the gradient's end */
  x2: z.number(),
  /** the y of the gradient's end */
  y2: z.number(),
  /**
   * the colors along the gradient. Before the first stop and after the last
   * the gradient is the first and last stop's color.
   */
  stops: StopsSchema,
  dither: DitherSchema,
});

/**
 * A gradient along the line from (x1, y1) to (x2, y2), like CSS's
 * `linear-gradient` and canvas's `createLinearGradient`. Coordinates are in
 * image pixels, not relative to the shape.
 */
export type LinearGradient = z.infer<typeof LinearGradientSchema>;

const RadialGradientSchema = z.object({
  type: z.literal("radial"),
  /** the x of the center, in image pixels */
  cx: z.number(),
  /** the y of the center */
  cy: z.number(),
  /** the radius where the gradient reaches offset 1 */
  r: z.number().min(0),
  /** the colors from the center (offset 0) out to the radius (offset 1) */
  stops: StopsSchema,
  dither: DitherSchema,
});

/**
 * A circular gradient from the center (cx, cy) out to radius r, like CSS's
 * `radial-gradient(circle r at cx cy, ...)`.
 */
export type RadialGradient = z.infer<typeof RadialGradientSchema>;

export const PaintSchema = z.union([
  ColorSchema,
  LinearGradientSchema,
  RadialGradientSchema,
]);

/** What to fill or stroke with: a {@link Color} or a gradient */
export type Paint = z.infer<typeof PaintSchema>;

// Gradients are looked up in a table this big
const LUT_SIZE = 1024;

/** A paint resolved for one image, ready to draw with */
export interface ResolvedPaint {
  /** the color, for solid paints: r, g, b and a from 0 to 255 */
  color?: [number, number, number, number];
  /**
   * for gradients, the r, g, b and a of LUT_SIZE points along it. r, g and b
   * are whole numbers unless the gradient is dithered.
   */
  lut?: Float32Array;
  /** for gradients, whether to dither them */
  dither?: boolean;
  /** for gradients, the position along it of the point (x, y), from 0 to 1 */
  at?: (x: number, y: number) => number;
}

/**
 * Resolve a paint for an image: CSS colors are parsed and converted to the
 * image's colour space, and gradients are sampled. Throws for invalid
 * colors, e.g. `Invalid color "notacolor"`.
 */
export function resolvePaint(
  paint: Paint,
  image: Pick<JimpClass, "iccProfile">,
): ResolvedPaint {
  const colorSpace = getColorSpace(image);

  if (typeof paint !== "object" || !("type" in paint)) {
    return { color: resolveColor(paint, colorSpace) };
  }

  const lut = gradientTable(normalizeStops(paint.stops), colorSpace, LUT_SIZE);
  const dither = paint.dither ?? false;

  // Without dithering, colors are rounded once here rather than per pixel
  if (!dither) {
    for (let i = 0; i < lut.length; i += 4) {
      lut[i] = Math.round(lut[i]!);
      lut[i + 1] = Math.round(lut[i + 1]!);
      lut[i + 2] = Math.round(lut[i + 2]!);
    }
  }

  if (paint.type === "linear") {
    const { x1, y1 } = paint;
    const dx = paint.x2 - x1;
    const dy = paint.y2 - y1;
    const length2 = dx * dx + dy * dy;

    // A gradient with no length is its last color, like SVG
    if (length2 === 0) {
      return { lut, dither, at: () => 1 };
    }

    return {
      lut,
      dither,
      at: (x, y) => ((x - x1) * dx + (y - y1) * dy) / length2,
    };
  }

  const { cx, cy, r } = paint;

  if (r === 0) {
    return { lut, dither, at: () => 1 };
  }

  return { lut, dither, at: (x, y) => Math.hypot(x - cx, y - cy) / r };
}

/**
 * Draw a color over the pixel at `i` with source-over compositing and
 * straight alpha, the same maths as Jimp's `composite`. `alpha` is from 0 to 1.
 * `dither`, from -0.5 to 0.5, is added to each channel before it's rounded.
 */
export function blendPixel(
  data: Uint8Array,
  i: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
  dither = 0,
) {
  if (alpha >= 1) {
    // Colors from 0 to 255 plus less than half a level round to 0 to 255
    data[i] = Math.round(r + dither);
    data[i + 1] = Math.round(g + dither);
    data[i + 2] = Math.round(b + dither);
    data[i + 3] = 255;
    return;
  }

  if (alpha <= 0) {
    return;
  }

  const under = (data[i + 3]! / 255) * (1 - alpha);
  const out = alpha + under;

  data[i] = Math.round((r * alpha + data[i]! * under) / out + dither);
  data[i + 1] = Math.round((g * alpha + data[i + 1]! * under) / out + dither);
  data[i + 2] = Math.round((b * alpha + data[i + 2]! * under) / out + dither);
  data[i + 3] = Math.round(out * 255 + dither);
}

/** Draw a paint over pixels x0 to x1 of row y, each as much as `coverage` says */
export function paintRow(
  data: Uint8Array,
  width: number,
  paint: ResolvedPaint,
  y: number,
  x0: number,
  x1: number,
  coverage: ArrayLike<number>,
) {
  const { color, lut, at, dither } = paint;
  let i = (y * width + x0) * 4;

  if (color) {
    const [r, g, b, a] = color;
    const alpha = a / 255;

    for (let x = x0; x < x1; x++, i += 4) {
      const c = coverage[x]!;

      if (c > 0) {
        blendPixel(data, i, r, g, b, alpha * c);
      }
    }

    return;
  }

  const last = LUT_SIZE - 1;
  const py = y + 0.5;

  for (let x = x0; x < x1; x++, i += 4) {
    const c = coverage[x]!;

    if (c > 0) {
      const t = at!(x + 0.5, py);
      const j = Math.round((t < 0 ? 0 : t > 1 ? 1 : t) * last) * 4;

      blendPixel(
        data,
        i,
        lut![j]!,
        lut![j + 1]!,
        lut![j + 2]!,
        (lut![j + 3]! / 255) * c,
        dither ? pixelNoise(x, y) - 0.5 : 0,
      );
    }
  }
}
