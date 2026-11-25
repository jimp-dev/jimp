import { describe, expect, test } from "vitest";
import { getTestImagePath } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";
import bmp from "@jimp/js-bmp";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import { methods as resizeMethods } from "@jimp/plugin-resize";
import { DISPLAY_P3_PROFILE } from "@jimp/utils";
import * as reference from "blurhash";

import { decodeBlurhash, methods } from "./index.js";
import { encodeBlurhash } from "./blurhash.js";

const Jimp = createJimp({
  formats: [bmp, jpeg, png],
  plugins: [methods, resizeMethods],
});

/** Deterministic pseudo-random bytes */
function randomPixels(width: number, height: number, seed: number) {
  const data = new Uint8ClampedArray(width * height * 4);
  let state = seed;

  for (let i = 0; i < data.length; i++) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    data[i] = i % 4 === 3 ? 255 : state >> 23;
  }

  return data;
}

/** A smooth image, closer to a photo than noise */
function gradientPixels(width: number, height: number) {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = 4 * (x + y * width);

      data[i] = Math.round((255 * x) / width);
      data[i + 1] = Math.round(128 + 127 * Math.sin(x / 5 + y / 7));
      data[i + 2] = Math.round((255 * y) / height);
      data[i + 3] = 255;
    }
  }

  return data;
}

function maxDifference(a: ArrayLike<number>, b: ArrayLike<number>) {
  expect(a.length).toBe(b.length);

  let max = 0;

  for (let i = 0; i < a.length; i++) {
    max = Math.max(max, Math.abs(a[i]! - b[i]!));
  }

  return max;
}

describe("encodeBlurhash matches the reference blurhash package", () => {
  test("for every number of components", () => {
    const data = gradientPixels(31, 23);

    for (let x = 1; x <= 9; x++) {
      for (let y = 1; y <= 9; y++) {
        expect(encodeBlurhash(data, 31, 23, x, y)).toBe(
          reference.encode(data, 31, 23, x, y),
        );
      }
    }
  });

  test("for noise", () => {
    for (const [width, height, seed] of [
      [1, 1, 1],
      [7, 3, 2],
      [64, 64, 3],
      [50, 17, 4],
    ] as const) {
      const data = randomPixels(width, height, seed);

      for (const [x, y] of [
        [1, 1],
        [4, 3],
        [9, 9],
        [2, 7],
      ] as const) {
        expect(encodeBlurhash(data, width, height, x, y)).toBe(
          reference.encode(data, width, height, x, y),
        );
      }
    }
  });

  test("for photos at full size", async () => {
    for (const name of ["dice.png", "cops.jpg", "windows95.bmp"] as const) {
      const image = await Jimp.read(getTestImagePath(name));
      const { data, width, height } = image.bitmap;
      const pixels = new Uint8ClampedArray(data);

      expect(encodeBlurhash(pixels, width, height, 4, 3)).toBe(
        reference.encode(pixels, width, height, 4, 3),
      );
    }
  });
});

describe("blurhash", () => {
  test("is the reference hash of an image up to 64 pixels", async () => {
    const image = await Jimp.read(getTestImagePath("icon-24.png"));
    image.background = 0xffffffff;

    // icon-24 has transparent pixels, so flatten it the same way first
    const flat = new Jimp({ width: 24, height: 24, color: 0xffffffff });
    flat.composite(image, 0, 0);

    expect(image.blurhash()).toBe(
      reference.encode(new Uint8ClampedArray(flat.bitmap.data), 24, 24, 4, 3),
    );
  });

  test("is the reference hash of the image scaled to 64 pixels", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const small = image.clone().resize({ w: 64 });
    const { data, width, height } = small.bitmap;

    expect(height).toBeLessThan(64);
    expect(image.blurhash()).toBe(
      reference.encode(new Uint8ClampedArray(data), width, height, 4, 3),
    );
    expect(image.blurhash({ componentsX: 9, componentsY: 2 })).toBe(
      reference.encode(new Uint8ClampedArray(data), width, height, 9, 2),
    );
  });

  test("scales tall images by their height", () => {
    const data = Buffer.from(gradientPixels(40, 200));
    const image = new Jimp({ data, width: 40, height: 200 });
    const small = image.clone().resize({ h: 64 });

    expect(image.blurhash()).toBe(
      reference.encode(new Uint8ClampedArray(small.bitmap.data), 13, 64, 4, 3),
    );
  });

  test("defaults to 4x3 components", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const hash = image.blurhash();

    expect(hash).toHaveLength(4 + 2 * 4 * 3);
    expect(hash).toBe(image.blurhash({ componentsX: 4, componentsY: 3 }));
    expect(image.blurhash({ componentsX: 1, componentsY: 1 })).toHaveLength(6);
  });

  test("doesn't change the image", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const before = Buffer.from(image.bitmap.data);
    const { width, height } = image.bitmap;

    image.blurhash();

    expect(image.bitmap.width).toBe(width);
    expect(image.bitmap.height).toBe(height);
    expect(image.bitmap.data.equals(before)).toBe(true);

    const transparent = new Jimp({ width: 4, height: 4, color: 0xff000080 });
    const transparentBefore = Buffer.from(transparent.bitmap.data);

    transparent.blurhash();

    expect(transparent.bitmap.data.equals(transparentBefore)).toBe(true);
  });

  test("draws transparent pixels over the background", () => {
    const image = new Jimp({ width: 8, height: 8, color: 0x00000000 });

    image.background = 0x336699ff;

    expect(image.blurhash()).toBe(
      new Jimp({ width: 8, height: 8, color: 0x336699ff }).blurhash(),
    );

    const half = new Jimp({ width: 8, height: 8, color: 0xff000080 });
    half.background = 0x0000ffff;
    const pixel = decodeBlurhash(
      half.blurhash({ componentsX: 1, componentsY: 1 }),
      {
        w: 1,
        h: 1,
      },
    ).data;

    // Half red over blue
    expect([...pixel]).toEqual([128, 0, 127, 255]);
  });

  test("draws transparent pixels like JPEG output, by default", async () => {
    const image = new Jimp({ width: 8, height: 8, color: 0xff000000 });

    // Half transparent pixels keep their colour, transparent ones are black
    image.setPixelColor(0xff000080, 0, 0);
    image.background = 0x00000000;

    const jpeg = await Jimp.read(await image.getBuffer("image/jpeg"));

    expect(jpeg.getPixelColor(0, 0) >>> 24).toBeGreaterThan(0xf0);
    expect(jpeg.getPixelColor(4, 4) >>> 24).toBeLessThan(0x10);

    const expected = new Jimp({ width: 8, height: 8, color: 0x000000ff });
    expected.setPixelColor(0xff0000ff, 0, 0);

    expect(image.blurhash()).toBe(expected.blurhash());
  });

  test("converts other colour spaces to sRGB", () => {
    const srgb = new Jimp({ width: 8, height: 8, color: 0xc06040ff });
    const p3 = new Jimp({ width: 8, height: 8, color: 0xc06040ff });

    p3.iccProfile = DISPLAY_P3_PROFILE;

    const p3InSrgb = p3.clone().toColorSpace("srgb");

    expect(p3.blurhash()).not.toBe(srgb.blurhash());
    expect(p3.blurhash()).toBe(p3InSrgb.blurhash());
  });

  test("throws for invalid options", () => {
    const image = new Jimp({ width: 4, height: 4 });

    expect(() => image.blurhash({ componentsX: 0 })).toThrow();
    expect(() => image.blurhash({ componentsY: 10 })).toThrow();
    expect(() => image.blurhash({ componentsX: 2.5 })).toThrow();
  });
});

describe("decodeBlurhash", () => {
  const hashes = [
    "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
    "LGF5]+Yk^6#M@-5c,1J5@[or[Q6.",
    "L6PZfSi_.AyE_3t7t7R**0o#DgR4",
    "00ADE+",
    reference.encode(gradientPixels(31, 23), 31, 23, 9, 9),
    reference.encode(randomPixels(20, 20, 5), 20, 20, 3, 5),
  ];

  test("matches the reference blurhash package", () => {
    for (const hash of hashes) {
      for (const [w, h] of [
        [32, 32],
        [1, 1],
        [17, 40],
      ] as const) {
        const { data, width, height } = decodeBlurhash(hash, { w, h });

        expect(width).toBe(w);
        expect(height).toBe(h);
        expect(
          maxDifference(data, reference.decode(hash, w, h)),
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  test("punch scales the contrast", () => {
    const hash = hashes[0]!;
    const flat = decodeBlurhash(hash, { w: 16, h: 16, punch: 0 }).data;

    // Without the AC components every pixel is the average colour
    for (let i = 4; i < flat.length; i++) {
      expect(flat[i]).toBe(flat[i % 4]);
    }

    // The reference rounds punch up to an odd whole number, so compare at 3
    expect(
      maxDifference(
        decodeBlurhash(hash, { w: 16, h: 16, punch: 3 }).data,
        reference.decode(hash, 16, 16, 3),
      ),
    ).toBeLessThanOrEqual(1);
  });

  test("makes an image with Jimp.fromBitmap", () => {
    const image = Jimp.fromBitmap(decodeBlurhash(hashes[0]!, { w: 32, h: 24 }));

    expect(image.bitmap.width).toBe(32);
    expect(image.bitmap.height).toBe(24);
    expect(image.getPixelColor(0, 0) & 0xff).toBe(0xff);
  });

  test("round trips the average colour", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const hash = image.blurhash({ componentsX: 1, componentsY: 1 });
    const decoded = decodeBlurhash(hash, { w: 1, h: 1 }).data;
    const again = encodeBlurhash(decoded, 1, 1, 1, 1);

    expect(again).toBe(hash);
  });

  test("throws for invalid hashes", () => {
    expect(() => decodeBlurhash("abc", { w: 1, h: 1 })).toThrow(
      "A BlurHash must be at least 6 characters",
    );
    expect(() =>
      decodeBlurhash("LEHV6nWB2yk8pyo0adR*.7kCMdn", { w: 1, h: 1 }),
    ).toThrow(
      "This BlurHash has 4x3 components, so it should be 28 characters, not 27",
    );
    expect(() =>
      decodeBlurhash("LEHV6nWB2yk8pyo0adR*.7kCMd!j", { w: 1, h: 1 }),
    ).toThrow(`"!" isn't a BlurHash character`);
  });

  test("throws for invalid options", () => {
    expect(() => decodeBlurhash("00ADE+", { w: 0, h: 1 })).toThrow();
    expect(() => decodeBlurhash("00ADE+", { w: 1.5, h: 1 })).toThrow();
    expect(() => decodeBlurhash("00ADE+", { w: 1, h: 1, punch: -1 })).toThrow();
  });
});
