import { Jimp, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import expect from "@storybook/expect";

import gif from "../src";

const jimp = configure({ types: [gif] }, Jimp);

describe("GIF", () => {
  const imagesDir = getTestDir(__dirname) + "/images";

  it("load GIF", async () => {
    const image = await jimp.read(imagesDir + "/flower.gif");
    expect(image.getPixelColor(10, 10)).toBe(0xe5e6d9ff);
  });

  it("load animated GIF", async () => {
    const image = await jimp.read(imagesDir + "/animated.gif");
    expect(image.getPixelColor(10, 10)).toBe(0xa1d2f1ff);
  });

  it("export GIF", async () => {
    const jgd = await jimp.read(imagesDir + "/flower.gif");
    const buffer = await jgd.getBufferAsync("image/gif");
    expect(buffer.toString()).toMatch(/^GIF/);
  });
});
