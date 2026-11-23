import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { diff } from "./index.js";

const Jimp = createJimp();

describe("Compare image difference", () => {
  const imgs = [
    Jimp.fromBitmap(makeTestImage("2222", "4444", "6666", "8888")),
    Jimp.fromBitmap(makeTestImage("2468", "2468", "2468", "2468")),
    Jimp.fromBitmap(makeTestImage("2212", "4434", "6656", "8878")),
    Jimp.fromBitmap(makeTestImage("2232", "4454", "6676", "8898")),
    Jimp.fromBitmap(makeTestImage("22322", "44544", "66766", "88988")),
  ] as const;

  test("images 0 and 1", () => {
    const result = diff(imgs[0], imgs[1]);

    expect(result.percent).toBe(0.75);
    expect(result.image).toMatchSnapshot();
  });

  test("images 0 and 2", () => {
    const result = diff(imgs[0], imgs[2]);

    expect(result.percent).toBe(0);
    expect(result.image).toMatchSnapshot();
  });

  test("images 0 and 3", () => {
    const result = diff(imgs[0], imgs[3]);

    expect(result.percent).toBe(0);
    expect(result.image).toMatchSnapshot();
  });

  test("allows to set a different threshold", () => {
    expect(diff(imgs[0], imgs[3], 0.1).percent).toBe(0);
    expect(diff(imgs[0], imgs[3], 0).percent).toBe(0.25);
  });

  test("throws an error if threshold is invalid", () => {
    expect(() => diff(imgs[0], imgs[3], -1)).toThrow(
      "threshold must be a number between 0 and 1",
    );
  });

  test("throws an error if threshold in options is invalid", () => {
    expect(() => diff(imgs[0], imgs[3], { threshold: 2 })).toThrow(
      "threshold must be a number between 0 and 1",
    );
  });

  test("accepts the threshold in options", () => {
    expect(diff(imgs[0], imgs[3], { threshold: 0 }).percent).toBe(0.25);
    expect(diff(imgs[0], imgs[1], { threshold: 0.1 })).toStrictEqual(
      diff(imgs[0], imgs[1], 0.1),
    );
  });

  test("draws only the differences on a transparent background with diffMask", () => {
    const result = diff(imgs[0], imgs[1], { diffMask: true });

    expect(result.percent).toBe(0.75);
    expect(result.image).toMatchSnapshot();
  });

  test("draws an empty mask for identical images", () => {
    const result = diff(imgs[0], imgs[0], { diffMask: true });

    expect(result.percent).toBe(0);
    expect([...result.image.bitmap.data].every((v) => v === 0)).toBe(true);
  });

  test("uses custom diff colors", () => {
    const fromCss = diff(imgs[0], imgs[1], { diffColor: "lime" });
    const fromHex = diff(imgs[0], imgs[1], { diffColor: 0x00ff00ff });
    const fromRGB = diff(imgs[0], imgs[1], {
      diffColor: { r: 0, g: 255, b: 0 },
    });

    expect(fromCss.image).toMatchSnapshot();
    expect(fromHex.image.bitmap.data).toStrictEqual(fromCss.image.bitmap.data);
    expect(fromRGB.image.bitmap.data).toStrictEqual(fromCss.image.bitmap.data);
  });

  test("uses diffColorAlt for pixels that are darker in the second image", () => {
    const darker = Jimp.fromBitmap(
      makeTestImage("2222", "4444", "6666", "8848"),
    );
    const result = diff(imgs[0], darker, {
      threshold: 0,
      diffColor: 0xff0000ff,
      diffColorAlt: 0x0000ffff,
    });

    expect(result.image.getPixelColor(2, 3)).toBe(0x0000ffff);
    expect(
      diff(imgs[0], darker, { threshold: 0 }).image.getPixelColor(2, 3),
    ).toBe(0xff0000ff);
  });

  test("draws unchanged pixels white with alpha 0", () => {
    const result = diff(imgs[0], imgs[2], { alpha: 0 });

    expect(result.percent).toBe(0);
    expect([...result.image.bitmap.data].every((v) => v === 0xff)).toBe(true);
  });

  test("clamps alpha to 0-1", () => {
    expect(diff(imgs[0], imgs[1], { alpha: 5 })).toStrictEqual(
      diff(imgs[0], imgs[1], { alpha: 1 }),
    );
    expect(diff(imgs[0], imgs[1], { alpha: -1 })).toStrictEqual(
      diff(imgs[0], imgs[1], { alpha: 0 }),
    );
  });

  test("counts anti-aliased pixels with includeAA", () => {
    // A white image with a black square and a grey anti-aliased edge pixel
    const original = new Jimp({ width: 5, height: 5, color: 0xffffffff });
    const changed = new Jimp({ width: 5, height: 5, color: 0xffffffff });

    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 5; y++) {
        original.setPixelColor(0x000000ff, x, y);
        changed.setPixelColor(0x000000ff, x, y);
      }
    }

    changed.setPixelColor(0x808080ff, 2, 2);

    const ignored = diff(original, changed, { aaColor: "blue" });
    const included = diff(original, changed, { includeAA: true });

    expect(ignored.percent).toBe(0);
    expect(ignored.image.getPixelColor(2, 2)).toBe(0x0000ffff);
    expect(included.percent).toBe(1 / 25);
    expect(included.image.getPixelColor(2, 2)).toBe(0xff0000ff);
  });

  test("throws for invalid colors", () => {
    expect(() => diff(imgs[0], imgs[1], { diffColor: "notacolor" })).toThrow(
      'Invalid color "notacolor"',
    );
  });

  test("should resize image before diffing", () => {
    expect(diff(imgs[3], imgs[4]).percent).toStrictEqual(
      diff(imgs[4], imgs[3]).percent,
    );
  });
});
