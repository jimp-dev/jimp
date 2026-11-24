import { describe, expect, test } from "vitest";

import { flattenPath, parseSvgPath, type PathCommand } from "./index.js";

/** Round every number in the commands, to compare curves */
function rounded(commands: PathCommand[], digits = 3) {
  const f = 10 ** digits;

  return commands.map((command) =>
    Object.fromEntries(
      Object.entries(command).map(([key, value]) => [
        key,
        typeof value === "number" ? Math.round(value * f) / f + 0 : value,
      ]),
    ),
  );
}

describe("parseSvgPath", () => {
  test("absolute commands", () => {
    expect(
      parseSvgPath("M 10 20 L 30 40 Q 1 2 3 4 C 1 2 3 4 5 6 Z"),
    ).toStrictEqual([
      { type: "M", x: 10, y: 20 },
      { type: "L", x: 30, y: 40 },
      { type: "Q", x1: 1, y1: 2, x: 3, y: 4 },
      { type: "C", x1: 1, y1: 2, x2: 3, y2: 4, x: 5, y: 6 },
      { type: "Z" },
    ]);
  });

  test("relative commands, horizontal and vertical lines", () => {
    expect(parseSvgPath("m10 10 l5 5 h10 v-5 H0 V0 z")).toStrictEqual([
      { type: "M", x: 10, y: 10 },
      { type: "L", x: 15, y: 15 },
      { type: "L", x: 25, y: 15 },
      { type: "L", x: 25, y: 10 },
      { type: "L", x: 0, y: 10 },
      { type: "L", x: 0, y: 0 },
      { type: "Z" },
    ]);
    // Relative curves are relative to the start of the curve
    expect(parseSvgPath("M10 10 q 5 0 5 5 c 0 5 -5 5 -5 5")).toStrictEqual([
      { type: "M", x: 10, y: 10 },
      { type: "Q", x1: 15, y1: 10, x: 15, y: 15 },
      { type: "C", x1: 15, y1: 20, x2: 10, y2: 20, x: 10, y: 20 },
    ]);
  });

  test("repeated arguments repeat the command, and after M they're lines", () => {
    expect(parseSvgPath("M0 0 10 0 10 10 l 1 1 2 2")).toStrictEqual([
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 10, y: 0 },
      { type: "L", x: 10, y: 10 },
      { type: "L", x: 11, y: 11 },
      { type: "L", x: 13, y: 13 },
    ]);
    expect(parseSvgPath("m1 1 1 1")).toStrictEqual([
      { type: "M", x: 1, y: 1 },
      { type: "L", x: 2, y: 2 },
    ]);
  });

  test("after Z, the current point is the subpath's start", () => {
    expect(parseSvgPath("M10 10 L20 10 Z l 5 5")).toStrictEqual([
      { type: "M", x: 10, y: 10 },
      { type: "L", x: 20, y: 10 },
      { type: "Z" },
      { type: "L", x: 15, y: 15 },
    ]);
  });

  test("compact numbers", () => {
    expect(parseSvgPath("M1.5.5L-1-2,3e1-.5E-1")).toStrictEqual([
      { type: "M", x: 1.5, y: 0.5 },
      { type: "L", x: -1, y: -2 },
      { type: "L", x: 30, y: -0.05 },
    ]);
  });

  test("smooth curves reflect the last control point", () => {
    expect(parseSvgPath("M0 0 C 0 10 10 10 10 0 S 20 -10 20 0")).toStrictEqual([
      { type: "M", x: 0, y: 0 },
      { type: "C", x1: 0, y1: 10, x2: 10, y2: 10, x: 10, y: 0 },
      { type: "C", x1: 10, y1: -10, x2: 20, y2: -10, x: 20, y: 0 },
    ]);
    expect(parseSvgPath("M0 0 Q 5 10 10 0 T 20 0 t 10 0")).toStrictEqual([
      { type: "M", x: 0, y: 0 },
      { type: "Q", x1: 5, y1: 10, x: 10, y: 0 },
      { type: "Q", x1: 15, y1: -10, x: 20, y: 0 },
      { type: "Q", x1: 25, y1: 10, x: 30, y: 0 },
    ]);
    // With no curve before, the control point is the current point
    expect(parseSvgPath("M0 0 S 5 5 10 0 T 20 0")).toStrictEqual([
      { type: "M", x: 0, y: 0 },
      { type: "C", x1: 0, y1: 0, x2: 5, y2: 5, x: 10, y: 0 },
      { type: "Q", x1: 10, y1: 0, x: 20, y: 0 },
    ]);
  });

  test("arcs become cubic curves on the ellipse", () => {
    // A half circle of radius 10 centered on (10, 0), clockwise on screen,
    // so through (10, 10)
    const commands = parseSvgPath("M0 0 A 10 10 0 0 0 20 0");

    expect(commands).toHaveLength(3);
    expect(commands[2]).toMatchObject({ x: 20, y: 0 });
    expect(rounded(commands)[1]).toMatchObject({ x: 10, y: 10 });

    // Every flattened point is on the circle
    const { points } = flattenPath(commands, { tolerance: 0.01 })[0]!;

    for (let i = 0; i < points.length; i += 2) {
      expect(Math.hypot(points[i]! - 10, points[i + 1]!)).toBeCloseTo(10, 2);
    }

    // The sweep flag picks the other side, the large arc flag the long way
    expect(rounded(parseSvgPath("M0 0 a 10 10 0 0 1 20 0"))[1]).toMatchObject({
      x: 10,
      y: -10,
    });
    expect(
      rounded(parseSvgPath("M0 0 A 10 10 0 1 1 10 10")).at(-1),
    ).toMatchObject({ x: 10, y: 10 });
    expect(parseSvgPath("M0 0 A 10 10 0 1 1 10 10")).toHaveLength(4);
  });

  test("arcs with flags that run into the numbers", () => {
    expect(parseSvgPath("M0 0a10 10 0 0020 0")).toStrictEqual(
      parseSvgPath("M0 0 a 10 10 0 0 0 20 0"),
    );
  });

  test("arcs with radii too small are scaled up, and zero radii are lines", () => {
    const commands = parseSvgPath("M0 0 A 1 1 0 0 0 20 0");

    expect(rounded(commands)[1]).toMatchObject({ x: 10, y: 10 });
    expect(parseSvgPath("M0 0 A 0 10 0 0 0 20 0")).toStrictEqual([
      { type: "M", x: 0, y: 0 },
      { type: "L", x: 20, y: 0 },
    ]);
    // An arc to where it starts draws nothing
    expect(parseSvgPath("M5 5 A 10 10 0 0 0 5 5")).toStrictEqual([
      { type: "M", x: 5, y: 5 },
    ]);
  });

  test("throws for invalid path data", () => {
    expect(parseSvgPath("")).toStrictEqual([]);
    expect(() => parseSvgPath("L 10 10")).toThrow(
      'Invalid path data: it must start with a move command (M or m), not "L"',
    );
    expect(() => parseSvgPath("M 10")).toThrow(
      "Invalid path data: expected a number at position 4 but found the end of the path",
    );
    expect(() => parseSvgPath("M 10 10 X 5")).toThrow(
      'Invalid path data: expected a command at position 8 but found "X"',
    );
    expect(() => parseSvgPath("M0 0 A 1 1 0 2 0 5 5")).toThrow(
      "expected a flag (0 or 1) at position 13",
    );
  });
});

describe("flattenPath", () => {
  test("lines stay as they are", () => {
    expect(flattenPath("M 0 0 L 10 0 L 10 10 Z M 20 20 L 30 30")).toStrictEqual(
      [
        { points: [0, 0, 10, 0, 10, 10], closed: true },
        { points: [20, 20, 30, 30], closed: false },
      ],
    );
  });

  test("curves are within the tolerance", () => {
    const quad = (t: number) => [
      2 * (1 - t) * t * 50 + t * t * 100,
      2 * (1 - t) * t * 100,
    ];

    for (const tolerance of [1, 0.1, 0.01]) {
      const { points } = flattenPath("M 0 0 Q 50 100 100 0", { tolerance })[0]!;

      expect(Array.from(points).slice(0, 2)).toStrictEqual([0, 0]);
      expect(Array.from(points).slice(-2)).toStrictEqual([100, 0]);

      // The middle of each segment is close to the curve. The points are
      // evenly spaced in t, so each segment's middle is at the middle t.
      const n = points.length / 2 - 1;

      for (let i = 0; i < n; i++) {
        const [x, y] = quad((i + 0.5) / n);
        const mx = (points[i * 2]! + points[i * 2 + 2]!) / 2;
        const my = (points[i * 2 + 1]! + points[i * 2 + 3]!) / 2;

        expect(Math.hypot(mx - x!, my - y!)).toBeLessThanOrEqual(tolerance);
      }
    }

    // Tighter tolerances need more points
    expect(
      flattenPath("M 0 0 C 0 100 100 100 100 0", { tolerance: 0.01 })[0]!.points
        .length,
    ).toBeGreaterThan(
      flattenPath("M 0 0 C 0 100 100 100 100 0", { tolerance: 1 })[0]!.points
        .length,
    );
  });

  test("applies a transform", () => {
    expect(
      flattenPath("M 1 1 L 2 1", { transform: [2, 0, 0, -1, 10, 20] }),
    ).toStrictEqual([{ points: [12, 19, 14, 19], closed: false }]);
  });

  test("accepts commands, like opentype.js glyph paths", () => {
    expect(
      flattenPath([
        { type: "M", x: 0, y: 0 },
        { type: "L", x: 4, y: 0 },
        { type: "L", x: 4, y: 4 },
        { type: "Z" },
      ]),
    ).toStrictEqual([{ points: [0, 0, 4, 0, 4, 4], closed: true }]);
  });

  test("throws for invalid commands", () => {
    expect(() =>
      flattenPath([
        { type: "M", x: 0, y: 0 },
        { type: "L", x: NaN, y: 0 },
      ]),
    ).toThrow("Path command 1 (L) needs x to be a finite number, got NaN");
    expect(() =>
      flattenPath([{ type: "X" } as unknown as PathCommand]),
    ).toThrow('Unknown path command "X" at index 0, expected M, L, Q, C or Z');
  });
});
