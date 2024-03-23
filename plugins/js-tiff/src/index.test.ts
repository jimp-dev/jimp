import { expect, test, describe } from "vitest";

import { createJimp } from "@jimp/core";
import { promises as fs } from "fs";

import tiff from "./index.js";

const jimp = createJimp({ formats: [tiff] });

describe("TIFF", () => {
  const imagesDir = __dirname + "/images";

  test("load TIFF", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/rgb.tiff");
    const image = await jimp.fromBuffer(imageBuffer);

    expect(image.getPixelColor(10, 10)).toBe(0xa4988bff);
    expect(image.getPixelColor(220, 190)).toBe(0xe0d7ddff);
    expect(image.getPixelColor(350, 130)).toBe(0x565433ff);
  });

  test("export TIFF", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await image.toBuffer("image/tiff");

    expect(buffer.toString()).toMatch(/^MM\u0000*\u0000/);
  });
});
