import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { methods, ResizeStrategy } from "./index.js";

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
          "□□□□■■■■"
        )
      ),
      tests: [
        { mode: "default", size: { height: 4, width: 4 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 4, width: 4 } },
        { mode: "BILINEAR", size: { height: 4, width: 4 } },
        { mode: "BICUBIC", size: { height: 4, width: 4 } },
        { mode: "HERMITE", size: { height: 4, width: 4 } },
        { mode: "BEZIER", size: { height: 4, width: 4 } },
        { mode: "default", size: { height: 5, width: 2 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 5, width: 2 } },
        { mode: "BILINEAR", size: { height: 5, width: 2 } },
        { mode: "BICUBIC", size: { height: 5, width: 2 } },
        { mode: "HERMITE", size: { height: 5, width: 2 } },
        { mode: "BEZIER", size: { height: 5, width: 2 } },
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
          "□□□□□□■■■■■■"
        )
      ),
      tests: [
        { mode: "default", size: { height: 6, width: 6 } },
        { mode: "NEAREST_NEIGHBOR", size: { height: 6, width: 6 } },
        { mode: "BILINEAR", size: { height: 6, width: 6 } },
        { mode: "BICUBIC", size: { height: 6, width: 6 } },
        { mode: "HERMITE", size: { height: 6, width: 6 } },
        { mode: "BEZIER", size: { height: 6, width: 6 } },
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
            })
          ).toMatchSnapshot();
        });
      });
    });
  });
});
