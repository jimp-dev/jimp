import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";
import { ResizeStrategy } from "@jimp/plugin-resize";

import { AffineOptions, methods } from "./index.js";

type Matrix = AffineOptions["matrix"];

const jimp = createJimp({ plugins: [methods] });
const strategies = Object.values(ResizeStrategy);

function numbered(w: number, h: number) {
  const data = Buffer.alloc(w * h * 4);

  for (let i = 0; i < w * h; i++) {
    data.writeUInt32BE(((i + 1) * 0x01010100 + 0xff) >>> 0, i * 4);
  }

  return jimp.fromBitmap({ width: w, height: h, data });
}

function pixels(image: { bitmap: { data: Buffer } }) {
  const result: number[] = [];

  for (let i = 0; i < image.bitmap.data.length; i += 4) {
    result.push(image.bitmap.data.readUInt32BE(i));
  }

  return result;
}

const twoColours = () =>
  jimp.fromBitmap(makeTestImage("▴▴▴▪▪", "▴▴▴▪▪", "▪▪▪▴▴", "▪▪▪▴▴"));

describe("affine", () => {
  describe("the identity matrix is a no-op", () => {
    test.each(
      [true, false].flatMap((fit) =>
        [undefined, ...strategies].map((mode) => [fit, mode] as const),
      ),
    )("fit %s, mode %s", (fit, mode) => {
      const image = numbered(5, 3);
      const before = image.clone();

      expect(image.affine({ matrix: [1, 0, 0, 1, 0, 0], fit, mode })).toBe(
        image,
      );
      expect(image.bitmap).toEqual(before.bitmap);
    });
  });

  test("a translation is a no-op when the canvas fits the image", () => {
    const image = numbered(5, 3);

    expect(
      image.clone().affine({ matrix: [1, 0, 0, 1, 7, -3] }).bitmap,
    ).toEqual(image.bitmap);
  });

  test("a translation moves the image when the size is kept", () => {
    const image = jimp.fromBitmap(makeTestImage("▴▸▾", "◆▪▰", "□■▦"));

    expect(
      image.affine({ matrix: [1, 0, 0, 1, 1, -1], fit: false }).bitmap,
    ).toEqual(makeTestImage(" ◆▪", " □■", "   "));
  });

  describe("right angle rotations match rotate exactly", () => {
    // rotate turns counter-clockwise, which is CSS's rotate(-deg)
    const rotation = (deg: number) => {
      const rad = (-deg * Math.PI) / 180;
      const cos = Math.round(Math.cos(rad));
      const sin = Math.round(Math.sin(rad));
      return [cos, sin, -sin, cos, 0, 0] as const;
    };

    test.each(
      [90, 180, 270, -90].flatMap((deg) =>
        [undefined, ...strategies].map((mode) => [deg, mode] as const),
      ),
    )("%i degrees, mode %s", (deg, mode) => {
      const transformed = numbered(7, 4).affine({
        matrix: rotation(deg),
        mode,
      });

      expect(transformed.bitmap).toEqual(numbered(7, 4).rotate(deg).bitmap);
    });

    test.each([90, 180, 270])("%i degrees without resizing", (deg) => {
      const transformed = numbered(7, 4).affine({
        matrix: rotation(deg),
        fit: false,
      });

      expect(transformed.bitmap).toEqual(
        numbered(7, 4).rotate({ deg, mode: false }).bitmap,
      );
    });
  });

  test("a flip matches flip exactly, even when interpolating", () => {
    const image = jimp.fromBitmap(makeTestImage("▴▸▾", "◆▪▰"));

    expect(
      image.affine({
        matrix: [-1, 0, 0, 1, 0, 0],
        mode: ResizeStrategy.MITCHELL,
      }).bitmap,
    ).toEqual(makeTestImage("▾▸▴", "▰▪◆"));
  });

  test.each([
    { matrix: [2, 0, 0, 2, 0, 0], size: [10, 6] },
    { matrix: [0.5, 0, 0, 0.5, 0, 0], size: [3, 2] },
    { matrix: [2, 0, 0, 1, 0, 0], size: [10, 3] },
    { matrix: [0, 1, 1, 0, 0, 0], size: [3, 5] },
    { matrix: [1, 0, 1, 1, 0, 0], size: [9, 3] },
    { matrix: [1, 0, 0, 1, 4, 4], size: [5, 3] },
    { matrix: [0.001, 0, 0, 0.001, 0, 0], size: [1, 1] },
  ] as { matrix: Matrix; size: number[] }[])(
    "$matrix fits a 5x3 image in $size",
    ({ matrix, size }) => {
      const image = numbered(5, 3).affine({ matrix });

      expect([image.width, image.height]).toEqual(size);
      expect(
        numbered(5, 3).affine({ matrix, fit: false }).bitmap,
      ).toMatchObject({ width: 5, height: 3 });
    },
  );

  test("fills new space with the background colour", () => {
    const image = new jimp({ width: 4, height: 4, color: 0xff0000ff });

    image.background = 0x0000ffff;
    image.affine({ matrix: [1, 0, 1, 1, 0, 0] });

    expect(new Set(pixels(image))).toEqual(new Set([0xff0000ff, 0x0000ffff]));
    expect(image.getPixelColor(0, 3)).toBe(0x0000ffff);
    expect(image.getPixelColor(image.width - 1, 0)).toBe(0x0000ffff);
  });

  describe("interpolation", () => {
    test("nearest neighbour is the same as the default", () => {
      const matrix = [1, 0.2, 0.4, 1, 0, 0] as const;

      expect(
        twoColours().affine({
          matrix,
          mode: ResizeStrategy.NEAREST_NEIGHBOR,
        }).bitmap,
      ).toEqual(twoColours().affine({ matrix }).bitmap);
    });

    test.each(strategies)("%s skews smoothly", (mode) => {
      expect(twoColours().skew({ x: 20, mode })).toMatchSnapshot();
    });

    test.each(strategies.filter((s) => s !== ResizeStrategy.NEAREST_NEIGHBOR))(
      "%s blends neighbouring pixels",
      (mode) => {
        const image = twoColours();
        const colours = new Set([...pixels(image), image.background]);
        const skewed = pixels(image.skew({ x: 20, mode }));

        expect(skewed.some((pixel) => !colours.has(pixel))).toBe(true);
      },
    );

    test.each(strategies)(
      "%s doesn't darken edges against a transparent background",
      (mode) => {
        const image = new jimp({ width: 6, height: 4, color: 0xff8040ff });
        const skewed = image.skew({ x: 20, y: 10, mode });
        const visible = pixels(skewed).filter((pixel) => pixel & 0xff);

        expect(new Set(visible.map((pixel) => pixel >>> 8))).toEqual(
          new Set([0xff8040]),
        );
      },
    );
  });

  describe("invalid matrices throw", () => {
    test.each([
      [1, 2, 2, 4, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0],
    ] as Matrix[])("%j can't be inverted", (...matrix) => {
      expect(() => numbered(3, 3).affine({ matrix })).toThrow(
        /The matrix can't be inverted/,
      );
    });

    test.each([
      [NaN, 0, 0, 1, 0, 0],
      [1, 0, 0, 1, Infinity, 0],
    ] as Matrix[])("%j isn't finite", (...matrix) => {
      expect(() => numbered(3, 3).affine({ matrix })).toThrow(
        /expected number/,
      );
    });

    test("a matrix needs 6 numbers", () => {
      expect(() =>
        numbered(3, 3).affine({ matrix: [1, 0, 0, 1] as never }),
      ).toThrow();
    });
  });
});

describe("skew", () => {
  const image = () => jimp.fromBitmap(makeTestImage("▴▸▾", "◆▪▰", "□■▦"));

  test("no angles is a no-op", () => {
    expect(image().skew({}).bitmap).toEqual(image().bitmap);
    expect(image().skew({ x: 0, y: 180 }).bitmap).toEqual(image().bitmap);
  });

  test("x slants vertical lines like a backslash", () => {
    expect(image().skew({ x: 45 }).bitmap).toEqual(
      makeTestImage(
        " ▴▸▾   ", //
        "  ◆▪▰  ",
        "   □■▦ ",
      ),
    );
  });

  test("negative x slants vertical lines like a slash", () => {
    expect(image().skew({ x: -45 }).bitmap).toEqual(
      makeTestImage(
        "   ▴▸▾ ", //
        "  ◆▪▰  ",
        " □■▦   ",
      ),
    );
  });

  test("y moves the right side down", () => {
    expect(image().skew({ y: 45 }).bitmap).toEqual(
      makeTestImage("   ", "▴  ", "◆▸ ", "□▪▾", " ■▰", "  ▦", "   "),
    );
  });

  test("keeps the centre row in place", () => {
    expect(image().skew({ x: 30 }).bitmap).toEqual(
      makeTestImage(
        "▴▸▾  ", //
        " ◆▪▰ ",
        "  □■▦",
      ),
    );
  });

  test("keeps the size with fit: false", () => {
    expect(image().skew({ x: 30, fit: false }).bitmap).toEqual(
      makeTestImage(
        "▸▾ ", //
        "◆▪▰",
        " □■",
      ),
    );
  });

  test("is CSS's skew(x, y)", () => {
    const x = 20;
    const y = -10;
    const tan = (deg: number) => Math.tan((deg * Math.PI) / 180);

    expect(numbered(6, 4).skew({ x, y }).bitmap).toEqual(
      numbered(6, 4).affine({ matrix: [1, tan(y), tan(x), 1, 0, 0] }).bitmap,
    );
  });

  test("throws for 90 degrees", () => {
    expect(() => image().skew({ x: 90 })).toThrow(/can't be 90 degrees/);
    expect(() => image().skew({ y: -270 })).toThrow(/can't be 90 degrees/);
  });

  test("throws when the skews cancel out into a line", () => {
    expect(() => image().skew({ x: 45, y: 45 })).toThrow(
      /The matrix can't be inverted/,
    );
  });
});
