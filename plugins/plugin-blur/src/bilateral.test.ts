import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import * as blur from "./index.js";

const Jimp = createJimp({ plugins: [blur.methods] });

type Image = InstanceType<typeof Jimp>;

function pixelAt(image: Image, x: number, y: number) {
  const idx = (y * image.bitmap.width + x) << 2;
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

/** A small, repeatable pseudo-random number generator */
function random(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/** Add noise of about `amount` levels to each color channel */
function addNoise(image: Image, amount: number, seed = 1) {
  const next = random(seed);
  const { data } = image.bitmap;

  for (let idx = 0; idx < data.length; idx++) {
    if ((idx & 3) !== 3) {
      const offset = (next() + next() + next() - 1.5) * 2 * amount;
      data[idx] = Math.min(255, Math.max(0, Math.round(data[idx]! + offset)));
    }
  }

  return image;
}

/** The standard deviation of the red channel in a region */
function deviation(image: Image, x: number, y: number, w: number, h: number) {
  const values: number[] = [];

  image.scan(x, y, w, h, (_, __, idx) => {
    values.push(image.bitmap.data[idx]!);
  });

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length,
  );
}

/** The bilateral filter written out directly, without lookup tables */
function referenceBilateral(image: Image, radius: number, tolerance: number) {
  const { width, height, data } = image.bitmap;
  const out = new Uint8Array(data);
  const reach = Math.ceil(radius * 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2;

      if (data[idx + 3] === 0) {
        continue;
      }

      const sums = [0, 0, 0];
      let total = 0;

      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          if (dx * dx + dy * dy > reach * reach) {
            continue;
          }

          const x1 = Math.min(width - 1, Math.max(0, x + dx));
          const y1 = Math.min(height - 1, Math.max(0, y + dy));
          const n = (y1 * width + x1) << 2;
          const distance2 =
            (data[n]! - data[idx]!) ** 2 +
            (data[n + 1]! - data[idx + 1]!) ** 2 +
            (data[n + 2]! - data[idx + 2]!) ** 2;
          const weight =
            Math.exp(-(dx * dx + dy * dy) / (2 * radius * radius)) *
            Math.exp(-distance2 / (2 * tolerance * tolerance)) *
            data[n + 3]!;

          for (let c = 0; c < 3; c++) {
            sums[c]! += data[n + c]! * weight;
          }

          total += weight;
        }
      }

      for (let c = 0; c < 3; c++) {
        out[idx + c] = Math.round(sums[c]! / total);
      }
    }
  }

  return out;
}

describe("bilateral", () => {
  test.each([
    [1, 20],
    [1.5, 30],
    [2, 60],
  ])(
    "matches the filter written out directly (radius %d, tolerance %d)",
    (radius, tolerance) => {
      const image = addNoise(
        new Jimp({ width: 25, height: 18, color: 0x6080a0ff }),
        40,
      );

      // Make some pixels transparent and some partly transparent
      image.scan((x, y, idx) => {
        if ((x + y) % 7 === 0) {
          image.bitmap.data[idx + 3] = 0;
        } else if ((x * y) % 5 === 0) {
          image.bitmap.data[idx + 3] = 90;
        }
      });

      const expected = referenceBilateral(image, radius, tolerance);
      const actual = image.bilateral({ radius, tolerance }).bitmap.data;

      // Float32 sums can round differently by a level
      for (let idx = 0; idx < expected.length; idx++) {
        expect(Math.abs(actual[idx]! - expected[idx]!)).toBeLessThanOrEqual(1);
      }
    },
  );

  test("leaves a uniform image unchanged", () => {
    const image = new Jimp({ width: 30, height: 20, color: 0x3c8ae180 });

    image.bilateral({ radius: 3 });

    image.scan((x, y) => {
      expect(pixelAt(image, x, y)).toEqual([0x3c, 0x8a, 0xe1, 0x80]);
    });
  });

  test("smooths noise in flat areas but keeps edges", () => {
    // Dark and light halves with noise, which the defaults should remove
    const image = new Jimp({ width: 60, height: 30, color: 0x404040ff });

    image.scan(30, 0, 30, 30, (_, __, idx) => {
      image.bitmap.data.set([0xc0, 0xc0, 0xc0], idx);
    });
    addNoise(image, 10);

    const noisyDeviation = deviation(image, 5, 5, 20, 20);

    image.bilateral();

    expect(deviation(image, 5, 5, 20, 20)).toBeLessThan(noisyDeviation / 2);

    // The step from 0x40 to 0xc0 stays sharp
    for (let y = 0; y < 30; y++) {
      expect(pixelAt(image, 29, y)[0]).toBeLessThan(0x40 + 20);
      expect(pixelAt(image, 30, y)[0]).toBeGreaterThan(0xc0 - 20);
    }
  });

  test("a higher tolerance smooths more", () => {
    const flat = () =>
      addNoise(new Jimp({ width: 30, height: 30, color: 0x808080ff }), 20);

    const low = deviation(flat().bilateral({ tolerance: 10 }), 5, 5, 20, 20);
    const high = deviation(flat().bilateral({ tolerance: 80 }), 5, 5, 20, 20);

    expect(high).toBeLessThan(low);
  });

  test("keeps the color of a shape's edge and leaves alpha alone", () => {
    // An opaque 0xffcc00ff square on a transparent black canvas
    const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

    image.scan(15, 15, 10, 10, (_, __, idx) => {
      image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
    });

    const original = [...image.bitmap.data];

    // A tolerance high enough that black would count if alpha didn't
    expect([...image.bilateral({ tolerance: 255 }).bitmap.data]).toEqual(
      original,
    );
  });

  test("works on a 1x1 image", () => {
    const image = new Jimp({ width: 1, height: 1, color: 0x3c8ae1ff });

    expect(pixelAt(image.bilateral(), 0, 0)).toEqual([0x3c, 0x8a, 0xe1, 0xff]);
  });

  test.each([
    { radius: 0 },
    { radius: 6 },
    { tolerance: 0 },
    { tolerance: 256 },
    { radius: "2" },
  ])("throws for %o", (options) => {
    const image = new Jimp({ width: 4, height: 4 });

    expect(() => image.bilateral(options as never)).toThrow();
  });
});
