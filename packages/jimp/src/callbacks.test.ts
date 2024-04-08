import { expect, test, describe } from "vitest";
import { makeTestImage } from "@jimp/test-utils";

import { HorizontalAlign, Jimp, VerticalAlign } from "./index.js";
import { CropOptions } from "@jimp/plugin-crop";
import { FlipOptions } from "@jimp/plugin-flip";
import { ResizeOptions, ScaleToFitOptions } from "@jimp/plugin-resize";
import { CoverOptions } from "@jimp/plugin-cover";
import { ContainOptions } from "@jimp/plugin-contain";

describe("Callbacks", () => {
  const targetImg = Jimp.fromBitmap(makeTestImage("▴▸▾", "◆▪▰", "▵▹▿"));
  const miniImg = Jimp.fromBitmap(makeTestImage("□▥", "▥■"));

  const operations = {
    crop: {
      args: [{ x: 1, y: 1, w: 2, h: 1 } as CropOptions],
    },
    invert: { args: [] },
    flip: {
      args: [{ horizontal: true, vertical: false } as FlipOptions],
    },
    gaussian: { args: [1] },
    blur: { args: [1] },
    greyscale: { args: [] },
    sepia: { args: [] },
    opacity: { args: [0.5] },
    resize: { args: [{ w: 2, h: 2 } as ResizeOptions] },
    scale: { args: [0.5] },
    brightness: { args: [0.5] },
    contrast: { args: [0.75] },
    posterize: { args: [5] },
    dither: { args: [] },
    // background: { args: [0xffffffff] },
    cover: {
      args: [
        {
          w: 3,
          h: 2,
          align: HorizontalAlign.LEFT | VerticalAlign.TOP,
        } as CoverOptions,
      ],
    },
    contain: {
      args: [
        {
          w: 3,
          h: 2,
          align: HorizontalAlign.LEFT | VerticalAlign.TOP,
        } as ContainOptions,
      ],
    },
    opaque: { args: [] },
    fade: { args: [0.5] },
    scaleToFit: { args: [{ w: 3, h: 2 } as ScaleToFitOptions] },
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
