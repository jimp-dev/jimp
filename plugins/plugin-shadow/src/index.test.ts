import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";

import { methods } from "./index.js";
import { createJimp } from "@jimp/core";

const jimp = createJimp({ plugins: [methods] });

describe("Shadow", () => {
  test("creates a shadow", async () => {
    const testImage = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(testImage.shadow({ x: -1, y: 1, blur: 1 })).toMatchSnapshot();
  });

  describe("draws the image over its shadow", () => {
    // An opaque two-color ring with a transparent hole, on a transparent background
    const makeRing = () =>
      jimp.fromBitmap(
        makeTestImage(
          "            ",
          "  ▴▴▴▴▴▴▴▴  ",
          "  ▴▾▾▾▾▾▾▴  ",
          "  ▴▾    ▾▴  ",
          "  ▴▾    ▾▴  ",
          "  ▴▾▾▾▾▾▾▴  ",
          "  ▴▴▴▴▴▴▴▴  ",
          "            ",
        ),
      );
    const options = { x: -1, y: 1, size: 1, blur: 1 };

    test("leaves the image's opaque pixels unchanged", () => {
      const original = makeRing();
      const result = makeRing().shadow(options);
      const { data } = original.bitmap;

      for (let idx = 0; idx < data.length; idx += 4) {
        if (data[idx + 3] === 0xff) {
          expect([...result.bitmap.data.subarray(idx, idx + 3)]).toEqual([
            ...data.subarray(idx, idx + 3),
          ]);
          expect(result.bitmap.data[idx + 3]).toBe(0xff);
        }
      }
    });

    test("only draws a black shadow where the image is transparent", () => {
      const original = makeRing();
      const result = makeRing().shadow(options);
      const { data } = original.bitmap;

      for (let idx = 0; idx < data.length; idx += 4) {
        if (data[idx + 3] === 0) {
          expect([...result.bitmap.data.subarray(idx, idx + 3)]).toEqual([
            0, 0, 0,
          ]);
        }
      }

      // The hole at (7, 3) is covered by the ring's shadow
      expect(result.getPixelColor(7, 3) & 0xff).toBeGreaterThan(0);
    });
  });

  test("keeps the colours of an image in another colour space", () => {
    const image = new jimp({
      width: 10,
      height: 10,
      color: 0x80604aff,
      colorSpace: "display-p3",
    });

    image.shadow();

    expect(image.colorSpace).toBe("display-p3");
    expect(image.getPixelColor(5, 5)).toBe(0x80604aff);
  });

  describe("shadow shape", () => {
    // an opaque square in the middle of a transparent image
    const makeSquare = () => {
      const image = new jimp({ width: 40, height: 40, color: 0x00000000 });

      image.scan(10, 10, 20, 20, (_, __, idx) => {
        image.bitmap.data.writeUInt32BE(0xff0000ff, idx);
      });

      return image;
    };
    const alphaAt = (
      image: ReturnType<typeof makeSquare>,
      x: number,
      y: number,
    ) => image.getPixelColor(x, y) & 0xff;

    test("grows the shadow from the center of the image", () => {
      const result = makeSquare().shadow({ x: 0, y: 0, size: 1.5, blur: 0 });

      // the square's shadow is 30x30, so it reaches 5 pixels past each side
      for (const [x, y] of [
        [6, 20],
        [33, 20],
        [20, 6],
        [20, 33],
      ]) {
        expect(alphaAt(result, x!, y!)).toBeGreaterThan(0);
      }

      for (const [x, y] of [
        [3, 20],
        [36, 20],
        [20, 3],
        [20, 36],
      ]) {
        expect(alphaAt(result, x!, y!)).toBe(0);
      }
    });

    test("rounds a fractional blur instead of removing the shadow", () => {
      const result = makeSquare().shadow({ x: 0, y: 0, size: 1.5, blur: 2.5 });

      expect(alphaAt(result, 7, 20)).toBeGreaterThan(0);
      expect(alphaAt(result, 32, 20)).toBeGreaterThan(0);
    });
  });
});
