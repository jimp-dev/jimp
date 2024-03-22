import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

import crop from "./index.js";

const jimp = createJimp({ plugins: [crop], formats: [] });

describe("crop", () => {
  // 6x5 size
  const testImage = makeTestImage(
    "  ◆◆  ",
    " ◆▦▦◆ ",
    "◆▦▦▦▦◆",
    " ◆▦▦◆ ",
    "  ◆◆  ",
  );

  test("full width from top", () => {
    expect(jimp.fromBitmap(testImage).crop(0, 0, 6, 2)).toMatchSnapshot();
  });

  test("full width from bottom", () => {
    expect(jimp.fromBitmap(testImage).crop(0, 3, 6, 2)).toMatchSnapshot();
  });

  test("full width from middle", () => {
    expect(jimp.fromBitmap(testImage).crop(0, 2, 6, 2)).toMatchSnapshot();
  });

  test("full height from left", () => {
    expect(jimp.fromBitmap(testImage).crop(0, 0, 2, 5)).toMatchSnapshot();
  });

  test("full height from right", () => {
    expect(jimp.fromBitmap(testImage).crop(4, 0, 2, 5)).toMatchSnapshot();
  });

  test("full height from middle", () => {
    expect(jimp.fromBitmap(testImage).crop(2, 0, 2, 5)).toMatchSnapshot();
  });
});
