import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import * as blur from "./index.js";

const Jimp = createJimp({ plugins: [blur.methods] });

type Image = InstanceType<typeof Jimp>;

function pixelAt(image: Image, x: number, y: number) {
  const idx = (y * image.bitmap.width + x) << 2;
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

// A grey image that steps from `left` to `right` between x = 19 and x = 20
function makeStep(left: number, right: number) {
  const image = new Jimp({ width: 40, height: 5, color: 0x000000ff });

  image.scan((x, _, idx) => {
    const value = x < 20 ? left : right;
    image.bitmap.data.set([value, value, value], idx);
  });

  return image;
}

// The share of a normalized Gaussian kernel with sigma `r` that lies past
// the center, which is how far the blur moves the pixel next to a step
function weightPastCenter(r: number) {
  const rs = Math.ceil(r * 2.57);
  let total = 0;
  let past = 0;

  for (let i = -rs; i <= rs; i++) {
    const weight = Math.exp(-(i * i) / (2 * r * r));

    total += weight;

    if (i > 0) {
      past += weight;
    }
  }

  return past / total;
}

describe("sharpen", () => {
  test("leaves a uniform image unchanged", () => {
    const image = new Jimp({ width: 30, height: 20, color: 0x3c8ae180 });

    image.sharpen({ amount: 3, radius: 2 });

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        expect(pixelAt(image, x, y)).toEqual([0x3c, 0x8a, 0xe1, 0x80]);
      }
    }
  });

  test("does nothing with an amount of 0", () => {
    const image = makeStep(100, 150);
    const original = [...image.bitmap.data];

    expect([...image.sharpen({ amount: 0 }).bitmap.data]).toEqual(original);
  });

  test.each([
    [1, 1],
    [0.5, 1],
    [2, 2],
  ])(
    "increases the contrast of a step edge (amount %d, radius %d)",
    (amount, radius) => {
      const image = makeStep(100, 150).sharpen({ amount, radius });
      // The blur pulls the pixels at the step toward each other by this much,
      // and sharpening pushes them apart by `amount` times as much
      const shift = 50 * weightPastCenter(radius) * amount;

      expect(pixelAt(image, 19, 2)).toEqual([
        ...Array(3).fill(Math.round(100 - shift)),
        255,
      ]);
      expect(pixelAt(image, 20, 2)).toEqual([
        ...Array(3).fill(Math.round(150 + shift)),
        255,
      ]);

      // Far from the step nothing changes
      expect(pixelAt(image, 0, 2)).toEqual([100, 100, 100, 255]);
      expect(pixelAt(image, 39, 2)).toEqual([150, 150, 150, 255]);
    },
  );

  test("clamps overshoot to 0-255", () => {
    const image = makeStep(10, 245).sharpen({ amount: 3 });

    expect(pixelAt(image, 19, 2)).toEqual([0, 0, 0, 255]);
    expect(pixelAt(image, 20, 2)).toEqual([255, 255, 255, 255]);
  });

  test("the threshold leaves small differences alone", () => {
    // A flat image with one pixel that's slightly brighter, like noise
    const image = new Jimp({ width: 9, height: 9, color: 0x646464ff });

    image.bitmap.data.set([103, 103, 103], (4 * 9 + 4) << 2);

    const original = [...image.bitmap.data];

    expect([
      ...image.clone().sharpen({ amount: 2, threshold: 4 }).bitmap.data,
    ]).toEqual(original);
    expect([...image.clone().sharpen({ amount: 2 }).bitmap.data]).not.toEqual(
      original,
    );
  });

  test("the threshold still sharpens large differences", () => {
    const sharpened = makeStep(100, 150).sharpen({ amount: 1 });
    const thresholded = makeStep(100, 150).sharpen({
      amount: 1,
      threshold: 4,
    });

    // Right at the step the blur moves pixels by 15, so they're sharpened
    expect(pixelAt(thresholded, 19, 2)).toEqual(pixelAt(sharpened, 19, 2));
    expect(pixelAt(thresholded, 20, 2)).toEqual(pixelAt(sharpened, 20, 2));

    // One pixel further out it only moves them by 3, which is skipped
    expect(pixelAt(sharpened, 18, 2)).toEqual([97, 97, 97, 255]);
    expect(pixelAt(thresholded, 18, 2)).toEqual([100, 100, 100, 255]);
    expect(pixelAt(sharpened, 21, 2)).toEqual([153, 153, 153, 255]);
    expect(pixelAt(thresholded, 21, 2)).toEqual([150, 150, 150, 255]);
  });

  describe("with transparency", () => {
    // An opaque 0xffcc00ff square on a transparent black canvas
    function makeSquare() {
      const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

      image.scan(15, 15, 10, 10, (_, __, idx) => {
        image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
      });

      return image;
    }

    test.each([
      ["a hard edge", () => makeSquare()],
      ["a soft edge", () => makeSquare().gaussian(3)],
    ])("doesn't darken %s or change alpha", (_, make) => {
      const image = make();
      const alpha = image.bitmap.data.filter((_, i) => i % 4 === 3);
      const { data } = image.sharpen({ amount: 3 }).bitmap;

      expect(data.filter((_, i) => i % 4 === 3)).toEqual(alpha);

      for (let idx = 0; idx < data.length; idx += 4) {
        if (data[idx + 3]! > 0) {
          expect([...data.subarray(idx, idx + 3)]).toEqual([0xff, 0xcc, 0x00]);
        }
      }
    });

    test("sharpens colors inside a translucent image", () => {
      const image = makeStep(100, 150);

      image.scan((_, __, idx) => {
        image.bitmap.data[idx + 3] = 0x80;
      });

      const opaque = makeStep(100, 150).sharpen({ amount: 1 });

      image.sharpen({ amount: 1 });

      for (let x = 0; x < 40; x++) {
        expect(pixelAt(image, x, 2).slice(0, 3)).toEqual(
          pixelAt(opaque, x, 2).slice(0, 3),
        );
        expect(pixelAt(image, x, 2)[3]).toBe(0x80);
      }
    });
  });

  test("validates the options", () => {
    const image = makeStep(100, 150);

    expect(() => image.sharpen({ amount: -1 })).toThrow();
    expect(() => image.sharpen({ amount: 1, radius: 0 })).toThrow();
    expect(() => image.sharpen({ amount: 1, threshold: 256 })).toThrow();
    // @ts-expect-error amount is required
    expect(() => image.sharpen({})).toThrow();
  });
});
