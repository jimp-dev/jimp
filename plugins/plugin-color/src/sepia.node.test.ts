import { expect, test, describe } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { methods as color } from "./index.js";

const jimp = createJimp({ plugins: [color] });

describe("sepia", () => {
  test("computes each output channel from the original pixel", () => {
    const image = jimp.fromBitmap(makeTestImage("▴"));

    image.sepia();

    expect(Array.from(image.bitmap.data)).toEqual([100, 88, 69, 255]);
  });

  test("blends between the original and full sepia", () => {
    const image = () => jimp.fromBitmap(makeTestImage("▴"));

    expect(image().sepia(1).bitmap).toStrictEqual(image().sepia().bitmap);
    expect(image().sepia(0).bitmap).toStrictEqual(image().bitmap);
    // half way between [255, 0, 0] and [100.2, 89.0, 69.4]
    expect(Array.from(image().sepia(0.5).bitmap.data)).toEqual([
      177, 44, 34, 255,
    ]);
  });

  test("clamps the amount to 0-1", () => {
    const image = () => jimp.fromBitmap(makeTestImage("▴"));

    expect(image().sepia(2).bitmap).toStrictEqual(image().sepia(1).bitmap);
    expect(image().sepia(-1).bitmap).toStrictEqual(image().bitmap);
  });
});
