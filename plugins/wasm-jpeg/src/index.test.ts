import { describe, expect, test } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import jpeg from "./index.js";

const format = jpeg();
const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM JPEG", () => {
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

  test("encodes without options", async () => {
    const buffer = await format.encode(image);
    expect((await format.decode(buffer)).width).toBe(image.width);
  });

  describe("getBuffer", () => {
    const Jimp = createJimp({ formats: [jpeg] });

    test("encodes without options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/jpeg"));
      expect(decoded.width).toBe(image.width);
    });

    test("encodes with empty options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/jpeg", {}));
      expect(decoded.width).toBe(image.width);
    });
  });
});
