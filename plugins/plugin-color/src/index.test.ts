import { expect, test, describe } from "vitest";

import { makeDonutTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";

import { ColorAction, MultiplyAction, methods as color } from "./index.js";

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

describe("multiply", () => {
  const pixel = () =>
    jimp.fromBitmap({
      data: Buffer.from([64, 128, 192, 200]),
      width: 1,
      height: 1,
    });
  const multiply = (params: MultiplyAction["params"]) => [
    ...pixel().color([{ apply: "multiply", params }]).bitmap.data,
  ];

  test("multiplies each channel by a factor and keeps alpha", () => {
    expect(multiply([1.5, 0.5, 2])).toStrictEqual([96, 64, 255, 200]);
  });

  test("rounds and clamps", () => {
    expect(multiply([1.1, 1.1, 1.1])).toStrictEqual([70, 141, 211, 200]);
    expect(multiply([-1, 0, 10])).toStrictEqual([0, 0, 255, 200]);
  });

  test("multiplies with a color like the multiply blend mode", () => {
    expect(multiply(["#ff8000"])).toStrictEqual([64, 64, 0, 200]);
    expect(multiply([{ r: 255, g: 128, b: 0 }])).toStrictEqual(
      multiply(["#ff8000"]),
    );
    expect(multiply(["white"])).toStrictEqual([64, 128, 192, 200]);
  });

  test("throws for an invalid CSS color", () => {
    expect(() => multiply(["nope"])).toThrow('Invalid color "nope"');
  });

  test("throws without three factors or a color", () => {
    expect(() =>
      // @ts-expect-error a single factor isn't allowed
      pixel().color([{ apply: "multiply", params: [1.2] }]),
    ).toThrow();
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

  test("desaturate 100 gives the HSL lightness, not greyscale()", () => {
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

describe("contrast", () => {
  const values = [0, 1, 64, 126, 127, 128, 129, 200, 254, 255];
  const makeImage = () =>
    jimp.fromBitmap({
      width: values.length,
      height: 1,
      data: Buffer.from(values.flatMap((v) => [v, v, 255 - v, 100])),
    });
  const reds = (image: ReturnType<typeof makeImage>) =>
    values.map((_, i) => image.bitmap.data[i * 4]!);

  test("0 leaves the image unchanged", () => {
    expect([...makeImage().contrast(0).bitmap.data]).toEqual([
      ...makeImage().bitmap.data,
    ]);
  });

  test("1 splits the channels at the midpoint", () => {
    const image = makeImage().contrast(1);

    expect(reds(image)).toEqual([0, 0, 0, 0, 0, 255, 255, 255, 255, 255]);
    // Blue is the inverse of red, so it's split the same way, inverted
    expect(values.map((_, i) => image.bitmap.data[i * 4 + 2])).toEqual([
      255, 255, 255, 255, 255, 0, 0, 0, 0, 0,
    ]);
    // Alpha is left alone
    expect(values.every((_, i) => image.bitmap.data[i * 4 + 3] === 100)).toBe(
      true,
    );
  });

  test("-1 turns the image mid grey", () => {
    expect(reds(makeImage().contrast(-1))).toEqual(values.map(() => 128));
  });

  test("scales the distance from the midpoint", () => {
    // 0.5 triples it: 127 is 0.5 below the midpoint, so it becomes 126
    expect(reds(makeImage().contrast(0.5))).toEqual([
      0, 0, 0, 123, 126, 129, 132, 255, 255, 255,
    ]);
    // -0.5 divides it by 3: 0 becomes 127.5 - 127.5 / 3 = 85
    expect(reds(makeImage().contrast(-0.5))).toEqual([
      85, 85, 106, 127, 127, 128, 128, 152, 170, 170,
    ]);
  });

  test("treats dark and light channels symmetrically", () => {
    for (const val of [-0.75, -0.3, 1 / 3, 0.5, 0.6, 0.9]) {
      const image = makeImage().contrast(val);

      values.forEach((_, i) => {
        expect(image.bitmap.data[i * 4]! + image.bitmap.data[i * 4 + 2]!).toBe(
          255,
        );
      });
    }
  });
});

describe("posterize", () => {
  const values = [0, 42, 43, 64, 127, 128, 170, 200, 212, 213, 254, 255];
  const posterize = (n: number) =>
    [
      ...jimp
        .fromBitmap({
          width: values.length,
          height: 1,
          data: Buffer.from(values.flatMap((v) => [v, v, v, 77])),
        })
        .posterize(n).bitmap.data,
    ].filter((_, i) => i % 4 === 0);

  test("rounds to the nearest of n levels", () => {
    expect(posterize(2)).toEqual([
      0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 255,
    ]);
    // 0, 85, 170 and 255
    expect(posterize(4)).toEqual([
      0, 0, 85, 85, 85, 170, 170, 170, 170, 255, 255, 255,
    ]);
  });

  test("keeps alpha", () => {
    const image = jimp
      .fromBitmap({ width: 1, height: 1, data: Buffer.from([10, 20, 30, 77]) })
      .posterize(3);

    expect([...image.bitmap.data]).toEqual([0, 0, 0, 77]);
  });

  test("uses at least 2 and a whole number of levels", () => {
    expect(posterize(1)).toEqual(posterize(2));
    expect(posterize(2.4)).toEqual(posterize(2));
    expect(posterize(256)).toEqual(values);
    expect(posterize(1000)).toEqual(values);
  });
});

describe("greyscale", () => {
  // Pure red, green and blue, an orange, and a pixel at alpha 128
  const makeImage = () =>
    jimp.fromBitmap({
      width: 5,
      height: 1,
      data: Buffer.from([
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 128, 0, 255, 10,
        200, 90, 128,
      ]),
    });

  test("uses the rounded Rec. 709 luminance and keeps alpha", () => {
    // 0.2126 * 255 = 54.213, 0.7152 * 255 = 182.376, 0.0722 * 255 = 18.411,
    // 54.213 + 0.7152 * 128 = 145.7586, 2.126 + 143.04 + 6.498 = 151.664
    expect([...makeImage().greyscale().bitmap.data]).toStrictEqual([
      54, 54, 54, 255, 182, 182, 182, 255, 18, 18, 18, 255, 146, 146, 146, 255,
      152, 152, 152, 128,
    ]);
  });

  test("leaves grey pixels unchanged", () => {
    const data = Buffer.alloc(256 * 4);

    for (let v = 0; v < 256; v++) {
      data.set([v, v, v, 255], v * 4);
    }

    const image = jimp.fromBitmap({ width: 256, height: 1, data });

    expect([...image.clone().greyscale().bitmap.data]).toStrictEqual([...data]);
  });

  test("the greyscale color action matches greyscale()", () => {
    const data = Buffer.alloc(4096 * 4);

    // 16 levels per channel, with varied alpha
    for (let i = 0; i < 4096; i++) {
      data.set(
        [(i >> 8) * 17, ((i >> 4) & 15) * 17, (i & 15) * 17, i & 255],
        i * 4,
      );
    }

    const image = jimp.fromBitmap({ width: 4096, height: 1, data });

    expect([
      ...image.clone().color([{ apply: "greyscale" }]).bitmap.data,
    ]).toStrictEqual([...image.clone().greyscale().bitmap.data]);
  });
});
