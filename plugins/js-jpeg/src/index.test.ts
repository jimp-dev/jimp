import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import jpeg from "./index.js";

const jimp = createJimp({ formats: [jpeg] });

describe("JPEG", () => {
  // The pixels libjpeg-turbo's djpeg decodes
  test("load JPG", async () => {
    const image = await jimp.read(getTestImagePath("cops.jpg"));

    expect(image.getPixelColor(10, 10)).toBe(0x3f4b03ff);
    expect(image.getPixelColor(220, 190)).toBe(0x5e94b6ff);
    expect(image.getPixelColor(350, 130)).toBe(0xdf7a44ff);
  });

  test("load JPG with fill bytes", async () => {
    const image = await jimp.read(getTestImagePath("fillbytes.jpg"));

    expect(image.getPixelColor(10, 10)).toBe(0xafb9c5ff);
    expect(image.getPixelColor(220, 190)).toBe(0x262c20ff);
    expect(image.getPixelColor(350, 130)).toBe(0x4d5d30ff);
  });

  test("export JPG", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });

    const buffer = await image.getBuffer("image/jpeg", {
      quality: 50,
    });

    // eslint-disable-next-line no-control-regex
    expect(buffer.toString()).toMatch(/^.{3,9}JFIF\u0000/);
  });
});
