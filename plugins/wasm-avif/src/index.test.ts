import { describe, expect, test } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import avif from "./index.js";

const format = avif();
const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM AVIF", () => {
  test("rejects options it doesn't support", async () => {
    await expect(
      // @ts-expect-error the codec doesn't use the colour space
      format.encode(image, { colorSpace: "srgb" }),
    ).rejects.toThrow();
  });

  test("round-trips an image", async () => {
    // Run two of each at once so both race to initialize the codec
    const [buffer] = await Promise.all([
      format.encode(image),
      format.encode(image),
    ]);
    const [decoded] = await Promise.all([
      format.decode(buffer),
      format.decode(buffer),
    ]);

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
    expect(decoded.data.length).toBe(image.width * image.height * 4);
  });

  test("quality sets the quality from 0 to 100", async () => {
    const width = 64;
    const height = 64;
    const data = Buffer.alloc(width * height * 4);

    for (let i = 0; i < data.length; i++) {
      data[i] = i % 4 === 3 ? 255 : (i * 37) % 256;
    }

    const noisy = { width, height, data };
    const low = await format.encode(noisy, { quality: 10 });
    const high = await format.encode(noisy, { quality: 90 });

    expect(low.length).toBeLessThan(high.length);
    await expect(format.encode(noisy, { quality: 101 })).rejects.toThrow();
  });

  test("maxResolutionInMP rejects larger images before decoding", async () => {
    const buffer = await format.encode(image);
    const limit = (image.width * image.height - 1) / 1_000_000;

    await expect(
      format.decode(buffer, { maxResolutionInMP: limit }),
    ).rejects.toThrow(
      `AVIF dimensions ${image.width}x${image.height} exceed the maximum resolution of ${limit} megapixels`,
    );

    const decoded = await format.decode(buffer, {
      maxResolutionInMP: (image.width * image.height) / 1_000_000,
    });
    expect(decoded.width).toBe(image.width);
  });

  describe("getBuffer", () => {
    const Jimp = createJimp({ formats: [avif] });

    test("encodes without options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/avif"));
      expect(decoded.width).toBe(image.width);
    });

    test("encodes with empty options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/avif", {}));
      expect(decoded.width).toBe(image.width);
    });
  });
});
