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

/** Every pixel a different color */
function createGradient(width: number, height: number) {
  const image = new jimp({ width, height });

  image.scan((x, y, idx) => {
    image.bitmap.data[idx] = (x * 255) / (width - 1);
    image.bitmap.data[idx + 1] = (y * 255) / (height - 1);
    image.bitmap.data[idx + 2] = ((x + y) * 255) / (width + height - 2);
    image.bitmap.data[idx + 3] = 255;
  });

  return image;
}

/** Give pixel `i` a color no other `i` has */
function setDistinctColor(image: InstanceType<typeof jimp>, i: number) {
  image.bitmap.data[i * 4] = i;
  image.bitmap.data[i * 4 + 1] = (i * 7) & 0xff;
  image.bitmap.data[i * 4 + 2] = 255 - i;
  image.bitmap.data[i * 4 + 3] = 255;
}

/** PSNR of the RGB channels of the opaque pixels */
function psnr(expected: Buffer, actual: Buffer) {
  let error = 0;
  let count = 0;

  for (let i = 0; i < expected.length; i += 4) {
    if (expected[i + 3] === 0) {
      continue;
    }

    for (let c = 0; c < 3; c++) {
      error += (expected[i + c]! - actual[i + c]!) ** 2;
      count++;
    }
  }

  return 10 * Math.log10((255 * 255) / (error / count));
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

  test("keeps images with 256 colors lossless", async () => {
    const image = new jimp({ width: 16, height: 16 });

    for (let i = 0; i < 256; i++) {
      setDistinctColor(image, i);
    }

    const decoded = await jimp.read(await image.getBuffer("image/gif"));

    expect(decoded.bitmap.data.equals(image.bitmap.data)).toBe(true);
  });

  test("keeps transparent pixels and up to 255 other colors lossless", async () => {
    const image = new jimp({ width: 16, height: 16 });

    for (let i = 1; i < 256; i++) {
      setDistinctColor(image, i);
    }

    const decoded = await jimp.read(await image.getBuffer("image/gif"));

    expect(decoded.getPixelColor(0, 0)).toBe(0);
    expect(decoded.bitmap.data.equals(image.bitmap.data)).toBe(true);
  });

  test("keeps transparency when there are too many colors", async () => {
    const image = createGradient(64, 64);

    image.scan(0, 0, 32, 64, (x, y, idx) => {
      image.bitmap.data[idx + 3] = 0;
    });

    const decoded = await jimp.read(await image.getBuffer("image/gif"));

    image.scan((x, y, idx) => {
      const alpha = decoded.bitmap.data[idx + 3];
      expect(alpha).toBe(x < 32 ? 0 : 255);
    });
    expect(psnr(image.bitmap.data, decoded.bitmap.data)).toBeGreaterThan(35);
  });

  test("quantizes images with more than 256 colors", async () => {
    const image = createGradient(256, 256);
    const decoded = await jimp.read(await image.getBuffer("image/gif"));

    expect(psnr(image.bitmap.data, decoded.bitmap.data)).toBeGreaterThan(35);
  });

  test("rejects images larger than GIF allows", async () => {
    const image = new jimp({ width: 65536, height: 1 });

    await expect(image.getBuffer("image/gif")).rejects.toThrow(
      "GIF dimensions 65536x1 exceed the maximum of 65535x65535"
    );
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

  test("draws what a frame's data holds when it's too short for the frame", async () => {
    // Like browsers, the rest of the frame isn't drawn. Only as many indexes
    // as the data can hold are allocated, not 4000x4000.
    const image = await jimp.read(
      createGif({
        width: 4000,
        height: 4000,
        frame: { width: 4000, height: 4000, lzw: ONE_PIXEL_LZW },
      })
    );

    expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
    expect(image.getPixelColor(1, 0)).toBe(0);
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
  ])(
    "grows a %ix%i logical screen to fit the first frame, like browsers",
    async (width, height) => {
      const image = await jimp.read(
        createGif({
          width,
          height,
          frame: { width: 1, height: 1, lzw: ONE_PIXEL_LZW },
        })
      );

      expect([image.width, image.height]).toEqual([
        Math.max(width, 1),
        Math.max(height, 1),
      ]);
    }
  );

  test("rejects a GIF whose image is empty", async () => {
    const crafted = createGif({
      width: 0,
      height: 0,
      frame: { width: 0, height: 0, lzw: ONE_PIXEL_LZW },
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid GIF dimensions 0x0"
    );
  });

  test("rejects a GIF without frames", async () => {
    expect(() => gif().decode(createGif({ width: 1, height: 1 }))).toThrow(
      "Invalid GIF file: no frames found"
    );
  });
});
