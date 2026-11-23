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
