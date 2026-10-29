import { expect, test, describe } from "vitest";
import "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";

import png from "@jimp/js-png";
import { createJimp } from "@jimp/core";

import { methods as quantize } from "./index.js";

const jimp = createJimp({ formats: [png], plugins: [quantize] });

describe("Quantize", () => {
  test("defines default threshold for lighter backgrounds", async () => {
    const testImage = await jimp.read(__dirname + "/images/colorful.png");
    const output = await testImage
      .quantize({
        colors: 8,
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("only reads the bytes of a Buffer view", () => {
    const backing = Buffer.alloc(64, 0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const image = new jimp({ width: 2, height: 2, data }).quantize({
      colors: 2,
    });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);
  });
});
