import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";

import png, { PNGColorType } from "./index.js";
import { getTestImagePath } from "@jimp/test-utils";

const jimp = createJimp({ formats: [png] });

describe("PNG", () => {
  test("load PNG", async () => {
    const image = await jimp.read(getTestImagePath("dice.png"));
    expect(image.getPixelColor(10, 10)).toBe(0x00000000);
    expect(image.getPixelColor(160, 80)).toBe(0x1c1cd4ff);
    expect(image.getPixelColor(400, 250)).toBe(0x7e0c0cda);
  });

  test("export PNG", async () => {
    const testImage = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await testImage.getBuffer("image/png");
    expect(buffer.toString()).toMatch(/^.PNG\r\n/);
  });

  describe("data after IEND", () => {
    async function getDice() {
      const image = await jimp.read(getTestImagePath("dice.png"));
      return {
        bitmap: image.bitmap,
        buffer: await image.getBuffer("image/png"),
      };
    }

    test.each([
      ["junk", () => Buffer.from("junk")],
      ["zeros", () => Buffer.alloc(1024)],
      [
        "a second PNG",
        () =>
          jimp
            .fromBitmap({ width: 1, height: 1, data: [0xff0000ff] })
            .getBuffer("image/png"),
      ],
    ])("ignores %s after IEND", async (_, getTrailingData) => {
      const dice = await getDice();
      const image = await jimp.read(
        Buffer.concat([dice.buffer, await getTrailingData()]),
      );

      expect(image.bitmap.width).toBe(dice.bitmap.width);
      expect(image.bitmap.height).toBe(dice.bitmap.height);
      expect(Buffer.compare(image.bitmap.data, dice.bitmap.data)).toBe(0);
    });

    test("still rejects truncated PNGs", async () => {
      const { buffer } = await getDice();

      await expect(
        jimp.read(buffer.subarray(0, buffer.length / 2)),
      ).rejects.toThrow();
      // Cut inside the IEND chunk
      await expect(
        jimp.read(buffer.subarray(0, buffer.length - 2)),
      ).rejects.toThrow();
    });

    test("still rejects a chunk length past the end of the data", async () => {
      const { buffer } = await getDice();
      const corrupt = Buffer.from(buffer);
      // Length of the IHDR chunk
      corrupt.writeUInt32BE(0xffffffff, 8);

      await expect(jimp.read(corrupt)).rejects.toThrow();
    });
  });

  describe("export PNG without alpha", () => {
    const width = 16;
    const height = 16;
    const data = Buffer.alloc(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      data[i * 4] = (i * 7) % 256;
      data[i * 4 + 1] = (i * 13) % 256;
      data[i * 4 + 2] = (i * 29) % 256;
      data[i * 4 + 3] = 0xff;
    }

    const source = jimp.fromBitmap({ width, height, data });

    async function expectRgbCopyOfSource(buffer: Buffer) {
      // The colour type is the byte after the IHDR width, height and bit depth
      expect(buffer[25]).toBe(PNGColorType.COLOR);

      const decoded = await jimp.read(buffer);

      expect(decoded.width).toBe(width);
      expect(decoded.height).toBe(height);
      expect([...decoded.bitmap.data]).toEqual([...source.bitmap.data]);
    }

    test("colorType: COLOR", async () => {
      const buffer = await source.getBuffer("image/png", {
        colorType: PNGColorType.COLOR,
      });

      await expectRgbCopyOfSource(buffer);
    });

    test("inputHasAlpha: false", async () => {
      const buffer = await source.getBuffer("image/png", {
        inputHasAlpha: false,
      });

      await expectRgbCopyOfSource(buffer);
    });
  });

  describe("automatic colour type", () => {
    const width = 16;
    const height = 16;

    function createImage(
      getPixel: (i: number) => [number, number, number, number],
    ) {
      const data = Buffer.alloc(width * height * 4);

      for (let i = 0; i < width * height; i++) {
        data.set(getPixel(i), i * 4);
      }

      return jimp.fromBitmap({ width, height, data });
    }

    const images = {
      "opaque grey": createImage((i) => [i, i, i, 0xff]),
      "opaque colour": createImage((i) => [
        (i * 7) % 256,
        (i * 13) % 256,
        (i * 29) % 256,
        0xff,
      ]),
      "grey with alpha": createImage((i) => [i, i, i, 255 - i]),
      "colour with alpha": createImage((i) => [
        (i * 7) % 256,
        (i * 13) % 256,
        (i * 29) % 256,
        255 - i,
      ]),
      // The pixel's RGB has to survive even though it is invisible
      "grey but for one transparent pixel": createImage((i) =>
        i === 100 ? [1, 2, 3, 0] : [i, i, i, 0xff],
      ),
    };

    test.each([
      ["opaque grey", PNGColorType.GRAYSCALE],
      ["opaque colour", PNGColorType.COLOR],
      ["grey with alpha", PNGColorType.GRAYSCALE_ALPHA],
      ["colour with alpha", PNGColorType.COLOR_ALPHA],
      ["grey but for one transparent pixel", PNGColorType.COLOR_ALPHA],
    ] as const)("%s", async (name, colorType) => {
      const source = images[name];
      const buffer = await source.getBuffer("image/png");

      // The colour type is the byte after the IHDR width, height and bit depth
      expect(buffer[25]).toBe(colorType);

      const decoded = await jimp.read(buffer);

      expect(decoded.width).toBe(width);
      expect(decoded.height).toBe(height);
      expect([...decoded.bitmap.data]).toEqual([...source.bitmap.data]);
    });

    test.each([
      PNGColorType.GRAYSCALE,
      PNGColorType.COLOR,
      PNGColorType.GRAYSCALE_ALPHA,
      PNGColorType.COLOR_ALPHA,
    ])("colorType %s overrides it", async (colorType) => {
      const buffer = await images["opaque grey"].getBuffer("image/png", {
        colorType,
      });

      expect(buffer[25]).toBe(colorType);
    });

    test("inputHasAlpha: false overrides it", async () => {
      const buffer = await images["opaque grey"].getBuffer("image/png", {
        inputHasAlpha: false,
      });

      expect(buffer[25]).toBe(PNGColorType.COLOR);
    });
  });
});
