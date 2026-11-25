import { describe, expect, test } from "vitest";

import { Jimp, BlendMode } from "./index.js";

const pixel = (color: number) => new Jimp({ width: 1, height: 1, color });

describe("composite", () => {
  describe("an opaque source gives an opaque result", () => {
    for (const mode of Object.values(BlendMode)) {
      test(mode, () => {
        for (let alpha = 0; alpha <= 0xff; alpha++) {
          const base = pixel(0x33669900 + alpha);
          base.composite(pixel(0xcc9933ff), 0, 0, { mode });

          expect(
            base.getPixelColor(0, 0) & 0xff,
            `background alpha ${alpha}`,
          ).toBe(0xff);
        }
      });
    }
  });

  test("rounds blended channels instead of truncating them", () => {
    const base = pixel(0x000000ff);
    base.composite(pixel(0xffffffff), 0, 0, { opacitySource: 0.5 });

    // 255 * 0.5 = 127.5
    expect(base.getPixelColor(0, 0)).toBe(0x808080ff);
  });

  test("blends a semi-transparent source over an opaque background", () => {
    const base = pixel(0x0000ffff);
    base.composite(pixel(0xff000080), 0, 0);

    expect(base.getPixelColor(0, 0)).toBe(0x80007fff);
  });

  test("blends an opaque source under a semi-transparent background", () => {
    const base = pixel(0xff000080);
    base.composite(pixel(0x0000ffff), 0, 0, { mode: BlendMode.DST_OVER });

    expect(base.getPixelColor(0, 0)).toBe(0x80007fff);
  });

  test("multiplies channels", () => {
    const base = pixel(0xc8c8c8ff);
    base.composite(pixel(0x966400ff), 0, 0, { mode: BlendMode.MULTIPLY });

    // 200 * 150 / 255 = 117.6, 200 * 100 / 255 = 78.4
    expect(base.getPixelColor(0, 0)).toBe(0x764e00ff);
  });

  // Worked out by hand with the formulas in
  // https://www.w3.org/TR/compositing-1/#blending, with 0x33 = 0.2,
  // 0x66 = 0.4, 0x99 = 0.6 and 0xcc = 0.8
  describe("matches the W3C formulas", () => {
    test.each([
      // B(0.2, 0.2) = 0.2 / 0.8 = 0.25, B(0.2, 0.8) = min(1, 1), B(0, 0.6) = 0
      [BlendMode.COLOR_DODGE, 0x333300ff, 0x33cc99ff, 0x40ff00ff],
      // B(0.8, 0.8) = 1 - 0.2 / 0.8 = 0.75, B(0.6, 0.2) = 1 - min(1, 2),
      // B(1, 0) = 1
      [BlendMode.COLOR_BURN, 0xcc99ffff, 0xcc3300ff, 0xbf00ffff],
      // B(0.4, 0.2) = 0.4 - 0.6 * 0.4 * 0.6 = 0.256,
      // B(0.2, 0.8) = 0.2 + 0.6 * (((16 * 0.2 - 12) * 0.2 + 4) * 0.2 - 0.2) = 0.3488,
      // B(0.4, 0.8) = 0.4 + 0.6 * (sqrt(0.4) - 0.4) = 0.5395
      [BlendMode.SOFT_LIGHT, 0x663366ff, 0x33ccccff, 0x41598aff],
      // SetSat(blue, 0.4) = (0, 0, 0.4), and SetLum with Lum(dst) = 0.52
      // adds 0.476 to each channel
      [BlendMode.HUE, 0xcc6666ff, 0x0000ffff, 0x7979dfff],
      // A grey source has no saturation, so the result is grey with
      // Lum(dst) = 0.52
      [BlendMode.SATURATION, 0xcc6666ff, 0x999999ff, 0x858585ff],
      // SetSat(dst, 1) = (1, 0.5, 0), then SetLum(_, 0.438) gives
      // (0.843, 0.343, -0.157), which ClipColor brings back into 0..1
      [BlendMode.SATURATION, 0x996633ff, 0xff0000ff, 0xbc5e00ff],
      // SetLum(red, 0.4) gives (1.1, 0.1, 0.1), which ClipColor scales
      // down to (1, 0.1429, 0.1429)
      [BlendMode.COLOR, 0x666666ff, 0xff0000ff, 0xff2424ff],
      // SetLum(dst, 0.6) adds 0.6 - 0.296 to each channel
      [BlendMode.LUMINOSITY, 0x336600ff, 0x999999ff, 0x81b44eff],
    ])("%s of %s and %s", (mode, dst, src, expected) => {
      const base = pixel(dst);
      base.composite(pixel(src), 0, 0, { mode });

      expect(base.getPixelColor(0, 0).toString(16)).toBe(expected.toString(16));
    });
  });

  describe("blends only where both images are there", () => {
    const newModes = [
      BlendMode.COLOR_DODGE,
      BlendMode.COLOR_BURN,
      BlendMode.SOFT_LIGHT,
      BlendMode.HUE,
      BlendMode.SATURATION,
      BlendMode.COLOR,
      BlendMode.LUMINOSITY,
    ];

    test.each(newModes)("%s over a transparent pixel is the source", (mode) => {
      const base = pixel(0x33669900);
      base.composite(pixel(0xcc9933ff), 0, 0, { mode });

      expect(base.getPixelColor(0, 0)).toBe(0xcc9933ff);
    });

    test.each(newModes)("%s of a transparent pixel changes nothing", (mode) => {
      const base = pixel(0x336699ff);
      base.composite(pixel(0xcc993300), 0, 0, { mode });

      expect(base.getPixelColor(0, 0)).toBe(0x336699ff);
    });

    test("opacitySource mixes the blend with the destination", () => {
      const base = pixel(0x333300ff);
      base.composite(pixel(0x33cc99ff), 0, 0, {
        mode: BlendMode.COLOR_DODGE,
        opacitySource: 0.5,
      });

      // Halfway between 0x333300 and the full blend, 0x40ff00
      expect(base.getPixelColor(0, 0).toString(16)).toBe("399900ff");
    });

    test("a semi-transparent source over a semi-transparent pixel", () => {
      const base = pixel(0x66666680);
      base.composite(pixel(0xff000080), 0, 0, { mode: BlendMode.COLOR });

      // αs = αb = 128 / 255, so αo = 0.7516, and the color is
      // (αs * (1 - αb) * red + αs * αb * B + αb * (1 - αs) * grey) / αo,
      // with B = (1, 0.1429, 0.1429) as above
      expect(base.getPixelColor(0, 0).toString(16)).toBe("cc2e2ec0");
    });
  });

  test("rejects unknown blend modes", () => {
    expect(() =>
      pixel(0xff0000ff).composite(pixel(0x0000ffff), 0, 0, {
        mode: "nope" as BlendMode,
      }),
    ).toThrow(
      'Unknown blend mode "nope", expected one of: srcOver, dstOver, multiply,',
    );
  });

  test("clamps opacities to 0..1", () => {
    const transparentSource = pixel(0x000000ff);
    transparentSource.composite(pixel(0xffffffff), 0, 0, {
      opacitySource: -1,
    });
    expect(transparentSource.getPixelColor(0, 0)).toBe(0x000000ff);

    const opaqueSource = pixel(0x000000ff);
    opaqueSource.composite(pixel(0xffffffff), 0, 0, { opacitySource: 2 });
    expect(opaqueSource.getPixelColor(0, 0)).toBe(0xffffffff);

    const transparentDest = pixel(0xff0000ff);
    transparentDest.composite(pixel(0x00000000), 0, 0, { opacityDest: -1 });
    expect(transparentDest.getPixelColor(0, 0) & 0xff).toBe(0);

    const opaqueDest = pixel(0xff0000ff);
    opaqueDest.composite(pixel(0x00000000), 0, 0, { opacityDest: 2 });
    expect(opaqueDest.getPixelColor(0, 0)).toBe(0xff0000ff);
  });

  test("rounds the background alpha scaled by opacityDest", () => {
    const base = pixel(0xff0000ff);
    base.composite(pixel(0x00000000), 0, 0, { opacityDest: 0.5 });

    // 255 * 0.5 = 127.5
    expect(base.getPixelColor(0, 0)).toBe(0xff000080);
  });
});
