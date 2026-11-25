import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";

import * as blur from "./index.js";

const Jimp = createJimp({ formats: [png, jpeg], plugins: [blur.methods] });

describe("hasAlpha", () => {
  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.blur(16).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("gaussian image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.gaussian(6).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});

describe("sharpen", () => {
  test("photo", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const output = await image
      .sharpen({ amount: 1.5, radius: 2 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image
      .sharpen({ amount: 2, radius: 3 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});

/** A small, repeatable pseudo-random number generator */
function random(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * Add grain of about `amount` levels to each color channel, like sensor
 * noise. Fully transparent pixels are left alone.
 */
function addGrain(image: InstanceType<typeof Jimp>, amount: number) {
  const next = random(1);
  const { data } = image.bitmap;

  for (let idx = 0; idx < data.length; idx++) {
    if ((idx & 3) !== 3 && data[idx | 3] !== 0) {
      const offset = (next() + next() + next() - 1.5) * 2 * amount;
      data[idx] = Math.min(255, Math.max(0, Math.round(data[idx]! + offset)));
    }
  }

  return image;
}

/** Turn `share` of the pixels black or white */
function addSaltAndPepper(image: InstanceType<typeof Jimp>, share: number) {
  const next = random(2);

  image.scan((_, __, idx) => {
    if (next() < share) {
      const value = next() < 0.5 ? 0 : 255;
      image.bitmap.data.set([value, value, value], idx);
    }
  });

  return image;
}

describe("median", () => {
  test("photo with salt-and-pepper noise", async () => {
    const image = addSaltAndPepper(
      await Jimp.read(getTestImagePath("cops.jpg")),
      0.1,
    );
    const output = await image.median(1).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.median(4).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("the cost grows with the radius, not its square", () => {
    const image = addGrain(new Jimp({ width: 400, height: 300 }), 60);
    const time = (radius: number) => {
      let fastest = Infinity;

      for (let run = 0; run < 3; run++) {
        const copy = image.clone();
        const start = performance.now();

        copy.median(radius);
        fastest = Math.min(fastest, performance.now() - start);
      }

      return fastest;
    };

    time(2);

    // 10 times the radius reads about 8 times as many pixels per step. Sorting
    // each window would read about 80 times as many. Comparing times instead
    // of a fixed limit holds on slower CI machines.
    expect(time(20)).toBeLessThan(time(2) * 25);
  }, 60_000);
});

describe("bilateral", () => {
  test("photo with grain", async () => {
    const image = addGrain(await Jimp.read(getTestImagePath("cops.jpg")), 12);
    const output = await image.bilateral().getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("image with alpha", async () => {
    const image = addGrain(await Jimp.read(getTestImagePath("dice.png")), 12);
    const output = await image
      .bilateral({ radius: 3, tolerance: 40 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("an Open Graph sized image is quick with the defaults", () => {
    const image = addGrain(new Jimp({ width: 1200, height: 630 }), 12);
    let fastest = Infinity;

    for (let run = 0; run < 3; run++) {
      const copy = image.clone();
      const start = performance.now();

      copy.bilateral();
      fastest = Math.min(fastest, performance.now() - start);
    }

    // About 100ms on a laptop. The limit leaves room for slow CI machines.
    expect(fastest).toBeLessThan(2000);
  }, 60_000);
});
