import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import png from "@jimp/js-png";
import bmp from "./index.js";

const jimp = createJimp({ formats: [bmp, png] });

describe("BMP", () => {
  test("uses correct colors for BMP", async function () {
    const expectedImg = await jimp.read(getTestImagePath("windows95.png"));
    const image = await jimp.read(getTestImagePath("windows95.bmp"));

    expect(image.bitmap.data).toEqual(expectedImg.bitmap.data);
  });

  test("keeps the alpha of a BMP with an alpha mask", async function () {
    // ImageMagick and GIMP save images with alpha as 32 bit BITMAPV5 files
    // with an alpha mask
    const expectedImg = await jimp.read(getTestImagePath("alpha-v5.png"));
    const image = await jimp.read(getTestImagePath("alpha-v5.bmp"));

    expect(image.bitmap.data).toEqual(expectedImg.bitmap.data);
  });

  // ImageMagick encodings of the same 115x37, 16 color image
  test.each([
    ["a 4 bit BMP with an odd width", "palette-4bit.bmp" as const],
    ["an RLE8 BMP", "palette-rle8.bmp" as const],
  ])("decodes %s", async (_, file) => {
    const expectedImg = await jimp.read(getTestImagePath("palette.png"));
    const image = await jimp.read(getTestImagePath(file));

    expect(image.bitmap.data).toEqual(expectedImg.bitmap.data);
  });
});
