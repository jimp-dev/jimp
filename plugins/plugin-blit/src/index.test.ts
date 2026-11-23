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

  test("a source region past the right edge doesn't wrap onto the next row", () => {
    const image = targetImg
      .clone()
      .blit({ src: srcImg, x: 0, y: 0, srcX: 4, srcY: 1, srcW: 4, srcH: 2 });

    expect(image).toMatchSnapshot();
    expect(image.bitmap).toEqual(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 0, y: 0, srcX: 4, srcY: 1, srcW: 2, srcH: 2 })
        .bitmap,
    );
  });

  test("a source region outside the source is clamped in place", () => {
    // The pixels that are drawn land where they would without clamping
    expect(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 2, y: 2, srcX: -1, srcY: -1, srcW: 3, srcH: 3 })
        .bitmap,
    ).toEqual(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 3, y: 3, srcX: 0, srcY: 0, srcW: 2, srcH: 2 })
        .bitmap,
    );
  });
});

describe("Blit alpha compositing", () => {
  const pixel = (color: number) => new Jimp({ width: 1, height: 1, color });

  test("keeps the source color over a transparent destination", () => {
    const image = pixel(0x00000000).blit(pixel(0xffffff80));

    expect([...image.bitmap.data]).toEqual([255, 255, 255, 128]);
  });

  test("combines alpha when blitting twice", () => {
    const src = pixel(0xffffff80);
    const image = pixel(0x00000000).blit(src).blit(src);

    // 128/255 + 128/255 * (1 - 128/255) = 0.7520..., which is 192 out of 255
    expect([...image.bitmap.data]).toEqual([255, 255, 255, 192]);
  });

  test("blends a semi-transparent source over an opaque destination", () => {
    const image = pixel(0x000000ff).blit(pixel(0xffffff80));

    expect([...image.bitmap.data]).toEqual([128, 128, 128, 255]);
  });

  test("an opaque source replaces the destination", () => {
    const image = pixel(0x11223380).blit(pixel(0xaabbccff));

    expect([...image.bitmap.data]).toEqual([0xaa, 0xbb, 0xcc, 0xff]);
  });

  test("a fully transparent source leaves the destination unchanged", () => {
    const opaque = pixel(0x11223344).blit(pixel(0xffffff00));
    const transparent = pixel(0x11223300).blit(pixel(0xffffff00));

    expect([...opaque.bitmap.data]).toEqual([0x11, 0x22, 0x33, 0x44]);
    expect([...transparent.bitmap.data]).toEqual([0x11, 0x22, 0x33, 0x00]);
  });

  test("matches composite", () => {
    const src = pixel(0xff800040);

    for (const color of [0x00000000, 0x0000ff80, 0x0000ffff, 0x123456c0]) {
      expect([...pixel(color).blit(src).bitmap.data]).toEqual([
        ...pixel(color).composite(src).bitmap.data,
      ]);
    }
  });
});
