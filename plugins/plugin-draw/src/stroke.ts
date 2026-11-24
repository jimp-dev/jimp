import { arcTo, DEFAULT_TOLERANCE, ellipseTo } from "./path.js";
import type { Polyline } from "./rasterize.js";

/**
 * How the ends of open lines look, like SVG's `stroke-linecap`:
 *
 * - `"butt"`: the line stops square at its end point
 * - `"round"`: a half circle past the end point
 * - `"square"`: a square end half the width past the end point
 */
export type LineCap = "butt" | "round" | "square";

/**
 * How corners between segments look, like SVG's `stroke-linejoin`:
 *
 * - `"miter"`: a sharp corner, cut off like `"bevel"` when it would be
 *   longer than `miterLimit` times the line width
 * - `"round"`: a rounded corner
 * - `"bevel"`: the corner is cut off
 */
export type LineJoin = "miter" | "round" | "bevel";

export interface StrokeOptions {
  /** the width of the line in pixels, centered on the path. Defaults to 1. */
  width?: number;
  /** how the ends of open subpaths look. Defaults to `"butt"`. */
  cap?: LineCap;
  /** how corners look. Defaults to `"miter"`. */
  join?: LineJoin;
  /**
   * the longest a miter join can be, as a multiple of the line width, before
   * it's beveled instead. Defaults to 10, like canvas.
   */
  miterLimit?: number;
  /** how far round joins and caps may stray from true arcs, in pixels. Defaults to 0.1. */
  tolerance?: number;
}

/** Points closer than this are the same point: their direction is just noise */
const MIN_SEGMENT = 1e-6;

function samePoint(points: number[], i: number, x: number, y: number) {
  return (
    Math.abs(points[i]! - x) < MIN_SEGMENT &&
    Math.abs(points[i + 1]! - y) < MIN_SEGMENT
  );
}

/**
 * Remove repeated points (and a closed polyline's repeated first point), and
 * any that aren't finite
 */
function distinctPoints({ points, closed }: Polyline) {
  const out: number[] = [];

  for (let i = 0; i + 1 < points.length; i += 2) {
    const x = points[i]!;
    const y = points[i + 1]!;

    if (
      Number.isFinite(x + y) &&
      (out.length === 0 || !samePoint(out, out.length - 2, x, y))
    ) {
      out.push(x, y);
    }
  }

  if (
    closed &&
    out.length > 2 &&
    samePoint(out, out.length - 2, out[0]!, out[1]!)
  ) {
    out.length -= 2;
  }

  return out;
}

class Stroker {
  private hw: number;
  private cap: LineCap;
  private join: LineJoin;
  private miterLimit: number;
  private tolerance: number;
  polygons: Polyline[] = [];

  constructor(options: StrokeOptions) {
    this.hw = (options.width ?? 1) / 2;
    this.cap = options.cap ?? "butt";
    this.join = options.join ?? "miter";
    this.miterLimit = options.miterLimit ?? 10;
    this.tolerance =
      options.tolerance && options.tolerance > 0
        ? options.tolerance
        : DEFAULT_TOLERANCE;
  }

  /**
   * Add the points of an arc of radius hw around (px, py), starting at
   * offset (ax, ay) and turning by `sweep` radians, not including the start
   */
  private arc(
    out: number[],
    px: number,
    py: number,
    ax: number,
    ay: number,
    sweep: number,
  ) {
    const { hw } = this;

    arcTo(
      (x, y) => out.push(x, y),
      px,
      py,
      hw,
      hw,
      Math.atan2(ay, ax),
      sweep,
      this.tolerance,
    );
  }

  /**
   * The sweep from offset a to offset b around the outside of a corner (or
   * end) whose outward direction is (ux, uy)
   */
  private outerSweep(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ux: number,
    uy: number,
  ) {
    const cross = ax * by - ay * bx;
    const dot = ax * bx + ay * by;

    // Turning right back on itself: go round the front
    if (Math.abs(cross) <= 1e-12 * this.hw * this.hw && dot < 0) {
      return ax * uy - ay * ux > 0 ? Math.PI : -Math.PI;
    }

    return Math.atan2(cross, dot);
  }

  /**
   * The corner on the outside of a turn at (px, py), from offset a to offset
   * b. (ux, uy) is the direction of the segment coming in.
   */
  private outerJoin(
    out: number[],
    px: number,
    py: number,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    ux: number,
    uy: number,
  ) {
    const { hw } = this;

    out.push(px + ax, py + ay);

    if (this.join === "round") {
      this.arc(out, px, py, ax, ay, this.outerSweep(ax, ay, bx, by, ux, uy));
      return;
    }

    if (this.join === "miter") {
      const mx = ax + bx;
      const my = ay + by;
      const mm = mx * mx + my * my;

      // The miter is 1 / cos(half the angle between the offsets) times the
      // half width, measured from the corner, so 2 * hw / |m| times the width
      if (mm > 0 && (2 * hw) / Math.sqrt(mm) <= this.miterLimit) {
        const scale = (2 * hw * hw) / mm;

        out.push(px + mx * scale, py + my * scale);
      }
    }

    out.push(px + bx, py + by);
  }

  /** Add the cap at an end (px, py), from offset a round to offset -a */
  private addCap(
    out: number[],
    px: number,
    py: number,
    ax: number,
    ay: number,
    ux: number,
    uy: number,
  ) {
    const { hw } = this;

    if (this.cap === "square") {
      out.push(px + ax + ux * hw, py + ay + uy * hw);
      out.push(px - ax + ux * hw, py - ay + uy * hw);
    } else if (this.cap === "round") {
      this.arc(out, px, py, ax, ay, this.outerSweep(ax, ay, -ax, -ay, ux, uy));
      // The arc ends on the other side, which the next point repeats
      out.length -= 2;
    }
  }

  /** A path with a single point: a dot for round and square caps */
  private dot(px: number, py: number) {
    const { hw } = this;

    if (this.cap === "round") {
      const out: number[] = [];

      ellipseTo((x, y) => out.push(x, y), px, py, hw, hw, this.tolerance);
      this.polygons.push({ points: out, closed: true });
    } else if (this.cap === "square") {
      this.polygons.push({
        points: [
          px - hw,
          py - hw,
          px + hw,
          py - hw,
          px + hw,
          py + hw,
          px - hw,
          py + hw,
        ],
        closed: true,
      });
    }
  }

  add(polyline: Polyline) {
    const p = distinctPoints(polyline);
    const n = p.length / 2;
    const closed = polyline.closed && n > 1;

    if (n === 0) {
      return;
    }

    if (n === 1) {
      this.dot(p[0]!, p[1]!);
      return;
    }

    const { hw } = this;
    const segments = closed ? n : n - 1;
    // The unit direction of each segment
    const u = new Float64Array(segments * 2);

    for (let i = 0; i < segments; i++) {
      const j = (i + 1) % n;
      const dx = p[j * 2]! - p[i * 2]!;
      const dy = p[j * 2 + 1]! - p[i * 2 + 1]!;
      const length = Math.hypot(dx, dy);

      u[i * 2] = dx / length;
      u[i * 2 + 1] = dy / length;
    }

    // The outlines on each side of the path, both in the path's direction.
    // The "left" side is offset by the normal (-uy, ux).
    const left: number[] = [];
    const right: number[] = [];

    const addJoin = (vertex: number, a: number, b: number) => {
      const px = p[vertex * 2]!;
      const py = p[vertex * 2 + 1]!;
      const uax = u[a * 2]!;
      const uay = u[a * 2 + 1]!;
      const ubx = u[b * 2]!;
      const uby = u[b * 2 + 1]!;
      const nax = -uay * hw;
      const nay = uax * hw;
      const nbx = -uby * hw;
      const nby = ubx * hw;
      const cross = uax * uby - uay * ubx;

      if (cross > 0) {
        // Turning towards the left side, so it's on the inside. Going through
        // the corner point keeps the inside of the turn filled.
        left.push(px + nax, py + nay, px, py, px + nbx, py + nby);
        this.outerJoin(right, px, py, -nax, -nay, -nbx, -nby, uax, uay);
      } else if (cross < 0 || uax * ubx + uay * uby < 0) {
        this.outerJoin(left, px, py, nax, nay, nbx, nby, uax, uay);
        right.push(px - nax, py - nay, px, py, px - nbx, py - nby);
      } else {
        // Straight on
        left.push(px + nax, py + nay);
        right.push(px - nax, py - nay);
      }
    };

    if (closed) {
      for (let i = 0; i < n; i++) {
        addJoin(i, (i - 1 + segments) % segments, i);
      }

      // The two sides wind opposite ways, so the inside of the path is a hole
      this.polygons.push({ points: left, closed: true });
      this.polygons.push({ points: reversePoints(right), closed: true });
      return;
    }

    const last = segments - 1;
    const startX = p[0]!;
    const startY = p[1]!;
    const endX = p[(n - 1) * 2]!;
    const endY = p[(n - 1) * 2 + 1]!;
    const n0x = -u[1]! * hw;
    const n0y = u[0]! * hw;
    const nlx = -u[last * 2 + 1]! * hw;
    const nly = u[last * 2]! * hw;

    left.push(startX + n0x, startY + n0y);
    right.push(startX - n0x, startY - n0y);

    for (let i = 1; i < n - 1; i++) {
      addJoin(i, i - 1, i);
    }

    left.push(endX + nlx, endY + nly);
    right.push(endX - nlx, endY - nly);

    // One outline: along the left, round the end, back along the right and
    // round the start
    const outline = left;

    this.addCap(outline, endX, endY, nlx, nly, u[last * 2]!, u[last * 2 + 1]!);
    for (let i = right.length - 2; i >= 0; i -= 2) {
      outline.push(right[i]!, right[i + 1]!);
    }

    this.addCap(outline, startX, startY, -n0x, -n0y, -u[0]!, -u[1]!);
    this.polygons.push({ points: outline, closed: true });
  }
}

function reversePoints(points: number[]) {
  const out = new Array<number>(points.length);

  for (let i = 0; i < points.length; i += 2) {
    out[points.length - 2 - i] = points[i]!;
    out[points.length - 1 - i] = points[i + 1]!;
  }

  return out;
}

/**
 * Turns lines into the outlines of strokes: polygons that, filled with the
 * `"nonzero"` fill rule, draw the lines `width` pixels wide with the given
 * caps and joins.
 *
 * The outlines can overlap themselves on the inside of sharp turns, so they
 * must be filled with `"nonzero"`, not `"evenodd"`.
 * @example
 * ```ts
 * import { flattenPath, strokePolylines, rasterize } from "@jimp/plugin-draw";
 *
 * const outline = strokePolylines(flattenPath("M 10 10 L 90 90"), {
 *   width: 8,
 *   cap: "round",
 * });
 *
 * rasterize(outline, { width: 100, height: 100 }, (y, x0, x1, coverage) => {
 *   // ...
 * });
 * ```
 */
export function strokePolylines(
  polylines: Iterable<Polyline>,
  options: StrokeOptions = {},
): Polyline[] {
  const stroker = new Stroker(options);

  if (!((options.width ?? 1) > 0)) {
    return [];
  }

  for (const polyline of polylines) {
    stroker.add(polyline);
  }

  return stroker.polygons;
}
