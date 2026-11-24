import type { Polyline } from "./rasterize.js";
import { parseSvgPath } from "./svg-path.js";

/**
 * One step of a path, in absolute coordinates. These are the same objects
 * opentype.js uses for glyph outlines, so a glyph's `path.commands` can be
 * drawn as they are.
 *
 * - `M`: start a new subpath at (x, y)
 * - `L`: a straight line to (x, y)
 * - `Q`: a quadratic Bézier curve to (x, y) with control point (x1, y1)
 * - `C`: a cubic Bézier curve to (x, y) with control points (x1, y1) and (x2, y2)
 * - `Z`: close the subpath with a straight line back to its start
 */
export type PathCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | { type: "Q"; x1: number; y1: number; x: number; y: number }
  | {
      type: "C";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x: number;
      y: number;
    }
  | { type: "Z" };

/** A path: SVG path data (like the `d` attribute) or a list of commands */
export type PathData = string | readonly PathCommand[];

/**
 * A 2D affine transform `[a, b, c, d, e, f]`, in the same order as CSS's
 * `matrix(a, b, c, d, e, f)` and Jimp's `affine`: each point (x, y) moves to
 * (a * x + c * y + e, b * x + d * y + f).
 */
export type Matrix = readonly [number, number, number, number, number, number];

export interface FlattenOptions {
  /**
   * How far, in pixels, the straight lines may stray from the curves they
   * replace. Defaults to 0.1.
   */
  tolerance?: number;
  /** a transform to apply to the path before flattening it */
  transform?: Matrix;
}

export const DEFAULT_TOLERANCE = 0.1;

/**
 * More segments than this per curve can't be told apart, and a curve with
 * huge coordinates would otherwise take forever
 */
const MAX_SEGMENTS = 10000;

/** Builds polylines point by point, dropping repeated points */
export class PolylineBuilder {
  polylines: Polyline[] = [];
  private points: number[] = [];

  moveTo(x: number, y: number) {
    this.end(false);
    this.points.push(x, y);
  }

  lineTo(x: number, y: number) {
    const { points } = this;
    const n = points.length;

    if (n === 0 || points[n - 2] !== x || points[n - 1] !== y) {
      points.push(x, y);
    }
  }

  /** End the current polyline, if it has any points */
  end(closed: boolean) {
    const { points } = this;

    // A closed polyline doesn't need its first point repeated at the end
    if (
      closed &&
      points.length > 2 &&
      points[0] === points[points.length - 2] &&
      points[1] === points[points.length - 1]
    ) {
      points.length -= 2;
    }

    if (points.length > 0) {
      this.polylines.push({ points, closed });
    }

    this.points = [];
  }

  finish() {
    this.end(false);
    return this.polylines;
  }
}

/** How many straight lines a curve with this much bend needs */
function segmentCount(bend: number, tolerance: number) {
  return Math.min(
    MAX_SEGMENTS,
    Math.max(1, Math.ceil(Math.sqrt(bend / tolerance))),
  );
}

/**
 * Add a quadratic Bézier curve from the builder's last point. A curve split
 * into n equal steps is within |p0 - 2p1 + p2| / (4n²) of its chords.
 */
function quadTo(
  out: PolylineBuilder,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tolerance: number,
) {
  const n = segmentCount(
    Math.hypot(x0 - 2 * x1 + x2, y0 - 2 * y1 + y2) / 4,
    tolerance,
  );

  for (let i = 1; i < n; i++) {
    const t = i / n;
    const mt = 1 - t;

    out.lineTo(
      mt * mt * x0 + 2 * mt * t * x1 + t * t * x2,
      mt * mt * y0 + 2 * mt * t * y1 + t * t * y2,
    );
  }

  out.lineTo(x2, y2);
}

/**
 * Add a cubic Bézier curve from the builder's last point. Its second
 * derivative is at most 6 * max(|p0 - 2p1 + p2|, |p1 - 2p2 + p3|), so n equal
 * steps are within 3/4 of that over n² of the curve.
 */
function cubicTo(
  out: PolylineBuilder,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  tolerance: number,
) {
  const bend = Math.max(
    Math.hypot(x0 - 2 * x1 + x2, y0 - 2 * y1 + y2),
    Math.hypot(x1 - 2 * x2 + x3, y1 - 2 * y2 + y3),
  );
  const n = segmentCount((bend * 3) / 4, tolerance);

  for (let i = 1; i < n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const c = 3 * mt * t * t;
    const d = t * t * t;

    out.lineTo(
      a * x0 + b * x1 + c * x2 + d * x3,
      a * y0 + b * y1 + c * y2 + d * y3,
    );
  }

  out.lineTo(x3, y3);
}

/** How many straight lines an arc needs to be within `tolerance` of it */
function arcSegments(r: number, sweep: number, tolerance: number) {
  const eighth = Math.PI / 4;
  // Steps within `tolerance` of the arc, and at least one per 45 degrees
  const step = Math.min(
    eighth,
    r > tolerance
      ? Math.max(2 * Math.acos(1 - tolerance / r), (2 * Math.PI) / MAX_SEGMENTS)
      : eighth,
  );
  const eighths = Math.round(Math.abs(sweep) / eighth);

  // Split whole eighths of a turn (circles, corners and caps) the same way,
  // so shapes come out symmetric
  if (eighths > 0 && Math.abs(Math.abs(sweep) - eighths * eighth) < 1e-9) {
    return eighths * Math.ceil(eighth / step - 1e-9);
  }

  return Math.ceil(Math.abs(sweep) / step - 1e-9);
}

/**
 * Add the points of an elliptical arc around (cx, cy), starting at angle
 * `start` and turning by `sweep` radians (clockwise on screen, since y points
 * down), not including the start point.
 *
 * A polygon through points on the arc is inside it, so its antialiased edge
 * would be too light. The points between the ends are pushed out just enough
 * that the polygon has the same area as the arc.
 */
export function arcTo(
  lineTo: (x: number, y: number) => void,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  start: number,
  sweep: number,
  tolerance: number,
) {
  const n = arcSegments(Math.max(rx, ry), sweep, tolerance);

  if (n < 1) {
    return;
  }

  // The polygon is a fan of triangles from the center. With the inner points
  // scaled by k, its area is r² sin(θ) (2k + (n - 2)k²) / 2 for steps of θ,
  // and the arc's is r² nθ / 2. Solve for k.
  const theta = Math.abs(sweep) / n;
  const sin = Math.sin(theta);
  let k = 1;

  if (n === 2) {
    k = theta / sin;
  } else if (n > 2) {
    const a = (n - 2) * sin;

    k = (-sin + Math.sqrt(sin * sin + a * n * theta)) / a;
  }

  for (let i = 1; i <= n; i++) {
    const angle = start + (sweep * i) / n;
    const scale = i === n ? 1 : k;

    lineTo(
      cx + rx * scale * Math.cos(angle),
      cy + ry * scale * Math.sin(angle),
    );
  }
}

/**
 * Add the points of a whole ellipse, clockwise from its rightmost point. Like
 * {@link arcTo}, the points are pushed out so the polygon has the ellipse's
 * area.
 */
export function ellipseTo(
  lineTo: (x: number, y: number) => void,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tolerance: number,
) {
  const n = arcSegments(Math.max(rx, ry), 2 * Math.PI, tolerance);
  const theta = (2 * Math.PI) / n;
  // n triangles of area r² k² sin(θ) / 2 make πr²
  const k = Math.sqrt(theta / Math.sin(theta));

  for (let i = 0; i < n; i++) {
    const angle = theta * i;

    lineTo(cx + rx * k * Math.cos(angle), cy + ry * k * Math.sin(angle));
  }
}

const COORDINATES = {
  M: ["x", "y"],
  L: ["x", "y"],
  Q: ["x1", "y1", "x", "y"],
  C: ["x1", "y1", "x2", "y2", "x", "y"],
  Z: [],
} as const;

/** Throw a clear error for unknown commands and non-finite coordinates */
function checkCommand(command: PathCommand, index: number) {
  const keys = COORDINATES[command?.type] as readonly string[] | undefined;

  if (!keys) {
    throw new Error(
      `Unknown path command ${JSON.stringify(command?.type)} at index ${index}, expected M, L, Q, C or Z`,
    );
  }

  for (const key of keys) {
    const value = (command as Record<string, unknown>)[key];

    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new Error(
        `Path command ${index} (${command.type}) needs ${key} to be a finite number, got ${String(value)}`,
      );
    }
  }
}

/**
 * Turns a path into polylines, replacing its curves with enough straight
 * lines that they're within `tolerance` pixels of the curve. Each subpath
 * becomes one polyline, closed if it ended with `Z`.
 * @example
 * ```ts
 * import { flattenPath } from "@jimp/plugin-draw";
 *
 * // A curve, scaled up 2x
 * flattenPath("M 0 0 Q 50 100 100 0", { transform: [2, 0, 0, 2, 0, 0] });
 * // [{ points: [0, 0, ..., 200, 0], closed: false }]
 * ```
 */
export function flattenPath(
  path: PathData,
  options: FlattenOptions = {},
): Polyline[] {
  const commands = typeof path === "string" ? parseSvgPath(path) : path;
  const tolerance =
    options.tolerance && options.tolerance > 0
      ? options.tolerance
      : DEFAULT_TOLERANCE;
  const [a, b, c, d, e, f] = options.transform ?? [1, 0, 0, 1, 0, 0];
  const tx = (x: number, y: number) => a * x + c * y + e;
  const ty = (x: number, y: number) => b * x + d * y + f;
  const out = new PolylineBuilder();
  // The current point and the start of the current subpath, transformed
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let open = false;

  // A drawing command after Z (or with no M before it) starts a new subpath
  // at the current point, like SVG
  const ensureOpen = () => {
    if (!open) {
      out.moveTo(x, y);
      startX = x;
      startY = y;
      open = true;
    }
  };

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i]!;

    checkCommand(command, i);

    switch (command.type) {
      case "M":
        x = tx(command.x, command.y);
        y = ty(command.x, command.y);
        open = false;
        ensureOpen();
        break;
      case "L":
        ensureOpen();
        x = tx(command.x, command.y);
        y = ty(command.x, command.y);
        out.lineTo(x, y);
        break;
      case "Q": {
        ensureOpen();
        const x2 = tx(command.x, command.y);
        const y2 = ty(command.x, command.y);

        quadTo(
          out,
          x,
          y,
          tx(command.x1, command.y1),
          ty(command.x1, command.y1),
          x2,
          y2,
          tolerance,
        );
        x = x2;
        y = y2;
        break;
      }
      case "C": {
        ensureOpen();
        const x3 = tx(command.x, command.y);
        const y3 = ty(command.x, command.y);

        cubicTo(
          out,
          x,
          y,
          tx(command.x1, command.y1),
          ty(command.x1, command.y1),
          tx(command.x2, command.y2),
          ty(command.x2, command.y2),
          x3,
          y3,
          tolerance,
        );
        x = x3;
        y = y3;
        break;
      }
      case "Z":
        if (open) {
          out.end(true);
          open = false;
        }

        x = startX;
        y = startY;
        break;
    }
  }

  return out.finish();
}
