import { expect, test, describe } from "vitest";
import { Buffer } from "buffer";
import { createJimp } from "@jimp/core";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

/** A 1 pixel high image from a list of RGBA pixels */
function row(...pixels: number[][]) {
  return jimp.fromBitmap({
    width: pixels.length,
    height: 1,
    data: Buffer.from(pixels.flat()),
  });
}

describe("displace", () => {
  test("moves alpha along with the color", () => {
    const image = row(
      [255, 0, 0, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    );
    // red 128 of 256 moves each pixel by half the offset
    const map = row(...new Array(4).fill([128, 0, 0, 255]));

    image.displace({ map, offset: 4 });

    expect([...image.bitmap.data.subarray(8, 12)]).toEqual([255, 0, 0, 255]);
  });

  test("stretches a map of a different size to fit the image", () => {
    const image = jimp.fromBitmap({
      width: 4,
      height: 4,
      data: Buffer.from(
        new Array(16).fill(0).flatMap((_, i) => [i * 16, 0, 0, 255]),
      ),
    });
    // a 2x2 map: only the top left quarter is displaced, by 1 pixel
    const map = jimp.fromBitmap({
      width: 2,
      height: 2,
      data: Buffer.from(
        [
          [128, 0, 0, 255],
          [0, 0, 0, 255],
          [0, 0, 0, 255],
          [0, 0, 0, 255],
        ].flat(),
      ),
    });
    const red = (img: typeof image) =>
      [...img.bitmap.data].filter((_, i) => i % 4 === 0);

    // prettier-ignore
    expect(red(image.clone().displace({ map, offset: 2 }))).toEqual([
      // in the top half, the pixel at x = 0 moves to x = 1
      0, 0, 32, 48,
      64, 64, 96, 112,
      // the bottom half isn't displaced
      128, 144, 160, 176,
      192, 208, 224, 240,
    ]);
  });

  test("a number only moves pixels along x, whatever the green channel", () => {
    const image = row(
      [255, 0, 0, 255],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    );
    const map = row(...new Array(4).fill([128, 255, 0, 255]));

    expect(
      image.clone().displace({ map, offset: { x: 4 } }).bitmap.data,
    ).toEqual(image.clone().displace({ map, offset: 4 }).bitmap.data);
    expect([
      ...image.displace({ map, offset: 4 }).bitmap.data.subarray(8, 12),
    ]).toEqual([255, 0, 0, 255]);
  });

  test("offset.y moves pixels down by the green channel", () => {
    const image = jimp.fromBitmap({
      width: 1,
      height: 4,
      data: Buffer.from(
        [
          [255, 0, 0, 255],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ].flat(),
      ),
    });
    // green 128 of 256 moves each pixel by half the offset, red is ignored
    const map = jimp.fromBitmap({
      width: 1,
      height: 1,
      data: Buffer.from([255, 128, 0, 255]),
    });

    image.displace({ map, offset: { y: 4 } });

    expect([...image.bitmap.data.subarray(8, 12)]).toEqual([255, 0, 0, 255]);
  });

  test("offset { x, y } moves pixels along both axes", () => {
    const transparent = [0, 0, 0, 0];
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: Buffer.from(
        [[255, 0, 0, 255], ...new Array(8).fill(transparent)].flat(),
      ),
    });
    const map = jimp.fromBitmap({
      width: 1,
      height: 1,
      data: Buffer.from([128, 128, 0, 255]),
    });

    image.displace({ map, offset: { x: 2, y: 2 } });

    // the red pixel moves from (0, 0) to (1, 1)
    expect([...image.bitmap.data.subarray(16, 20)]).toEqual([255, 0, 0, 255]);
  });
});
