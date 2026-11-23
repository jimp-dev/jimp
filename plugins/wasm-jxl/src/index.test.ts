import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { Bitmap } from "@jimp/types";

import jxl from "./index.js";

const format = jxl();

/** A smooth gradient with every kind of alpha, and colour under alpha 0 */
function makeImage(width: number, height: number, opaque = false): Bitmap {
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      data[i] = (x * 255) / (width - 1);
      data[i + 1] = (y * 255) / (height - 1);
      data[i + 2] = 128 + Math.sin((x + y) / 6) * 100;
      data[i + 3] = opaque ? 255 : x < 4 ? 0 : x < 8 ? 100 + y : 255;
    }
  }

  return { width, height, data };
}

const image = makeImage(32, 24);
const opaqueImage = makeImage(32, 24, true);

/** The largest and mean differences between two bitmaps' samples */
function difference(a: Bitmap, b: Bitmap) {
  let max = 0;
  let total = 0;

  for (let i = 0; i < a.data.length; i++) {
    const difference = Math.abs(a.data[i]! - b.data[i]!);
    max = Math.max(max, difference);
    total += difference;
  }

  return { max, mean: total / a.data.length };
}

/**
 * The files are lossless, but the codec's decoder converts the colours to
 * sRGB in floating point, which puts a few samples 1 off, e.g. a red of 8
 * next to a bright green decodes as 7. Alpha isn't converted.
 */
function expectLossless(decoded: Bitmap, image: Bitmap) {
  let off = 0;

  expect(decoded.width).toBe(image.width);
  expect(decoded.height).toBe(image.height);

  for (let i = 0; i < image.data.length; i++) {
    const difference = Math.abs(decoded.data[i]! - image.data[i]!);

    if (i % 4 === 3) {
      expect(difference).toBe(0);
    } else {
      expect(difference).toBeLessThanOrEqual(1);
      off += difference;
    }
  }

  expect(off).toBeLessThan(image.data.length / 100);
}

describe("WASM JPEG XL", () => {
  test("rejects options it doesn't support", async () => {
    await expect(
      // @ts-expect-error the codec always writes sRGB
      format.encode(image, { colorSpace: "srgb" }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error left out because it's broken in the codec
      format.encode(image, { lossyPalette: true }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error quality is a number
      format.encode(image, { quality: "high" }),
    ).rejects.toThrow();
  });

  test.each([
    ["RGBA", image],
    ["RGB", opaqueImage],
  ])("round-trips %s losslessly", async (_, image) => {
    // Run two of each at once so both race to initialize the codec
    const [buffer] = await Promise.all([
      format.encode(image, { lossless: true }),
      format.encode(image, { lossless: true }),
    ]);
    const [decoded] = await Promise.all([
      format.decode(buffer),
      format.decode(buffer),
    ]);

    expectLossless(decoded, image);
  });

  test("is lossless at quality 100", async () => {
    const decoded = await format.decode(
      await format.encode(image, { quality: 100 }),
    );

    expectLossless(decoded, image);
  });

  test("encodes lossy by default", async () => {
    const buffer = await format.encode(image);
    const decoded = await format.decode(buffer);
    const opaque = await format.decode(await format.encode(opaqueImage));

    // A bare codestream
    expect(buffer.readUInt16BE(0)).toBe(0xff0a);
    expect(difference(opaque, opaqueImage).max).toBeGreaterThan(1);
    expect(difference(opaque, opaqueImage).mean).toBeLessThan(3);

    // Alpha is lossy too, but keeps transparent and opaque pixels
    for (let i = 3; i < image.data.length; i += 4) {
      const alpha = image.data[i]!;

      if (alpha === 0 || alpha === 255) {
        expect(decoded.data[i]).toBe(alpha);
      } else {
        expect(Math.abs(decoded.data[i]! - alpha)).toBeLessThanOrEqual(2);
      }
    }
  });

  test("lower quality makes smaller files", async () => {
    const high = await format.encode(opaqueImage, { quality: 95 });
    const low = await format.encode(opaqueImage, { quality: 30 });

    expect(low.length).toBeLessThan(high.length);
  });

  test.each([
    { effort: 1 },
    { effort: 9 },
    { progressive: true },
    { lossyModular: true },
    { epf: 0 },
    { epf: 3 },
    { decodingSpeedTier: 4 },
    { photonNoiseIso: 3200 },
  ])("encodes with %o", async (options) => {
    const decoded = await format.decode(
      await format.encode(opaqueImage, options),
    );

    expect(difference(decoded, opaqueImage).mean).toBeLessThan(
      options.photonNoiseIso ? 8 : 5,
    );
  });

  test("clamps out-of-range options", async () => {
    // Each is outside of the range the codec accepts
    const buffer = await format.encode(opaqueImage, {
      quality: 150,
      effort: 20,
      epf: 9,
      decodingSpeedTier: 10,
      photonNoiseIso: -1,
    });

    // Quality 150 is clamped to 100, so lossless
    expectLossless(await format.decode(buffer), opaqueImage);
    await expect(
      format.encode(opaqueImage, { quality: -10, effort: 0, epf: -5 }),
    ).resolves.toBeInstanceOf(Buffer);
  });

  test("encodes a 1x1 image", async () => {
    const pixel = { width: 1, height: 1, data: Buffer.from([1, 2, 3, 4]) };
    const decoded = await format.decode(
      await format.encode(pixel, { lossless: true }),
    );

    expect(decoded).toEqual(pixel);
  });

  test("rejects data that isn't JPEG XL", async () => {
    await expect(format.decode(Buffer.from("not a jxl"))).rejects.toThrow(
      "Failed to decode the JPEG XL image: it's invalid, or uses a feature the codec doesn't support",
    );
  });

  test("rejects a cut off file", async () => {
    const buffer = await format.encode(image, { lossless: true });

    await expect(
      format.decode(buffer.subarray(0, buffer.length / 2)),
    ).rejects.toThrow("Failed to decode the JPEG XL image");
    // The codec still works afterwards
    expectLossless(await format.decode(buffer), image);
  });

  test("rejects images over maxResolutionInMP", async () => {
    const buffer = await format.encode(image);

    await expect(
      format.decode(buffer, { maxResolutionInMP: 0.0005 }),
    ).rejects.toThrow(
      "JPEG XL dimensions 32x24 exceed the maximum resolution of 0.0005 megapixels",
    );
    await expect(
      format.decode(buffer, { maxResolutionInMP: 0.001 }),
    ).resolves.toMatchObject({ width: 32 });
  });

  describe("Jimp", () => {
    const Jimp = createJimp({ formats: [jxl] });

    test("reads and writes JPEG XL", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(
        await jimp.getBuffer("image/jxl", { lossless: true }),
      );

      expect(decoded.mime).toBe("image/jxl");
      expectLossless(decoded.bitmap, image);
    });

    test("encodes with empty options", async () => {
      const jimp = Jimp.fromBitmap(image);
      const decoded = await Jimp.read(await jimp.getBuffer("image/jxl", {}));
      expect(decoded.width).toBe(image.width);
    });

    test("passes decode options to the format", async () => {
      const buffer = await Jimp.fromBitmap(image).getBuffer("image/jxl");

      await expect(
        Jimp.read(buffer, { "image/jxl": { maxResolutionInMP: 0.0005 } }),
      ).rejects.toThrow("exceed the maximum resolution");
    });
  });

  test.runIf(typeof window !== "undefined")(
    "decodes a cjxl file in the browser",
    async () => {
      const response = await fetch(
        new URL("./images/rgba.jxl", import.meta.url),
      );
      const decoded = await format.decode(
        Buffer.from(await response.arrayBuffer()),
      );

      expect(decoded.width).toBe(23);
      expect(decoded.height).toBe(17);
      // The first pixels of rgba.png
      expect([...decoded.data.subarray(0, 8)]).toEqual([
        0, 0, 0, 0, 11, 0, 0, 6,
      ]);
    },
  );
});
