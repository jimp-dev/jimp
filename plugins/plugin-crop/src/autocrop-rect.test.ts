import { expect, test, describe } from "vitest";

import { methods } from "./index.js";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

const jimp = createJimp({ plugins: [methods] });

describe("autocropRect", () => {
  test("returns the rectangle autocrop would apply", () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▫▫◆   ",
        "  ◆▫▫▫▫◆  ",
        "   ◆▫▫◆   ",
        "    ◆◆    ",
        "          "
      )
    );

    expect(imgSrc.autocropRect()).toEqual({
      x: 2,
      y: 1,
      w: 6,
      h: 5,
    });
  });

  test("returns the full image when cropOnlyFrames prevents cropping", () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥   ◆◆   ",
        "▥▥  ◆▫▫◆  ",
        "▥▥ ◆▫▫▫▫◆ ",
        "▥▥  ◆▫▫◆  ",
        "▥▥   ◆◆   ",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expect(imgSrc.autocropRect()).toEqual({
      x: 0,
      y: 0,
      w: 10,
      h: 7,
    });
  });

  test("can be passed directly to crop for the same result as autocrop", () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "   ◆◆   ",
        "  ◆▫▫◆  ",
        " ◆▫▫▫▫◆ ",
        "  ◆▫▫◆  ",
        "   ◆◆   ",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥"
      )
    );
    const options = {
      cropSymmetric: true,
      cropOnlyFrames: false,
      leaveBorder: 2,
    } as const;

    const rect = imgSrc.autocropRect(options);
    const croppedWithRect = imgSrc.clone().crop(rect);
    const croppedWithAutocrop = imgSrc.clone().autocrop(options);

    expect(croppedWithRect.bitmap).toEqual(croppedWithAutocrop.bitmap);
  });
});
