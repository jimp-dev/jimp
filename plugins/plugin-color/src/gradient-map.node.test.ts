import { expect, test, describe } from "vitest";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { createJimp } from "@jimp/core";
import {
  cssColorToHex,
  DISPLAY_P3,
  DISPLAY_P3_PROFILE,
  intToRGBA,
} from "@jimp/utils";
import "@jimp/test-utils/image-snapshot";

import { methods as color } from "./index.js";

const jimp = createJimp({ formats: [png, jpeg], plugins: [color] });

/** An image of the given [r, g, b, a] pixels in a row */
function pixels(...values: number[][]) {
  return jimp.fromBitmap({
    width: values.length,
    height: 1,
    data: Uint8Array.from(values.flat()),
  });
}

/** A row of every grey level, from 0 to 255 */
function ramp() {
  return pixels(...Array.from({ length: 256 }, (_, v) => [v, v, v, 255]));
}

describe("gradientMap", () => {
  test("black to white leaves greys unchanged", () => {
    const image = ramp();

    image.gradientMap(["black", "white"]);

    expect(image.bitmap).toStrictEqual(ramp().bitmap);
  });

  test("maps the darkest pixels to the first stop and the lightest to the last", () => {
    const image = pixels(
      [0, 0, 0, 255],
      [255, 255, 255, 255],
      [128, 128, 128, 255],
    );

    image.gradientMap(["#ff0000", "#0000ff"]);

    // 128 / 255 of the way from red to blue
    expect(Array.from(image.bitmap.data)).toEqual([
      255, 0, 0, 255, 0, 0, 255, 255, 127, 0, 128, 255,
    ]);
  });

  test("places colors by their Rec. 709 luminance, like greyscale", () => {
    const original = pixels(
      [255, 0, 0, 255],
      [0, 255, 0, 255],
      [0, 0, 255, 255],
      [12, 200, 99, 255],
    );
    const stops = ["#1e3264", "#f037a5"];

    expect(original.clone().gradientMap(stops).bitmap).toStrictEqual(
      original.clone().greyscale().gradientMap(stops).bitmap,
    );
    // red's luminance is 54, so it's 54 / 255 of the way along
    expect(
      Array.from(
        original
          .clone()
          .gradientMap(["black", "white"])
          .bitmap.data.slice(0, 4),
      ),
    ).toEqual([54, 54, 54, 255]);
  });

  test("uses the offsets of { offset, color } stops", () => {
    const image = pixels(
      [0, 0, 0, 255],
      [51, 51, 51, 255],
      [102, 102, 102, 255],
    );

    image.gradientMap([
      { offset: 0.2, color: "#000000" },
      { offset: 0.4, color: "#ffffff" },
    ]);

    // before the first stop, at it, and at the second
    expect(Array.from(image.bitmap.data)).toEqual([
      0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255,
    ]);
  });

  test("three stops", async () => {
    const image = await jimp.read(__dirname + "/images/tiles.jpg");

    image.gradientMap(["#000000", "#d9381e", "#ffe08a"]);

    expect(await image.getBuffer("image/png")).toMatchImageSnapshot();
  });

  test("duotone", async () => {
    const image = await jimp.read(__dirname + "/images/tiles.jpg");

    image.gradientMap(["#1e3264", "#f037a5"]);

    expect(await image.getBuffer("image/png")).toMatchImageSnapshot();
  });

  test("takes { stops } as well as a list of stops", () => {
    const stops = ["#1e3264", "#f037a5"];

    expect(ramp().gradientMap({ stops }).bitmap).toStrictEqual(
      ramp().gradientMap(stops).bitmap,
    );
  });

  test("keeps each pixel's alpha", () => {
    const image = pixels(
      [0, 0, 0, 0],
      [128, 128, 128, 100],
      [255, 255, 255, 255],
    );

    image.gradientMap(["#ff0000", "#0000ff"]);

    expect([3, 7, 11].map((i) => image.bitmap.data[i])).toEqual([0, 100, 255]);
  });

  test("multiplies alpha by the gradient's alpha", () => {
    const image = pixels([0, 0, 0, 200], [255, 255, 255, 200]);

    image.gradientMap([
      { offset: 0, color: "#ff000000" },
      { offset: 1, color: { r: 0, g: 0, b: 255, a: 128 } },
    ]);

    expect(Array.from(image.bitmap.data)).toEqual([0, 0, 0, 0, 0, 0, 255, 100]);
  });

  test("amount blends with the original", () => {
    const stops = ["#ff0000", "#0000ff"];
    const image = () => pixels([0, 0, 0, 255], [255, 255, 255, 51]);

    expect(image().gradientMap({ stops, amount: 0 }).bitmap).toStrictEqual(
      image().bitmap,
    );
    expect(image().gradientMap({ stops, amount: 1 }).bitmap).toStrictEqual(
      image().gradientMap(stops).bitmap,
    );
    expect(
      Array.from(image().gradientMap({ stops, amount: 0.5 }).bitmap.data),
    ).toEqual([128, 0, 0, 255, 128, 128, 255, 51]);
  });

  test("clamps the amount to 0-1", () => {
    const stops = ["#ff0000", "#0000ff"];

    expect(ramp().gradientMap({ stops, amount: 2 }).bitmap).toStrictEqual(
      ramp().gradientMap(stops).bitmap,
    );
    expect(ramp().gradientMap({ stops, amount: -1 }).bitmap).toStrictEqual(
      ramp().bitmap,
    );
  });

  test("converts CSS colors to the image's colour space", () => {
    const image = pixels([0, 0, 0, 255]);

    image.iccProfile = DISPLAY_P3_PROFILE;
    image.gradientMap(["#ff0000", "#0000ff"]);

    const { r, g, b, a } = intToRGBA(cssColorToHex("#ff0000", DISPLAY_P3));

    expect(Array.from(image.bitmap.data)).toEqual([r, g, b, a]);
  });

  test("throws for invalid colors and missing stops", () => {
    expect(() => ramp().gradientMap(["black", "notacolor"])).toThrow(
      'Invalid color "notacolor"',
    );
    expect(() => ramp().gradientMap([])).toThrow();
    // @ts-expect-error missing stops
    expect(() => ramp().gradientMap({ amount: 1 })).toThrow();
  });

  test("can be applied from a list of edits", () => {
    const stops = ["#1e3264", "#f037a5"];

    expect(
      ramp().apply([["gradientMap", { stops, amount: 0.8 }]]).bitmap,
    ).toStrictEqual(ramp().gradientMap({ stops, amount: 0.8 }).bitmap);
  });
});
