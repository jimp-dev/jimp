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
});
