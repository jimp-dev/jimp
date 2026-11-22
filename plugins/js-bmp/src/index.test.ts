import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import png from "@jimp/js-png";
import bmp from "./index.js";

const jimp = createJimp({ formats: [bmp, png] });

/** Build a BMP with a BITMAPINFOHEADER and an optional palette */
function createBmp({
  width,
  height,
  bitDepth,
  compression = 0,
  palette = [],
  pixels,
}: {
  width: number;
  height: number;
  bitDepth: number;
  compression?: number;
  palette?: number[];
  pixels: number[];
}) {
  const offset = 14 + 40 + palette.length * 4;
  const buffer = Buffer.alloc(offset + pixels.length);

  buffer.write("BM", 0);
  buffer.writeUInt32LE(buffer.length, 2);
  buffer.writeUInt32LE(offset, 10);
  buffer.writeUInt32LE(40, 14);
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22);
  buffer.writeUInt16LE(1, 26);
  buffer.writeUInt16LE(bitDepth, 28);
  buffer.writeUInt32LE(compression, 30);
  buffer.writeUInt32LE(pixels.length, 34);
  buffer.writeUInt32LE(palette.length, 46);
  palette.forEach((color, i) => buffer.writeUInt32LE(color, 54 + i * 4));
  buffer.set(pixels, offset);

  return buffer;
}

describe("BMP", () => {
  test("load BMP", async () => {
    const image = await jimp.read(getTestImagePath("windows95.bmp"));

    expect(image.getPixelColor(10, 10)).toBe(0xeff7f7ff);
    expect(image.getPixelColor(150, 80)).toBe(0x73add6ff);
    expect(image.getPixelColor(190, 200)).toBe(0xf7c300ff);
  });

  test("export BMP", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await image.getBuffer("image/bmp");

    expect(buffer.toString()).toMatch(/^BM/);
  });

  test("round trips an exported BMP", async () => {
    const image = new jimp({ width: 5, height: 3, color: 0x336699ff });
    const decoded = await jimp.read(await image.getBuffer("image/bmp"));

    expect(decoded.width).toBe(5);
    expect(decoded.height).toBe(3);
    expect(decoded.getPixelColor(4, 2)).toBe(0x336699ff);
  });

  test("decodes an uncompressed 24 bit BMP", async () => {
    // 2x2, bottom-up, each row padded to 8 bytes
    const image = await jimp.read(
      createBmp({
        width: 2,
        height: 2,
        bitDepth: 24,
        pixels: [
          0xff, 0, 0, 0, 0xff, 0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0,
        ],
      })
    );

    expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
    expect(image.getPixelColor(1, 0)).toBe(0xffffffff);
    expect(image.getPixelColor(0, 1)).toBe(0x0000ffff);
    expect(image.getPixelColor(1, 1)).toBe(0x00ff00ff);
  });

  test("decodes a top-down BMP", async () => {
    const image = await jimp.read(
      createBmp({
        width: 1,
        height: -2,
        bitDepth: 24,
        pixels: [0, 0, 0xff, 0, 0xff, 0, 0, 0],
      })
    );

    expect(image.height).toBe(2);
    expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
    expect(image.getPixelColor(0, 1)).toBe(0x0000ffff);
  });

  test("decodes an RLE8 BMP", async () => {
    const image = await jimp.read(
      createBmp({
        width: 4,
        height: 2,
        bitDepth: 8,
        compression: 1,
        palette: [0x000000, 0xff0000],
        // 4 x color 1, end of line, 4 x color 0, end of bitmap
        pixels: [4, 1, 0, 0, 4, 0, 0, 1],
      })
    );

    expect(image.width).toBe(4);
    expect(image.height).toBe(2);
  });

  test("rejects an RLE8 BMP whose dimensions don't fit its data", async () => {
    // The header claims 10000x10000 but there is no pixel data at all
    const crafted = createBmp({
      width: 10_000,
      height: 10_000,
      bitDepth: 8,
      compression: 1,
      palette: new Array(256).fill(0),
      pixels: [],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "BMP data is too short for an RLE image of 10000x10000"
    );
  });

  test("rejects an uncompressed BMP whose dimensions don't fit its data", async () => {
    const crafted = createBmp({
      width: 5000,
      height: 5000,
      bitDepth: 24,
      pixels: [0, 0, 0, 0],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "BMP data is too short for an image of 5000x5000 at 24 bits per pixel"
    );
  });

  test("rejects a BMP missing its last row", async () => {
    const crafted = createBmp({
      width: 2,
      height: 2,
      bitDepth: 24,
      pixels: [0xff, 0, 0, 0, 0xff, 0, 0, 0],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "BMP data is too short for an image of 2x2 at 24 bits per pixel"
    );
  });

  test("rejects BMPs larger than the maximum resolution", async () => {
    const crafted = createBmp({
      width: 0x7fffffff,
      height: 0x7fffffff,
      bitDepth: 32,
      pixels: [],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "exceed the maximum resolution of 100 megapixels"
    );
  });

  test("maxResolutionInMP can be configured", async () => {
    const buffer = createBmp({
      width: 2,
      height: 2,
      bitDepth: 32,
      pixels: new Array(16).fill(0xff),
    });

    await expect(
      jimp.read(buffer, { "image/bmp": { maxResolutionInMP: 0.000003 } })
    ).rejects.toThrow("exceed the maximum resolution of 0.000003 megapixels");

    const image = await jimp.read(buffer, {
      "image/bmp": { maxResolutionInMP: 0.00001 },
    });

    expect(image.width).toBe(2);
  });

  test.each([
    [0, 10],
    [10, 0],
    [-10, 10],
  ])("rejects a BMP with dimensions %ix%i", async (width, height) => {
    const crafted = createBmp({ width, height, bitDepth: 24, pixels: [] });

    await expect(jimp.read(crafted)).rejects.toThrow(
      `Invalid BMP dimensions ${width}x${Math.abs(height)}`
    );
  });

  test("rejects unsupported bit depths", async () => {
    const crafted = createBmp({
      width: 1,
      height: 1,
      bitDepth: 7,
      pixels: [0, 0, 0, 0],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Unsupported BMP bit depth 7"
    );
  });

  test("rejects a truncated header", async () => {
    expect(() => bmp().decode(Buffer.from("BM\0\0\0\0\0\0\0\0"))).toThrow(
      "Invalid BMP file: header is truncated"
    );
  });
});
