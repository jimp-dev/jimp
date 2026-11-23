import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import "@jimp/test-utils/image-snapshot";
import { getTestImagePath } from "@jimp/test-utils";

import { methods, ResizeStrategy } from "./index.js";

const Jimp = createJimp({ formats: [png], plugins: [methods] });

/**
 * 24x24 on transparent black: an opaque red disc, a half transparent blue
 * square over it and a 1px white diagonal line
 */
function shapes() {
  const size = 24;
  const data = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      if ((x - 9) ** 2 + (y - 9) ** 2 <= 49) {
        data.set([255, 0, 0, 255], i);
      }

      if (x >= 12 && x < 20 && y >= 12 && y < 20) {
        data.set([0, 64, 255, 128], i);
      }

      if (x === y) {
        data.set([255, 255, 255, 255], i);
      }
    }
  }

  return Jimp.fromBitmap({ width: size, height: size, data });
}

describe("Resize with convolution filters", () => {
  const modes = ["LANCZOS", "LANCZOS2", "MITCHELL"] as const;

  modes.forEach((modeType) => {
    const mode = ResizeStrategy[modeType];

    test(`${modeType} downscales a photo with transparency`, async () => {
      // 800x600 to 200x150
      const image = await Jimp.read(getTestImagePath("dice.png"));
      const output = await image
        .resize({ w: 200, mode })
        .getBuffer("image/png");

      expect(output).toMatchImageSnapshot();
    });

    test(`${modeType} upscales hard edges with transparency`, async () => {
      // 24x24 to 96x96
      const output = await shapes()
        .resize({ w: 96, mode })
        .getBuffer("image/png");

      expect(output).toMatchImageSnapshot();
    });
  });
});
