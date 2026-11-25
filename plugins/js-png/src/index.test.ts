import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";

import { PNG } from "@jimp/pngjs";
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

  test("maxResolutionInMP rejects larger images before decoding", async () => {
    const path = getTestImagePath("dice.png");
    const { width, height } = (await jimp.read(path)).bitmap;
    const limit = (width * height - 1) / 1_000_000;

    await expect(
      jimp.read(path, { "image/png": { maxResolutionInMP: limit } }),
    ).rejects.toThrow(
      `PNG dimensions ${width}x${height} exceed the maximum resolution of ${limit} megapixels`,
    );
    await expect(
      jimp.readFrames(path, { "image/png": { maxResolutionInMP: limit } }),
    ).rejects.toThrow("exceed the maximum resolution");

    const image = await jimp.read(path, {
      "image/png": { maxResolutionInMP: (width * height) / 1_000_000 },
    });
    expect(image.bitmap.width).toBe(width);
  });

  test("decodes 16-bit PNGs to 8 bits", async () => {
    const source = new PNG({ width: 1, height: 1 });
    source.data = Buffer.from(new Uint16Array(4).fill(0x8000).buffer);
    const buffer = PNG.sync.write(source, {
      bitDepth: 16,
      colorType: PNGColorType.COLOR_ALPHA,
    });
    expect(buffer[24]).toBe(16);

    for (const options of [{}, { skipRescale: true } as object]) {
      const image = await jimp.fromBuffer(buffer, { "image/png": options });
      expect(image.getPixelColor(0, 0)).toBe(0x80808080);
    }
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
      ).rejects.toThrow("Unexpected end of file in IDAT chunk");
    });

    test("decodes PNGs cut inside IEND, as the image data is complete", async () => {
      const dice = await getDice();
      const image = await jimp.read(
        dice.buffer.subarray(0, dice.buffer.length - 2),
      );

      expect(Buffer.compare(image.bitmap.data, dice.bitmap.data)).toBe(0);
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
    // Big enough for more than 256 colours
    const width = 32;
    const height = 32;

    function createImage(
      getPixel: (i: number) => [number, number, number, number],
    ) {
      const data = Buffer.alloc(width * height * 4);

      for (let i = 0; i < width * height; i++) {
        data.set(getPixel(i), i * 4);
      }

      return jimp.fromBitmap({ width, height, data });
    }

    const color = (i: number): [number, number, number] => [
      (i * 7) % 256,
      ((i >> 4) * 13) % 256,
      (i * 29) % 256,
    ];
    const images = {
      "opaque grey": createImage((i) => [i % 256, i % 256, i % 256, 0xff]),
      "opaque colour": createImage((i) => [...color(i), 0xff]),
      "grey with alpha": createImage((i) => [
        i % 256,
        i % 256,
        i % 256,
        255 - (i >> 2),
      ]),
      "colour with alpha": createImage((i) => [...color(i), 255 - (i >> 2)]),
      // The pixel's RGB has to survive even though it is invisible
      "grey but for one transparent pixel": createImage((i) =>
        i === 100 ? [1, 2, 3, 0] : [i % 256, i % 256, i % 256, 0xff],
      ),
      "256 colours or fewer": createImage((i) => [...color(i % 200), 0xff]),
      "black and white": createImage((i) =>
        i % 3 ? [0, 0, 0, 0xff] : [0xff, 0xff, 0xff, 0xff],
      ),
    };

    test.each([
      ["opaque grey", PNGColorType.GRAYSCALE, 8],
      ["opaque colour", PNGColorType.COLOR, 8],
      ["grey with alpha", PNGColorType.GRAYSCALE_ALPHA, 8],
      ["colour with alpha", PNGColorType.COLOR_ALPHA, 8],
      ["grey but for one transparent pixel", PNGColorType.COLOR_ALPHA, 8],
      ["256 colours or fewer", PNGColorType.PALETTE, 8],
      ["black and white", PNGColorType.GRAYSCALE, 1],
    ] as const)("%s", async (name, colorType, bitDepth) => {
      const source = images[name];
      const buffer = await source.getBuffer("image/png");

      // The IHDR width and height, then the bit depth and colour type
      expect(buffer[24]).toBe(bitDepth);
      expect(buffer[25]).toBe(colorType);

      const decoded = await jimp.read(buffer);

      expect(decoded.width).toBe(width);
      expect(decoded.height).toBe(height);
      expect([...decoded.bitmap.data]).toEqual([...source.bitmap.data]);
    });

    test.each([
      PNGColorType.GRAYSCALE,
      PNGColorType.COLOR,
      PNGColorType.PALETTE,
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

  describe("APNG", () => {
    const path = getTestImagePath("animated.png");

    test("readFrames decodes every frame", async () => {
      const { frames, loop } = await jimp.readFrames(path);
      const defaultImage = await jimp.read(path);

      expect(frames).toHaveLength(8);
      expect(frames.map((frame) => frame.delay)).toEqual(Array(8).fill(200));
      // It plays 3 times: once, then 2 repeats
      expect(loop).toBe(2);
      // The first frame is the image that read() returns
      expect([...frames[0]!.image.bitmap.data]).toEqual([
        ...defaultImage.bitmap.data,
      ]);
      expect([...frames[7]!.image.bitmap.data]).not.toEqual([
        ...defaultImage.bitmap.data,
      ]);
    });

    test("readFrames stops after maxFrames", async () => {
      const { frames } = await jimp.readFrames(path, { maxFrames: 3 });

      expect(frames).toHaveLength(3);
    });

    test("a PNG that isn't animated has one frame", async () => {
      const result = await jimp.readFrames(getTestImagePath("dice.png"));

      expect(result.frames).toHaveLength(1);
      expect(result.frames[0]!.delay).toBeUndefined();
      expect("loop" in result).toBe(false);
    });
  });
});
