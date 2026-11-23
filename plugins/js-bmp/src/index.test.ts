import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import png from "@jimp/js-png";
import bmp from "./index.js";

const jimp = createJimp({ formats: [bmp, png] });

/**
 * Build a BMP with a BITMAPINFOHEADER, optional color masks (for
 * BI_BITFIELDS and BI_ALPHA_BITFIELDS), an optional palette and optional
 * bytes between the palette and the pixel data
 */
function createBmp({
  width,
  height,
  bitDepth,
  compression = 0,
  masks = [],
  palette = [],
  gap = [],
  pixels,
}: {
  width: number;
  height: number;
  bitDepth: number;
  compression?: number;
  masks?: number[];
  palette?: number[];
  gap?: number[];
  pixels: number[];
}) {
  const paletteOffset = 14 + 40 + masks.length * 4;
  const offset = paletteOffset + palette.length * 4 + gap.length;
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
  masks.forEach((mask, i) => buffer.writeUInt32LE(mask, 54 + i * 4));
  palette.forEach((color, i) =>
    buffer.writeUInt32LE(color, paletteOffset + i * 4),
  );
  buffer.set(gap, offset - gap.length);
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

  test("writes the header options", async () => {
    const image = new jimp({ width: 2, height: 2, color: 0x336699ff });
    const buffer = await image.getBuffer("image/bmp", {
      hr: 2835,
      vr: 1417,
      reserved1: 7,
      reserved2: 9,
    });

    expect(buffer.readUInt32LE(38)).toBe(2835);
    expect(buffer.readUInt32LE(42)).toBe(1417);
    expect(buffer.readUInt16LE(6)).toBe(7);
    expect(buffer.readUInt16LE(8)).toBe(9);
  });

  test("writes a 24 bit BMP without a palette by default", async () => {
    const image = new jimp({ width: 2, height: 2, color: 0x336699ff });
    const buffer = await image.getBuffer("image/bmp", {
      palette: [{ red: 0, green: 0, blue: 0, quad: 0 }],
      colors: 1,
      importantColors: 1,
    } as object);

    expect(buffer).toEqual(await image.getBuffer("image/bmp"));
    expect(buffer.readUInt16LE(28)).toBe(24);
  });

  // an odd width, so rows need padding
  function colourful() {
    const image = new jimp({ width: 13, height: 5 });

    image.scan((x, y, idx) => {
      image.bitmap.data[idx] = (x * 53 + y * 97) & 0xff;
      image.bitmap.data[idx + 1] = (x * 29) & 0xff;
      image.bitmap.data[idx + 2] = (y * 61) & 0xff;
      image.bitmap.data[idx + 3] = 0xff;
    });

    return image;
  }

  describe("bitPP", () => {
    test.each([
      [24 as const, 0],
      [32 as const, 0],
      // 5 bits per channel
      [16 as const, 7],
    ])("round trips a %d bit BMP", async (bitPP, tolerance) => {
      const image = colourful();
      const buffer = await image.getBuffer("image/bmp", { bitPP });
      const decoded = await jimp.read(buffer);

      expect(buffer.readUInt16LE(28)).toBe(bitPP);
      expect(decoded.width).toBe(13);
      expect(decoded.height).toBe(5);

      for (let i = 0; i < image.bitmap.data.length; i++) {
        expect(
          Math.abs(decoded.bitmap.data[i]! - image.bitmap.data[i]!),
        ).toBeLessThanOrEqual(tolerance);
      }
    });

    test.each([2, 15, 64])("rejects %d bits", async (bitPP) => {
      await expect(
        colourful().getBuffer("image/bmp", { bitPP } as object),
      ).rejects.toThrow(
        `Unsupported BMP bit depth ${bitPP}, use 1, 4, 8, 16, 24, 32`,
      );
    });

    test.each([1 as const, 4 as const, 8 as const])(
      "accepts %d bits",
      async (bitPP) => {
        const buffer = await colourful().getBuffer("image/bmp", { bitPP });

        expect(buffer.readUInt16LE(28)).toBe(bitPP);
      },
    );
  });

  describe("palette bit depths", () => {
    /** The 0xRRGGBB colours of a BMP's palette */
    function readPalette(buffer: Buffer) {
      const colors = buffer.readUInt32LE(46);

      return Array.from(
        { length: colors },
        (_, i) => buffer.readUInt32LE(54 + i * 4) & 0xffffff,
      );
    }

    /** A 13x5 image (an odd width, so rows need padding) with these colours */
    function withColours(colours: number[]) {
      const image = new jimp({ width: 13, height: 5 });

      image.scan((x, y) => {
        image.setPixelColor(colours[(y * 13 + x) % colours.length]!, x, y);
      });

      return image;
    }

    /** `count` different opaque colours */
    function createColours(count: number) {
      return Array.from(
        { length: count },
        (_, i) => (((i * 0x10e7f3) & 0xffffff) * 0x100 + 0xff) >>> 0,
      );
    }

    test.each([
      [1 as const, 2],
      [4 as const, 16],
      [8 as const, 65],
    ])(
      "writes a %d bit BMP with the image's colours when it has few enough",
      async (bitPP, count) => {
        const colours = createColours(count);
        const image = withColours(colours);
        const buffer = await image.getBuffer("image/bmp", { bitPP });
        const decoded = await jimp.read(buffer);

        expect(buffer.readUInt16LE(28)).toBe(bitPP);
        expect(readPalette(buffer)).toEqual(
          colours.map((colour) => colour >>> 8).sort((a, b) => a - b),
        );
        expect(decoded.bitmap.data).toEqual(image.bitmap.data);
      },
    );

    test("writes a black and white 1 bit BMP", async () => {
      const image = colourful();
      const buffer = await image.getBuffer("image/bmp", { bitPP: 1 });
      const decoded = await jimp.read(buffer);

      expect(buffer.readUInt16LE(28)).toBe(1);
      expect(readPalette(buffer)).toEqual([0x000000, 0xffffff]);
      expect(decoded.width).toBe(13);
      expect(decoded.height).toBe(5);

      image.scan((x, y, idx) => {
        const [red, green, blue] = image.bitmap.data.subarray(idx, idx + 3);
        const luminance = 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;

        expect(decoded.getPixelColor(x, y)).toBe(
          luminance > 127.5 ? 0xffffffff : 0x000000ff,
        );
      });
    });

    test.each([
      [4 as const, 16, 16],
      [8 as const, 256, 4],
    ])(
      "builds a palette for a %d bit BMP of an image with more colours",
      async (bitPP, maxColours, maxError) => {
        const image = new jimp({ width: 33, height: 33 });

        image.scan((x, y, idx) => {
          image.bitmap.data[idx] = x * 8;
          image.bitmap.data[idx + 1] = y * 8;
          image.bitmap.data[idx + 2] = 128;
          image.bitmap.data[idx + 3] = 0xff;
        });

        const buffer = await image.getBuffer("image/bmp", { bitPP });
        const decoded = await jimp.read(buffer);
        const palette = readPalette(buffer);

        expect(buffer.readUInt16LE(28)).toBe(bitPP);
        expect(palette.length).toBeGreaterThan(maxColours / 2);
        expect(palette.length).toBeLessThanOrEqual(maxColours);

        let error = 0;

        decoded.scan((x, y, idx) => {
          const colour = decoded.getPixelColor(x, y) >>> 8;

          // Every pixel is the nearest palette colour
          const distance = (c: number) =>
            ((c >> 16) - image.bitmap.data[idx]!) ** 2 +
            (((c >> 8) & 0xff) - image.bitmap.data[idx + 1]!) ** 2 +
            ((c & 0xff) - image.bitmap.data[idx + 2]!) ** 2;

          expect(palette).toContain(colour);
          expect(distance(colour)).toBe(Math.min(...palette.map(distance)));

          for (let i = 0; i < 3; i++) {
            error += Math.abs(
              decoded.bitmap.data[idx + i]! - image.bitmap.data[idx + i]!,
            );
          }
        });

        // 1089 colours, 8 apart, don't fit in the palette, but they're close
        expect(error / (33 * 33 * 3)).toBeLessThan(maxError);
      },
    );

    test.each([1 as const, 4 as const, 8 as const])(
      "writes a %d bit BMP with the given palette",
      async (bitPP) => {
        const image = withColours([0x101010ff, 0xf0f0f0ff, 0xc02020ff]);
        const buffer = await image.getBuffer("image/bmp", {
          bitPP,
          palette: ["white", 0x000000ff],
        });
        const decoded = await jimp.read(buffer);

        expect(readPalette(buffer)).toEqual([0xffffff, 0x000000]);

        image.scan((x, y) => {
          expect(decoded.getPixelColor(x, y)).toBe(
            image.getPixelColor(x, y) === 0xf0f0f0ff ? 0xffffffff : 0x000000ff,
          );
        });
      },
    );

    test.each([
      [1 as const, 3],
      [4 as const, 17],
      [8 as const, 257],
      [8 as const, 0],
    ])("rejects a %d bit palette of %d colours", async (bitPP, count) => {
      await expect(
        colourful().getBuffer("image/bmp", {
          bitPP,
          palette: createColours(count),
        }),
      ).rejects.toThrow(
        `A ${bitPP}-bit BMP palette needs 1 to ${2 ** bitPP} colours, got ${count}`,
      );
    });

    test("rejects an invalid palette colour", async () => {
      await expect(
        colourful().getBuffer("image/bmp", {
          bitPP: 4,
          palette: ["black", "not a colour"],
        }),
      ).rejects.toThrow('Invalid color "not a colour"');
    });

    test("ignores the palette of a 24 bit BMP", async () => {
      const image = colourful();

      expect(
        await image.getBuffer("image/bmp", { palette: [0x000000ff] }),
      ).toEqual(await image.getBuffer("image/bmp"));
    });
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
      }),
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
      }),
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
        // Bottom row first: 4 x color 1, end of line, 4 x color 0, end of bitmap
        pixels: [4, 1, 0, 0, 4, 0, 0, 1],
      }),
    );

    expect(image.width).toBe(4);
    expect(image.height).toBe(2);
    expect(image.getPixelColor(3, 0)).toBe(0x000000ff);
    expect(image.getPixelColor(3, 1)).toBe(0xff0000ff);
  });

  test.each([
    [
      "an uncompressed",
      { bitDepth: 24, pixels: [0, 0, 0xff, 0, 0, 0xff, 0, 0, 0xff, 0, 0, 0] },
    ],
    [
      "an RLE8",
      // 3 x color 1, end of line, end of bitmap
      { bitDepth: 8, compression: 1, pixels: [3, 1, 0, 0, 0, 1] },
    ],
  ])(
    "reads the pixel data of %s BMP from the offset in the header",
    async (_, image) => {
      const decoded = await jimp.read(
        createBmp({
          width: 3,
          height: 1,
          palette: [0x000000, 0xff0000],
          // Not red when read as 24 bit pixels, and the end of the bitmap
          // when read as RLE8
          gap: [0, 1, 0xff, 0, 0, 0xff, 0, 0],
          ...image,
        }),
      );

      expect(decoded.getPixelColor(0, 0)).toBe(0xff0000ff);
      expect(decoded.getPixelColor(1, 0)).toBe(0xff0000ff);
      expect(decoded.getPixelColor(2, 0)).toBe(0xff0000ff);
    },
  );

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
      "BMP data is too short for an RLE image of 10000x10000",
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
      "BMP data is too short for an image of 5000x5000 at 24 bits per pixel",
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
      "BMP data is too short for an image of 2x2 at 24 bits per pixel",
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
      "exceed the maximum resolution of 100 megapixels",
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
      jimp.read(buffer, { "image/bmp": { maxResolutionInMP: 0.000003 } }),
    ).rejects.toThrow("exceed the maximum resolution of 0.000003 megapixels");

    const image = await jimp.read(buffer, {
      "image/bmp": { maxResolutionInMP: 0.00001 },
    });

    expect(image.width).toBe(2);
  });

  test.each([
    [0, 10, "0x10"],
    [10, 0, "10x0"],
    // bmp-ts reads the width as unsigned
    [-10, 10, "4294967286x10"],
  ])("rejects a BMP with dimensions %ix%i", async (width, height, message) => {
    const crafted = createBmp({ width, height, bitDepth: 24, pixels: [] });

    await expect(jimp.read(crafted)).rejects.toThrow(
      `Invalid BMP dimensions ${message}`,
    );
  });

  test("rejects unsupported bit depths", async () => {
    const crafted = createBmp({
      width: 1,
      height: 1,
      bitDepth: 64,
      pixels: [0, 0, 0, 0],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Unsupported BMP bit depth 64",
    );
  });

  test("rejects a truncated header", async () => {
    expect(() => bmp().decode(Buffer.from("BM\0\0\0\0\0\0\0\0"))).toThrow(
      RangeError,
    );
  });

  test.each([
    // ARGB 4444. bmp-ts scales 4 bit channels by 16, so 0xf is 0xf0.
    [
      16,
      [0x0f00, 0x00f0, 0x000f, 0xf000],
      [0x00, 0x8f, 0x0f, 0xf0],
      [0xf0000080, 0x0000f0f0],
    ],
    // ARGB 8888
    [
      32,
      [0x00ff0000, 0x0000ff00, 0x000000ff, 0xff000000],
      [0x00, 0x00, 0xff, 0x80, 0xff, 0x00, 0x00, 0xff],
      [0xff000080, 0x0000ffff],
    ],
  ])(
    "keeps the alpha of a %i bit BI_ALPHA_BITFIELDS BMP",
    async (bitDepth, masks, pixels, expected) => {
      const image = await jimp.read(
        createBmp({
          width: 2,
          height: 1,
          bitDepth,
          compression: 6,
          masks,
          pixels,
        }),
      );

      expect(image.getPixelColor(0, 0)).toBe(expected[0]);
      expect(image.getPixelColor(1, 0)).toBe(expected[1]);
    },
  );

  test.each([
    ["zero", 0],
    ["not zero", 0x80],
  ])(
    "ignores the alpha byte of a 32 bit BMP without an alpha mask when it is %s",
    async (_, alpha) => {
      const image = await jimp.read(
        createBmp({
          width: 2,
          height: 1,
          bitDepth: 32,
          pixels: [0, 0, 0xff, alpha, 0xff, 0, 0, alpha],
        }),
      );

      expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
      expect(image.getPixelColor(1, 0)).toBe(0x0000ffff);
    },
  );
});
