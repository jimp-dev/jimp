import { expect, test, describe } from "vitest";

import { makeDonutTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { ColorAction, methods as color } from "./index.js";

const jimp = createJimp({ plugins: [color] });

describe("canvas color transformation", () => {
  const redDonutJGD = makeDonutTestImage(0x00000000, 0xff000088, 0xff0000ff);

  test("can apply more than one color transformation", () => {
    const image = jimp.fromBitmap(redDonutJGD);
    const newJGD = image.color([
      { apply: "hue", params: [-180] },
      { apply: "lighten", params: [25] },
    ]);

    expect(newJGD.bitmap).toMatchSnapshot();
  });

  test("lighten", () => {
    const image = jimp.fromBitmap(redDonutJGD);
    expect(image.color([{ apply: "lighten", params: [25] }])).toMatchSnapshot();
  });

  test("brighten", () => {
    const image = jimp.fromBitmap(redDonutJGD);
    expect(
      image.color([{ apply: "brighten", params: [25] }]),
    ).toMatchSnapshot();
  });

  test("spin hue", () => {
    const image = jimp.fromBitmap(redDonutJGD);
    expect(image.color([{ apply: "hue", params: [150] }])).toMatchSnapshot();
  });

  test("does not modify the actions passed in", () => {
    const actions: ColorAction[] = [
      { apply: "hue", params: [150] },
      { apply: "mix", params: [{ r: 0, g: 0, b: 255 }, 50] },
      { apply: "xor", params: [{ r: 1, g: 2, b: 3 }] },
    ];
    const copy = structuredClone(actions);

    jimp.fromBitmap(redDonutJGD).color(actions);

    expect(actions).toStrictEqual(copy);
  });
});

describe("mix and xor colors", () => {
  const pixel = (colorSpace?: "display-p3") =>
    new jimp({
      data: Buffer.from([0x40, 0x80, 0xc0, 0xff]),
      width: 1,
      height: 1,
      colorSpace,
    });

  test("accept a CSS color", () => {
    expect(
      pixel().color([{ apply: "xor", params: ["#06D"] }]).bitmap.data,
    ).toStrictEqual(
      pixel().color([{ apply: "xor", params: [{ r: 0, g: 0x66, b: 0xdd }] }])
        .bitmap.data,
    );
    expect(
      pixel().color([{ apply: "mix", params: ["white", 25] }]).bitmap.data,
    ).toStrictEqual(
      pixel().color([
        { apply: "mix", params: [{ r: 255, g: 255, b: 255 }, 25] },
      ]).bitmap.data,
    );
  });

  test("convert CSS colors to the image's colour space", () => {
    const image = pixel("display-p3");
    image.color([{ apply: "mix", params: ["red", 100] }]);

    // sRGB red in Display P3
    expect([...image.bitmap.data]).toStrictEqual([0xea, 0x33, 0x23, 0xff]);
  });

  test("throw for an invalid CSS color", () => {
    expect(() =>
      pixel().color([{ apply: "xor", params: ["notacolor"] }]),
    ).toThrow('Invalid color "notacolor"');
    expect(() =>
      pixel().color([{ apply: "mix", params: ["nope", 50] }]),
    ).toThrow('Invalid color "nope"');
  });
});

describe("saturation", () => {
  // Scaling HSL saturation scales each channel's distance from the midpoint
  // of the max and min channels, so the expected values are easy to derive.
  // Pixels: a muted red (midpoint 150), a grey, and a fully saturated red.
  const makeImage = () =>
    jimp.fromBitmap({
      width: 3,
      height: 1,
      data: Buffer.from([
        200, 100, 100, 255, 128, 128, 128, 255, 255, 0, 0, 128,
      ]),
    });

  test("desaturate scales saturation instead of subtracting from it", () => {
    const image = makeImage().color([{ apply: "desaturate", params: [50] }]);

    expect([...image.bitmap.data]).toStrictEqual([
      175, 125, 125, 255, 128, 128, 128, 255, 191, 64, 64, 128,
    ]);
  });

  test("desaturate 100 is greyscale", () => {
    const image = makeImage().color([{ apply: "desaturate", params: [100] }]);

    expect([...image.bitmap.data]).toStrictEqual([
      150, 150, 150, 255, 128, 128, 128, 255, 128, 128, 128, 128,
    ]);
  });

  test("saturate scales saturation and leaves greys alone", () => {
    const image = makeImage().color([{ apply: "saturate", params: [50] }]);

    expect([...image.bitmap.data]).toStrictEqual([
      225, 75, 75, 255, 128, 128, 128, 255, 255, 0, 0, 128,
    ]);
  });

  test("saturate and desaturate default to 10", () => {
    expect([
      ...makeImage().color([{ apply: "desaturate" }]).bitmap.data,
    ]).toStrictEqual([
      195, 105, 105, 255, 128, 128, 128, 255, 242, 13, 13, 128,
    ]);
    expect([
      ...makeImage().color([{ apply: "saturate" }]).bitmap.data,
    ]).toStrictEqual([205, 95, 95, 255, 128, 128, 128, 255, 255, 0, 0, 128]);
  });
});

describe("lightness", () => {
  // Pixels: a near-white, an orange, and a pure red with alpha 128.
  const makeImage = () =>
    jimp.fromBitmap({
      width: 3,
      height: 1,
      data: Buffer.from([250, 252, 255, 255, 100, 50, 0, 255, 255, 0, 0, 128]),
    });

  test("darken blends toward black without making colors vivid", () => {
    const image = makeImage().color([{ apply: "darken", params: [40] }]);

    expect([...image.bitmap.data]).toStrictEqual([
      150, 151, 153, 255, 60, 30, 0, 255, 153, 0, 0, 128,
    ]);
  });

  test("lighten blends toward white", () => {
    const image = makeImage().color([{ apply: "lighten", params: [40] }]);

    expect([...image.bitmap.data]).toStrictEqual([
      252, 253, 255, 255, 162, 132, 102, 255, 255, 102, 102, 128,
    ]);
  });

  test("lighten and darken default to 10", () => {
    expect(makeImage().color([{ apply: "darken" }]).bitmap).toStrictEqual(
      makeImage().color([{ apply: "darken", params: [10] }]).bitmap,
    );
    expect(makeImage().color([{ apply: "lighten" }]).bitmap).toStrictEqual(
      makeImage().color([{ apply: "lighten", params: [10] }]).bitmap,
    );
  });
});

describe("brightness", () => {
  test("brightness of 1 should be the same as no change", () => {
    const jgd = makeDonutTestImage(0xff000088, 0xff000088, 0xff000088);
    const image = jimp.fromBitmap(jgd);
    const image2 = jimp.fromBitmap(jgd);

    expect(image.brightness(1).bitmap).toStrictEqual(image2.bitmap);
  });

  test("should be able to brighten", () => {
    const jgd = makeDonutTestImage(0xaa000088, 0xaa000088, 0xaa000088);
    const image = jimp.fromBitmap(jgd);

    expect(image.brightness(2).bitmap).toMatchSnapshot();
  });

  test("should be able to darken", () => {
    const jgd = makeDonutTestImage(0xaa000088, 0xaa000088, 0xaa000088);
    const image = jimp.fromBitmap(jgd);

    expect(image.brightness(0.2).bitmap).toMatchSnapshot();
  });
});
