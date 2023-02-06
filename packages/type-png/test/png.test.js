import { Jimp, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import expect from "@storybook/expect";

import png from "../src";

const jimp = configure({ types: [png] }, Jimp);

describe("PNG", () => {
  const imagesDir = getTestDir(__dirname) + "/images";

  it("load PNG", async () => {
    const image = await jimp.read(imagesDir + "/dice.png");

    expect(image.getPixelColor(10, 10)).toBe(0x00000000);
    expect(image.getPixelColor(160, 80)).toBe(0x1c1cd4ff);
    expect(image.getPixelColor(400, 250)).toBe(0x7e0c0cda);
  });

  it("export PNG", async () => {
    const jgd = await jimp.read({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await jgd.getBufferAsync("image/png");

    expect(buffer.toString()).toMatch(/^.PNG\r\n/);
  });

  it("should use png options", async () => {
    const jgd = await jimp.read({
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

    const image = await jgd
      .deflateStrategy(0)
      .colorType(0)
      .getBufferAsync(Jimp.MIME_PNG);

    const expected = await jimp.read(imagesDir + "/options.png");
    const expectedBuffer = await expected
      .deflateStrategy(0)
      .colorType(0)
      .getBufferAsync(Jimp.MIME_PNG);

    expect(image).toEqual(expectedBuffer);
  });
});
