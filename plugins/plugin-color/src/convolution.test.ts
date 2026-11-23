import { Buffer } from "buffer";
import { expect, test, describe } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { Edge } from "@jimp/types";
import { createJimp } from "@jimp/core";

import { methods } from "./index.js";

const jimp = createJimp({ formats: [png, jpeg], plugins: [methods] });

describe("Convolution", function () {
  const imgMid = jimp.fromBitmap(
    makeTestImage(
      "22222222",
      "22222222",
      "22888822",
      "22888822",
      "22888822",
      "22888822",
      "22222222",
      "22222222",
    ),
  );
  /** stores the Jimp instances of the JGD images above. */
  const imgTopLeft = jimp.fromBitmap(
    makeTestImage(
      "88222222",
      "88222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
      "22222222",
    ),
  );

  const sharpM = [
    [-1, -1, 0],
    [-1, 1, 1],
    [0, 1, 1],
  ];

  test("3x3 sharp matrix on EDGE_EXTEND", () => {
    expect(imgMid.clone().convolution(sharpM)).toMatchSnapshot();
    expect(imgTopLeft.clone().convolution(sharpM)).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_WRAP", () => {
    expect(
      imgMid.clone().convolution({ kernel: sharpM, edgeHandling: Edge.WRAP }),
    ).toMatchSnapshot();
    expect(
      imgTopLeft
        .clone()
        .convolution({ kernel: sharpM, edgeHandling: Edge.WRAP }),
    ).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_CROP", () => {
    expect(
      imgMid.clone().convolution({ kernel: sharpM, edgeHandling: Edge.CROP }),
    ).toMatchSnapshot();
    expect(
      imgTopLeft
        .clone()
        .convolution({ kernel: sharpM, edgeHandling: Edge.CROP }),
    ).toMatchSnapshot();
  });
});

describe("Convolution divisor and bias", () => {
  // A 3x1 image with a brighter, more opaque pixel in the middle
  const makeImage = () =>
    jimp.fromBitmap({
      width: 3,
      height: 1,
      data: Buffer.from([10, 20, 30, 200, 100, 120, 140, 240, 10, 20, 30, 200]),
    });

  // Every row is the same, so with EXTEND edges an end pixel's sum is
  // 12 * itself + 4 * the middle, and the middle's is 8 * end + 8 * itself.
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];

  test("convolution divides the sum and adds the bias", () => {
    // 520 / 16 = 32.5, 720 / 16 = 45, 920 / 16 = 57.5 at the ends
    expect([
      ...makeImage().convolution({ kernel, divisor: 16 }).bitmap.data,
    ]).toEqual([32, 45, 57, 200, 55, 70, 85, 240, 32, 45, 57, 200]);
    expect([
      ...makeImage().convolution({ kernel, divisor: 16, bias: -30 }).bitmap
        .data,
    ]).toEqual([2, 15, 27, 200, 25, 40, 55, 240, 2, 15, 27, 200]);
  });

  test("convolute divides the sum and adds the bias to the colors", () => {
    // Alpha is convolved too: 3360 / 16 = 210 and 3520 / 16 = 220
    expect([
      ...makeImage().convolute({ kernel, divisor: 16 }).bitmap.data,
    ]).toEqual([32, 45, 57, 210, 55, 70, 85, 220, 32, 45, 57, 210]);
    expect([
      ...makeImage().convolute({ kernel, divisor: 16, bias: 100 }).bitmap.data,
    ]).toEqual([132, 145, 157, 210, 155, 170, 185, 220, 132, 145, 157, 210]);
  });

  test("a negative divisor with a bias inverts the image", () => {
    expect([
      ...makeImage().convolution({ kernel: [[1]], divisor: -1, bias: 255 })
        .bitmap.data,
    ]).toEqual([245, 235, 225, 200, 155, 135, 115, 240, 245, 235, 225, 200]);
  });

  test("the default divisor and bias leave the output unchanged", () => {
    const width = 16;
    const height = 16;
    const data = Buffer.from(
      Array.from({ length: width * height * 4 }, (_, i) => (i * 97 + 13) % 256),
    );
    const image = jimp.fromBitmap({ width, height, data });
    const kernel = [
      [0.1, -0.7, 0.3],
      [-1.1, 2.9, -0.2],
      [0.05, -0.6, 0.4],
    ];

    expect(
      image.clone().convolution({ kernel, divisor: 1, bias: 0 }).bitmap.data,
    ).toEqual(image.clone().convolution(kernel).bitmap.data);
    expect(
      image.clone().convolute({ kernel, divisor: 1, bias: 0 }).bitmap.data,
    ).toEqual(image.clone().convolute(kernel).bitmap.data);
  });

  test("rejects a divisor of 0", () => {
    expect(() => makeImage().convolution({ kernel, divisor: 0 })).toThrow(
      "divisor must not be 0",
    );
    expect(() => makeImage().convolute({ kernel, divisor: 0 })).toThrow(
      "divisor must not be 0",
    );
  });
});
