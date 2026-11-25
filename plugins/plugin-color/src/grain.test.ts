import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import { methods as color } from "./index.js";

const Jimp = createJimp({ plugins: [color] });

function grey(width = 64, height = 64, color = 0x808080ff) {
  return new Jimp({ width, height, color });
}

/** How much each pixel's red changed from 128 */
function changes(image: InstanceType<typeof Jimp>) {
  const { data } = image.bitmap;
  const result: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    result.push(data[i]! - 128);
  }

  return result;
}

function std(values: number[]) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
  );
}

/** The correlation between each pixel's change and its right neighbour's */
function neighbourCorrelation(values: number[], width: number) {
  const a: number[] = [];
  const b: number[] = [];

  values.forEach((v, i) => {
    if ((i + 1) % width !== 0) {
      a.push(v);
      b.push(values[i + 1]!);
    }
  });

  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(a);
  const mb = mean(b);
  let cov = 0;

  a.forEach((v, i) => {
    cov += (v - ma) * (b[i]! - mb);
  });

  return cov / a.length / (std(a) * std(b));
}

describe("grain", () => {
  test("is the same every time, and different for each seed", () => {
    const a = grey().grain();
    const b = grey().grain();
    const c = grey().grain({ seed: 1 });

    expect(a.bitmap.data).toStrictEqual(b.bitmap.data);
    expect(a.bitmap.data).not.toStrictEqual(c.bitmap.data);
    expect(grey().grain({ seed: 1 }).bitmap.data).toStrictEqual(c.bitmap.data);
  });

  test("depends on each pixel's position, not the image's size", () => {
    const small = grey(20, 20).grain({ size: 3 });
    const large = grey(40, 40).grain({ size: 3 });

    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        expect(small.getPixelColor(x, y)).toBe(large.getPixelColor(x, y));
      }
    }
  });

  test("amount 0 changes nothing", () => {
    expect(grey().grain({ amount: 0 }).bitmap.data).toStrictEqual(
      grey().bitmap.data,
    );
  });

  test.each([1, 2, 4, 8])(
    "size %d has about the same strength as size 1",
    (size) => {
      const amount = 0.1;
      const image = grey(256, 256).grain({ amount, size });
      const expected = (amount * 255) / Math.sqrt(6);
      const values = changes(image);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;

      expect(Math.abs(mean)).toBeLessThan(size);
      expect(std(values)).toBeGreaterThan(expected * 0.8);
      expect(std(values)).toBeLessThan(expected * 1.2);
      // Each change is at most amount × 255
      expect(Math.max(...values.map(Math.abs))).toBeLessThanOrEqual(26);
    },
  );

  test("size makes grains bigger than a pixel", () => {
    const fine = changes(grey(128, 128).grain({ size: 1 }));
    const coarse = changes(grey(128, 128).grain({ size: 4 }));

    expect(Math.abs(neighbourCorrelation(fine, 128))).toBeLessThan(0.05);
    expect(neighbourCorrelation(coarse, 128)).toBeGreaterThan(0.7);
  });

  test("monochrome grain changes red, green and blue together", () => {
    const image = grey(16, 16, 0x406080ff).grain();
    const { data } = image.bitmap;
    let changed = 0;

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i]! - 0x40;

      expect(data[i + 1]! - 0x60).toBe(dr);
      expect(data[i + 2]! - 0x80).toBe(dr);

      if (dr !== 0) {
        changed++;
      }
    }

    expect(changed).toBeGreaterThan(200);
  });

  test("color grain changes each channel separately", () => {
    const image = grey(16, 16).grain({ monochrome: false });
    const { data } = image.bitmap;
    let different = 0;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) {
        different++;
      }
    }

    expect(different).toBeGreaterThan(200);
  });

  test("keeps alpha, and leaves transparent pixels alone", () => {
    const image = grey(16, 16, 0x80808080);

    image.setPixelColor(0x12345600, 0, 0);
    image.grain({ amount: 0.5 });

    expect(image.getPixelColor(0, 0)).toBe(0x12345600);

    for (let i = 7; i < image.bitmap.data.length; i += 4) {
      expect(image.bitmap.data[i]).toBe(0x80);
    }
  });

  test("clamps to 0-255", () => {
    const black = grey(16, 16, 0x000000ff).grain({ amount: 1 });
    const white = grey(16, 16, 0xffffffff).grain({ amount: 1 });

    expect(Math.min(...black.bitmap.data)).toBe(0);
    expect(Math.max(...white.bitmap.data)).toBe(255);
    expect(new Set(black.bitmap.data).size).toBeGreaterThan(10);
  });

  test("validates its options", () => {
    expect(() => grey().grain({ amount: 2 })).toThrow();
    expect(() => grey().grain({ amount: -0.1 })).toThrow();
    expect(() => grey().grain({ size: 0.5 })).toThrow();
    expect(() => grey().grain({ size: 17 })).toThrow();
    expect(() => grey().grain({ seed: 1.5 })).toThrow();
  });

  test("works with apply", () => {
    expect(
      grey().apply([["grain", { amount: 0.05, seed: 3 }]]).bitmap.data,
    ).toStrictEqual(grey().grain({ amount: 0.05, seed: 3 }).bitmap.data);
  });
});
