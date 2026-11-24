import type { JimpClass } from "@jimp/types";
import { cssColorToHex, getColorSpace, intToRGBA } from "@jimp/utils";
import { z } from "zod";

export const ColorSchema = z.union([
  z.number().int().min(0).max(0xffffffff),
  z.string(),
  z.object({
    r: z.number(),
    g: z.number(),
    b: z.number(),
    /** the alpha, from 0 to 255. Defaults to 255. */
    a: z.number().optional(),
  }),
]);

/**
 * A color: a hex number (`0xRRGGBBAA`), a CSS color string, which is
 * converted to the image's colour space, or an object of pixel values from 0
 * to 255 (`{ r, g, b, a }`, where `a` defaults to 255).
 */
export type Color = z.infer<typeof ColorSchema>;

const GradientStopSchema = z.object({
  /** where the color is along the gradient, from 0 (the start) to 1 (the end) */
  offset: z.number(),
  /** the color at that point */
  color: ColorSchema,
});

export type GradientStop = z.infer<typeof GradientStopSchema>;

const StopsSchema = z.array(GradientStopSchema).min(1);

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
   * for gradients, the r, g, b (whole numbers) and a of LUT_SIZE points
   * along it
   */
  lut?: Float32Array;
  /** for gradients, the position along it of the point (x, y), from 0 to 1 */
  at?: (x: number, y: number) => number;
}

function clamp(n: number, min: number, max: number) {
  return n < min ? min : n > max ? max : n;
}

/** The r, g, b and a of a color, as pixel values for the image */
function resolveColor(
  color: Color,
  image: Pick<JimpClass, "iccProfile">,
): [number, number, number, number] {
  if (typeof color === "object") {
    const channel = (n: number) => Math.round(clamp(n, 0, 255));

    return [
      channel(color.r),
      channel(color.g),
      channel(color.b),
      channel(color.a ?? 255),
    ];
  }

  const { r, g, b, a } = intToRGBA(cssColorToHex(color, getColorSpace(image)));

  return [r, g, b, a];
}

/**
 * Sample the gradient's stops into a table. Colors are interpolated with
 * premultiplied alpha, like CSS and canvas, so fading to transparent doesn't
 * go grey.
 */
function gradientTable(
  stops: GradientStop[],
  image: Pick<JimpClass, "iccProfile">,
) {
  // Like CSS, offsets are clamped and each is at least the one before
  let previous = 0;
  const resolved = stops.map(({ offset, color }) => {
    const [r, g, b, a] = resolveColor(color, image);
    const position = Math.max(previous, clamp(offset, 0, 1));
    const alpha = a / 255;

    previous = position;

    return { position, color: [r * alpha, g * alpha, b * alpha, a] };
  });
  const lut = new Float32Array(LUT_SIZE * 4);
  let stop = 0;

  for (let i = 0; i < LUT_SIZE; i++) {
    const t = i / (LUT_SIZE - 1);

    while (stop < resolved.length && resolved[stop]!.position <= t) {
      stop++;
    }

    // Between stops `stop - 1` and `stop`
    const before = resolved[Math.max(0, stop - 1)]!;
    const after = resolved[Math.min(resolved.length - 1, stop)]!;
    const span = after.position - before.position;
    const mix = span > 0 ? clamp((t - before.position) / span, 0, 1) : 0;
    const premultiplied = before.color.map(
      (c, channel) => c + (after.color[channel]! - c) * mix,
    );
    const a = premultiplied[3]!;
    const alpha = a / 255;

    for (let channel = 0; channel < 3; channel++) {
      lut[i * 4 + channel] =
        alpha > 0 ? Math.round(premultiplied[channel]! / alpha) : 0;
    }

    lut[i * 4 + 3] = a;
  }

  return lut;
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
  if (typeof paint !== "object" || !("type" in paint)) {
    return { color: resolveColor(paint, image) };
  }

  const lut = gradientTable(paint.stops, image);

  if (paint.type === "linear") {
    const { x1, y1 } = paint;
    const dx = paint.x2 - x1;
    const dy = paint.y2 - y1;
    const length2 = dx * dx + dy * dy;

    // A gradient with no length is its last color, like SVG
    if (length2 === 0) {
      return { lut, at: () => 1 };
    }

    return {
      lut,
      at: (x, y) => ((x - x1) * dx + (y - y1) * dy) / length2,
    };
  }

  const { cx, cy, r } = paint;

  if (r === 0) {
    return { lut, at: () => 1 };
  }

  return { lut, at: (x, y) => Math.hypot(x - cx, y - cy) / r };
}

/**
 * Draw a color over the pixel at `i` with source-over compositing and
 * straight alpha, the same maths as Jimp's `composite`. `alpha` is from 0 to 1.
 */
export function blendPixel(
  data: Uint8Array,
  i: number,
  r: number,
  g: number,
  b: number,
  alpha: number,
) {
  if (alpha >= 1) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
    return;
  }

  if (alpha <= 0) {
    return;
  }

  const under = (data[i + 3]! / 255) * (1 - alpha);
  const out = alpha + under;

  data[i] = Math.round((r * alpha + data[i]! * under) / out);
  data[i + 1] = Math.round((g * alpha + data[i + 1]! * under) / out);
  data[i + 2] = Math.round((b * alpha + data[i + 2]! * under) / out);
  data[i + 3] = Math.round(out * 255);
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
  const { color, lut, at } = paint;
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
      );
    }
  }
}
