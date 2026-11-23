import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import * as crop from "@jimp/plugin-crop";
import png from "@jimp/js-png";
import { Jimp } from "./index.js";

const red = 0xff0000ff;
const blue = 0x0000ffff;
const white = 0xffffffff;

function makeImage() {
  return new Jimp({ width: 2, height: 2, color: white });
}

describe("methods that return the image", () => {
  test("scan returns the same image", () => {
    const image = makeImage();
    const visited: number[] = [];

    expect(image.scan((_x, _y, idx) => visited.push(idx))).toBe(image);
    expect(visited).toEqual([0, 4, 8, 12]);

    visited.length = 0;
    expect(image.scan(1, 1, 1, 1, (_x, _y, idx) => visited.push(idx))).toBe(
      image,
    );
    expect(visited).toEqual([12]);
  });

  test("setPixelColor returns the same image", () => {
    const image = makeImage();

    expect(image.setPixelColor(red, 1, 0)).toBe(image);
    expect(image.getPixelColor(1, 0)).toBe(red);
    expect(image.getPixelColor(0, 0)).toBe(white);
  });

  test("composite returns the same image and draws the source", () => {
    const image = makeImage();
    const source = new Jimp({ width: 1, height: 1, color: blue });

    expect(image.composite(source, 1, 1)).toBe(image);
    expect(image.getPixelColor(1, 1)).toBe(blue);
    expect(image.getPixelColor(0, 0)).toBe(white);
  });

  test("composite still rejects images from another Jimp class", () => {
    const image = makeImage();
    const OtherJimp = createJimp();
    const other = new OtherJimp({ width: 1, height: 1 });

    expect(() => image.composite(other)).toThrow(
      "The source must be a Jimp image",
    );
  });

  test("scanIterator yields the image it was called on", () => {
    const image = makeImage();
    const pixels = [...image.scanIterator()];

    expect(pixels).toHaveLength(4);
    expect(pixels.every((pixel) => pixel.image === image)).toBe(true);
    expect(pixels.map(({ x, y, idx }) => [x, y, idx])).toEqual([
      [0, 0, 0],
      [1, 0, 4],
      [0, 1, 8],
      [1, 1, 12],
    ]);
  });

  test("plugin methods return the same image", () => {
    const image = makeImage();

    expect(image.greyscale()).toBe(image);
    expect(image.resize({ w: 1 })).toBe(image);
    expect(image.crop({ x: 0, y: 0, w: 1, h: 1 })).toBe(image);
    expect(image.width).toBe(1);
  });

  test("chains apply every step to one image", () => {
    const image = makeImage();
    const result = image
      .scan(() => {})
      .setPixelColor(red, 0, 0)
      .composite(new Jimp({ width: 1, height: 1, color: blue }), 1, 0)
      .crop({ x: 0, y: 0, w: 2, h: 1 });

    expect(result).toBe(image);
    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.getPixelColor(0, 0)).toBe(red);
    expect(result.getPixelColor(1, 0)).toBe(blue);
  });
});

describe("clone", () => {
  test("returns an independent copy with the plugin methods", () => {
    const image = makeImage().setPixelColor(red, 0, 0);
    image.background = blue;
    const copy = image.clone();

    expect(copy).not.toBe(image);
    expect(copy).toBeInstanceOf(Jimp);
    expect(copy.bitmap.data).toEqual(image.bitmap.data);
    expect(copy.bitmap.data).not.toBe(image.bitmap.data);

    copy.setPixelColor(blue, 0, 0).resize({ w: 1 });

    expect(image.getPixelColor(0, 0)).toBe(red);
    expect(image.width).toBe(2);
    expect(copy.width).toBe(1);
  });

  test("keeps the class of images from createJimp", () => {
    const CustomJimp = createJimp({ plugins: [crop.methods], formats: [png] });
    const copy = new CustomJimp({ width: 2, height: 2 }).clone();

    expect(copy).toBeInstanceOf(CustomJimp);
    expect(typeof copy.crop).toBe("function");
    expect("resize" in copy).toBe(false);
  });
});

describe("static readers", () => {
  test("return images with the plugin methods", async () => {
    const png = await makeImage().getBuffer("image/png");
    const images = [
      Jimp.fromBitmap({ width: 1, height: 1, data: [red] }),
      await Jimp.fromBuffer(png),
      await Jimp.read(png),
    ];

    for (const image of images) {
      expect(image).toBeInstanceOf(Jimp);
      expect(typeof image.resize).toBe("function");
      expect(image.resize({ w: 1 })).toBe(image);
    }

    expect(images[0]!.getPixelColor(0, 0)).toBe(red);
    expect(images[1]!.mime).toBe("image/png");
    expect(images[2]!.mime).toBe("image/png");
  });

  test("work on classes from createJimp", async () => {
    const CustomJimp = createJimp({ plugins: [crop.methods], formats: [png] });
    const buffer = await makeImage().getBuffer("image/png");
    const images = [
      CustomJimp.fromBitmap({ width: 1, height: 1, data: [red] }),
      await CustomJimp.fromBuffer(buffer),
      await CustomJimp.read(buffer),
    ];

    for (const image of images) {
      expect(image).toBeInstanceOf(CustomJimp);
      expect(image.crop({ x: 0, y: 0, w: 1, h: 1 })).toBe(image);
      expect("resize" in image).toBe(false);
    }
  });
});

describe("constructor", () => {
  test("fills the image with a CSS color and uses it as the background", () => {
    const image = new Jimp({ width: 1, height: 1, color: "red" });

    expect(image.getPixelColor(0, 0)).toBe(red);
    expect(image.background).toBe(red);
  });

  test("throws for an invalid CSS color", () => {
    expect(() => new Jimp({ width: 1, height: 1, color: "nope" })).toThrow(
      'Invalid color "nope"',
    );
  });
});
