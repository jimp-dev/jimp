import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import { promises as fs } from "fs";

import { makeTestImage } from "@jimp/test-utils";

import blit from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [blit] });

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
      "▾▾▾▾◆◆◆◆"
    )
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
    expect(targetImg.clone().blit({ src: srcImg })).toMatchSnapshot();
  });

  test("blit on middle, with no crop", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: 1, y: 1 })
    ).toMatchSnapshot();
  });

  test("blit on middle, with x,y crop", () => {
    expect(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 2, y: 2, srcX: 1, srcY: 1, srcW: 5, srcH: 5 })
    ).toMatchSnapshot();
  });

  test("blit on middle, with x,y,w,h crop", () => {
    expect(
      targetImg
        .clone()
        .blit({ src: srcImg, x: 2, y: 2, srcX: 1, srcY: 1, srcW: 4, srcH: 4 })
    ).toMatchSnapshot();
  });

  test("blit partially out, on top-left", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: -1, y: -1 })
    ).toMatchSnapshot();
  });

  test("blit partially out, on bottom-right", () => {
    expect(
      targetImg.clone().blit({ src: srcImg, x: 3, y: 3 })
    ).toMatchSnapshot();
  });

  test("blit alpha", async () => {
    const dice = await Jimp.fromBuffer(
      await fs.readFile(__dirname + "/images/dice.png")
    );
    const image = await Jimp.fromBuffer(
      await fs.readFile(__dirname + "/images/cops.jpg")
    );
    const output = await image.blit({ src: dice }).toBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  async function createCat(catNum: number, len: number) {
    const imgHeight = 60;

    const butt = await Jimp.fromBuffer(
      await fs.readFile(__dirname + "/images/cat_butt.png")
    );
    const head = await Jimp.fromBuffer(
      await fs.readFile(__dirname + "/images/cat_head.png")
    );
    const fuzz = await Jimp.fromBuffer(
      await fs.readFile(__dirname + "/images/cat_fuzz.png")
    );

    let longCat = len;
    longCat = longCat > 20 ? 20 : longCat;
    longCat = longCat <= 1 ? 1 : longCat;

    const cat =
      Math.floor(catNum * (head.bitmap.height / imgHeight)) * imgHeight;

    const newImage = new Jimp({
      width:
        butt.bitmap.width + head.bitmap.width + fuzz.bitmap.width * longCat,
      height: imgHeight,
      color: 0x00000000,
    });

    newImage.blit({
      src: butt,
      x: 0,
      y: 0,
      srcX: 0,
      srcY: cat,
      srcW: butt.bitmap.width,
      srcH: imgHeight,
    });
    for (let i = 0; i < longCat; i++) {
      newImage.blit({
        src: fuzz,
        x: butt.bitmap.width + fuzz.bitmap.width * i,
        y: 0,
        srcX: 0,
        srcY: cat,
        srcW: fuzz.bitmap.width,
        srcH: imgHeight,
      });
    }

    newImage.blit({
      src: head,
      x: butt.bitmap.width + fuzz.bitmap.width * longCat,
      y: 0,
      srcX: 0,
      srcY: cat,
      srcW: head.bitmap.width,
      srcH: imgHeight,
    });

    return newImage;
  }

  test("uses src params correctly", async () => {
    const small = await createCat(0.3, 1);
    expect(await small.toBuffer("image/png")).toMatchImageSnapshot();

    const medium = await createCat(0.6, 7);
    expect(await medium.toBuffer("image/png")).toMatchImageSnapshot();

    const large = await createCat(0.9, 20);
    expect(await large.toBuffer("image/png")).toMatchImageSnapshot();
  });
});
