import { expect, test, describe } from "vitest";
import "@jimp/test-utils";
import { promises as fs } from "fs";
import { createJimp } from "@jimp/core";

import png from "./index.js";

const jimp = createJimp({ formats: [png] });

describe("PNG", () => {
  const imagesDir = __dirname + "/test-images";

  test("load PNG", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/dice.png");
    const image = await jimp.fromBuffer(imageBuffer);

    expect(image.getPixelColor(10, 10)).toBe(0x00000000);
    expect(image.getPixelColor(160, 80)).toBe(0x1c1cd4ff);
    expect(image.getPixelColor(400, 250)).toBe(0x7e0c0cda);
  });

  test("export PNG", async () => {
    const testImage = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await testImage.toBuffer("image/png");

    expect(buffer.toString()).toMatch(/^.PNG\r\n/);
  });

  test("should use png options", async () => {
    const testImage = jimp.fromBitmap({
      width: 20,
      height: 20,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff, 0xff0000ff, 0xff0080ff, 0xff00ffff,
        0xff0080ff, 0xff00ffff, 0x8000ffff, 0xff00ffff, 0x8000ffff, 0x0000ffff,
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff, 0xff0000ff, 0xff0080ff, 0xff00ffff,
        0xff0080ff, 0xff00ffff, 0x8000ffff, 0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });

    const image = await testImage.toBuffer("image/png", {
      deflateStrategy: 0,
      colorType: 0,
    });

    await fs.writeFile(__dirname + "/output.png", image);

    expect(image).toMatchImageSnapshot();
  });
});
