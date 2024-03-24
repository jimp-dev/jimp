import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { Edge } from "@jimp/types";
import { promises as fs } from "fs";

import color from "./index.js";
import { createJimp } from "@jimp/core";

const jimp = createJimp({ formats: [png, jpeg], plugins: [color] });

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
      "22222222"
    )
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
      "22222222"
    )
  );

  const sharpM = [
    [-1, -1, 0],
    [-1, 1, 1],
    [0, 1, 1],
  ];

  const blurM = [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ];

  test("3x3 sharp matrix on EDGE_EXTEND", () => {
    expect(imgMid.clone().convolution(sharpM)).toMatchSnapshot();
    expect(imgTopLeft.clone().convolution(sharpM)).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_WRAP", () => {
    expect(imgMid.clone().convolution(sharpM, Edge.WRAP)).toMatchSnapshot();
    expect(imgTopLeft.clone().convolution(sharpM, Edge.WRAP)).toMatchSnapshot();
  });

  test("3x3 sharp matrix on EDGE_CROP", () => {
    expect(imgMid.clone().convolution(sharpM, Edge.CROP)).toMatchSnapshot();
    expect(imgTopLeft.clone().convolution(sharpM, Edge.CROP)).toMatchSnapshot();
  });

  test("3x3 box blur matrix using convolute", async () => {
    const imageBuffer = await fs.readFile(__dirname + "/images/tiles.jpg");
    const image = await jimp.fromBuffer(imageBuffer);
    const output = await image.convolute(blurM).toBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("new pixel value is greater than 255", async () => {
    const imageBuffer = await fs.readFile(__dirname + "/images/qr.jpg");
    const image = await jimp.fromBuffer(imageBuffer);

    const convolutionMatrix = [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ];

    const output = await image
      .convolution(convolutionMatrix)
      .toBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });
});
