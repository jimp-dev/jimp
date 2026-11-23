import { describe, expect, test } from "vitest";
import { Edge, Jimp } from "./index.js";

const red = 0xff0000ff;
const white = 0xffffffff;

// 3x3 image where every pixel has a different color
function makeImage() {
  const image = new Jimp({ width: 3, height: 3, color: white });

  image.scan((x, y, idx) => {
    image.bitmap.data.writeUInt32BE((y * 3 + x + 1) * 0x100 + 0xff, idx);
  });

  return image;
}

describe("setPixelColor", () => {
  test("does nothing outside the image", () => {
    const image = makeImage();
    const before = Buffer.from(image.bitmap.data);

    for (const [x, y] of [
      [-1, 0],
      [3, 0],
      [0, -1],
      [0, 3],
      [5, 1],
      [-10, -10],
      [Infinity, 0],
      [0, -Infinity],
      [2.5, 0],
    ] as const) {
      image.setPixelColor(red, x, y);
    }

    expect(image.bitmap.data).toEqual(before);
  });

  test("rounds coordinates like getPixelColor", () => {
    const image = makeImage();

    image.setPixelColor(red, 1.4, 0.6);

    expect(image.getPixelColor(1, 1)).toBe(red);
    expect(image.getPixelColor(1.4, 0.6)).toBe(red);
  });

  test("throws for NaN coordinates", () => {
    const image = makeImage();

    expect(() => image.setPixelColor(red, NaN, 0)).toThrow(
      "hex, x and y must be numbers",
    );
    expect(() => image.setPixelColor(red, 0, NaN)).toThrow(
      "hex, x and y must be numbers",
    );
  });
});

describe("getPixelColor", () => {
  test("returns the nearest edge pixel outside the image", () => {
    const image = makeImage();

    expect(image.getPixelColor(-1, 1)).toBe(image.getPixelColor(0, 1));
    expect(image.getPixelColor(5, 1)).toBe(image.getPixelColor(2, 1));
    expect(image.getPixelColor(1, -Infinity)).toBe(image.getPixelColor(1, 0));
    expect(image.getPixelColor(10, 10)).toBe(image.getPixelColor(2, 2));
  });

  test("throws for NaN coordinates", () => {
    const image = makeImage();

    expect(() => image.getPixelColor(NaN, 0)).toThrow(
      "x and y must be numbers",
    );
  });
});

describe("getPixelIndex", () => {
  test("extends to the nearest edge pixel by default", () => {
    const image = makeImage();

    expect(image.getPixelIndex(1, 1)).toBe(16);
    expect(image.getPixelIndex(5, 1)).toBe(20);
    expect(image.getPixelIndex(-5, -5, Edge.EXTEND)).toBe(0);
  });

  test("wraps around with Edge.WRAP", () => {
    const image = makeImage();

    expect(image.getPixelIndex(-1, 1, Edge.WRAP)).toBe(20);
    expect(image.getPixelIndex(3, 1, Edge.WRAP)).toBe(12);
    // More than one image away
    expect(image.getPixelIndex(-4, 1, Edge.WRAP)).toBe(20);
    expect(image.getPixelIndex(1, -7, Edge.WRAP)).toBe(
      image.getPixelIndex(1, 2),
    );
    expect(image.getPixelIndex(7, 7, Edge.WRAP)).toBe(
      image.getPixelIndex(1, 1),
    );
  });

  test("returns -1 outside the image with Edge.CROP", () => {
    const image = makeImage();

    expect(image.getPixelIndex(2, 2, Edge.CROP)).toBe(32);
    expect(image.getPixelIndex(3, 0, Edge.CROP)).toBe(-1);
    expect(image.getPixelIndex(0, -1, Edge.CROP)).toBe(-1);
    expect(image.getPixelIndex(Infinity, 0, Edge.CROP)).toBe(-1);
  });

  test("throws for NaN coordinates", () => {
    const image = makeImage();

    expect(() => image.getPixelIndex(NaN, 0, Edge.CROP)).toThrow(
      "x and y must be numbers",
    );
  });
});
