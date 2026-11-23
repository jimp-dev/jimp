import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import gif from "./index.js";

const jimp = createJimp({ formats: [gif] });

// clear code, color index 1, end of information, as 3 bit LZW codes
const ONE_PIXEL_LZW = [0x4c, 0x01];

/** Build a GIF with a two color global palette and an optional frame */
function createGif({
  width,
  height,
  frame,
}: {
  width: number;
  height: number;
  frame?: { width: number; height: number; lzw: number[] };
}) {
  const bytes = [
    ...Buffer.from("GIF89a"),
    width & 0xff,
    width >> 8,
    height & 0xff,
    height >> 8,
    // Global palette of 2 colors
    0x80,
    0,
    0,
    ...[0x00, 0x00, 0x00, 0xff, 0x00, 0x00],
  ];

  if (frame) {
    bytes.push(
      0x2c,
      0,
      0,
      0,
      0,
      frame.width & 0xff,
      frame.width >> 8,
      frame.height & 0xff,
      frame.height >> 8,
      0,
      // LZW minimum code size, one sub-block and its terminator
      2,
      frame.lzw.length,
      ...frame.lzw,
      0
    );
  }

  bytes.push(0x3b);

  return Buffer.from(bytes);
}

describe("GIF", () => {
  test("load GIF", async () => {
    const image = await jimp.read(getTestImagePath("flower.gif"));
    expect(image.getPixelColor(10, 10)).toBe(0xfefefeff);
  });

  test("load animated GIF", async () => {
    const image = await jimp.read(getTestImagePath("animated.gif"));
    expect(image.getPixelColor(10, 10)).toBe(0xa1d2f1ff);
  });

  test("export GIF", async () => {
    const jgd = await jimp.read(getTestImagePath("flower.gif"));
    const buffer = await jgd.getBuffer("image/gif");
    expect(buffer.toString()).toMatch(/^GIF/);
  });

  test("round trips an exported GIF", async () => {
    const image = new jimp({ width: 5, height: 3, color: 0x336699ff });
    const decoded = await jimp.read(await image.getBuffer("image/gif"));

    expect(decoded.width).toBe(5);
    expect(decoded.height).toBe(3);
    expect(decoded.getPixelColor(4, 2)).toBe(0x336699ff);
  });

  test("decodes a minimal GIF", async () => {
    const image = await jimp.read(
      createGif({
        width: 1,
        height: 1,
        frame: { width: 1, height: 1, lzw: ONE_PIXEL_LZW },
      })
    );

    expect(image.width).toBe(1);
    expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
  });

  test("rejects GIFs larger than the maximum resolution", async () => {
    const crafted = createGif({
      width: 65535,
      height: 65535,
      frame: { width: 1, height: 1, lzw: ONE_PIXEL_LZW },
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "GIF dimensions 65535x65535 exceed the maximum resolution of 100 megapixels"
    );
  });

  test("rejects frames larger than the maximum resolution", async () => {
    const crafted = createGif({
      width: 1,
      height: 1,
      frame: { width: 65535, height: 65535, lzw: ONE_PIXEL_LZW },
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "GIF frame dimensions 65535x65535 exceed the maximum resolution of 100 megapixels"
    );
  });

  test("rejects a frame whose dimensions don't fit its data", async () => {
    const crafted = createGif({
      width: 5000,
      height: 5000,
      frame: { width: 5000, height: 5000, lzw: ONE_PIXEL_LZW },
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "GIF data is too short for a frame of 5000x5000"
    );
  });

  test("maxResolutionInMP can be configured", async () => {
    const buffer = createGif({
      width: 2,
      height: 2,
      frame: { width: 1, height: 1, lzw: ONE_PIXEL_LZW },
    });

    await expect(
      jimp.read(buffer, { "image/gif": { maxResolutionInMP: 0.000003 } })
    ).rejects.toThrow("exceed the maximum resolution of 0.000003 megapixels");

    const image = await jimp.read(buffer, {
      "image/gif": { maxResolutionInMP: 0.00001 },
    });

    expect(image.width).toBe(2);
  });

  test.each([
    [0, 10],
    [10, 0],
  ])("rejects a GIF with dimensions %ix%i", async (width, height) => {
    const crafted = createGif({
      width,
      height,
      frame: { width: 1, height: 1, lzw: ONE_PIXEL_LZW },
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      `Invalid GIF dimensions ${width}x${height}`
    );
  });

  test("rejects a GIF without frames", async () => {
    expect(() => gif().decode(createGif({ width: 1, height: 1 }))).toThrow(
      "Invalid GIF file: no frames found"
    );
  });
});
