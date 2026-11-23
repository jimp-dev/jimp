import { expect, test, describe } from "vitest";
import "@jimp/test-utils";

import { createJimp } from "@jimp/core";

import { methods as dither, DitherOptions } from "./index.js";

const jimp = createJimp({ plugins: [dither] });

const types = ["floyd-steinberg", "atkinson", "bayer4", "bayer8"] as const;

/** A width × height image where pixel (x, y) is the grey from `grey(x, y)` */
function greyImage(
  width: number,
  height: number,
  grey: (x: number, y: number) => number,
) {
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      data.fill(grey(x, y), idx, idx + 3);
      data[idx + 3] = 255;
    }
  }

  return jimp.fromBitmap({ data, width, height });
}

/** The red value of each pixel, one array per row */
function rows(image: ReturnType<typeof greyImage>) {
  const { width, height, data } = image.bitmap;

  return Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => data[(y * width + x) * 4]!),
  );
}

/** A small image with every kind of pixel, including part and fully transparent ones */
function mixedImage() {
  const width = 16;
  const height = 16;
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    data[i * 4] = (i * 37) & 255;
    data[i * 4 + 1] = (i * 91 + 13) & 255;
    data[i * 4 + 2] = (i * 151 + 101) & 255;
    data[i * 4 + 3] = [0, 0, 1, 64, 128, 200, 254, 255][i % 8]!;
  }

  return jimp.fromBitmap({ data, width, height });
}

// The standard Bayer matrices
const bayer4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const bayer8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

describe("Dither", () => {
  describe("default", () => {
    test("adds the 4×4 pattern to each colour channel", () => {
      const image = greyImage(4, 4, () => 100).dither();

      expect(rows(image)).toStrictEqual(
        bayer4.map((row) => row.map((m) => 100 + m + 1)),
      );
    });

    test("is the same with no options, {} and type rgb565", () => {
      const expected = mixedImage().dither().bitmap.data;

      expect(mixedImage().dither({}).bitmap.data).toStrictEqual(expected);
      expect(mixedImage().dither({ type: "rgb565" }).bitmap.data).toStrictEqual(
        expected,
      );
    });
  });

  describe("floyd-steinberg", () => {
    test("turns a grey gradient into black and white with the same brightness", () => {
      const width = 256;
      const height = 64;
      const image = greyImage(width, height, (x) => x).dither({
        type: "floyd-steinberg",
      });
      const output = rows(image);

      for (const row of output) {
        for (const value of row) {
          expect([0, 255]).toContain(value);
        }
      }

      // Each 32 px wide band averages close to the greys it started as
      for (let band = 0; band < width / 32; band++) {
        let sum = 0;

        for (const row of output) {
          for (let x = band * 32; x < (band + 1) * 32; x++) {
            sum += row[x]!;
          }
        }

        const expected = band * 32 + 15.5;

        expect(Math.abs(sum / (32 * height) - expected)).toBeLessThan(3);
      }
    });

    test("writes the same grey to red, green and blue in black and white", () => {
      const { data } = mixedImage().dither({ type: "floyd-steinberg" }).bitmap;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) {
          expect([0, 255]).toContain(data[i]);
          expect(data[i + 1]).toBe(data[i]);
          expect(data[i + 2]).toBe(data[i]);
        }
      }
    });

    test("spreads the error as 7/16, 3/16, 5/16 and 1/16", () => {
      // 100 rounds to 0 and leaves 100 to share out, which is enough to
      // push the right neighbour (100 + 700/16 = 143.75) up to 255
      const image = greyImage(3, 2, () => 100).dither({
        type: "floyd-steinberg",
      });

      expect(rows(image)[0]!.slice(0, 2)).toStrictEqual([0, 255]);
    });
  });

  test("atkinson keeps the brightness of mid greys", () => {
    const output = rows(
      greyImage(64, 64, () => 128).dither({ type: "atkinson" }),
    ).flat();
    const mean = output.reduce((a, b) => a + b, 0) / output.length;

    expect(new Set(output)).toStrictEqual(new Set([0, 255]));
    expect(Math.abs(mean - 128)).toBeLessThan(4);
  });

  describe("bayer", () => {
    test("bayer4 lights the 8 cells at or above 8 in mid grey", () => {
      const image = greyImage(4, 4, () => 128).dither({ type: "bayer4" });

      expect(rows(image)).toStrictEqual(
        bayer4.map((row) => row.map((m) => (m >= 8 ? 255 : 0))),
      );
    });

    test("bayer4 tiles across a larger image", () => {
      const image = greyImage(8, 6, () => 128).dither({ type: "bayer4" });

      expect(rows(image)).toStrictEqual(
        Array.from({ length: 6 }, (_, y) =>
          Array.from({ length: 8 }, (_, x) =>
            bayer4[y % 4]![x % 4]! >= 8 ? 255 : 0,
          ),
        ),
      );
    });

    test("bayer8 lights a quarter of the cells in a quarter grey", () => {
      // 64 / 255 lights the cells at or above 64 × (1 - 64 / 255) - 0.5 ≈ 47.4
      const image = greyImage(8, 8, () => 64).dither({ type: "bayer8" });

      expect(rows(image)).toStrictEqual(
        bayer8.map((row) => row.map((m) => (m >= 48 ? 255 : 0))),
      );
    });

    test("bayer8 lights n of 64 cells for each grey n × 255 / 64", () => {
      for (let n = 0; n <= 64; n++) {
        const grey = Math.round((n * 255) / 64);
        const lit = rows(greyImage(8, 8, () => grey).dither({ type: "bayer8" }))
          .flat()
          .filter((v) => v === 255).length;

        expect(lit).toBe(n);
      }
    });

    test("dithers between the two nearest levels of a palette", () => {
      // 3 levels are 0, 128 and 255, and 64 is halfway between 0 and 128
      const image = greyImage(4, 4, () => 64).dither({
        type: "bayer4",
        palette: 3,
      });

      expect(rows(image)).toStrictEqual(
        bayer4.map((row) => row.map((m) => (m >= 8 ? 128 : 0))),
      );
    });
  });

  describe("palette", () => {
    test.each(types)("%s only uses the palette's levels", (type) => {
      const { data } = mixedImage().dither({ type, palette: 4 }).bitmap;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) {
          expect([0, 85, 170, 255]).toContain(data[i]);
          expect([0, 85, 170, 255]).toContain(data[i + 1]);
          expect([0, 85, 170, 255]).toContain(data[i + 2]);
        }
      }
    });

    test.each(types)(
      "%s with rgb565 survives a round trip through 16 bits",
      (type) => {
        const { data } = mixedImage().dither({
          type,
          palette: "rgb565",
        }).bitmap;
        const expand5 = (v: number) => ((v >> 3) << 3) | (v >> 5);
        const expand6 = (v: number) => ((v >> 2) << 2) | (v >> 6);

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] !== 0) {
            expect(expand5(data[i]!)).toBe(data[i]);
            expect(expand6(data[i + 1]!)).toBe(data[i + 1]);
            expect(expand5(data[i + 2]!)).toBe(data[i + 2]);
          }
        }
      },
    );

    test.each(types)("%s with 256 levels changes nothing", (type) => {
      const image = mixedImage();
      const original = Buffer.from(image.bitmap.data);

      expect(image.dither({ type, palette: 256 }).bitmap.data).toStrictEqual(
        original,
      );
    });
  });

  test.each(types)("%s leaves alpha and transparent pixels alone", (type) => {
    for (const palette of ["bw", "rgb565", 3] as const) {
      const image = mixedImage();
      const original = Buffer.from(image.bitmap.data);
      const { data } = image.dither({ type, palette }).bitmap;

      for (let i = 0; i < data.length; i += 4) {
        expect(data[i + 3]).toBe(original[i + 3]);

        if (original[i + 3] === 0) {
          expect(data.subarray(i, i + 4)).toStrictEqual(
            original.subarray(i, i + 4),
          );
        }
      }
    }
  });

  test("doesn't pass error on to transparent pixels", () => {
    // The middle pixel is transparent. If it took 7/16 of the left pixel's
    // error and passed some on, the right pixel would round up to white.
    const data = Buffer.from([
      120, 120, 120, 255, 0, 0, 0, 0, 120, 120, 120, 255,
    ]);
    const image = jimp
      .fromBitmap({ data, width: 3, height: 1 })
      .dither({ type: "floyd-steinberg" });

    expect([...image.bitmap.data]).toStrictEqual([
      0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 255,
    ]);
  });

  test.each([
    { type: "rgb565", palette: "bw" },
    { type: "ordered" },
    { type: "floyd-steinberg", palette: 1 },
    { type: "floyd-steinberg", palette: 257 },
    { type: "floyd-steinberg", palette: 2.5 },
    { type: "floyd-steinberg", palette: "grey" },
    { palette: "bw" },
  ])("rejects %o", (options) => {
    expect(() =>
      greyImage(2, 2, () => 0).dither(options as DitherOptions),
    ).toThrow();
  });
});
