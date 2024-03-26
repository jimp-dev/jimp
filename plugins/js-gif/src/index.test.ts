import { expect, test, describe } from "vitest";
import { promises as fs } from "fs";

import { createJimp } from "@jimp/core";

import gif from "./index.js";

const jimp = createJimp({ formats: [gif] });

describe("GIF", () => {
  const imagesDir = __dirname + "/images";

  test("load GIF", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/flower.gif");
    const image = await jimp.fromBuffer(imageBuffer);
    expect(image.getPixelColor(10, 10)).toBe(0xe5e6d9ff);
  });

  test("load animated GIF", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/animated.gif");
    const image = await jimp.fromBuffer(imageBuffer);
    expect(image.getPixelColor(10, 10)).toBe(0xa1d2f1ff);
  });

  test("export GIF", async () => {
    const imageBuffer = await fs.readFile(imagesDir + "/flower.gif");
    const jgd = await jimp.fromBuffer(imageBuffer);
    const buffer = await jgd.getBuffer("image/gif");
    expect(buffer.toString()).toMatch(/^GIF/);
  });
});
