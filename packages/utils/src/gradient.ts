import { z } from "zod";

import { ColorSpace } from "./color-space.js";
import { cssColorToHex, intToRGBA } from "./index.js";

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

export const GradientStopSchema = z.object({
  /** where the color is along the gradient, from 0 (the start) to 1 (the end) */
  offset: z.number(),
  /** the color at that point */
  color: ColorSchema,
});

/**
 * A color at a point along a gradient. Gradients in `@jimp/plugin-draw`,
 * `@jimp/layout` and `gradientMap` all take a list of these.
 */
export type GradientStop = z.infer<typeof GradientStopSchema>;

/**
 * The colors along a gradient: `{ offset, color }` stops, or bare colors,
 * which are spread out evenly (the first at 0 and the last at 1). Like CSS,
 * offsets are clamped to 0-1 and each is at least the one before. Before the
 * first stop and after the last the gradient is the first and last stop's
 * color.
 */
export const GradientStopsSchema = z
  .array(z.union([GradientStopSchema, ColorSchema]))
  .min(1);

export type GradientStops = z.infer<typeof GradientStopsSchema>;

/** Gradient stops with bare colors given their evenly spread offsets */
export function normalizeStops(stops: GradientStops): GradientStop[] {
  const last = stops.length - 1;

  return stops.map((stop, i) =>
    typeof stop === "object" && "offset" in stop
      ? stop
      : { offset: last === 0 ? 0 : i / last, color: stop },
  );
}

function clamp(n: number, min: number, max: number) {
  return n < min ? min : n > max ? max : n;
}

/**
 * The r, g, b and a of a color, as pixel values from 0 to 255 in
 * `colorSpace`, the space of the image the color is for. Throws for invalid
 * colors, e.g. `Invalid color "notacolor"`.
 */
export function resolveColor(
  color: Color,
  colorSpace: ColorSpace,
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

  const { r, g, b, a } = intToRGBA(cssColorToHex(color, colorSpace));

  return [r, g, b, a];
}

/**
 * Sample a gradient's stops at `size` evenly spaced points from 0 to 1, as
 * r, g, b (whole numbers) and a for each point. Colors are interpolated in
 * the image's colour space as it's stored (gamma encoded, not linear light),
 * with premultiplied alpha, like CSS and canvas, so fading to transparent
 * doesn't go grey.
 */
export function gradientTable(
  stops: GradientStop[],
  colorSpace: ColorSpace,
  size = 1024,
) {
  // Like CSS, offsets are clamped and each is at least the one before
  let previous = 0;
  const resolved = stops.map(({ offset, color }) => {
    const [r, g, b, a] = resolveColor(color, colorSpace);
    const position = Math.max(previous, clamp(offset, 0, 1));
    const alpha = a / 255;

    previous = position;

    return { position, color: [r * alpha, g * alpha, b * alpha, a] };
  });
  const lut = new Float32Array(size * 4);
  let stop = 0;

  for (let i = 0; i < size; i++) {
    const t = size > 1 ? i / (size - 1) : 0;

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
