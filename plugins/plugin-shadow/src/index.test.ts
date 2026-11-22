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
          // composite truncates rather than rounds, so an opaque pixel drawn
          // over part of the shadow can come out as 254
          expect(result.bitmap.data[idx + 3]).toBeGreaterThanOrEqual(0xfe);
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
});
