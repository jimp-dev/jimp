import { describe, expect, test } from "vitest";
import { promises as fs } from "fs";
import { createJimp } from "@jimp/core";

import png from "@jimp/js-png";
import bmp from "./index.js";

const jimp = createJimp({ formats: [bmp, png] });

describe("BMP", () => {
  const imagesDir = __dirname + "/images";

  test("load BMP", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/windows95.bmp");
    const image = await jimp.fromBuffer(imageBuffer);

    expect(image.getPixelColor(10, 10)).toBe(0xeff7f7ff);
    expect(image.getPixelColor(150, 80)).toBe(0x73add6ff);
    expect(image.getPixelColor(190, 200)).toBe(0xf7c300ff);
  });

  test("export BMP", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await image.toBuffer("image/bmp");

    await fs.writeFile(imagesDir + "/test.bmp", buffer);

    expect(buffer.toString()).toMatch(/^BM/);
  });

  test("uses correct colors for BMP", async function () {
    const pngBuffer = await fs.readFile(imagesDir + "/windows95.png");
    const expectedImg = await jimp.fromBuffer(pngBuffer);

    const bmpBuffer = await fs.readFile(imagesDir + "/windows95.bmp");
    const image = await jimp.fromBuffer(bmpBuffer);

    expect(image.bitmap.data).toEqual(expectedImg.bitmap.data);
  });
});
