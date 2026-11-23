import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import "@jimp/test-utils/image-snapshot";
import { ResizeStrategy } from "@jimp/plugin-resize";

import { methods } from "./index.js";

const Jimp = createJimp({ formats: [png], plugins: [methods] });

/**
 * 32x32 on transparent black: an opaque red disc, a half transparent blue
 * square over it, a 1px white line and a black and white checkerboard
 */
function shapes() {
  const size = 32;
  const data = Buffer.alloc(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      if ((x - 11) ** 2 + (y - 11) ** 2 <= 64) {
        data.set([255, 0, 0, 255], i);
      }

      if (x >= 14 && x < 24 && y >= 14 && y < 24) {
        data.set([0, 64, 255, 128], i);
      }

      if (y === 26 && x >= 2 && x < 30) {
        data.set([255, 255, 255, 255], i);
      }

      if (x >= 22 && x < 30 && y >= 2 && y < 10) {
        const v = (x + y) % 2 ? 255 : 0;
        data.set([v, v, v, 255], i);
      }
    }
  }

  return Jimp.fromBitmap({ width: size, height: size, data });
}

describe("Rotate 30 degrees with each mode", () => {
  const modes = [
    "NEAREST_NEIGHBOR",
    "BILINEAR",
    "BICUBIC",
    "HERMITE",
    "BEZIER",
    "LANCZOS",
    "LANCZOS2",
    "MITCHELL",
  ] as const;

  modes.forEach((modeType) => {
    test(modeType, async () => {
      const output = await shapes()
        .rotate({ deg: 30, mode: ResizeStrategy[modeType] })
        .getBuffer("image/png");

      expect(output).toMatchImageSnapshot();
    });
  });
});
