import { describe, expect, test } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import webp from "./index.js";

const format = webp();
const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM WebP", () => {
  test("rejects options it doesn't support", async () => {
    await expect(
      // @ts-expect-error the codec doesn't use the colour space
      format.encode(image, { colorSpace: "srgb" }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error libwebp ignores threadLevel
      format.encode(image, { threadLevel: 1 }),
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

  test("maxResolutionInMP rejects larger images before decoding", async () => {
    const buffer = await format.encode(image);
    const limit = (image.width * image.height - 1) / 1_000_000;

    await expect(
      format.decode(buffer, { maxResolutionInMP: limit }),
    ).rejects.toThrow(
      `WebP dimensions ${image.width}x${image.height} exceed the maximum resolution of ${limit} megapixels`,
    );

    const decoded = await format.decode(buffer, {
      maxResolutionInMP: (image.width * image.height) / 1_000_000,
    });
    expect(decoded.width).toBe(image.width);
  });

  describe("getBuffer", () => {
    const Jimp = createJimp({ formats: [webp] });

    test("encodes without options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/webp"));
      expect(decoded.width).toBe(image.width);
    });

    test("encodes with empty options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/webp", {}));
      expect(decoded.width).toBe(image.width);
    });
  });
});
