import { makeTestImage } from "@jimp/test-utils";
import { describe, expect, test } from "vitest";

import { Jimp, intToRGBA, rgbaToInt } from "./index.js";

describe("scan", () => {
  const barsJGD = makeTestImage("▴▴▸▸▾▾◆◆", "▴▴▸▸▾▾◆◆", "▵▵▹▹▿▿◇◇");

  test("draw bars with scan", async () => {
    const image = new Jimp({ width: 8, height: 3, color: 0xffffffff });

    image.scan((x, y, idx) => {
      const color = [
        [0xff, 0x00, 0x00],
        [0x00, 0xff, 0x00],
        [0x00, 0x00, 0xff],
        [0xff, 0xff, 0x00],
      ][Math.floor(x / (image.bitmap.width / 4))];

      image.bitmap.data[idx] = color![0]!;
      image.bitmap.data[idx + 1] = color![1]!;
      image.bitmap.data[idx + 2] = color![2]!;
      image.bitmap.data[idx + 3] = y === 2 ? 0x7f : 0xff;
    });

    expect(image).toMatchSnapshot();
  });

  test("draw bars with iterate scan", async () => {
    const j = new Jimp({ width: 8, height: 3, color: 0xffffffff });

    for (const { x, y, idx, image } of j.scanIterator(
      0,
      0,
      j.bitmap.width,
      j.bitmap.height
    )) {
      const color = [
        [0xff, 0x00, 0x00],
        [0x00, 0xff, 0x00],
        [0x00, 0x00, 0xff],
        [0xff, 0xff, 0x00],
      ][Math.floor(x / (image.bitmap.width / 4))];

      image.bitmap.data[idx] = color![0];
      image.bitmap.data[idx + 1] = color![1];
      image.bitmap.data[idx + 2] = color![2];
      image.bitmap.data[idx + 3] = y === 2 ? 0x7f : 0xff;
    }

    expect(j).toMatchSnapshot();
  });

  test("draw bars with (get|set)PixelColor", async () => {
    const image = Jimp.fromBitmap(barsJGD);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const hex = image.getPixelColor(x, y); // e.g. 0xFF000FF
        const rgba = intToRGBA(hex); // e.g. {r: 255, g: 255, b: 255, a:255}
        const hex2 = rgbaToInt(rgba.g, rgba.b, rgba.r, rgba.a);
        image.setPixelColor(hex2, x, y);
      }
    }

    expect(image).toMatchSnapshot();
  });

  test("create a image with plain color", async () => {
    const image = new Jimp({ width: 8, height: 3, color: 0xff0000ff });

    expect(image).toMatchSnapshot();
  });
});
