import { describe, expect, test } from "vitest";

import {
  rasterize,
  strokePolylines,
  type FillRule,
  type Polyline,
} from "./index.js";

/** Rasterize into rows of coverage, rounded to 3 decimal places */
function coverage(
  polylines: Polyline[],
  width: number,
  height: number,
  fillRule?: FillRule,
) {
  const rows = Array.from({ length: height }, () =>
    new Array<number>(width).fill(0),
  );

  rasterize(polylines, { width, height, fillRule }, (y, x0, x1, row) => {
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThan(height);
    expect(x0).toBeGreaterThanOrEqual(0);
    expect(x1).toBeLessThanOrEqual(width);

    for (let x = x0; x < x1; x++) {
      rows[y]![x] = Math.round(row[x]! * 1000) / 1000;
    }
  });

  return rows;
}

function rect(x: number, y: number, w: number, h: number, clockwise = true) {
  const points = [x, y, x + w, y, x + w, y + h, x, y + h];

  if (!clockwise) {
    points.splice(0, 8, x, y, x, y + h, x + w, y + h, x + w, y);
  }

  return { points, closed: true };
}

describe("rasterize", () => {
  test("covers whole pixels exactly", () => {
    expect(coverage([rect(1, 1, 2, 3)], 4, 5)).toStrictEqual([
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ]);
  });

  test("gives a pixel's coverage as the area inside the shape", () => {
    // Half of the first column, a quarter of the corner
    expect(coverage([rect(0.5, 0.5, 1.5, 1)], 3, 2)).toStrictEqual([
      [0.25, 0.5, 0],
      [0.25, 0.5, 0],
    ]);

    // A diagonal cuts the pixels it crosses in half
    expect(
      coverage([{ points: [0, 0, 3, 0, 0, 3], closed: true }], 3, 3),
    ).toStrictEqual([
      [1, 1, 0.5],
      [1, 0.5, 0],
      [0.5, 0, 0],
    ]);

    // A sliver a tenth of a pixel wide
    expect(coverage([rect(1.2, 0, 0.1, 1)], 3, 1)).toStrictEqual([[0, 0.1, 0]]);
  });

  test("doesn't depend on which way round the outline goes", () => {
    expect(coverage([rect(0.5, 0, 2, 1, false)], 3, 1)).toStrictEqual(
      coverage([rect(0.5, 0, 2, 1)], 3, 1),
    );
  });

  test("nonzero fills nested outlines drawn the same way round", () => {
    const shapes = [rect(0, 0, 4, 1), rect(1, 0, 2, 1)];

    expect(coverage(shapes, 4, 1, "nonzero")).toStrictEqual([[1, 1, 1, 1]]);
    expect(coverage(shapes, 4, 1)).toStrictEqual([[1, 1, 1, 1]]);
    // The other way round, the inner outline cuts a hole
    expect(
      coverage([rect(0, 0, 4, 1), rect(1, 0, 2, 1, false)], 4, 1, "nonzero"),
    ).toStrictEqual([[1, 0, 0, 1]]);
  });

  test("evenodd makes nested outlines holes whichever way round", () => {
    expect(
      coverage([rect(0, 0, 4, 1), rect(1, 0, 2, 1)], 4, 1, "evenodd"),
    ).toStrictEqual([[1, 0, 0, 1]]);
    expect(
      coverage([rect(0, 0, 4, 1), rect(1, 0, 2, 1, false)], 4, 1, "evenodd"),
    ).toStrictEqual([[1, 0, 0, 1]]);
    // Three deep is filled again
    expect(
      coverage(
        [rect(0, 0, 5, 1), rect(1, 0, 3, 1), rect(2, 0, 1, 1)],
        5,
        1,
        "evenodd",
      ),
    ).toStrictEqual([[1, 0, 1, 0, 1]]);
  });

  test("evenodd antialiases the edges of holes", () => {
    expect(
      coverage([rect(0, 0, 4, 1), rect(1.5, 0, 1, 1)], 4, 1, "evenodd"),
    ).toStrictEqual([[1, 0.5, 0.5, 1]]);
  });

  test("clips shapes to the area", () => {
    // Bigger than the area on every side
    expect(coverage([rect(-10, -10, 30, 30)], 3, 2)).toStrictEqual([
      [1, 1, 1],
      [1, 1, 1],
    ]);
    // Crossing the edges diagonally
    expect(
      coverage([{ points: [-1, -1, 4, -1, -1, 4], closed: true }], 3, 3),
    ).toStrictEqual([
      [1, 1, 0.5],
      [1, 0.5, 0],
      [0.5, 0, 0],
    ]);
    // Huge coordinates
    expect(coverage([rect(-1e12, -1e12, 2e12, 2e12)], 2, 1)).toStrictEqual([
      [1, 1],
    ]);
  });

  test("draws nothing for shapes outside the area", () => {
    for (const shape of [
      rect(-5, 0, 4, 2),
      rect(5, 0, 4, 2),
      rect(0, -5, 4, 2),
      rect(0, 5, 4, 2),
    ]) {
      let called = false;

      rasterize([shape], { width: 3, height: 3 }, () => {
        called = true;
      });
      expect(called).toBe(false);
    }
  });

  test("ignores degenerate outlines and non-finite points", () => {
    expect(
      coverage(
        [
          { points: [], closed: true },
          { points: [1, 1], closed: true },
          { points: [0, 0, 2, 0], closed: true },
          { points: [0, 0, NaN, 1, 2, Infinity], closed: true },
        ],
        2,
        2,
      ),
    ).toStrictEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test("does nothing for an empty area", () => {
    let called = false;

    rasterize([rect(0, 0, 1, 1)], { width: 0, height: 5 }, () => {
      called = true;
    });
    expect(called).toBe(false);
  });
});

describe("strokePolylines", () => {
  const line = { points: [1, 1.5, 4, 1.5], closed: false };

  test("butt caps stop at the ends", () => {
    expect(coverage(strokePolylines([line]), 6, 3)).toStrictEqual([
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
  });

  test("square caps go half the width past the ends", () => {
    expect(
      coverage(strokePolylines([line], { width: 2, cap: "square" }), 6, 3),
    ).toStrictEqual([
      [0.5, 0.5, 0.5, 0.5, 0.5, 0],
      [1, 1, 1, 1, 1, 0],
      [0.5, 0.5, 0.5, 0.5, 0.5, 0],
    ]);
  });

  test("round caps are half circles", () => {
    const rows = coverage(
      strokePolylines([{ points: [3, 3, 7, 3], closed: false }], {
        width: 4,
        cap: "round",
      }),
      10,
      6,
    );

    // The area is the rectangle plus a circle
    const area = rows.flat().reduce((a, b) => a + b, 0);

    expect(area).toBeCloseTo(4 * 4 + Math.PI * 4, 1);
    // Symmetric about the middle
    for (const row of rows) {
      expect(row).toStrictEqual([...row].reverse());
    }
  });

  test("dots for a single point with round or square caps", () => {
    const dot = [{ points: [2, 2], closed: false }];

    expect(coverage(strokePolylines(dot, { width: 2 }), 4, 4)).toStrictEqual(
      coverage([], 4, 4),
    );
    expect(
      coverage(strokePolylines(dot, { width: 2, cap: "square" }), 4, 4),
    ).toStrictEqual([
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ]);

    const area = coverage(
      strokePolylines(dot, { width: 2, cap: "round" }),
      4,
      4,
    )
      .flat()
      .reduce((a, b) => a + b, 0);

    expect(area).toBeCloseTo(Math.PI, 1);
  });

  // An L: down the left and along the top, 2 wide, with its corner at (3, 3)
  const corner = [{ points: [3, 9, 3, 3, 9, 3], closed: false }];

  function cornerPixel(join: "miter" | "round" | "bevel", miterLimit = 10) {
    return coverage(
      strokePolylines(corner, { width: 2, join, miterLimit }),
      10,
      10,
    )[2]![2];
  }

  test("joins corners", () => {
    // The pixel at the outside of the corner
    expect(cornerPixel("miter")).toBe(1);
    expect(cornerPixel("bevel")).toBe(0.5);
    // A quarter circle of radius 1
    expect(cornerPixel("round")).toBeCloseTo(Math.PI / 4, 2);
    // A right angle's miter is √2 times the width, so a lower limit bevels it
    expect(cornerPixel("miter", 1.4)).toBe(0.5);
  });

  test("fills the inside of corners", () => {
    const rows = coverage(strokePolylines(corner, { width: 2 }), 10, 10);

    expect(rows[3]!.slice(2, 5)).toStrictEqual([1, 1, 1]);
    expect(rows[4]!.slice(1, 5)).toStrictEqual([0, 1, 1, 0]);
  });

  test("closed outlines join up and leave the inside empty", () => {
    const square = [rect(2, 2, 4, 4)];

    expect(coverage(strokePolylines(square, { width: 2 }), 8, 8)).toStrictEqual(
      [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
    );
  });

  test("draws nothing with no width", () => {
    expect(strokePolylines([line], { width: 0 })).toStrictEqual([]);
  });
});
