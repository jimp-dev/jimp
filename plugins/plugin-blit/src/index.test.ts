import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import { makeTestImage } from "@jimp/test-utils";

import * as blit from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [blit.methods] });

describe("Blit over image", function () {
  const targetImg = Jimp.fromBitmap(
    makeTestImage(
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
    ),
  );
  // stores the Jimp instances of the JGD images above.
  // prettier-ignore
  const srcImg = Jimp.fromBitmap(makeTestImage(
    "□□□□□□",
    "□▥▥▥▥□",
    "□▥■■▥□",
    "□▥■■▥□",
    "□▥▥▥▥□",
    "□□□□□□"
  ));

  test("blit on top, with no crop", () => {
    expect(targetImg.clone().blit(srcImg)).toMatchSnapshot();
  });

  test("blit on middle, with no crop", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: 1, y: 1 }),
    ).toMatchSnapshot();
  });

  test("blit on middle, with x,y crop", () => {
    expect(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 2, y: 2, srcX: 1, srcY: 1, srcW: 5, srcH: 5 }),
    ).toMatchSnapshot();
  });

  test("blit on middle, with x,y,w,h crop", () => {
    expect(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 2, y: 2, srcX: 1, srcY: 1, srcW: 4, srcH: 4 }),
    ).toMatchSnapshot();
  });

  test("blit partially out, on top-left", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: -1, y: -1 }),
    ).toMatchSnapshot();
  });

  test("blit partially out, on bottom-right", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: 3, y: 3 }),
    ).toMatchSnapshot();
  });

  test("blit preserves source colors over transparent pixels", () => {
    const target = Jimp.fromBitmap({
      width: 1,
      height: 1,
      data: new Uint8Array([0, 0, 0, 0]),
    });
    const source = Jimp.fromBitmap({
      width: 1,
      height: 1,
      data: new Uint8Array([255, 255, 255, 128]),
    });

    target.blit(source);

    expect(Array.from(target.bitmap.data)).toEqual([255, 255, 255, 128]);
  });
});
