import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import png from "@jimp/js-png";
import ico, { msIcon, readIcoEntries } from "./index.js";

const jimp = createJimp({ formats: [ico, msIcon, png] });

/**
 * Build the BMP of an ICO entry: a BITMAPINFOHEADER with the doubled height,
 * an optional palette, the pixels and the transparency mask. Rows are given
 * top to bottom, without padding.
 */
function createBmp({
  width,
  bitDepth,
  palette = [],
  rows,
  mask,
}: {
  width: number;
  bitDepth: number;
  palette?: number[];
  rows: number[][];
  /** "1" is transparent */
  mask?: string[];
}) {
  const height = rows.length;
  const stride = Math.ceil((width * bitDepth) / 32) * 4;
  const maskStride = Math.ceil(width / 32) * 4;
  const header = Buffer.alloc(40 + palette.length * 4);

  header.writeUInt32LE(40, 0);
  header.writeInt32LE(width, 4);
  header.writeInt32LE(height * 2, 8);
  header.writeUInt16LE(1, 12);
  header.writeUInt16LE(bitDepth, 14);
  header.writeUInt32LE(palette.length, 32);
  palette.forEach((color, i) => header.writeUInt32LE(color, 40 + i * 4));

  // Both bitmaps are stored bottom up
  const pixels = rows.toReversed().map((row) => {
    const padded = Buffer.alloc(stride);
    padded.set(row);
    return padded;
  });
  const maskRows = (mask ?? []).toReversed().map((row) => {
    const padded = Buffer.alloc(maskStride);

    [...row].forEach((bit, x) => {
      padded[x >> 3]! |= Number(bit) << (7 - (x & 7));
    });

    return padded;
  });

  return Buffer.concat([header, ...pixels, ...maskRows]);
}

/** Put images in an ICO file, or a CUR file with type 2 */
function createIco(images: Buffer[], type = 1) {
  const directory = Buffer.alloc(6 + images.length * 16);
  let offset = directory.length;

  directory.writeUInt16LE(type, 2);
  directory.writeUInt16LE(images.length, 4);

  images.forEach((image, i) => {
    directory.writeUInt32LE(image.length, 6 + i * 16 + 8);
    directory.writeUInt32LE(offset, 6 + i * 16 + 12);
    offset += image.length;
  });

  return Buffer.concat([directory, ...images]);
}

function createPng(width: number, height: number, color: number) {
  return png().encode(new jimp({ width, height, color }).bitmap);
}

function getPixels(image: InstanceType<typeof jimp>) {
  const pixels: number[] = [];

  image.scan((x, y) => {
    pixels.push(image.getPixelColor(x, y));
  });

  return pixels;
}

describe("ICO", () => {
  describe("decode", () => {
    test("decodes a PNG image", async () => {
      const image = await jimp.read(createIco([createPng(3, 2, 0x11223380)]));

      expect(image.mime).toBe("image/x-icon");
      expect(image.width).toBe(3);
      expect(image.height).toBe(2);
      expect(getPixels(image)).toEqual(new Array(6).fill(0x11223380));
    });

    test("decodes a 32 bit BMP with its alpha", async () => {
      const image = await jimp.read(
        createIco([
          createBmp({
            width: 2,
            bitDepth: 32,
            // BGRA
            rows: [
              [0, 0, 0xff, 0xff, 0, 0xff, 0, 0x80],
              [0xff, 0, 0, 0x40, 0xff, 0xff, 0xff, 0],
            ],
            // Ignored, the image has alpha
            mask: ["11", "11"],
          }),
        ]),
      );

      expect(getPixels(image)).toEqual([
        0xff0000ff, 0x00ff0080, 0x0000ff40, 0xffffff00,
      ]);
    });

    test("uses the mask of a 32 bit BMP whose alpha is all 0", async () => {
      const image = await jimp.read(
        createIco([
          createBmp({
            width: 2,
            bitDepth: 32,
            rows: [[0, 0, 0xff, 0, 0, 0xff, 0, 0]],
            mask: ["01"],
          }),
        ]),
      );

      expect(getPixels(image)).toEqual([0xff0000ff, 0x00ff0000]);
    });

    test("decodes a 24 bit BMP with its mask", async () => {
      // An odd width, so the rows of both bitmaps are padded
      const image = await jimp.read(
        createIco([
          createBmp({
            width: 3,
            bitDepth: 24,
            rows: [
              [0, 0, 0xff, 0, 0xff, 0, 0xff, 0, 0],
              [0xff, 0xff, 0xff, 0, 0, 0, 0x80, 0x80, 0x80],
            ],
            mask: ["010", "001"],
          }),
        ]),
      );

      expect(image.width).toBe(3);
      expect(image.height).toBe(2);
      expect(getPixels(image)).toEqual([
        0xff0000ff, 0x00ff0000, 0x0000ffff, 0xffffffff, 0x000000ff, 0x80808000,
      ]);
    });

    test.each([
      // One palette index per byte
      [8, [[0, 1, 2]]],
      // Two per byte, the low nibble of the last byte is padding
      [4, [[0x01, 0x20]]],
      // Eight per byte
      [1, [[0b01000000]]],
    ])("decodes a %i bit BMP with its mask", async (bitDepth, rows) => {
      const palette =
        bitDepth === 1 ? [0xff0000, 0x00ff00] : [0xff0000, 0x00ff00, 0x0000ff];
      const image = await jimp.read(
        createIco([
          createBmp({ width: 3, bitDepth, palette, rows, mask: ["100"] }),
        ]),
      );

      expect(getPixels(image)).toEqual([
        0xff000000,
        0x00ff00ff,
        bitDepth === 1 ? 0xff0000ff : 0x0000ffff,
      ]);
    });

    test("decodes a BMP without a mask as opaque", async () => {
      const image = await jimp.read(
        createIco([
          createBmp({ width: 1, bitDepth: 24, rows: [[0, 0, 0xff]] }),
        ]),
      );

      expect(getPixels(image)).toEqual([0xff0000ff]);
    });

    test("decodes a CUR file", async () => {
      const image = await jimp.read(
        createIco([createPng(2, 2, 0x336699ff)], 2),
      );

      expect(image.mime).toBe("image/x-icon");
      expect(getPixels(image)).toEqual(new Array(4).fill(0x336699ff));
    });

    // Written by ImageMagick: a 32 bit BMP and a 4 bit BMP with a mask
    test.each([
      [0, "icon-24.png" as const],
      [1, "icon-16.png" as const],
    ])("decodes image %i like ImageMagick", async (index, expected) => {
      const image = await jimp.read(getTestImagePath("icon.ico"), {
        "image/x-icon": { index },
      });
      const expectedImg = await jimp.read(getTestImagePath(expected));

      expect([...image.bitmap.data]).toEqual([...expectedImg.bitmap.data]);
    });
  });

  describe("picking an image", () => {
    const icon = createIco([
      createPng(1, 1, 0xff0000ff),
      createBmp({
        width: 2,
        bitDepth: 24,
        rows: [new Array(6).fill(0), new Array(6).fill(0)],
      }),
      createBmp({
        width: 2,
        bitDepth: 32,
        rows: [new Array(8).fill(0xff), new Array(8).fill(0xff)],
      }),
      createPng(4, 1, 0x0000ffff),
      createPng(3, 3, 0x00ff00ff),
    ]);

    test("lists the images", () => {
      // js-png writes images of one colour as 1-bit palette PNGs
      expect(readIcoEntries(icon)).toEqual([
        { index: 0, width: 1, height: 1, bitDepth: 1, format: "png" },
        { index: 1, width: 2, height: 2, bitDepth: 24, format: "bmp" },
        { index: 2, width: 2, height: 2, bitDepth: 32, format: "bmp" },
        { index: 3, width: 4, height: 1, bitDepth: 1, format: "png" },
        { index: 4, width: 3, height: 3, bitDepth: 1, format: "png" },
      ]);
    });

    test("decodes the largest image by default", async () => {
      const image = await jimp.read(icon);

      expect(image.width).toBe(3);
      expect(image.getPixelColor(0, 0)).toBe(0x00ff00ff);
    });

    test("decodes the image at an index", async () => {
      const image = await jimp.read(icon, { "image/x-icon": { index: 3 } });

      expect(image.width).toBe(4);
      expect(image.getPixelColor(0, 0)).toBe(0x0000ffff);
    });

    test.each([
      // The 2x2 image with the most bits per pixel
      [2, 2, 0xffffffff],
      // The smallest image that's large enough
      [1, 1, 0xff0000ff],
      [3, 3, 0x00ff00ff],
      // The 4x1 image is 4 pixels wide
      [4, 4, 0x0000ffff],
      // The largest image when none is large enough
      [100, 3, 0x00ff00ff],
    ])("decodes the image for size %i", async (size, width, color) => {
      const image = await jimp.read(icon, { "image/x-icon": { size } });

      expect(image.width).toBe(width);
      expect(image.getPixelColor(0, 0)).toBe(color);
    });

    test("rejects an index that's out of range", async () => {
      await expect(
        jimp.read(icon, { "image/x-icon": { index: 5 } }),
      ).rejects.toThrow(
        "ICO image index 5 is out of range, the file has 5 images",
      );
    });
  });

  describe("encode", () => {
    function colourful(width: number, height: number) {
      const image = new jimp({ width, height });

      image.scan((x, y, idx) => {
        image.bitmap.data[idx] = (x * 53 + y * 97) & 0xff;
        image.bitmap.data[idx + 1] = (x * 29) & 0xff;
        image.bitmap.data[idx + 2] = (y * 61) & 0xff;
        image.bitmap.data[idx + 3] = (x * 17 + y * 7) & 0xff;
      });

      return image;
    }

    test("writes the image as a PNG", async () => {
      const image = colourful(13, 5);
      const buffer = await image.getBuffer("image/x-icon");

      // An icon with one image
      expect([...buffer.subarray(0, 6)]).toEqual([0, 0, 1, 0, 1, 0]);
      // 13x5, no palette, 1 plane, 32 bits per pixel, at the end of the directory
      expect([...buffer.subarray(6, 14)]).toEqual([13, 5, 0, 0, 1, 0, 32, 0]);
      expect(buffer.readUInt32LE(6 + 8)).toBe(buffer.length - 22);
      expect(buffer.readUInt32LE(6 + 12)).toBe(22);
      expect(readIcoEntries(buffer)).toEqual([
        { index: 0, width: 13, height: 5, bitDepth: 32, format: "png" },
      ]);

      const decoded = await jimp.read(buffer);

      expect([...decoded.bitmap.data]).toEqual([...image.bitmap.data]);
    });

    test("writes image/vnd.microsoft.icon", async () => {
      const image = colourful(4, 4);

      expect(await image.getBuffer("image/vnd.microsoft.icon")).toEqual(
        await image.getBuffer("image/x-icon"),
      );
    });

    test("writes an image for each size", async () => {
      const image = colourful(64, 64);
      const original = Buffer.from(image.bitmap.data);
      const buffer = await image.getBuffer("image/x-icon", {
        sizes: [16, 32, 48, 256],
      });

      expect(readIcoEntries(buffer)).toEqual(
        [16, 32, 48, 256].map((size, index) => ({
          index,
          width: size,
          height: size,
          bitDepth: 32,
          format: "png",
        })),
      );
      // 256 is written as 0
      expect([...buffer.subarray(6 + 3 * 16, 6 + 3 * 16 + 2)]).toEqual([0, 0]);
      // The image itself isn't resized
      expect(image.width).toBe(64);
      expect([...image.bitmap.data]).toEqual([...original]);

      const largest = await jimp.read(buffer);
      const smallest = await jimp.read(buffer, {
        "image/x-icon": { index: 0 },
      });

      expect(largest.width).toBe(256);
      expect(smallest.width).toBe(16);
    });

    test("keeps the aspect ratio, clamps sizes and drops duplicates", async () => {
      const buffer = await colourful(8, 4).getBuffer("image/x-icon", {
        sizes: [4, 4.2, 0, 1000],
      });

      expect(
        readIcoEntries(buffer).map(({ width, height }) => [width, height]),
      ).toEqual([
        [4, 2],
        [1, 1],
        [256, 128],
      ]);
    });

    test("scales images larger than 256 pixels down", async () => {
      const buffer = await colourful(300, 150).getBuffer("image/x-icon");

      expect([...buffer.subarray(6, 8)]).toEqual([0, 128]);
      expect(readIcoEntries(buffer)).toMatchObject([
        { width: 256, height: 128 },
      ]);
    });
  });

  describe("invalid files", () => {
    test.each([
      [
        "isn't an ICO",
        Buffer.from("not an icon"),
        "it doesn't start with an ICO header",
      ],
      ["is empty", Buffer.alloc(0), "it doesn't start with an ICO header"],
      [
        "has an unknown type",
        Buffer.from([0, 0, 3, 0, 1, 0]),
        "unknown image type 3",
      ],
      [
        "has no images",
        Buffer.from([0, 0, 1, 0, 0, 0]),
        "it contains no images",
      ],
      [
        "has a truncated directory",
        Buffer.from([0, 0, 1, 0, 5, 0, 0, 0]),
        "the directory of 5 images is truncated",
      ],
      [
        "has an image past its end",
        createIco([createPng(1, 1, 0)]).subarray(0, 30),
        "image 0 is past the end of the file",
      ],
      [
        "has a truncated image",
        createIco([Buffer.alloc(10)]),
        "image 0 is truncated",
      ],
    ])("rejects a file that %s", (_, data, message) => {
      expect(() => ico().decode(data)).toThrow(`Invalid ICO file: ${message}`);
      expect(() => readIcoEntries(data)).toThrow(message);
    });

    test("rejects a BMP with an unsupported bit depth", async () => {
      const bmp = createBmp({ width: 1, bitDepth: 24, rows: [[0, 0, 0]] });
      bmp.writeUInt16LE(7, 14);

      await expect(jimp.read(createIco([bmp]))).rejects.toThrow(
        "Unsupported BMP bit depth 7",
      );
    });

    test("rejects a BMP missing its palette", async () => {
      const bmp = createBmp({ width: 1, bitDepth: 8, rows: [[0]] });

      await expect(jimp.read(createIco([bmp]))).rejects.toThrow(
        "Invalid ICO file: image 0 is truncated",
      );
    });
  });
});
