import { Jimp, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import expect from "@storybook/expect";

import jpeg from "../src";

const jimp = configure({ types: [jpeg] }, Jimp);

describe("JPEG", () => {
  const imagesDir = getTestDir(__dirname) + "/images";

  it("load JPG", async () => {
    const image = await jimp.read(imagesDir + "/cops.jpg");

    expect(image.getPixelColor(10, 10)).toBe(0x3f4a02ff);
    expect(image.getPixelColor(220, 190)).toBe(0x5d94b6ff);
    expect(image.getPixelColor(350, 130)).toBe(0xdf7944ff);
  });

  it("load JPG with fill bytes", async () => {
    const image = await jimp.read(imagesDir + "/fillbytes.jpg");

    expect(image.getPixelColor(10, 10)).toBe(0xaeb8c3ff);
    expect(image.getPixelColor(220, 190)).toBe(0x262b21ff);
    expect(image.getPixelColor(350, 130)).toBe(0x4e5d30ff);
  });

  it("export JPG", async () => {
    const image = await jimp.read({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    image.quality(50);
    const buffer = await image.getBufferAsync("image/jpeg");

    expect(buffer.toString()).toMatch(/^.{3,9}JFIF\u0000/);
  });
});
