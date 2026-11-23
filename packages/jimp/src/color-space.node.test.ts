import { describe, expect, test } from "vitest";
import { DISPLAY_P3_PROFILE, intToRGBA } from "@jimp/utils";

import { Jimp } from "./index.js";

const images = __dirname + "/images/icc-profile/";

// sRGB red, #ff0000, in Display P3
const SRGB_RED_IN_P3 = 0xea3323ff;

function pixels(image: { bitmap: { data: Buffer } }) {
  return Buffer.from(image.bitmap.data);
}

describe("colour spaces", () => {
  test("reports the colour space of an image", async () => {
    expect((await Jimp.read(images + "p3.png")).colorSpace).toBe("display-p3");
    expect((await Jimp.read(images + "p3-two-segments.jpg")).colorSpace).toBe(
      "display-p3",
    );
    expect(new Jimp({ width: 1, height: 1 }).colorSpace).toBe("srgb");

    const custom = new Jimp({ width: 1, height: 1 });
    custom.iccProfile = Buffer.from("not a profile");

    expect(custom.colorSpace).toBe("custom");
  });

  test("creates Display P3 images", async () => {
    const image = new Jimp({
      width: 2,
      height: 2,
      color: "#ff0000",
      colorSpace: "display-p3",
    });

    expect(image.colorSpace).toBe("display-p3");
    // CSS colors are sRGB, so they're converted
    expect(image.getPixelColor(0, 0)).toBe(SRGB_RED_IN_P3);

    const p3Red = new Jimp({
      width: 1,
      height: 1,
      color: "color(display-p3 1 0 0)",
      colorSpace: "display-p3",
    });
    const raw = new Jimp({
      width: 1,
      height: 1,
      color: 0xff0000ff,
      colorSpace: "display-p3",
    });

    expect(p3Red.getPixelColor(0, 0)).toBe(0xff0000ff);
    // Numbers are pixel values
    expect(raw.getPixelColor(0, 0)).toBe(0xff0000ff);

    const reread = await Jimp.read(await image.getBuffer("image/png"));

    expect(reread.colorSpace).toBe("display-p3");
    expect(reread.iccProfile).toEqual(DISPLAY_P3_PROFILE);
    expect(reread.getPixelColor(0, 0)).toBe(SRGB_RED_IN_P3);

    const fromBitmap = Jimp.fromBitmap({
      ...raw.bitmap,
      colorSpace: "display-p3",
    });

    expect(fromBitmap.colorSpace).toBe("display-p3");
  });

  test("converts an image to sRGB and back", async () => {
    const image = new Jimp({
      width: 1,
      height: 1,
      // Inside sRGB, so it survives the round trip
      color: "color(display-p3 0.5 0.4 0.3)",
      colorSpace: "display-p3",
    });
    const before = image.getPixelColor(0, 0);

    image.toColorSpace("srgb");

    expect(image.colorSpace).toBe("srgb");
    expect(image.iccProfile).toBeUndefined();
    expect(image.getPixelColor(0, 0)).not.toBe(before);

    image.toColorSpace("display-p3");

    const after = intToRGBA(image.getPixelColor(0, 0));

    expect(image.colorSpace).toBe("display-p3");
    for (const [channel, value] of Object.entries(intToRGBA(before))) {
      expect(
        Math.abs(after[channel as keyof typeof after] - value),
      ).toBeLessThanOrEqual(1);
    }

    const red = new Jimp({ width: 1, height: 1, color: 0xff0000ff });

    red.toColorSpace("display-p3");
    expect(red.getPixelColor(0, 0)).toBe(SRGB_RED_IN_P3);
  });

  test("won't convert from a profile it can't read", () => {
    const image = new Jimp({ width: 1, height: 1 });
    image.iccProfile = Buffer.from("not a profile");

    expect(() => image.toColorSpace("srgb")).toThrow(/ICC profile/);
    // @ts-expect-error not a supported colour space
    expect(() => image.toColorSpace("rec2020")).toThrow(/rec2020/);
  });

  test("composite and blit convert images from another colour space", () => {
    const photo = () =>
      new Jimp({
        width: 4,
        height: 4,
        color: 0x000000ff,
        colorSpace: "display-p3",
      });
    const srgbRed = new Jimp({ width: 2, height: 2, color: 0xff0000ff });

    expect(photo().composite(srgbRed, 0, 0).getPixelColor(0, 0)).toBe(
      SRGB_RED_IN_P3,
    );
    expect(photo().blit({ src: srgbRed, x: 0, y: 0 }).getPixelColor(1, 1)).toBe(
      SRGB_RED_IN_P3,
    );

    // The same colour space is drawn as is
    const p3Red = new Jimp({
      width: 2,
      height: 2,
      color: 0xff0000ff,
      colorSpace: "display-p3",
    });

    expect(photo().composite(p3Red, 0, 0).getPixelColor(0, 0)).toBe(0xff0000ff);
    // The source image isn't changed
    expect(srgbRed.getPixelColor(0, 0)).toBe(0xff0000ff);
  });

  test("border colours are converted", () => {
    const image = new Jimp({
      width: 2,
      height: 2,
      color: 0x000000ff,
      colorSpace: "display-p3",
    });

    image.border({ width: 1, color: "#ff0000" });
    expect(image.getPixelColor(1, 0)).toBe(SRGB_RED_IN_P3);
  });

  test("operations that redraw the image keep its colours", async () => {
    const image = await Jimp.read(images + "p3.png");
    const center = image.getPixelColor(32, 24);

    image.contain({ w: 64, h: 64 });
    expect(image.colorSpace).toBe("display-p3");
    expect(image.getPixelColor(32, 32)).toBe(center);

    image.rotate(90);
    expect(image.colorSpace).toBe("display-p3");
  });

  test("converts to sRGB for formats that can't carry a profile", async () => {
    const image = await Jimp.read(images + "p3.png");
    const srgb = pixels(image.clone().toColorSpace("srgb"));

    for (const mime of ["image/bmp", "image/tiff"] as const) {
      const output = await Jimp.read(await image.getBuffer(mime));

      expect(output.colorSpace).toBe("srgb");
      expect(pixels(output)).toEqual(srgb);
    }

    // The image itself isn't changed
    expect(image.colorSpace).toBe("display-p3");
    expect(pixels(image)).not.toEqual(srgb);
  });

  test("converts to sRGB with icc: false", async () => {
    const image = await Jimp.read(images + "p3.png");
    const output = await Jimp.read(
      await image.getBuffer("image/png", { icc: false }),
    );

    expect(output.iccProfile).toBeUndefined();
    expect(pixels(output)).toEqual(pixels(image.clone().toColorSpace("srgb")));
  });

  test("removing the profile keeps the pixel values", async () => {
    const image = await Jimp.read(images + "p3.png");
    const before = pixels(image);

    image.iccProfile = undefined;

    const output = await Jimp.read(await image.getBuffer("image/png"));

    expect(output.iccProfile).toBeUndefined();
    expect(pixels(output)).toEqual(before);
  });
});
