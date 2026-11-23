import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { methods, resampleKernels, ResizeStrategy } from "./index.js";

const jimp = createJimp({ plugins: [methods], formats: [] });

describe("Resize images", () => {
  const testImages = [
    {
      title: "max contrast 8x8",
      src: jimp.fromBitmap(
        makeTestImage(
          "■■■■□□□□",
          "■■■■□□□□",
          "■■■■□□□□",
          "■■■■□□□□",
          "□□□□■■■■",
          "□□□□■■■■",
          "□□□□■■■■",
          "□□□□■■■■",
        ),
      ),
      tests: [
        { mode: "default", size: { height: 4, width: 4 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 4, width: 4 } },
        { mode: "BILINEAR", size: { height: 4, width: 4 } },
        { mode: "BICUBIC", size: { height: 4, width: 4 } },
        { mode: "HERMITE", size: { height: 4, width: 4 } },
        { mode: "BEZIER", size: { height: 4, width: 4 } },
        { mode: "LANCZOS", size: { height: 4, width: 4 } },
        { mode: "LANCZOS2", size: { height: 4, width: 4 } },
        { mode: "MITCHELL", size: { height: 4, width: 4 } },
        { mode: "default", size: { height: 5, width: 2 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 5, width: 2 } },
        { mode: "BILINEAR", size: { height: 5, width: 2 } },
        { mode: "BICUBIC", size: { height: 5, width: 2 } },
        { mode: "HERMITE", size: { height: 5, width: 2 } },
        { mode: "BEZIER", size: { height: 5, width: 2 } },
        { mode: "LANCZOS", size: { height: 5, width: 2 } },
        { mode: "LANCZOS2", size: { height: 5, width: 2 } },
        { mode: "MITCHELL", size: { height: 5, width: 2 } },
      ],
    },
    /**********************************************************************/
    {
      title: "max contrast 12x12 with dots",
      src: jimp.fromBitmap(
        makeTestImage(
          "■■■■■■□□□□□□",
          "■■■■■■□□□□□□",
          "■■■□■■□□■□□□",
          "■■■■■■□□□□□□",
          "■■■■■■□□□□□□",
          "■■■■■■□□□□□□",
          "□□□□□□■■■■■■",
          "□□□□□□■■■■■■",
          "□□□□□□■■■■■■",
          "□□□■□□■■□■■■",
          "□□□□□□■■■■■■",
          "□□□□□□■■■■■■",
        ),
      ),
      tests: [
        { mode: "default", size: { height: 6, width: 6 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 6, width: 6 } },
        { mode: "BILINEAR", size: { height: 6, width: 6 } },
        { mode: "BICUBIC", size: { height: 6, width: 6 } },
        { mode: "HERMITE", size: { height: 6, width: 6 } },
        { mode: "BEZIER", size: { height: 6, width: 6 } },
        { mode: "LANCZOS", size: { height: 6, width: 6 } },
        { mode: "LANCZOS2", size: { height: 6, width: 6 } },
        { mode: "MITCHELL", size: { height: 6, width: 6 } },
      ],
    },
    /**********************************************************************/
    {
      title: "mutch contrast 4x4",
      src: jimp.fromBitmap(makeTestImage("▩▩▥▥", "▩▩▥▥", "▥▥▩▩", "▥▥▩▩")),
      tests: [
        { mode: "default", size: { height: 6, width: 6 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 6, width: 6 } },
        { mode: "BILINEAR", size: { height: 6, width: 6 } },
        { mode: "BICUBIC", size: { height: 6, width: 6 } },
        { mode: "HERMITE", size: { height: 6, width: 6 } },
        { mode: "BEZIER", size: { height: 6, width: 6 } },
        { mode: "LANCZOS", size: { height: 6, width: 6 } },
        { mode: "LANCZOS2", size: { height: 6, width: 6 } },
        { mode: "MITCHELL", size: { height: 6, width: 6 } },
      ],
    },
  ];

  describe("keeps alignment of a red ramp", () => {
    // red = 0,50,100,150,200
    function ramp(width: number, height: number) {
      const data = Buffer.alloc(width * height * 4);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          data[idx] = x * 50;
          data[idx + 3] = 255;
        }
      }

      return jimp.fromBitmap({ width, height, data });
    }

    function red(image: ReturnType<typeof ramp>) {
      return Array.from(
        { length: image.bitmap.width },
        (_, x) => image.bitmap.data[x * 4],
      );
    }

    const modes = ["BILINEAR", "BICUBIC", "HERMITE", "BEZIER"] as const;

    modes.forEach((modeType) => {
      const mode = ResizeStrategy[modeType];

      test(`${modeType} 5x3 to 5x3`, () => {
        expect(red(ramp(5, 3).resize({ w: 5, h: 3, mode }))).toEqual([
          0, 50, 100, 150, 200,
        ]);
      });

      test(`${modeType} 5x1 to 5x1`, () => {
        expect(red(ramp(5, 1).resize({ w: 5, h: 1, mode }))).toEqual([
          0, 50, 100, 150, 200,
        ]);
      });

      test(`${modeType} 1x5 to 1x5`, () => {
        const image = jimp.fromBitmap({
          width: 1,
          height: 5,
          data: Buffer.from(
            [0, 50, 100, 150, 200].flatMap((v) => [v, 0, 0, 255]),
          ),
        });
        const resized = image.resize({ w: 1, h: 5, mode });

        expect(
          Array.from({ length: 5 }, (_, y) => resized.bitmap.data[y * 4]),
        ).toEqual([0, 50, 100, 150, 200]);
      });

      test(`${modeType} 5x3 to 10x3 reaches the last pixel`, () => {
        const row = red(ramp(5, 3).resize({ w: 10, h: 3, mode }));

        expect(row[0]).toBe(0);
        expect(row[8]).toBe(200);
        expect(row[9]).toBe(200);
      });
    });
  });

  describe("doesn't darken the edges of transparent images", () => {
    // a white 20x20 square on transparent black
    function square() {
      const data = Buffer.alloc(40 * 40 * 4);

      for (let y = 10; y < 30; y++) {
        for (let x = 10; x < 30; x++) {
          data.fill(255, (y * 40 + x) * 4, (y * 40 + x + 1) * 4);
        }
      }

      return jimp.fromBitmap({ width: 40, height: 40, data });
    }

    function visibleColors(image: ReturnType<typeof square>) {
      const colors = new Set<string>();
      const { data } = image.bitmap;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3]) {
          colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
        }
      }

      return [...colors];
    }

    const modes = [
      "BILINEAR",
      "BICUBIC",
      "HERMITE",
      "BEZIER",
      "LANCZOS",
      "LANCZOS2",
      "MITCHELL",
    ] as const;

    modes.forEach((modeType) => {
      const mode = ResizeStrategy[modeType];

      [15, 25, 60].forEach((w) => {
        test(`${modeType} 40x40 to ${w}x${w}`, () => {
          const resized = square().resize({ w, mode });
          const { data } = resized.bitmap;
          const alphas = new Set<number>();

          for (let i = 3; i < data.length; i += 4) {
            alphas.add(data[i]!);
          }

          // the edges are blended
          expect(alphas.size).toBeGreaterThan(2);
          expect(visibleColors(resized)).toEqual(["255,255,255"]);
        });
      });
    });
  });

  describe("convolution filters", () => {
    const modes = ["LANCZOS", "LANCZOS2", "MITCHELL"] as const;

    // a grey 6x4 image with a gradient, hard edges and a row of 0/255
    const GREY = [
      [10, 10, 200, 220, 240, 255],
      [10, 40, 180, 230, 128, 60],
      [30, 90, 150, 210, 90, 20],
      [0, 255, 0, 255, 0, 255],
    ];

    function grey() {
      return jimp.fromBitmap({
        width: 6,
        height: 4,
        data: Buffer.from(GREY.flat().flatMap((v) => [v, v, v, 255])),
      });
    }

    // the red channel, with a check that the image stayed grey and opaque
    function values(image: ReturnType<typeof grey>) {
      const { data } = image.bitmap;
      const red: number[] = [];

      for (let i = 0; i < data.length; i += 4) {
        expect([data[i + 1], data[i + 2], data[i + 3]]).toEqual([
          data[i],
          data[i],
          255,
        ]);
        red.push(data[i]!);
      }

      return red;
    }

    function maxDifference(actual: number[], expected: number[]) {
      expect(actual).toHaveLength(expected.length);
      return Math.max(...actual.map((v, i) => Math.abs(v - expected[i]!)));
    }

    // Generated from the GREY image with ImageMagick 7.1.2 Q16-HDRI
    // (`magick -size 6x4 -depth 8 rgba:grey.rgba -filter <Lanczos|Lanczos2|Mitchell> -resize WxH! rgba:-`)
    // and Pillow 12 (`Image.resize((w, h), Image.LANCZOS)`), red channel.
    //
    // The filters, weights and edge handling are the same, so the only
    // difference is rounding: jimp keeps floats between the row and column
    // passes like ImageMagick's HDRI build, so the tolerance is ±1.
    //
    // Pillow rounds and clamps to 8 bits between the passes. Where Lanczos
    // overshoots past 0 or 255 in the first pass (the 0/255 row when
    // upscaling), Pillow clips the overshoot and differs from ImageMagick and
    // jimp by up to 22, so the 9x7 upscale isn't compared with Pillow.
    const expected = {
      "4x3": {
        LANCZOS: [0, 138, 234, 212, 21, 145, 194, 34, 90, 137, 131, 124],
        LANCZOS2: [0, 139, 227, 211, 28, 143, 188, 45, 89, 125, 143, 123],
        MITCHELL: [10, 136, 220, 202, 36, 138, 179, 67, 86, 125, 143, 123],
        PILLOW: [0, 138, 234, 212, 21, 145, 194, 34, 89, 137, 131, 124],
      },
      "2x1": {
        LANCZOS: [99, 160],
        LANCZOS2: [99, 157],
        MITCHELL: [101, 153],
        PILLOW: [99, 160],
      },
      "10x2": {
        LANCZOS: [
          19, 0, 18, 128, 219, 228, 210, 184, 146, 127, 0, 75, 165, 105, 103,
          223, 175, 43, 74, 133,
        ],
        LANCZOS2: [
          12, 10, 23, 126, 212, 222, 210, 181, 150, 132, 1, 71, 163, 108, 103,
          222, 170, 47, 88, 130,
        ],
        MITCHELL: [
          13, 16, 39, 125, 196, 218, 205, 174, 149, 136, 12, 70, 144, 114, 117,
          206, 166, 68, 93, 126,
        ],
        PILLOW: [
          19, 0, 18, 128, 219, 228, 211, 184, 145, 126, 0, 75, 165, 105, 103,
          223, 175, 43, 74, 132,
        ],
      },
      "9x7": {
        LANCZOS: [
          16, 0, 33, 176, 228, 218, 245, 255, 255, 12, 0, 40, 170, 231, 221,
          212, 204, 204, 10, 9, 58, 157, 230, 222, 156, 93, 74, 26, 21, 65, 162,
          223, 206, 135, 24, 0, 23, 60, 112, 129, 191, 203, 109, 43, 35, 0, 121,
          201, 50, 145, 226, 45, 87, 206, 0, 155, 252, 3, 121, 244, 7, 119, 255,
        ],
        LANCZOS2: [
          10, 0, 33, 175, 221, 224, 245, 255, 255, 9, 3, 41, 169, 221, 224, 210,
          200, 195, 7, 13, 57, 160, 221, 222, 153, 96, 66, 19, 31, 74, 155, 210,
          207, 129, 51, 5, 23, 60, 110, 131, 187, 200, 105, 48, 26, 0, 112, 197,
          54, 146, 225, 45, 96, 194, 0, 143, 251, 6, 121, 241, 8, 127, 255,
        ],
        MITCHELL: [
          10, 3, 41, 168, 216, 224, 239, 252, 255, 9, 8, 48, 165, 216, 221, 207,
          196, 190, 10, 19, 62, 157, 213, 214, 154, 104, 78, 21, 36, 79, 151,
          202, 201, 128, 62, 24, 26, 63, 110, 131, 181, 193, 105, 58, 44, 9,
          108, 175, 75, 147, 204, 65, 98, 176, 0, 133, 214, 41, 126, 212, 42,
          125, 255,
        ],
      },
    };

    Object.entries(expected).forEach(([size, references]) => {
      const [w, h] = size.split("x").map(Number) as [number, number];

      modes.forEach((modeType) => {
        test(`${modeType} 6x4 to ${size} matches ImageMagick`, () => {
          const resized = grey().resize({
            w,
            h,
            mode: ResizeStrategy[modeType],
          });

          expect(
            maxDifference(values(resized), references[modeType]),
          ).toBeLessThanOrEqual(1);
        });
      });

      if ("PILLOW" in references) {
        test(`LANCZOS 6x4 to ${size} matches Pillow`, () => {
          const resized = grey().resize({ w, h, mode: ResizeStrategy.LANCZOS });

          expect(
            maxDifference(values(resized), references.PILLOW),
          ).toBeLessThanOrEqual(1);
        });
      }
    });

    modes.forEach((modeType) => {
      const mode = ResizeStrategy[modeType];

      test(`${modeType} doesn't change the image when the size is the same`, () => {
        expect(grey().resize({ w: 6, h: 4, mode }).bitmap.data).toEqual(
          grey().bitmap.data,
        );
      });

      [
        [3, 2],
        [1, 1],
        [13, 9],
        [6, 9],
        [20, 1],
      ].forEach(([w, h]) => {
        test(`${modeType} keeps a constant image constant at ${w}x${h}`, () => {
          const image = jimp.fromBitmap({
            width: 6,
            height: 4,
            data: Buffer.from(
              Array.from({ length: 24 }, () => [37, 140, 251, 200]).flat(),
            ),
          });
          const { data } = image.resize({ w: w!, h: h!, mode }).bitmap;

          for (let i = 0; i < data.length; i += 4) {
            expect([...data.subarray(i, i + 4)]).toEqual([37, 140, 251, 200]);
          }
        });
      });

      test(`${modeType} clamps overshoot at a hard edge`, () => {
        // the filters dip below 0 and above 255 next to the edge, which
        // must not wrap around
        const edge = jimp.fromBitmap({
          width: 8,
          height: 1,
          data: Buffer.from(
            [0, 0, 0, 0, 255, 255, 255, 255].flatMap((v) => [v, v, v, 255]),
          ),
        });
        const { data } = edge.resize({ w: 20, h: 1, mode }).bitmap;
        const red = Array.from({ length: 20 }, (_, x) => data[x * 4]!);

        expect(Math.max(...red.slice(0, 10))).toBeLessThan(128);
        expect(Math.min(...red.slice(10))).toBeGreaterThan(128);
        expect(red[0]).toBe(0);
        expect(red[19]).toBe(255);
      });

      test(`${modeType} gives transparent pixels no colour`, () => {
        // half transparent red, half opaque blue
        const image = jimp.fromBitmap({
          width: 4,
          height: 1,
          data: Buffer.from([
            255, 0, 0, 0, 255, 0, 0, 0, 0, 0, 255, 255, 0, 0, 255, 255,
          ]),
        });
        const { data } = image.resize({ w: 9, h: 1, mode }).bitmap;

        for (let i = 0; i < data.length; i += 4) {
          // the red is invisible, so none of it may show up
          expect(data[i]).toBe(0);

          if (data[i + 3]) {
            expect(data[i + 2]).toBe(255);
          }
        }
      });
    });

    test("downscaling widens the filter so it doesn't alias", () => {
      // 1px stripes at the Nyquist frequency should become flat grey when
      // shrunk, not a pattern of their own
      const stripes = jimp.fromBitmap({
        width: 40,
        height: 1,
        data: Buffer.from(
          Array.from({ length: 40 }, (_, x) =>
            x % 2 ? [255, 255, 255, 255] : [0, 0, 0, 255],
          ).flat(),
        ),
      });

      modes.forEach((modeType) => {
        const { data } = stripes
          .clone()
          .resize({ w: 7, h: 1, mode: ResizeStrategy[modeType] }).bitmap;

        // the first and last pixels see the stripes cut off by the edge
        for (let x = 1; x < 6; x++) {
          expect(Math.abs(data[x * 4]! - 128)).toBeLessThanOrEqual(3);
        }
      });
    });
  });

  testImages.forEach((image) => {
    describe(image.title, () => {
      image.tests.forEach(({ mode: modeType, size }) => {
        test(`to ${modeType} ${size.width}x${size.height}`, () => {
          const mode = ResizeStrategy[modeType as keyof typeof ResizeStrategy];

          expect(
            image.src.clone().resize({
              w: size.width,
              h: size.height,
              mode,
            }),
          ).toMatchSnapshot();
        });
      });
    });
  });
});

describe("resampleKernels", () => {
  // the 4-point interpolations of bicubic, hermite and bezier resizing
  const interpolations = {
    [ResizeStrategy.BICUBIC](
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      const a0 = x3 - x2 - x0 + x1;
      const a1 = x0 - x1 - a0;
      return a0 * t * t * t + a1 * t * t + (x2 - x0) * t + x1;
    },
    [ResizeStrategy.HERMITE](
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      const c2 = x0 - 2.5 * x1 + 2 * x2 - 0.5 * x3;
      const c3 = 0.5 * (x3 - x0) + 1.5 * (x1 - x2);
      return ((c3 * t + c2) * t + 0.5 * (x2 - x0)) * t + x1;
    },
    [ResizeStrategy.BEZIER](
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      const cp1 = x1 + (x2 - x0) / 4;
      const cp2 = x2 - (x3 - x1) / 4;
      const nt = 1 - t;
      return (
        x1 * nt * nt * nt +
        3 * cp1 * nt * nt * t +
        3 * cp2 * nt * t * t +
        x2 * t * t * t
      );
    },
  };

  Object.entries(interpolations).forEach(([mode, interpolate]) => {
    test(`${mode} is the kernel of its resize interpolation`, () => {
      const { kernel } = resampleKernels[mode as keyof typeof interpolations];
      const xs = [3, -7, 11, 5] as const;

      for (let t = 0; t < 1; t += 0.05) {
        const convolved = xs.reduce(
          (sum, x, n) => sum + x * kernel(n - 1 - t),
          0,
        );
        expect(convolved).toBeCloseTo(interpolate(...xs, t), 10);
      }
    });
  });

  Object.entries(resampleKernels).forEach(([mode, { support, kernel }]) => {
    test(`${mode} weights add up to 1`, () => {
      for (let t = 0; t < 1; t += 0.05) {
        let sum = 0;

        for (let n = -Math.ceil(support); n <= Math.ceil(support); n++) {
          sum += kernel(n - t);
        }

        // Lanczos is only close to 1
        expect(sum).toBeCloseTo(1, mode.startsWith("lanczos") ? 1 : 10);
      }
    });
  });
});
