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
      "1100010000011111011010111111000000010101011011110101101010010010",
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

    expect(image.hash(17)).toBe("4ffe16c8400d78g7");
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
