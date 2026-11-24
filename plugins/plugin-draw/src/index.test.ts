import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import { fillPath, methods, rasterize, strokePath } from "./index.js";

const Jimp = createJimp({ plugins: [methods] });

type Image = InstanceType<typeof Jimp>;

function makeImage(width: number, height: number, color = 0x00000000) {
  return new Jimp({ width, height, color });
}

/** The [r, g, b, a] of a pixel */
function pixel(image: Image, x: number, y: number) {
  const idx = image.getPixelIndex(x, y);
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

/** The alpha channel as rows of numbers */
function alphas(image: Image) {
  const rows: number[][] = [];

  for (let y = 0; y < image.bitmap.height; y++) {
    const row: number[] = [];

    for (let x = 0; x < image.bitmap.width; x++) {
      row.push(pixel(image, x, y)[3]!);
    }

    rows.push(row);
  }

  return rows;
}

describe("drawRect", () => {
  test("fills whole pixels exactly", () => {
    const image = makeImage(5, 4).drawRect({
      x: 1,
      y: 1,
      w: 3,
      h: 2,
      fill: 0xff0000ff,
    });

    expect(alphas(image)).toStrictEqual([
      [0, 0, 0, 0, 0],
      [0, 255, 255, 255, 0],
      [0, 255, 255, 255, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(pixel(image, 2, 1)).toStrictEqual([255, 0, 0, 255]);
    // Pixels outside the shape aren't touched
    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 0]);
  });

  test("antialiases edges by how much of each pixel they cover", () => {
    const image = makeImage(4, 1).drawRect({
      x: 0.5,
      y: 0,
      w: 2.25,
      h: 1,
      fill: "#000",
    });

    // Half, all, three quarters
    expect(alphas(image)).toStrictEqual([[128, 255, 191, 0]]);
  });

  test("negative sizes go left and up", () => {
    expect(
      makeImage(4, 4).drawRect({ x: 3, y: 3, w: -2, h: -2 }).bitmap.data,
    ).toStrictEqual(
      makeImage(4, 4).drawRect({ x: 1, y: 1, w: 2, h: 2 }).bitmap.data,
    );
  });

  test("fills black with no fill or stroke", () => {
    const image = makeImage(1, 1).drawRect({ x: 0, y: 0, w: 1, h: 1 });

    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 255]);
  });

  test("strokes centered on the edge, over the fill", () => {
    const image = makeImage(8, 8).drawRect({
      x: 2,
      y: 2,
      w: 4,
      h: 4,
      fill: "#00ff00",
      stroke: "#0000ff",
      strokeWidth: 2,
    });

    expect(alphas(image)).toStrictEqual([
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 255, 255, 255, 255, 255, 255, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    expect(pixel(image, 2, 2)).toStrictEqual([0, 0, 255, 255]);
    expect(pixel(image, 3, 3)).toStrictEqual([0, 255, 0, 255]);
  });

  test("rounds the corners the same way on every corner", () => {
    const image = makeImage(20, 12).drawRect({
      x: 2,
      y: 1,
      w: 16,
      h: 10,
      radius: 4,
      fill: "black",
    });
    const rows = alphas(image);

    // Mirrored left to right and top to bottom
    for (const row of rows) {
      expect(row).toStrictEqual([...row].reverse());
    }

    expect(rows).toStrictEqual([...rows].reverse());
    // The corner is cut off, the edges between the corners are solid
    expect(rows[1]![2]).toBe(0);
    expect(rows[1]![10]).toBe(255);
    expect(rows[6]![2]).toBe(255);
    // A quarter circle of radius 4 is missing from each corner's 4x4 square
    const corner = rows
      .slice(1, 5)
      .flatMap((row) => row.slice(2, 6))
      .reduce((a, b) => a + b / 255, 0);

    expect(corner).toBeCloseTo(16 - (16 - 4 * Math.PI), 1);
  });

  test("rounds each corner differently, and scales radii to fit", () => {
    const image = makeImage(10, 10).drawRect({
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      radius: { topLeft: 20 },
    });

    // The radius is scaled down to 10, so the corner reaches the next ones
    expect(pixel(image, 0, 0)[3]).toBe(0);
    expect(pixel(image, 9, 0)[3]).toBeGreaterThan(200);
    expect(pixel(image, 9, 0)).toStrictEqual(pixel(image, 0, 9));
    expect(pixel(image, 9, 9)[3]).toBe(255);
  });
});

describe("drawEllipse", () => {
  test("is symmetric and has the area of an ellipse", () => {
    const image = makeImage(32, 24).drawEllipse({
      cx: 16,
      cy: 12,
      rx: 10,
      ry: 6,
      fill: "black",
    });
    const rows = alphas(image);

    for (const row of rows) {
      expect(row).toStrictEqual([...row].reverse());
    }

    expect(rows).toStrictEqual([...rows].reverse());

    const area = rows.flat().reduce((a, b) => a + b / 255, 0);

    expect(area).toBeCloseTo(Math.PI * 10 * 6, 0);
  });

  test("a circle is symmetric about both diagonals", () => {
    const image = makeImage(21, 21).drawEllipse({
      cx: 10.5,
      cy: 10.5,
      rx: 8,
      ry: 8,
      stroke: "black",
      strokeWidth: 2,
    });
    const rows = alphas(image);

    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        expect(rows[y]![x]).toBe(rows[x]![y]);
      }
    }

    // The ring has an empty middle
    expect(rows[10]![10]).toBe(0);
    expect(rows[10]![2]).toBe(255);
  });
});

describe("drawLine", () => {
  test("draws a crisp line on pixel centers", () => {
    const image = makeImage(6, 3).drawLine({
      x1: 1,
      y1: 1.5,
      x2: 5,
      y2: 1.5,
      color: "black",
    });

    expect(alphas(image)).toStrictEqual([
      [0, 0, 0, 0, 0, 0],
      [0, 255, 255, 255, 255, 0],
      [0, 0, 0, 0, 0, 0],
    ]);
  });

  test("a line on pixel edges covers half of two rows", () => {
    const image = makeImage(4, 3).drawLine({
      x1: 0,
      y1: 1,
      x2: 4,
      y2: 1,
      color: "black",
    });

    expect(alphas(image)).toStrictEqual([
      [128, 128, 128, 128],
      [128, 128, 128, 128],
      [0, 0, 0, 0],
    ]);
  });

  test("caps", () => {
    const line = (cap?: "butt" | "round" | "square") =>
      alphas(
        makeImage(8, 3).drawLine({
          x1: 2,
          y1: 1.5,
          x2: 6,
          y2: 1.5,
          color: "black",
          cap,
        }),
      )[1];

    expect(line()).toStrictEqual([0, 0, 255, 255, 255, 255, 0, 0]);
    expect(line("butt")).toStrictEqual([0, 0, 255, 255, 255, 255, 0, 0]);
    expect(line("square")).toStrictEqual([0, 128, 255, 255, 255, 255, 128, 0]);

    // A half circle of radius 0.5 past each end
    const round = line("round")!;

    expect(round.slice(2, 6)).toStrictEqual([255, 255, 255, 255]);
    expect(round[1]).toBeCloseTo((255 * Math.PI) / 8, -1);
    expect(round[6]).toBe(round[1]);
  });

  test("diagonal lines are antialiased evenly along their length", () => {
    const image = makeImage(20, 20).drawLine({
      x1: 0,
      y1: 0,
      x2: 20,
      y2: 20,
      color: "black",
      width: 2,
    });
    const rows = alphas(image);

    // Symmetric about the diagonal, and every step looks the same
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        expect(rows[y]![x]).toBe(rows[x]![y]);
      }
    }

    expect(rows[10]!.slice(8, 13)).toStrictEqual(rows[5]!.slice(3, 8));
    // Each row has the line's area: 2√2 pixels
    expect(rows[10]!.reduce((a, b) => a + b / 255, 0)).toBeCloseTo(
      2 * Math.SQRT2,
      1,
    );
  });

  test("draws nothing with a width of 0", () => {
    const image = makeImage(4, 4).drawLine({
      x1: 0,
      y1: 0,
      x2: 4,
      y2: 4,
      color: "black",
      width: 0,
    });

    expect(
      alphas(image)
        .flat()
        .every((a) => a === 0),
    ).toBe(true);
  });
});

describe("drawPolygon", () => {
  const star: [number, number][] = [
    [10, 0],
    [16, 20],
    [0, 7],
    [20, 7],
    [4, 20],
  ];

  test("fills with the nonzero rule by default", () => {
    const image = makeImage(20, 20).drawPolygon({ points: star });

    // The middle of the star is filled
    expect(pixel(image, 10, 10)[3]).toBe(255);
  });

  test("evenodd leaves the middle of a star empty", () => {
    const image = makeImage(20, 20).drawPolygon({
      points: star,
      fillRule: "evenodd",
    });

    expect(pixel(image, 10, 10)[3]).toBe(0);
    expect(pixel(image, 10, 5)[3]).toBe(255);
  });

  test("takes points as [x, y] or { x, y }", () => {
    expect(
      makeImage(10, 10).drawPolygon({
        points: star.map(([x, y]) => ({ x: x / 2, y: y / 2 })),
      }).bitmap.data,
    ).toStrictEqual(
      makeImage(10, 10).drawPolygon({
        points: star.map(([x, y]) => [x / 2, y / 2]),
      }).bitmap.data,
    );
  });

  test("open polylines aren't joined up", () => {
    const draw = (closed: boolean) =>
      alphas(
        makeImage(6, 6).drawPolygon({
          points: [
            [1, 1],
            [5, 1],
            [5, 5],
          ],
          closed,
          stroke: "black",
          strokeWidth: 1,
        }),
      );

    // The diagonal from (5, 5) back to (1, 1) is only there when closed
    expect(draw(true)[3]![3]).toBeGreaterThan(0);
    expect(draw(false)[3]![3]).toBe(0);
  });

  test("joins", () => {
    const corner = (join: "miter" | "round" | "bevel") =>
      pixel(
        makeImage(10, 10).drawPolygon({
          points: [
            [3, 9],
            [3, 3],
            [9, 3],
          ],
          closed: false,
          stroke: "black",
          strokeWidth: 2,
          join,
        }),
        2,
        2,
      )[3];

    expect(corner("miter")).toBe(255);
    expect(corner("bevel")).toBe(128);
    expect(corner("round")).toBeCloseTo(255 * (Math.PI / 4), -1);
  });
});

describe("drawPath", () => {
  test("draws SVG path data", () => {
    expect(
      makeImage(6, 6).drawPath({ path: "M1 1 h4 v4 h-4 Z" }).bitmap.data,
    ).toStrictEqual(
      makeImage(6, 6).drawRect({ x: 1, y: 1, w: 4, h: 4 }).bitmap.data,
    );
  });

  test("draws commands", () => {
    expect(
      makeImage(6, 6).drawPath({
        path: [
          { type: "M", x: 1, y: 1 },
          { type: "L", x: 5, y: 1 },
          { type: "L", x: 5, y: 5 },
          { type: "L", x: 1, y: 5 },
          { type: "Z" },
        ],
      }).bitmap.data,
    ).toStrictEqual(
      makeImage(6, 6).drawRect({ x: 1, y: 1, w: 4, h: 4 }).bitmap.data,
    );
  });

  test("fill rules cut holes", () => {
    // Two squares drawn the same way round
    const path = "M0 0 H6 V6 H0 Z M2 2 H4 V4 H2 Z";

    expect(pixel(makeImage(6, 6).drawPath({ path }), 3, 3)[3]).toBe(255);
    expect(
      pixel(makeImage(6, 6).drawPath({ path, fillRule: "evenodd" }), 3, 3)[3],
    ).toBe(0);
  });

  test("throws for invalid path data", () => {
    expect(() => makeImage(6, 6).drawPath({ path: "M 1 1 L" })).toThrow(
      "Invalid path data: expected a number at position 7",
    );
  });
});

describe("compositing", () => {
  test("blends over existing pixels like composite", () => {
    const base = () => makeImage(1, 1, 0x3366cc80);
    const drawn = base().drawRect({
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      fill: 0xff8800b0,
    });
    const composited = base().composite(makeImage(1, 1, 0xff8800b0));

    expect(pixel(drawn, 0, 0)).toStrictEqual(pixel(composited, 0, 0));
  });

  test("partial coverage multiplies the alpha", () => {
    const base = () => makeImage(2, 1, 0x3366ccff);
    const drawn = base().drawRect({
      x: 0,
      y: 0,
      w: 1.5,
      h: 1,
      fill: 0xff8800ff,
    });
    const composited = base().composite(makeImage(1, 1, 0xff880080), 1, 0);

    expect(pixel(drawn, 0, 0)).toStrictEqual([255, 136, 0, 255]);
    expect(pixel(drawn, 1, 0)).toStrictEqual(pixel(composited, 1, 0));
  });

  test("drawing on a transparent pixel keeps the paint's color", () => {
    const image = makeImage(2, 1).drawRect({
      x: 0,
      y: 0,
      w: 1.5,
      h: 1,
      fill: "rgba(255, 0, 0, 0.5)",
    });

    expect(pixel(image, 0, 0)).toStrictEqual([255, 0, 0, 128]);
    expect(pixel(image, 1, 0)).toStrictEqual([255, 0, 0, 64]);
  });
});

describe("colors", () => {
  const draw = (
    fill: Parameters<Image["drawRect"]>[0]["fill"],
    image = makeImage(1, 1),
  ) => pixel(image.drawRect({ x: 0, y: 0, w: 1, h: 1, fill }), 0, 0);

  test("hex numbers, CSS colors and { r, g, b, a }", () => {
    expect(draw(0x11223344)).toStrictEqual([0x11, 0x22, 0x33, 0x44]);
    expect(draw("#112233")).toStrictEqual([0x11, 0x22, 0x33, 0xff]);
    expect(draw("rgba(17, 34, 51, 0.5)")).toStrictEqual([17, 34, 51, 128]);
    expect(draw({ r: 17, g: 34, b: 51 })).toStrictEqual([17, 34, 51, 255]);
    expect(draw({ r: 17, g: 34, b: 51, a: 68 })).toStrictEqual([
      17, 34, 51, 68,
    ]);
    // Out of range channels are clamped
    expect(draw({ r: -5, g: 300, b: 51.4 })).toStrictEqual([0, 255, 51, 255]);
  });

  test("converts CSS colors to the image's colour space", () => {
    const image = new Jimp({
      width: 1,
      height: 1,
      color: 0,
      colorSpace: "display-p3",
    });

    // sRGB red in Display P3
    expect(draw("red", image)).toStrictEqual([0xea, 0x33, 0x23, 0xff]);
  });

  test("throws for invalid colors", () => {
    expect(() => draw("notacolor")).toThrow('Invalid color "notacolor"');
    expect(() =>
      makeImage(1, 1).drawLine({ x1: 0, y1: 0, x2: 1, y2: 1, color: "nope" }),
    ).toThrow('Invalid color "nope"');
    expect(() => draw(-1)).toThrow();
    expect(() => draw(0x1ffffffff)).toThrow();
  });

  test("an invalid stroke draws nothing, not even the fill", () => {
    const image = makeImage(1, 1);

    expect(() =>
      image.drawRect({
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        fill: "red",
        stroke: "notacolor",
      }),
    ).toThrow('Invalid color "notacolor"');
    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 0]);
  });
});

describe("gradients", () => {
  test("linear gradients interpolate between stops", () => {
    const image = makeImage(10, 1).drawRect({
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      fill: {
        type: "linear",
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 0,
        stops: [
          { offset: 0, color: "#000000" },
          { offset: 1, color: "#ff0000" },
        ],
      },
    });

    // Sampled at pixel centers
    for (let x = 0; x < 10; x++) {
      expect(pixel(image, x, 0)[0]).toBeCloseTo(((x + 0.5) / 10) * 255, -0.5);
    }
  });

  test("several stops, hard stops and the colors past the ends", () => {
    const image = makeImage(12, 1).drawRect({
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      fill: {
        type: "linear",
        x1: 2,
        y1: 0,
        x2: 10,
        y2: 0,
        stops: [
          { offset: 0, color: "#ff0000" },
          { offset: 0.5, color: "#00ff00" },
          { offset: 0.5, color: "#0000ff" },
          { offset: 1, color: "#ffffff" },
        ],
      },
    });
    const at = (x: number) => pixel(image, x, 0).slice(0, 3);

    // Before the start, the first color; after the end, the last
    expect(at(0)).toStrictEqual([255, 0, 0]);
    expect(at(1)).toStrictEqual([255, 0, 0]);
    expect(at(11)).toStrictEqual([255, 255, 255]);
    // Pixel 3's center is 0.1875 of the way along, 0.375 from red to green
    expect(at(3)[0]).toBeCloseTo(255 * 0.625, -0.5);
    expect(at(3)[1]).toBeCloseTo(255 * 0.375, -0.5);
    // Either side of the hard stop
    expect(at(5)[1]).toBeGreaterThan(200);
    expect(at(5)[2]).toBe(0);
    expect(at(6)[1]).toBe(at(6)[0]);
    expect(at(6)[2]).toBeGreaterThan(200);
  });

  test("fading to transparent doesn't darken the color", () => {
    const image = makeImage(10, 1).drawRect({
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      fill: {
        type: "linear",
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 0,
        stops: [
          { offset: 0, color: "red" },
          { offset: 1, color: "transparent" },
        ],
      },
    });

    for (let x = 0; x < 10; x++) {
      const [r, g, b, a] = pixel(image, x, 0);

      expect([r, g, b]).toStrictEqual([255, 0, 0]);
      expect(a).toBeCloseTo((1 - (x + 0.5) / 10) * 255, -0.5);
    }
  });

  test("radial gradients go from the center out", () => {
    const image = makeImage(21, 21).drawRect({
      x: 0,
      y: 0,
      w: 21,
      h: 21,
      fill: {
        type: "radial",
        cx: 10.5,
        cy: 10.5,
        r: 10,
        stops: [
          { offset: 0, color: "white" },
          { offset: 1, color: "black" },
        ],
      },
    });

    expect(pixel(image, 10, 10)).toStrictEqual([255, 255, 255, 255]);
    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 0, 255]);
    // Halfway out is halfway between
    expect(pixel(image, 15, 10)[0]).toBeCloseTo(255 * 0.5, -1);
    expect(pixel(image, 10, 15)).toStrictEqual(pixel(image, 15, 10));
  });

  test("a gradient with no length is its last color", () => {
    const image = makeImage(1, 1).drawRect({
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      fill: {
        type: "linear",
        x1: 5,
        y1: 5,
        x2: 5,
        y2: 5,
        stops: [
          { offset: 0, color: "red" },
          { offset: 1, color: "blue" },
        ],
      },
    });

    expect(pixel(image, 0, 0)).toStrictEqual([0, 0, 255, 255]);
  });
});

describe("floodFill", () => {
  /** A 5x5 white image with a black ring around the middle pixel */
  function ring() {
    const image = makeImage(5, 5, 0xffffffff);

    for (const [x, y] of [
      [1, 1],
      [2, 1],
      [3, 1],
      [1, 2],
      [3, 2],
      [1, 3],
      [2, 3],
      [3, 3],
    ]) {
      image.setPixelColor(0x000000ff, x!, y!);
    }

    return image;
  }

  test("fills the connected area of the same color", () => {
    const image = ring().floodFill({ x: 0, y: 0, color: 0xff0000ff });

    expect(pixel(image, 0, 0)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(image, 4, 4)).toStrictEqual([255, 0, 0, 255]);
    // The ring and the pixel inside it aren't connected
    expect(pixel(image, 1, 1)).toStrictEqual([0, 0, 0, 255]);
    expect(pixel(image, 2, 2)).toStrictEqual([255, 255, 255, 255]);
  });

  test("doesn't fill through diagonal gaps", () => {
    const image = makeImage(3, 3, 0xffffffff);

    image.setPixelColor(0x000000ff, 1, 0);
    image.setPixelColor(0x000000ff, 0, 1);
    image.floodFill({ x: 0, y: 0, color: "red" });

    expect(pixel(image, 0, 0)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(image, 1, 1)).toStrictEqual([255, 255, 255, 255]);
  });

  test("tolerance fills similar colors", () => {
    // A row of greys getting darker
    const image = makeImage(6, 1);

    for (let x = 0; x < 6; x++) {
      const v = 255 - x * 20;
      image.setPixelColor(
        ((v << 24) | (v << 16) | (v << 8) | 0xff) >>> 0,
        x,
        0,
      );
    }

    const filled = (tolerance?: number) => {
      const result = image
        .clone()
        .floodFill({ x: 0, y: 0, color: 0xff0000ff, tolerance });

      return [0, 1, 2, 3, 4, 5].filter((x) => pixel(result, x, 0)[1] === 0)
        .length;
    };

    expect(filled()).toBe(1);
    // 20 / 255 is about 0.08
    expect(filled(0.08)).toBe(2);
    expect(filled(0.16)).toBe(3);
    expect(filled(1)).toBe(6);
  });

  test("fills transparent areas, whatever their hidden color", () => {
    const image = makeImage(3, 1);

    image.bitmap.data.set([255, 255, 255, 0], 4);
    image.floodFill({ x: 0, y: 0, color: "blue" });

    expect(alphas(image)).toStrictEqual([[255, 255, 255]]);
    expect(pixel(image, 1, 0)).toStrictEqual([0, 0, 255, 255]);
  });

  test("blends semi-transparent colors over the area", () => {
    const image = makeImage(2, 1, 0xffffffff).floodFill({
      x: 0,
      y: 0,
      color: "rgba(0, 0, 0, 0.5)",
    });

    expect(pixel(image, 1, 0)).toStrictEqual([127, 127, 127, 255]);
  });

  test("fills with a gradient", () => {
    const image = makeImage(10, 1).floodFill({
      x: 0,
      y: 0,
      color: {
        type: "linear",
        x1: 0,
        y1: 0,
        x2: 10,
        y2: 0,
        stops: [
          { offset: 0, color: "black" },
          { offset: 1, color: "white" },
        ],
      },
    });

    expect(pixel(image, 0, 0)[0]).toBeLessThan(pixel(image, 9, 0)[0]!);
  });

  test("a point outside the image fills nothing", () => {
    const image = ring();
    const before = Buffer.from(image.bitmap.data);

    image.floodFill({ x: -1, y: 2, color: "red" });
    image.floodFill({ x: 2, y: 5, color: "red" });

    expect(image.bitmap.data).toStrictEqual(before);
  });

  test("fills from the pixel a fractional point is in", () => {
    const image = ring().floodFill({ x: 2.9, y: 2.2, color: "red" });

    expect(pixel(image, 2, 2)).toStrictEqual([255, 0, 0, 255]);
    expect(pixel(image, 0, 0)).toStrictEqual([255, 255, 255, 255]);
  });
});

describe("clipping", () => {
  test("shapes partly outside the image are clipped", () => {
    const image = makeImage(4, 4).drawRect({
      x: -5,
      y: -5,
      w: 7,
      h: 7,
      fill: "black",
    });

    expect(alphas(image)).toStrictEqual([
      [255, 255, 0, 0],
      [255, 255, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]);
  });

  test("shapes outside the image change nothing", () => {
    const image = makeImage(4, 4, 0x11223344);
    const before = Buffer.from(image.bitmap.data);

    image
      .drawRect({ x: 10, y: 10, w: 5, h: 5, stroke: "red", strokeWidth: 3 })
      .drawEllipse({ cx: -100, cy: 2, rx: 50, ry: 50, fill: "red" })
      .drawLine({ x1: -10, y1: -10, x2: 100, y2: -10, color: "red", width: 4 })
      .drawPath({ path: "M 1e9 1e9 L 2e9 1e9 L 2e9 2e9 Z" });

    expect(image.bitmap.data).toStrictEqual(before);
  });

  test("lines crossing the whole image are clipped at its edges", () => {
    const image = makeImage(4, 4).drawLine({
      x1: -1000,
      y1: 2,
      x2: 1000,
      y2: 2,
      color: "black",
      width: 2,
    });

    expect(alphas(image)).toStrictEqual([
      [0, 0, 0, 0],
      [255, 255, 255, 255],
      [255, 255, 255, 255],
      [0, 0, 0, 0],
    ]);
  });
});

describe("validation", () => {
  test("non-finite numbers throw", () => {
    expect(() =>
      makeImage(4, 4).drawRect({ x: NaN, y: 0, w: 1, h: 1 }),
    ).toThrow("expected number, received NaN");
    expect(() =>
      makeImage(4, 4).drawLine({
        x1: 0,
        y1: 0,
        x2: Infinity,
        y2: 0,
        color: "red",
      }),
    ).toThrow("expected number, received Infinity");
    expect(() =>
      makeImage(4, 4).drawPolygon({
        points: [
          [0, 0],
          [1, NaN],
          [2, 2],
        ],
      }),
    ).toThrow();
    expect(() =>
      makeImage(4, 4).drawPath({
        path: [{ type: "M", x: 0, y: Infinity }],
      }),
    ).toThrow();
  });

  test("negative sizes throw", () => {
    expect(() =>
      makeImage(4, 4).drawEllipse({ cx: 0, cy: 0, rx: -1, ry: 1 }),
    ).toThrow();
    expect(() =>
      makeImage(4, 4).drawLine({
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
        color: "red",
        width: -1,
      }),
    ).toThrow();
  });
});

describe("raster API", () => {
  test("fillPath fills paths with a transform", () => {
    const image = makeImage(6, 6);

    // A unit square, scaled up and moved
    fillPath(image, "M0 0 H1 V1 H0 Z", "black", {
      transform: [4, 0, 0, 4, 1, 1],
    });

    expect(image.bitmap.data).toStrictEqual(
      makeImage(6, 6).drawRect({ x: 1, y: 1, w: 4, h: 4 }).bitmap.data,
    );
  });

  test("fillPath fills glyph-like outlines with holes", () => {
    const image = makeImage(10, 10);

    // An "O": the outer contour clockwise, the inner one anticlockwise, as
    // in TrueType fonts
    fillPath(
      image,
      [
        { type: "M", x: 1, y: 1 },
        { type: "L", x: 9, y: 1 },
        { type: "L", x: 9, y: 9 },
        { type: "L", x: 1, y: 9 },
        { type: "Z" },
        { type: "M", x: 3, y: 3 },
        { type: "L", x: 3, y: 7 },
        { type: "L", x: 7, y: 7 },
        { type: "L", x: 7, y: 3 },
        { type: "Z" },
      ],
      "black",
    );

    expect(pixel(image, 2, 2)[3]).toBe(255);
    expect(pixel(image, 5, 5)[3]).toBe(0);
  });

  test("strokePath strokes paths", () => {
    const image = makeImage(6, 3);

    strokePath(image, "M1 1.5 H5", "black", { width: 1 });

    expect(image.bitmap.data).toStrictEqual(
      makeImage(6, 3).drawLine({
        x1: 1,
        y1: 1.5,
        x2: 5,
        y2: 1.5,
        color: "black",
      }).bitmap.data,
    );
  });

  test("rasterize gives coverage to draw anywhere", () => {
    const mask = new Float32Array(4 * 2);

    rasterize(
      [{ points: [0, 0, 2, 0, 2, 2, 0, 2], closed: true }],
      { width: 4, height: 2 },
      (y, x0, x1, coverage) => {
        mask.set(coverage.subarray(x0, x1), y * 4 + x0);
      },
    );

    expect([...mask]).toStrictEqual([1, 1, 0, 0, 1, 1, 0, 0]);
  });
});
