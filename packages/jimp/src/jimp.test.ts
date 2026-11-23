import { describe, expect, test } from "vitest";
import { Jimp } from "./index.js";
import { getTestImagePath, makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

describe("hasAlpha", () => {
  test("image with no alpha", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    expect(image.hasAlpha()).toBe(false);
  });

  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    expect(image.hasAlpha()).toBe(true);
  });

  test("autocropRect is available on the public Jimp entrypoint", () => {
    const image = Jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▫▫◆   ",
        "  ◆▫▫▫▫◆  ",
        "   ◆▫▫◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(image.autocropRect()).toEqual({
      x: 2,
      y: 1,
      w: 6,
      h: 5,
    });
  });
});

describe("fromBitmap", () => {
  test("Buffer view only copies its own bytes", () => {
    const backing = Buffer.alloc(64, 0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const before = Buffer.from(backing);
    const image = Jimp.fromBitmap({ data, width: 2, height: 2 });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);

    image.bitmap.data.fill(0);
    expect(backing.equals(before)).toBe(true);
  });

  test("Uint8Array view only uses its own bytes", () => {
    const backing = new Uint8Array(64).fill(0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const image = Jimp.fromBitmap({ data, width: 2, height: 2 });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);
  });
});

describe("getBuffer", () => {
  test("encoders that return a plain Uint8Array", async () => {
    const CustomJimp = createJimp({
      formats: [
        () => ({
          ...png(),
          // Like jpeg-js when it isn't loaded as CommonJS
          encode: async (bitmap) =>
            new Uint8Array(await png().encode(bitmap)) as Buffer,
        }),
      ],
    });
    const image = new CustomJimp({ width: 2, height: 2, color: 0xff0000ff });
    const expected = await Jimp.fromBitmap(image.bitmap).getBuffer("image/png");

    const buffer = await image.getBuffer("image/png");
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.equals(expected)).toBe(true);

    expect(await image.getBase64("image/png")).toBe(
      `data:image/png;base64,${expected.toString("base64")}`,
    );
  });
});

describe("palette BMPs", () => {
  async function roundTrip(image: InstanceType<typeof Jimp>, bitPP: 1 | 4) {
    const buffer = await image.getBuffer("image/bmp", { bitPP });

    return Jimp.read(buffer);
  }

  test("a dithered image is written exactly as a 1-bit BMP", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));

    image.dither({ type: "floyd-steinberg" });

    const decoded = await roundTrip(image, 1);

    expect(decoded.bitmap.data).toEqual(image.bitmap.data);
  });

  test("a quantized image is written exactly as a 4-bit BMP", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));

    image.quantize({ colors: 16 });

    const decoded = await roundTrip(image, 4);

    expect(decoded.bitmap.data).toEqual(image.bitmap.data);
  });
});
