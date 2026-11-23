import { expect, test, describe } from "vitest";
import "@jimp/test-utils";

import jpeg from "@jimp/js-jpeg";
import { methods as color } from "@jimp/plugin-color";
import { methods as hash } from "@jimp/plugin-hash";
import { createJimp } from "@jimp/core";

import { methods as threshold, otsuThreshold } from "./index.js";
import { getTestImagePath } from "@jimp/test-utils";

const jimp = createJimp({
  formats: [jpeg],
  plugins: [threshold, hash, color],
});

/** An image with one pixel per grey value, each with the given alpha */
function greyImage(values: number[], alpha: number | number[] = 255) {
  const data = Buffer.alloc(values.length * 4);

  values.forEach((value, i) => {
    data[i * 4] = value;
    data[i * 4 + 1] = value;
    data[i * 4 + 2] = value;
    data[i * 4 + 3] = typeof alpha === "number" ? alpha : alpha[i]!;
  });

  return jimp.fromBitmap({ data, width: values.length, height: 1 });
}

/**
 * Otsu's method written the textbook way: try every split and keep the one
 * with the smallest weighted within-class variance (lowest split on ties).
 * Returns the highest value of the dark class.
 */
function referenceOtsu(values: number[]) {
  const variance = (xs: number[]) => {
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    return xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  };
  let best = Infinity;
  let bestT = -1;

  for (let t = 0; t < 255; t++) {
    const dark = values.filter((v) => v <= t);
    const light = values.filter((v) => v > t);

    if (dark.length === 0 || light.length === 0) {
      continue;
    }

    const within =
      dark.length * variance(dark) + light.length * variance(light);

    if (within < best) {
      best = within;
      bestT = t;
    }
  }

  return bestT;
}

describe("Threshold", () => {
  test("defines default threshold for lighter backgrounds", async () => {
    const testImage = await jimp.read(getTestImagePath("hands.jpg"));
    const expectedImage = await jimp.read(
      getTestImagePath("hands_mx200_rp255.jpg"),
    );
    const output = testImage.threshold({ max: 200, replace: 255 }).hash();

    expect(output).toStrictEqual(expectedImage.hash());
  });

  test("thresholds each channel when autoGreyscale is false", () => {
    // A red, a green and a dark blue pixel
    const data = Buffer.from([
      200, 10, 10, 255, 10, 200, 10, 255, 10, 10, 90, 128,
    ]);
    const image = jimp
      .fromBitmap({ data, width: 3, height: 1 })
      .threshold({ max: 100, replace: 0, autoGreyscale: false });

    // Channels from 100 up are replaced, the rest and alpha are kept
    expect([...image.bitmap.data]).toEqual([
      0, 10, 10, 255, 10, 0, 10, 255, 10, 10, 90, 128,
    ]);
  });

  test("autoGreyscale false on a greyscaled image matches true", async () => {
    const image = await jimp.read(getTestImagePath("hands.jpg"));

    const auto = image.clone().threshold({ max: 120 });
    const manual = image
      .clone()
      .greyscale()
      .threshold({ max: 120, autoGreyscale: false });

    expect(Buffer.compare(auto.bitmap.data, manual.bitmap.data)).toBe(0);
  });
});

describe("Otsu", () => {
  // Half the pixels spread around 50, half around 200, unevenly so the
  // classes aren't mirror images of each other
  const dark = [38, 42, 45, 47, 48, 49, 50, 50, 51, 52, 53, 55, 58, 62];
  const light = [
    180, 188, 194, 197, 199, 200, 200, 201, 202, 204, 207, 212, 225, 231,
  ];
  const bimodal = [...dark, ...light];

  test("splits a bimodal image between its modes", () => {
    const level = otsuThreshold(greyImage(bimodal));

    expect(level).toBe(referenceOtsu(bimodal) + 1);
    expect(level).toBeGreaterThan(Math.max(...dark));
    expect(level).toBeLessThanOrEqual(Math.min(...light));
  });

  test("matches scikit-image's threshold_otsu", () => {
    // skimage.filters.threshold_otsu(np.array(values, dtype=np.uint8))
    // returns 100 (scikit-image 0.26.0). It reports the highest dark value,
    // so the `max` for threshold() is one more.
    const values = [
      10, 10, 20, 35, 48, 60, 62, 70, 100, 180, 182, 185, 190, 201, 230, 251,
    ];

    expect(otsuThreshold(greyImage(values))).toBe(101);
    expect(referenceOtsu(values)).toBe(100);
  });

  test("uses greyscale luminance unless autoGreyscale is false", () => {
    // Pure red is 255 in the red channel but only ~54 as Rec. 709 luminance
    const data = Buffer.from([
      255, 0, 0, 255, 255, 0, 0, 255, 250, 250, 250, 255, 250, 250, 250, 255,
    ]);
    const image = jimp.fromBitmap({ data, width: 4, height: 1 });

    expect(otsuThreshold(image)).toBe(55);
    expect(otsuThreshold(image, { autoGreyscale: false })).toBe(251);
  });

  test("rounds luminance like greyscale(), so grey pixels keep their value", () => {
    // Truncating would turn 5 into 4 (the weights sum to a little under 1)
    expect(otsuThreshold(greyImage([5, 200]))).toBe(6);
    expect(otsuThreshold(greyImage([5, 200]), { autoGreyscale: false })).toBe(
      6,
    );
  });

  test("returns 255 for a uniform image", () => {
    expect(otsuThreshold(greyImage([0, 0, 0, 0]))).toBe(255);
    expect(otsuThreshold(greyImage([128, 128, 128, 128]))).toBe(255);
    expect(otsuThreshold(greyImage([255, 255, 255, 255]))).toBe(255);
    expect(otsuThreshold(greyImage([10, 200], 0))).toBe(255);
    expect(
      otsuThreshold(
        jimp.fromBitmap({ data: Buffer.alloc(0), width: 0, height: 0 }),
      ),
    ).toBe(255);
  });

  test("leaves a uniform image unchanged", () => {
    const image = greyImage([90, 90, 90]).threshold({
      max: "otsu",
      replace: 0,
    });

    expect([...image.bitmap.data]).toEqual([
      90, 90, 90, 255, 90, 90, 90, 255, 90, 90, 90, 255,
    ]);
  });

  test("ignores fully transparent pixels", () => {
    const expected = otsuThreshold(greyImage(bimodal));
    // Lots of transparent pixels that would drag the split if counted
    const hidden = new Array(100).fill(120);
    const alpha = [...bimodal.map(() => 255), ...hidden.map(() => 0)];

    expect(otsuThreshold(greyImage([...bimodal, ...hidden], alpha))).toBe(
      expected,
    );
    expect(otsuThreshold(greyImage([...bimodal, ...hidden]))).not.toBe(
      expected,
    );
  });

  test("weights partially transparent pixels by their alpha", () => {
    // At alpha 51 (a fifth of 255) each 120 pixel counts a fifth as much as
    // an opaque one, the same as every opaque pixel appearing five times
    const values = [0, 120, 120, 120, 120, 200, 200, 200, 200];
    const alpha = [255, 51, 51, 51, 51, 255, 255, 255, 255];
    const expanded = values.flatMap((v, i) =>
      new Array(alpha[i] === 255 ? 5 : 1).fill(v),
    );

    expect(otsuThreshold(greyImage(values, alpha))).toBe(
      referenceOtsu(expanded) + 1,
    );
    expect(otsuThreshold(greyImage(values, alpha))).toBe(1);
    expect(otsuThreshold(greyImage(values))).toBe(121);
  });

  test("threshold with max 'otsu' uses the computed level", async () => {
    const auto = (await jimp.read(getTestImagePath("hands.jpg"))).threshold({
      max: "otsu",
    });
    const image = await jimp.read(getTestImagePath("hands.jpg"));
    const manual = image.threshold({ max: otsuThreshold(image) });

    expect(Buffer.compare(auto.bitmap.data, manual.bitmap.data)).toBe(0);
  });

  test("rejects unknown strings for max", () => {
    expect(() =>
      // @ts-expect-error testing invalid input
      greyImage([1, 2]).threshold({ max: "auto" }),
    ).toThrow();
  });
});
