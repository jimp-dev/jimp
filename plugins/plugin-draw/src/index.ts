import type { JimpClass } from "@jimp/types";
import { z } from "zod";

import { floodFillMask } from "./flood-fill.js";
import {
  DEFAULT_TOLERANCE,
  flattenPath,
  type FlattenOptions,
  type PathData,
} from "./path.js";
import {
  paintRow,
  PaintSchema,
  resolvePaint,
  type Paint,
  type ResolvedPaint,
} from "./paint.js";
import { rasterize, type FillRule, type Polyline } from "./rasterize.js";
import { ellipsePolyline, rectPolyline, type Radii } from "./shapes.js";
import { strokePolylines, type StrokeOptions } from "./stroke.js";

export { flattenPath, type FlattenOptions, type Matrix } from "./path.js";
export type { PathCommand, PathData } from "./path.js";
export { parseSvgPath } from "./svg-path.js";
export {
  rasterize,
  type FillRule,
  type Polyline,
  type RasterizeOptions,
  type RowCallback,
} from "./rasterize.js";
export {
  strokePolylines,
  type LineCap,
  type LineJoin,
  type StrokeOptions,
} from "./stroke.js";
export { PaintSchema } from "./paint.js";
export type {
  Color,
  GradientStop,
  LinearGradient,
  Paint,
  RadialGradient,
} from "./paint.js";

/** The parts of an image the drawing functions use */
export type DrawTarget = Pick<JimpClass, "bitmap" | "iccProfile">;

export interface FillOptions {
  /** which parts of overlapping outlines are filled. Defaults to `"nonzero"`. */
  fillRule?: FillRule;
}

function fillResolved(
  image: DrawTarget,
  polylines: Iterable<Polyline>,
  paint: ResolvedPaint,
  fillRule: FillRule = "nonzero",
) {
  const { width, height, data } = image.bitmap;

  rasterize(polylines, { width, height, fillRule }, (y, x0, x1, coverage) => {
    paintRow(data, width, paint, y, x0, x1, coverage);
  });
}

/**
 * Fills polygons on an image, antialiased, compositing the paint over the
 * pixels already there. Anything outside the image is clipped.
 *
 * This and {@link fillPath} are the building blocks of the drawing methods,
 * for other plugins to draw their own shapes, like glyph outlines.
 * @example
 * ```ts
 * import { Jimp } from "jimp";
 * import { fillPolylines } from "@jimp/plugin-draw";
 *
 * const image = new Jimp({ width: 100, height: 100, color: 0xffffffff });
 * const triangle = { points: [50, 10, 90, 90, 10, 90], closed: true };
 *
 * fillPolylines(image, [triangle], "#e63946");
 * ```
 */
export function fillPolylines(
  image: DrawTarget,
  polylines: Iterable<Polyline>,
  paint: Paint,
  options: FillOptions = {},
) {
  fillResolved(
    image,
    polylines,
    resolvePaint(PaintSchema.parse(paint), image),
    options.fillRule,
  );
}

/**
 * Fills a path on an image: SVG path data or a list of commands, like the
 * glyph outlines from a font. Curves are flattened to within
 * `options.tolerance` pixels, after `options.transform` is applied.
 * @example
 * ```ts
 * import { fillPath } from "@jimp/plugin-draw";
 *
 * // A heart, twice the size and moved to (20, 20)
 * fillPath(
 *   image,
 *   "M 10 30 A 20 20 0 0 1 50 30 A 20 20 0 0 1 90 30 Q 90 60 50 90 Q 10 60 10 30 Z",
 *   "crimson",
 *   { transform: [2, 0, 0, 2, 20, 20] },
 * );
 *
 * // A glyph from opentype.js: font units have y pointing up
 * const glyph = font.charToGlyph("g");
 * const scale = 64 / font.unitsPerEm;
 *
 * fillPath(image, glyph.path.commands, "black", {
 *   transform: [scale, 0, 0, -scale, x, baseline],
 * });
 * ```
 */
export function fillPath(
  image: DrawTarget,
  path: PathData,
  paint: Paint,
  options: FillOptions & FlattenOptions = {},
) {
  fillPolylines(image, flattenPath(path, options), paint, options);
}

/**
 * Strokes a path on an image: draws its outline `options.width` pixels wide,
 * centered on the path, with the given caps and joins. The transform applies
 * to the path, not the stroke width.
 * @example
 * ```ts
 * import { strokePath } from "@jimp/plugin-draw";
 *
 * strokePath(image, "M 10 80 Q 50 10 90 80", "#1d3557", {
 *   width: 6,
 *   cap: "round",
 * });
 * ```
 */
export function strokePath(
  image: DrawTarget,
  path: PathData,
  paint: Paint,
  options: StrokeOptions & Pick<FlattenOptions, "transform"> = {},
) {
  fillPolylines(
    image,
    strokePolylines(flattenPath(path, options), options),
    paint,
  );
}

const PointSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.object({ x: z.number(), y: z.number() }),
]);

const LineCapSchema = z.enum(["butt", "round", "square"]);
const LineJoinSchema = z.enum(["miter", "round", "bevel"]);
const FillRuleSchema = z.enum(["nonzero", "evenodd"]);

const ShapeStyleSchema = z.object({
  /**
   * what to fill the shape with: a color or a gradient. Defaults to black
   * when there's no `stroke`.
   */
  fill: PaintSchema.optional(),
  /** what to draw the outline with: a color or a gradient */
  stroke: PaintSchema.optional(),
  /** the width of the outline in pixels, centered on the shape's edge. Defaults to 1. */
  strokeWidth: z.number().min(0).optional(),
});

const JoinStyleSchema = z.object({
  /** how the outline's corners look: `"miter"` (default), `"round"` or `"bevel"` */
  join: LineJoinSchema.optional(),
  /**
   * the longest a miter corner can be, as a multiple of `strokeWidth`, before
   * it's beveled. Defaults to 10.
   */
  miterLimit: z.number().min(1).optional(),
});

const OpenPathStyleSchema = JoinStyleSchema.extend({
  /** how the ends of open outlines look: `"butt"` (default), `"round"` or `"square"` */
  cap: LineCapSchema.optional(),
  /** which parts of overlapping outlines are filled: `"nonzero"` (default) or `"evenodd"` */
  fillRule: FillRuleSchema.optional(),
});

const DrawLineOptionsSchema = z.object({
  /** the x of the start of the line */
  x1: z.number(),
  /** the y of the start of the line */
  y1: z.number(),
  /** the x of the end of the line */
  x2: z.number(),
  /** the y of the end of the line */
  y2: z.number(),
  /** the color of the line, or a gradient */
  color: PaintSchema,
  /** the width of the line in pixels. Defaults to 1. */
  width: z.number().min(0).optional(),
  /** how the ends look: `"butt"` (default), `"round"` or `"square"` */
  cap: LineCapSchema.optional(),
});

export type DrawLineOptions = z.infer<typeof DrawLineOptionsSchema>;

const CornerRadiiSchema = z.object({
  /** the radius of the top left corner */
  topLeft: z.number().min(0).optional(),
  /** the radius of the top right corner */
  topRight: z.number().min(0).optional(),
  /** the radius of the bottom right corner */
  bottomRight: z.number().min(0).optional(),
  /** the radius of the bottom left corner */
  bottomLeft: z.number().min(0).optional(),
});

const DrawRectOptionsSchema = ShapeStyleSchema.extend(
  JoinStyleSchema.shape,
).extend({
  /** the x of the rectangle's left edge */
  x: z.number(),
  /** the y of the rectangle's top edge */
  y: z.number(),
  /** the width. A negative width goes left from x. */
  w: z.number(),
  /** the height. A negative height goes up from y. */
  h: z.number(),
  /**
   * the radius of the corners: one for every corner, or one per corner.
   * Radii too big for the rectangle are scaled down like CSS `border-radius`.
   */
  radius: z.union([z.number().min(0), CornerRadiiSchema]).optional(),
});

export type DrawRectOptions = z.infer<typeof DrawRectOptionsSchema>;

const DrawEllipseOptionsSchema = ShapeStyleSchema.extend({
  /** the x of the center */
  cx: z.number(),
  /** the y of the center */
  cy: z.number(),
  /** the horizontal radius */
  rx: z.number().min(0),
  /** the vertical radius. Use the same as `rx` for a circle. */
  ry: z.number().min(0),
});

export type DrawEllipseOptions = z.infer<typeof DrawEllipseOptionsSchema>;

const DrawPolygonOptionsSchema = ShapeStyleSchema.extend(
  OpenPathStyleSchema.shape,
).extend({
  /** the corners, as `[x, y]` pairs or `{ x, y }` objects */
  points: z.array(PointSchema),
  /**
   * whether the outline joins the last point back to the first. Defaults to
   * true; false draws a polyline. A fill is always closed.
   */
  closed: z.boolean().optional(),
});

export type DrawPolygonOptions = z.infer<typeof DrawPolygonOptionsSchema>;

const PathCommandSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("M"), x: z.number(), y: z.number() }),
  z.object({ type: z.literal("L"), x: z.number(), y: z.number() }),
  z.object({
    type: z.literal("Q"),
    x1: z.number(),
    y1: z.number(),
    x: z.number(),
    y: z.number(),
  }),
  z.object({
    type: z.literal("C"),
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    x: z.number(),
    y: z.number(),
  }),
  z.object({ type: z.literal("Z") }),
]);

const DrawPathOptionsSchema = ShapeStyleSchema.extend(
  OpenPathStyleSchema.shape,
).extend({
  /**
   * SVG path data, like `"M 10 10 L 90 10 Q 90 90 10 90 Z"`, or a list of
   * {@link PathCommand}s
   */
  path: z.union([z.string(), z.array(PathCommandSchema)]),
});

export type DrawPathOptions = z.infer<typeof DrawPathOptionsSchema>;

const FloodFillOptionsSchema = z.object({
  /** the x of the pixel to start filling from */
  x: z.number(),
  /** the y of the pixel to start filling from */
  y: z.number(),
  /** the color to fill with, or a gradient */
  color: PaintSchema,
  /**
   * how different, from 0 to 1, a pixel's color can be from the starting
   * pixel's and still be filled. Defaults to 0: only the exact color.
   */
  tolerance: z.number().min(0).max(1).optional(),
});

export type FloodFillOptions = z.infer<typeof FloodFillOptionsSchema>;

/** How {@link drawShape} fills and strokes a shape */
export type ShapeStyle = z.infer<typeof ShapeStyleSchema> &
  Omit<StrokeOptions, "width" | "tolerance"> & { fillRule?: FillRule };

/**
 * Fills and then strokes polygons, the way SVG draws shapes and the drawing
 * methods do. With neither `fill` nor `stroke` they're filled black. Both
 * paints are resolved before anything is drawn, so an invalid stroke color
 * throws without leaving the fill drawn.
 * @example
 * ```ts
 * import { drawShape, flattenPath } from "@jimp/plugin-draw";
 *
 * drawShape(image, flattenPath(glyph.path.commands, { transform }), {
 *   fill: "white",
 *   stroke: "black",
 *   strokeWidth: 2,
 *   join: "round",
 * });
 * ```
 */
export function drawShape<I extends DrawTarget>(
  image: I,
  polylines: Polyline[],
  style: ShapeStyle,
) {
  const { stroke, strokeWidth = 1 } = style;
  const fill = style.fill ?? (stroke === undefined ? 0x000000ff : undefined);
  // Resolve both first, so an invalid stroke color doesn't leave a fill drawn
  const fillPaint = fill === undefined ? undefined : resolvePaint(fill, image);
  const strokePaint =
    stroke === undefined ? undefined : resolvePaint(stroke, image);

  if (fillPaint) {
    fillResolved(image, polylines, fillPaint, style.fillRule);
  }

  if (strokePaint) {
    const outline = strokePolylines(polylines, {
      width: strokeWidth,
      cap: style.cap,
      join: style.join,
      miterLimit: style.miterLimit,
    });

    fillResolved(image, outline, strokePaint);
  }

  return image;
}

function toRadii(radius: DrawRectOptions["radius"] = 0): Radii {
  if (typeof radius === "number") {
    return [radius, radius, radius, radius];
  }

  return [
    radius.topLeft ?? 0,
    radius.topRight ?? 0,
    radius.bottomRight ?? 0,
    radius.bottomLeft ?? 0,
  ];
}

export const methods = {
  /**
   * Draws a straight, antialiased line. It's centered on the line from
   * (x1, y1) to (x2, y2), `width` pixels wide.
   *
   * Like canvas, a line on whole pixel coordinates straddles two rows (or
   * columns) of pixels, so an odd width looks blurry. Add 0.5 to the
   * coordinates to cover whole pixels.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = new Jimp({ width: 200, height: 100, color: "white" });
   *
   * image.drawLine({ x1: 10, y1: 10, x2: 190, y2: 90, color: "#e63946", width: 4 });
   * // or with round ends
   * image.drawLine({ x1: 10, y1: 90, x2: 190, y2: 10, color: 0x1d3557ff, width: 8, cap: "round" });
   * ```
   */
  drawLine<I extends JimpClass>(image: I, options: DrawLineOptions) {
    const {
      x1,
      y1,
      x2,
      y2,
      color,
      width = 1,
      cap,
    } = DrawLineOptionsSchema.parse(options);

    return drawShape(image, [{ points: [x1, y1, x2, y2], closed: false }], {
      stroke: color,
      strokeWidth: width,
      cap,
    });
  },

  /**
   * Draws a rectangle, optionally with rounded corners. Give a `fill`, a
   * `stroke` or both; with neither it's filled black. The stroke is centered
   * on the rectangle's edge, like SVG and canvas.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = new Jimp({ width: 200, height: 100, color: "white" });
   *
   * image.drawRect({ x: 10, y: 10, w: 80, h: 80, fill: "#a8dadc" });
   * // a rounded outline
   * image.drawRect({ x: 110, y: 10, w: 80, h: 80, radius: 16, stroke: "#1d3557", strokeWidth: 4 });
   * ```
   */
  drawRect<I extends JimpClass>(image: I, options: DrawRectOptions) {
    const parsed = DrawRectOptionsSchema.parse(options);
    let { x, y, w, h } = parsed;

    if (w < 0) {
      x += w;
      w = -w;
    }

    if (h < 0) {
      y += h;
      h = -h;
    }

    const outline = rectPolyline(
      x,
      y,
      w,
      h,
      toRadii(parsed.radius),
      DEFAULT_TOLERANCE,
    );

    return drawShape(image, [outline], parsed);
  },

  /**
   * Draws an ellipse centered on (cx, cy), or a circle when `rx` and `ry`
   * are the same. Give a `fill`, a `stroke` or both; with neither it's filled
   * black.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = new Jimp({ width: 200, height: 100, color: "white" });
   *
   * image.drawEllipse({ cx: 50, cy: 50, rx: 40, ry: 40, fill: "#f4a261" });
   * image.drawEllipse({ cx: 150, cy: 50, rx: 40, ry: 25, stroke: "black", strokeWidth: 3 });
   * ```
   */
  drawEllipse<I extends JimpClass>(image: I, options: DrawEllipseOptions) {
    const parsed = DrawEllipseOptionsSchema.parse(options);
    const { cx, cy, rx, ry } = parsed;

    return drawShape(
      image,
      [ellipsePolyline(cx, cy, rx, ry, DEFAULT_TOLERANCE)],
      parsed,
    );
  },

  /**
   * Draws a polygon through `points`, or with `closed: false` a polyline.
   * Give a `fill`, a `stroke` or both; with neither it's filled black.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = new Jimp({ width: 100, height: 100, color: "white" });
   *
   * // a star, with its middle filled
   * image.drawPolygon({
   *   points: [[50, 5], [79, 95], [2, 40], [98, 40], [21, 95]],
   *   fill: "gold",
   *   stroke: "black",
   *   strokeWidth: 2,
   *   join: "round",
   * });
   *
   * // a zigzag line
   * image.drawPolygon({
   *   points: [{ x: 10, y: 90 }, { x: 40, y: 60 }, { x: 60, y: 90 }, { x: 90, y: 60 }],
   *   closed: false,
   *   stroke: "#e63946",
   *   strokeWidth: 4,
   * });
   * ```
   */
  drawPolygon<I extends JimpClass>(image: I, options: DrawPolygonOptions) {
    const parsed = DrawPolygonOptionsSchema.parse(options);
    const points: number[] = [];

    for (const point of parsed.points) {
      if (Array.isArray(point)) {
        points.push(point[0], point[1]);
      } else {
        points.push(point.x, point.y);
      }
    }

    return drawShape(
      image,
      [{ points, closed: parsed.closed ?? true }],
      parsed,
    );
  },

  /**
   * Draws a path: SVG path data (every command, `M L H V C S Q T A Z`, upper
   * or lower case) or a list of {@link PathCommand}s. Give a `fill`, a
   * `stroke` or both; with neither it's filled black.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = new Jimp({ width: 100, height: 100, color: "white" });
   *
   * // a ring: evenodd makes the inner circle a hole
   * image.drawPath({
   *   path: "M 10 50 A 40 40 0 1 0 90 50 A 40 40 0 1 0 10 50 Z M 30 50 A 20 20 0 1 0 70 50 A 20 20 0 1 0 30 50 Z",
   *   fill: "#2a9d8f",
   *   fillRule: "evenodd",
   * });
   * ```
   */
  drawPath<I extends JimpClass>(image: I, options: DrawPathOptions) {
    const parsed = DrawPathOptionsSchema.parse(options);

    return drawShape(
      image,
      flattenPath(parsed.path, { tolerance: DEFAULT_TOLERANCE }),
      parsed,
    );
  },

  /**
   * Fills the area around (x, y) with a color, like a paint bucket: every
   * pixel connected to it (up, down, left or right) whose color is within
   * `tolerance` of its color. The fill is drawn over those pixels, so a
   * semi-transparent color blends with them.
   *
   * Colors are compared with alpha premultiplied, so all fully transparent
   * pixels match each other. A point outside the image fills nothing.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.floodFill({ x: 10, y: 10, color: "#ffcc00", tolerance: 0.1 });
   * ```
   */
  floodFill<I extends JimpClass>(image: I, options: FloodFillOptions) {
    const {
      x,
      y,
      color,
      tolerance = 0,
    } = FloodFillOptionsSchema.parse(options);
    const paint = resolvePaint(color, image);
    const { width, data } = image.bitmap;
    const mask = floodFillMask(
      image.bitmap,
      Math.floor(x),
      Math.floor(y),
      tolerance,
    );

    if (!mask) {
      return image;
    }

    const coverage = new Float32Array(width).fill(1);

    for (let row = 0; row < image.bitmap.height; row++) {
      const start = row * width;
      let x0 = -1;

      for (let col = 0; col <= width; col++) {
        const filled = col < width && mask[start + col] === 1;

        if (filled && x0 < 0) {
          x0 = col;
        } else if (!filled && x0 >= 0) {
          paintRow(data, width, paint, row, x0, col, coverage);
          x0 = -1;
        }
      }
    }

    return image;
  },
};
