import { expect, test, describe } from "vitest";

import { clampRegion, colorDiff, scan, scanIterator } from "./index.js";
import { JimpClass } from "@jimp/types";

// Convert [0..1] float to a percent value with only one decimal.
const pct = (n: number) => ((n * 1000) << 0) / 10;

describe("colorDiff", () => {
  test("totally opaque (no alpha defined)", () => {
    expect(colorDiff({ r: 255, g: 0, b: 0 }, { r: 255, g: 0, b: 0 })).toEqual(
      0,
    );

    expect(
      pct(colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 })),
    ).toEqual(33.3);

    expect(
      pct(colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 0 })),
    ).toEqual(66.6);

    expect(colorDiff({ r: 255, g: 0, b: 0 }, { r: 0, g: 255, b: 255 })).toEqual(
      1,
    );

    expect(colorDiff({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toEqual(
      1,
    );
  });

  test("totally transparent", () => {
    expect(
      colorDiff({ r: 255, g: 0, b: 0, a: 0 }, { r: 255, g: 0, b: 0, a: 0 }),
    ).toEqual(0);

    expect(
      colorDiff({ r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 0 }),
    ).toEqual(1);
  });

  test("different alpha", () => {
    expect(
      pct(
        colorDiff(
          { r: 255, g: 0, b: 0, a: 100 },
          { r: 255, g: 0, b: 0, a: 150 },
        ),
      ),
    ).toEqual(3.8);

    expect(
      colorDiff({ r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 }),
    ).toEqual(1);
  });
});

describe("scan", () => {
  class TestImage {
    public bitmap = {
      height: 3,
      width: 3,
      data: Buffer.from([
        0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00,
        0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00, 0xff, 0x00, 0x00, 0x00,
      ]),
    };
  }

  const img = new TestImage() as JimpClass;

  test("scan", () => {
    let count = 0;

    scan(img, function (_, __, idx) {
      count++;
      expect(img.bitmap.data[idx]).toBe(this.bitmap.data[idx]);
    });

    expect(count).toBe(img.bitmap.width * img.bitmap.height);
  });

  const scanned = (x: number, y: number, w: number, h: number) => {
    const pixels: [number, number, number][] = [];

    scan(img, x, y, w, h, (px, py, idx) => pixels.push([px, py, idx]));

    return pixels;
  };

  test("doesn't wrap past the right edge onto the next row", () => {
    expect(scanned(2, 0, 2, 2)).toEqual([
      [2, 0, 8],
      [2, 1, 20],
    ]);
  });

  test("doesn't scan outside the image", () => {
    expect(scanned(-1, -1, 2, 2)).toEqual([[0, 0, 0]]);
    expect(scanned(2, 2, 5, 5)).toEqual([[2, 2, 32]]);
    expect(scanned(3, 0, 1, 1)).toEqual([]);
  });
});

describe("scanIterator", () => {
  const img = {
    bitmap: { width: 3, height: 2, data: Buffer.alloc(3 * 2 * 4) },
  } as JimpClass;

  test("only yields pixels inside the image", () => {
    const pixels = [...scanIterator(img, 2, 1, 3, 3)].map(({ x, y, idx }) => [
      x,
      y,
      idx,
    ]);

    expect(pixels).toEqual([[2, 1, 20]]);
  });
});

describe("clampRegion", () => {
  const img = { bitmap: { width: 100, height: 50 } };

  test("leaves a region inside the image alone", () => {
    expect(clampRegion(img, 10, 10, 20, 20)).toEqual({
      x: 10,
      y: 10,
      w: 20,
      h: 20,
    });
  });

  test("rounds the region", () => {
    expect(clampRegion(img, 1.4, 1.6, 2.5, 2.4)).toEqual({
      x: 1,
      y: 2,
      w: 3,
      h: 2,
    });
  });

  test("drops the part of the region outside the image", () => {
    expect(clampRegion(img, -10, 40, 30, 30)).toEqual({
      x: 0,
      y: 40,
      w: 20,
      h: 10,
    });
    expect(clampRegion(img, 90, -5, 9000, 9000)).toEqual({
      x: 90,
      y: 0,
      w: 10,
      h: 50,
    });
  });

  test("is empty when the region doesn't overlap the image", () => {
    expect(clampRegion(img, 200, 0, 10, 10)).toEqual({
      x: 100,
      y: 0,
      w: 0,
      h: 10,
    });
    expect(clampRegion(img, -20, -20, 10, 10)).toEqual({
      x: 0,
      y: 0,
      w: 0,
      h: 0,
    });
    expect(clampRegion(img, 10, 10, -5, 5)).toEqual({
      x: 10,
      y: 10,
      w: 0,
      h: 5,
    });
  });
});
