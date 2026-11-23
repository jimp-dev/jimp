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
