import { expect, test, describe } from "vitest";
import { makeTestImage } from "@jimp/test-utils";

import { HorizontalAlign, Jimp, VerticalAlign } from "./index.js";

describe("Callbacks", () => {
  const targetImg = Jimp.fromBitmap(makeTestImage("▴▸▾", "◆▪▰", "▵▹▿"));
  const miniImg = Jimp.fromBitmap(makeTestImage("□▥", "▥■"));

  const operations = {
    crop: { args: [1, 1, 2, 1] },
    invert: { args: [] },
    flip: { args: [true, false] },
    mirror: { args: [true, false] },
    gaussian: { args: [1] },
    blur: { args: [1] },
    greyscale: { args: [] },
    sepia: { args: [] },
    opacity: { args: [0.5] },
    resize: { args: [2, 2] },
    scale: { args: [0.5] },
    brightness: { args: [0.5] },
    contrast: { args: [0.75] },
    posterize: { args: [5] },
    dither: { args: [] },
    // background: { args: [0xffffffff] },
    cover: {
      args: [3, 2, HorizontalAlign.LEFT | VerticalAlign.TOP],
    },
    contain: {
      args: [3, 2, HorizontalAlign.LEFT | VerticalAlign.TOP],
    },
    opaque: { args: [] },
    fade: { args: [0.5] },
    scaleToFit: { args: [3, 2] },
    blit: { args: [{ src: miniImg }] },
    composite: { args: [miniImg, 0, 0] },
  };

  Object.entries(operations).forEach(([op, { args }]) => {
    test("with " + op, () => {
      const clone = targetImg.clone();

      expect(
        (clone[op as keyof typeof clone] as any)(...args)
      ).toMatchSnapshot();
    });
  });
});
