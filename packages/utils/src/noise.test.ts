import { describe, expect, test } from "vitest";

import { pixelNoise } from "./index.js";

describe("pixelNoise", () => {
  test("is the same for the same inputs", () => {
    expect(pixelNoise(10, 20)).toBe(pixelNoise(10, 20));
    expect(pixelNoise(10, 20, 3)).toBe(pixelNoise(10, 20, 3));
    expect(pixelNoise(10, 20)).not.toBe(pixelNoise(10, 20, 1));
    expect(pixelNoise(10, 20)).not.toBe(pixelNoise(20, 10));
  });

  test("is spread evenly from 0 to 1, with no pattern between neighbours", () => {
    const buckets = new Array(10).fill(0);
    let sum = 0;
    let product = 0;
    const n = 200 * 200;

    for (let y = -100; y < 100; y++) {
      for (let x = -100; x < 100; x++) {
        const value = pixelNoise(x, y, 7);

        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);

        buckets[Math.floor(value * 10)]++;
        sum += value;
        product += (value - 0.5) * (pixelNoise(x + 1, y, 7) - 0.5);
      }
    }

    expect(sum / n).toBeCloseTo(0.5, 2);

    for (const count of buckets) {
      expect(count / n).toBeGreaterThan(0.095);
      expect(count / n).toBeLessThan(0.105);
    }

    // The covariance of uncorrelated uniform numbers is 0; the variance is 1/12
    expect(Math.abs(product / n)).toBeLessThan(0.002);
  });
});
