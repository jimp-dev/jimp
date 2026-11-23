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
      j.bitmap.height,
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

  test("scan and scanIterator clamp the region to the image", () => {
    const image = new Jimp({ width: 4, height: 3, color: 0xffffffff });
    const scanned: number[][] = [];

    image.scan(3, 1, 5, 5, (x, y, idx) => scanned.push([x, y, idx]));

    expect(scanned).toEqual([
      [3, 1, 28],
      [3, 2, 44],
    ]);
    expect(
      [...image.scanIterator(3, 1, 5, 5)].map(({ x, y, idx }) => [x, y, idx]),
    ).toEqual(scanned);
  });

  test("scanIterator defaults to the rest of the image", () => {
    const image = new Jimp({ width: 4, height: 3, color: 0xffffffff });

    expect(
      [...image.scanIterator(2, 1)].map(({ x, y, idx }) => [x, y, idx]),
    ).toEqual([
      [2, 1, 24],
      [3, 1, 28],
      [2, 2, 40],
      [3, 2, 44],
    ]);
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
