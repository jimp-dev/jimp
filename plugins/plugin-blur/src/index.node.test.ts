import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";

import * as blur from "./index.js";

const Jimp = createJimp({ formats: [png, jpeg], plugins: [blur.methods] });

describe("hasAlpha", () => {
  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.blur(16).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("gaussian image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.gaussian(6).getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});

describe("sharpen", () => {
  test("photo", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const output = await image
      .sharpen({ amount: 1.5, radius: 2 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image
      .sharpen({ amount: 2, radius: 3 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});
