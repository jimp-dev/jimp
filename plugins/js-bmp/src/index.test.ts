import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import png from "@jimp/js-png";
import bmp from "./index.js";

const jimp = createJimp({ formats: [bmp, png] });

describe("BMP", () => {
  test("load BMP", async () => {
    const image = await jimp.read(getTestImagePath("windows95.bmp"));

    expect(image.getPixelColor(10, 10)).toBe(0xeff7f7ff);
    expect(image.getPixelColor(150, 80)).toBe(0x73add6ff);
    expect(image.getPixelColor(190, 200)).toBe(0xf7c300ff);
  });

  test("load BMP with a gap before the pixel data", async () => {
    const original = readFileSync(getTestImagePath("windows95.bmp"));
    const expected = await jimp.read(original);

    // Insert 8 bytes between the palette and the pixel data and point the
    // file header's pixel data offset past them.
    const pixelOffset = original.readUInt32LE(10);
    const gap = 8;
    const withGap = Buffer.concat([
      original.subarray(0, pixelOffset),
      Buffer.alloc(gap, 0xab),
      original.subarray(pixelOffset),
    ]);
    withGap.writeUInt32LE(withGap.length, 2);
    withGap.writeUInt32LE(pixelOffset + gap, 10);

    const image = await jimp.read(withGap);

    let mismatched = 0;
    for (let y = 0; y < expected.bitmap.height; y++) {
      for (let x = 0; x < expected.bitmap.width; x++) {
        if (image.getPixelColor(x, y) !== expected.getPixelColor(x, y)) {
          mismatched++;
        }
      }
    }

    expect(mismatched).toBe(0);
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
});
