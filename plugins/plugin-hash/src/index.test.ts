import { expect, test, describe } from "vitest";
import { getTestImagePath } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";
import bmp from "@jimp/js-bmp";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import tiff from "@jimp/js-tiff";

import { methods, compareHashes, distance } from "./index.js";

const Jimp = createJimp({
  formats: [bmp, png, jpeg, tiff],
  plugins: [methods],
});

describe("hash", () => {
  test("base 2", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));

    expect(image.hash(2)).toBe(
      "1011111000011111110010111110000011100000011000000001111010010010",
    );
  });

  test("base 10 (decimal)", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));

    expect(image.hash(10)).toBe("13730553271407496929");
  });

  test("base 16 (hex)", async () => {
    const image = await Jimp.read(getTestImagePath("rgb.tiff"));

    expect(image.hash(16)).toBe("d6bb21695387067f");
  });

  test("base 64", async () => {
    const image = await Jimp.read(getTestImagePath("windows95.bmp"));

    expect(image.hash(64)).toBe("fbyNjQOxYB8");
  });

  test("base 23", async function () {
    const image = await Jimp.read(getTestImagePath("panoramic.jpg"));

    expect(image.hash(23)).toBe("0mgi432lh91ch25");
  });

  test("base 17", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));

    expect(image.hash(17)).toBe("4d63354ea7cfe5a5");
  });
});

describe("pHash", () => {
  test("should calculate the distance using distanceFromHash", async function () {
    const image1 = await Jimp.read(getTestImagePath("dice.png"));
    const image2 = await Jimp.read(getTestImagePath("mask.png"));

    const hash = image1.pHash();

    expect(image2.distanceFromHash(hash)).toBe(distance(image1, image2));
  });

  test("should calculate the distance using compareHashes.", async function () {
    const image1 = await Jimp.read(getTestImagePath("dice.png"));
    const image2 = await Jimp.read(getTestImagePath("mask.png"));

    const hash1 = image1.pHash();
    const hash2 = image2.pHash();

    expect(compareHashes(hash1, hash2)).toBe(distance(image1, image2));
  });

  // https://github.com/jimp-dev/jimp/issues/338
  test("should not let the DC term flatten the hash of bright images", () => {
    function sketch(draw: (x: number, y: number) => boolean) {
      const image = new Jimp({ width: 64, height: 64, color: 0xffffffff });

      image.scan((x, y) => {
        if (draw(x, y)) {
          image.setPixelColor(0x000000ff, x, y);
        }
      });

      return image;
    }

    const cross = sketch((x, y) => x === y || x === 63 - y);
    const frame = sketch((x, y) => x === 8 || x === 55 || y === 8 || y === 55);

    expect(cross.pHash()).not.toBe("1".padEnd(64, "0"));
    expect(distance(cross, frame)).toBeGreaterThan(0.5);
  });
});

// https://github.com/jimp-dev/jimp/issues/1221
describe("transparency", () => {
  /** Draws an opaque shape on a fully transparent background. */
  function glyph(
    size: number,
    draw: (x: number, y: number) => boolean,
    color: number,
    hidden: (x: number, y: number) => number,
  ) {
    const image = new Jimp({ width: size, height: size });

    image.scan((x, y) => {
      image.setPixelColor(
        draw(x / size, y / size) ? color : hidden(x, y),
        x,
        y,
      );
    });

    return image;
  }

  const ring = (x: number, y: number) =>
    Math.abs(Math.hypot(x - 0.5, y - 0.5) - 0.375) < 0.04;
  const square = (x: number, y: number) =>
    x > 0.15 && x < 0.45 && y > 0.15 && y < 0.45;
  const bar = (x: number, y: number) => y > 0.6 && y < 0.8;

  const transparentBlack = () => 0x00000000;
  const transparentWhite = () => 0xffffff00;
  const transparentNoise = (x: number, y: number) =>
    (((x * 37 + y * 91) % 256) * 0x01010100) >>> 0;

  // 32x32 is the size the hash works at, so the image isn't resampled and
  // the colour under transparent pixels would otherwise reach the DCT as-is.
  test.each([32, 64])(
    "should ignore the colour of fully transparent pixels (%ipx)",
    (size) => {
      const black = glyph(size, ring, 0xffffffff, transparentBlack);
      const white = glyph(size, ring, 0xffffffff, transparentWhite);
      const noise = glyph(size, ring, 0xffffffff, transparentNoise);

      expect(white.pHash()).toBe(black.pHash());
      expect(noise.pHash()).toBe(black.pHash());
      expect(distance(black, white)).toBe(0);
    },
  );

  test("should keep light and dark shapes distinguishable", () => {
    for (const color of [0xffffffff, 0x000000ff]) {
      const a = glyph(64, square, color, transparentBlack);
      const b = glyph(64, bar, color, transparentBlack);

      expect(distance(a, b)).toBeGreaterThan(0.25);
    }
  });

  test("should not modify the image", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const before = Buffer.from(image.bitmap.data);

    image.pHash();

    expect(image.bitmap.data.equals(before)).toBe(true);
  });
});
