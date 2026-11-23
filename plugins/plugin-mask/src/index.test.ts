import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

describe("Mask", () => {
  const imgSrcOpaq = jimp.fromBitmap(
    // prettier-ignore
    makeTestImage(
      "▴□▾□■□",
      "■▴■▾■□",
      "■□▴□▾□",
      "■□■▴■▾"
    ),
  );
  const imgSrcAlpa = jimp.fromBitmap(
    // prettier-ignore
    makeTestImage(
      "▴▵▾▿",
      "▴▵▾▿",
      "▴▵▾▿"
    ),
  );
  const maskGrayBig = jimp.fromBitmap(
    // prettier-ignore
    makeTestImage(
      "048840",
      "8CFFC8",
      "8CFFC8",
      "048840"
    ),
  );
  const maskGraySmall = jimp.fromBitmap(
    // prettier-ignore
    makeTestImage(
      "0369",
      "369C",
      "69CF"
    ),
  );
  const maskColor = jimp.fromBitmap(
    // prettier-ignore
    makeTestImage(
      "▴▴▾▾",
      "▪▪▰▰",
      "□□□□"
    ),
  );

  test("Affect opaque image with a gray mask with the same size", () => {
    expect(imgSrcOpaq.clone().mask(maskGrayBig)).toMatchSnapshot();
  });

  test("Affect opaque image with a gray mask with the same size, blited", () => {
    expect(
      imgSrcOpaq.clone().mask({ src: maskGrayBig, x: 1, y: 1 }),
    ).toMatchSnapshot();
  });

  test("Affect opaque image with a gray mask with the same size, blited negative", () => {
    expect(
      imgSrcOpaq.clone().mask({ src: maskGrayBig, x: -1, y: -1 }),
    ).toMatchSnapshot();
  });

  test("Affect opaque image with a smaller gray mask", () => {
    expect(imgSrcOpaq.clone().mask(maskGraySmall)).toMatchSnapshot();
  });

  test("Affect opaque image with a smaller gray mask, blited", () => {
    expect(
      imgSrcOpaq.clone().mask({ src: maskGraySmall, x: 1, y: 1 }),
    ).toMatchSnapshot();
  });

  test("Affect alpha image with a bigger gray mask", () => {
    expect(imgSrcAlpa.clone().mask(maskGrayBig)).toMatchSnapshot();
  });

  test("Affect alpha image with a bigger gray mask, blited", () => {
    expect(
      imgSrcAlpa.clone().mask({ src: maskGrayBig, x: -1, y: -1 }),
    ).toMatchSnapshot();
  });

  test("Affect opaque image with a colored mask", () => {
    expect(
      imgSrcOpaq.clone().mask({ src: maskColor, x: 1, y: 1 }),
    ).toMatchSnapshot();
  });
});

function solid(width: number, height: number, rgba: number[]) {
  const image = new jimp({ width, height });

  image.scan((_, __, idx) => {
    image.bitmap.data.set(rgba, idx);
  });

  return image;
}

function alphas(image: { bitmap: { data: Uint8Array | Buffer } }) {
  return Array.from(image.bitmap.data.filter((_, i) => i % 4 === 3));
}

describe("Mask semantics", () => {
  test("an opaque grey mask on an opaque image sets alpha to the grey value", () => {
    const image = solid(256, 1, [200, 30, 60, 255]);
    const mask = new jimp({ width: 256, height: 1 });

    mask.scan((x, _, idx) => {
      mask.bitmap.data.set([x, x, x, 255], idx);
    });

    expect(alphas(image.mask(mask))).toEqual(
      Array.from({ length: 256 }, (_, v) => v),
    );
  });

  test("an opaque grey mask multiplies existing alpha and rounds", () => {
    const image = new jimp({ width: 256, height: 256 });
    const mask = new jimp({ width: 256, height: 256 });

    image.scan((x, _, idx) => {
      image.bitmap.data.set([200, 30, 60, x], idx);
    });
    mask.scan((_, y, idx) => {
      mask.bitmap.data.set([y, y, y, 255], idx);
    });

    const expected: number[] = [];

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        expected.push(Math.round((x * y) / 255));
      }
    }

    expect(alphas(image.mask(mask))).toEqual(expected);
  });

  test("colour mask pixels use GIMP's linear-light luminance, not the average", () => {
    const colours = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [0, 255, 255],
      [255, 0, 255],
      [255, 255, 0],
      [255, 128, 0],
    ];
    const image = solid(colours.length, 1, [255, 255, 255, 255]);
    const mask = new jimp({ width: colours.length, height: 1 });

    colours.forEach((colour, x) => {
      mask.bitmap.data.set([...colour, 255], x * 4);
    });

    // The averages would be 85, 85, 85, 170, 170, 170 and 128
    expect(alphas(image.mask(mask))).toEqual([
      130, 220, 70, 228, 145, 248, 165,
    ]);
  });

  test("the mask's own alpha also hides the image", () => {
    const image = solid(4, 1, [200, 30, 60, 255]);
    const mask = new jimp({ width: 4, height: 1 });

    mask.bitmap.data.set([
      ...[255, 255, 255, 128],
      ...[255, 255, 255, 0],
      ...[128, 128, 128, 128],
      ...[0, 0, 0, 255],
    ]);

    expect(alphas(image.mask(mask))).toEqual([128, 0, 64, 0]);
  });

  test("only alpha changes", () => {
    const image = solid(2, 2, [200, 30, 60, 255]);

    image.mask(solid(2, 2, [10, 200, 90, 100]));

    expect(Array.from(image.bitmap.data.filter((_, i) => i % 4 !== 3))).toEqual(
      [200, 30, 60, 200, 30, 60, 200, 30, 60, 200, 30, 60],
    );
  });

  test("a mask bigger than the image, offset past both edges", () => {
    const image = solid(3, 2, [0, 0, 0, 255]);
    const mask = new jimp({ width: 6, height: 5 });

    mask.scan((x, y, idx) => {
      const v = y * 50 + x;
      mask.bitmap.data.set([v, v, v, 255], idx);
    });

    // Mask pixel (x + 2, y + 1) lands on image pixel (x, y)
    expect(alphas(image.mask({ src: mask, x: -2, y: -1 }))).toEqual([
      52, 53, 54, 102, 103, 104,
    ]);
  });

  test("parts of the image outside the mask are left alone", () => {
    const image = solid(3, 3, [0, 0, 0, 200]);

    image.mask({ src: solid(2, 2, [0, 0, 0, 255]), x: 2, y: 2 });

    expect(alphas(image)).toEqual([200, 200, 200, 200, 200, 200, 200, 200, 0]);
  });

  test("a mask entirely outside the image does nothing", () => {
    const mask = solid(2, 2, [0, 0, 0, 255]);

    for (const [x, y] of [
      [3, 0],
      [0, 3],
      [-2, 0],
      [0, -2],
      [10, -10],
    ]) {
      expect(
        alphas(solid(3, 3, [0, 0, 0, 255]).mask({ src: mask, x, y })),
      ).toEqual(Array(9).fill(255));
    }
  });

  test("fractional offsets are rounded", () => {
    const image = solid(3, 1, [0, 0, 0, 255]);

    image.mask({ src: solid(1, 1, [0, 0, 0, 255]), x: 1.6, y: 0.4 });

    expect(alphas(image)).toEqual([255, 255, 0]);
  });
});
