/**
 * A polygon outline made of straight lines: `points` holds the x and y of
 * each vertex, one after the other (`[x0, y0, x1, y1, ...]`).
 *
 * When filling, every polyline is treated as closed. When stroking, `closed`
 * says whether the last point joins back up to the first.
 */
export interface Polyline {
  points: ArrayLike<number>;
  closed: boolean;
}

/**
 * Which parts of a self-intersecting or nested shape are inside it, like
 * SVG's `fill-rule`:
 *
 * - `"nonzero"`: inside if the outlines wind around the point a non-zero
 *   number of times. Overlapping shapes drawn the same way round merge, and a
 *   hole has to be drawn the other way round.
 * - `"evenodd"`: inside if a ray from the point crosses an odd number of
 *   outlines, so every nested outline is a hole whichever way it's drawn.
 */
export type FillRule = "nonzero" | "evenodd";

/**
 * Called once for each row with any coverage. `coverage[x]` is how much of
 * the pixel at (x, y) the shape covers, from 0 to 1, for `x0 <= x < x1`. The
 * array is reused for the next row, so copy anything you need to keep.
 */
export type RowCallback = (
  y: number,
  x0: number,
  x1: number,
  coverage: Float32Array,
) => void;

export interface RasterizeOptions {
  /** the width of the area to draw in. Anything outside 0..width is clipped. */
  width: number;
  /** the height of the area to draw in. Anything outside 0..height is clipped. */
  height: number;
  /** the fill rule, `"nonzero"` by default */
  fillRule?: FillRule;
}

// Each edge is 5 numbers: the x and y of its top end, the y of its bottom end,
// how far x moves for each step in y, and +1 or -1 for whether it went down
// or up.
const EDGE_SIZE = 5;

class EdgeList {
  data = new Float64Array(EDGE_SIZE * 64);
  length = 0;
  minY = Infinity;
  maxY = -Infinity;

  constructor(
    private width: number,
    private height: number,
  ) {}

  /** Add the line from (x0, y0) to (x1, y1), clipped to the area */
  add(x0: number, y0: number, x1: number, y1: number) {
    // Horizontal edges cover nothing. Skip non-finite points rather than
    // filling the whole image with NaN.
    if (y0 === y1 || !Number.isFinite(x0 + y0 + x1 + y1)) {
      return;
    }

    let dir = 1;

    if (y0 > y1) {
      dir = -1;
      [x0, y0, x1, y1] = [x1, y1, x0, y0];
    }

    const { height, width } = this;

    // Each row is filled on its own, so edges above or below the area don't
    // matter
    if (y1 <= 0 || y0 >= height) {
      return;
    }

    const dxdy = (x1 - x0) / (y1 - y0);

    if (y0 < 0) {
      x0 += (0 - y0) * dxdy;
      y0 = 0;
    }

    if (y1 > height) {
      x1 = x0 + (height - y0) * dxdy;
      y1 = height;
    }

    // Parts of the edge to the left or right of the area still cover the
    // pixels to their right, so move them onto the area's border rather than
    // dropping them. Split the edge where it crosses a border so each part
    // can be moved separately.
    if (x0 >= 0 && x0 <= width && x1 >= 0 && x1 <= width) {
      this.push(x0, y0, y1, dxdy, dir);
      return;
    }

    const yAt = (x: number) => y0 + (x - x0) / dxdy;
    let ya = y0;
    let xa = x0;
    const splits: number[] = [];

    for (const border of [0, width]) {
      if ((x0 < border && x1 > border) || (x0 > border && x1 < border)) {
        splits.push(yAt(border));
      }
    }

    splits.sort((a, b) => a - b);
    splits.push(y1);

    for (const yb of splits) {
      const xb = yb === y1 ? x1 : x0 + (yb - y0) * dxdy;
      const mid = (xa + xb) / 2;

      if (mid <= 0 || mid >= width) {
        this.push(mid <= 0 ? 0 : width, ya, yb, 0, dir);
      } else {
        this.push(clamp(xa, 0, width), ya, yb, dxdy, dir);
      }

      ya = yb;
      xa = xb;
    }
  }

  private push(x: number, y0: number, y1: number, dxdy: number, dir: number) {
    if (y1 <= y0) {
      return;
    }

    if (this.data.length < (this.length + 1) * EDGE_SIZE) {
      const data = new Float64Array(this.data.length * 2);
      data.set(this.data);
      this.data = data;
    }

    const i = this.length * EDGE_SIZE;

    this.data[i] = x;
    this.data[i + 1] = y0;
    this.data[i + 2] = y1;
    this.data[i + 3] = dxdy;
    this.data[i + 4] = dir;
    this.length++;
    this.minY = Math.min(this.minY, y0);
    this.maxY = Math.max(this.maxY, y1);
  }
}

function clamp(n: number, min: number, max: number) {
  return n < min ? min : n > max ? max : n;
}

/**
 * Scan converts polygons with exact area coverage antialiasing: each pixel's
 * coverage is the area of it inside the shape, worked out from the edges that
 * cross it (the method used by FreeType and font-rs), not by sampling. The
 * fill rule is applied to the winding-weighted area.
 *
 * This is the low-level part of {@link fillPolylines}: use it to draw
 * coverage somewhere other than a Jimp image, e.g. into a mask.
 * @example
 * ```ts
 * import { rasterize } from "@jimp/plugin-draw";
 *
 * const mask = new Float32Array(100 * 100);
 * const triangle = { points: [10, 10, 90, 50, 10, 90], closed: true };
 *
 * rasterize([triangle], { width: 100, height: 100 }, (y, x0, x1, coverage) => {
 *   mask.set(coverage.subarray(x0, x1), y * 100 + x0);
 * });
 * ```
 */
export function rasterize(
  polylines: Iterable<Polyline>,
  options: RasterizeOptions,
  onRow: RowCallback,
) {
  const width = Math.floor(options.width);
  const height = Math.floor(options.height);
  const evenOdd = options.fillRule === "evenodd";

  if (!(width > 0 && height > 0)) {
    return;
  }

  const edges = new EdgeList(width, height);

  for (const { points } of polylines) {
    const n = points.length >> 1;

    if (n < 2) {
      continue;
    }

    let px = points[(n - 1) * 2]!;
    let py = points[(n - 1) * 2 + 1]!;

    for (let i = 0; i < n; i++) {
      const x = points[i * 2]!;
      const y = points[i * 2 + 1]!;

      edges.add(px, py, x, y);
      px = x;
      py = y;
    }
  }

  if (edges.length === 0) {
    return;
  }

  const e = edges.data;
  const order = new Uint32Array(edges.length);

  for (let i = 0; i < order.length; i++) {
    order[i] = i;
  }

  order.sort((a, b) => e[a * EDGE_SIZE + 1]! - e[b * EDGE_SIZE + 1]!);

  // One accumulation cell per pixel, plus two: edges on the right border
  // write to cells `width` and `width + 1`
  const acc = new Float64Array(width + 2);
  const add = (x: number, area: number) => {
    acc[x] = acc[x]! + area;
  };
  const coverage = new Float32Array(width);
  const active = new Uint32Array(edges.length);
  let activeCount = 0;
  let next = 0;
  const yEnd = Math.min(height, Math.ceil(edges.maxY));

  for (let y = Math.max(0, Math.floor(edges.minY)); y < yEnd; y++) {
    const rowBottom = y + 1;

    while (
      next < order.length &&
      e[order[next]! * EDGE_SIZE + 1]! < rowBottom
    ) {
      active[activeCount++] = order[next++]!;
    }

    let minX = width + 2;
    let maxX = -1;

    for (let k = 0; k < activeCount; k++) {
      const i = active[k]! * EDGE_SIZE;
      const ex = e[i]!;
      const ey0 = e[i + 1]!;
      const ey1 = e[i + 2]!;

      if (ey1 <= y) {
        active[k--] = active[--activeCount]!;
        continue;
      }

      const dxdy = e[i + 3]!;
      const ya = ey0 > y ? ey0 : y;
      const yb = ey1 < rowBottom ? ey1 : rowBottom;
      const d = (yb - ya) * e[i + 4]!;
      // Clamp away rounding error that would put x just outside the area
      const xa = clamp(ex + (ya - ey0) * dxdy, 0, width);
      const xb = clamp(ex + (yb - ey0) * dxdy, 0, width);
      const x0 = xa < xb ? xa : xb;
      const x1 = xa < xb ? xb : xa;
      const x0floor = Math.floor(x0);
      const x1ceil = Math.ceil(x1);

      // Accumulate the area each cell gets from this part of the edge, so a
      // running sum along the row gives each pixel's coverage. From font-rs:
      // https://github.com/raphlinus/font-rs
      if (x1ceil <= x0floor + 1) {
        // Inside one cell: split by where the edge crosses it on average
        const xmf = 0.5 * (xa + xb) - x0floor;

        add(x0floor, d - d * xmf);
        add(x0floor + 1, d * xmf);
        minX = x0floor < minX ? x0floor : minX;
        maxX = x0floor + 1 > maxX ? x0floor + 1 : maxX;
      } else {
        const s = 1 / (x1 - x0);
        const x0f = x0 - x0floor;
        const a0 = 0.5 * s * (1 - x0f) * (1 - x0f);
        const x1f = x1 - x1ceil + 1;
        const am = 0.5 * s * x1f * x1f;

        add(x0floor, d * a0);

        if (x1ceil === x0floor + 2) {
          add(x0floor + 1, d * (1 - a0 - am));
        } else {
          const a1 = s * (1.5 - x0f);

          add(x0floor + 1, d * (a1 - a0));

          for (let x = x0floor + 2; x < x1ceil - 1; x++) {
            add(x, d * s);
          }

          const a2 = a1 + (x1ceil - x0floor - 3) * s;

          add(x1ceil - 1, d * (1 - a2 - am));
        }

        add(x1ceil, d * am);
        minX = x0floor < minX ? x0floor : minX;
        maxX = x1ceil > maxX ? x1ceil : maxX;
      }
    }

    if (maxX < 0) {
      continue;
    }

    // The edges in a row add up to nothing, so past the last cell written
    // the sum is back to 0
    const end = maxX < width ? maxX : width;
    let sum = 0;
    let first = -1;
    let last = -1;

    for (let x = minX; x < end; x++) {
      sum += acc[x]!;
      acc[x] = 0;

      let c = sum < 0 ? -sum : sum;

      if (evenOdd) {
        c -= 2 * Math.floor(c / 2);
        c = c > 1 ? 2 - c : c;
      } else if (c > 1) {
        c = 1;
      }

      // Rounding error leaves tiny amounts where there should be none
      if (c < 1e-9) {
        c = 0;
      } else if (c > 1 - 1e-9) {
        c = 1;
      }

      coverage[x] = c;

      if (c > 0) {
        if (first < 0) {
          first = x;
        }

        last = x;
      }
    }

    for (let x = end; x <= maxX; x++) {
      acc[x] = 0;
    }

    if (first >= 0) {
      onRow(y, first, last + 1, coverage);
    }
  }
}
