import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

import { methods as crop } from "./index.js";

const jimp = createJimp({ plugins: [crop], formats: [] });

describe("crop", () => {
  // 6x5 size
  const testImage = makeTestImage(
    "  ◆◆  ",
    " ◆▦▦◆ ",
    "◆▦▦▦▦◆",
    " ◆▦▦◆ ",
    "  ◆◆  ",
  );

  test("full width from top", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 0, y: 0, w: 6, h: 2 }),
    ).toMatchSnapshot();
  });

  test("full width from bottom", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 0, y: 3, w: 6, h: 2 }),
    ).toMatchSnapshot();
  });

  test("full width from middle", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 0, y: 2, w: 6, h: 2 }),
    ).toMatchSnapshot();
  });

  test("full height from left", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 0, y: 0, w: 2, h: 5 }),
    ).toMatchSnapshot();
  });

  test("full height from right", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 4, y: 0, w: 2, h: 5 }),
    ).toMatchSnapshot();
  });

  test("full height from middle", () => {
    expect(
      jimp.fromBitmap(testImage).crop({ x: 2, y: 0, w: 2, h: 5 }),
    ).toMatchSnapshot();
  });

  describe("out of bounds", () => {
    const crop = (x: number, y: number, w: number, h: number) =>
      jimp.fromBitmap(testImage).crop({ x, y, w, h });

    test("negative x and y are clamped to the top left", () => {
      expect(crop(-1, -2, 3, 4).bitmap).toEqual(crop(0, 0, 2, 2).bitmap);
    });

    test("past the right edge doesn't wrap onto the next row", () => {
      expect(crop(4, 1, 5, 2)).toMatchSnapshot();
      expect(crop(4, 1, 5, 2).bitmap).toEqual(crop(4, 1, 2, 2).bitmap);
    });

    test("past the bottom edge", () => {
      expect(crop(1, 3, 2, 5).bitmap).toEqual(crop(1, 3, 2, 2).bitmap);
    });

    test("full width past the bottom edge", () => {
      const image = crop(0, 3, 6, 5);

      expect(image.bitmap.data.length).toBe(6 * 2 * 4);
      expect(image.bitmap).toEqual(crop(0, 3, 6, 2).bitmap);
    });

    test("a rectangle larger than the image doesn't grow it", () => {
      expect(crop(0, 0, 9000, 9000).bitmap).toEqual(
        jimp.fromBitmap(testImage).bitmap,
      );
    });

    test("throws when nothing would be left", () => {
      expect(() => crop(10, 10, 2, 2)).toThrow(
        "The crop region (x: 10, y: 10, w: 2, h: 2) doesn't overlap the 6x5 image, so the result would be empty",
      );
      expect(() => crop(-3, 0, 3, 5)).toThrow("doesn't overlap");
      expect(() => crop(0, 0, 0, 5)).toThrow("doesn't overlap");
    });
  });
});
