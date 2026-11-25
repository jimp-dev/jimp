import { expect, test, describe } from "vitest";

import "@jimp/test-utils/image-snapshot";
import { getTestImagePath } from "@jimp/test-utils";

import { Jimp, BlendMode } from "./index.js";

describe("composite", () => {
  test("can apply more than one color transformation", async () => {
    const mask = new Jimp({ height: 100, width: 100, color: 0x0000ff });
    const cops = await Jimp.read(getTestImagePath("cops.jpg"));

    cops.composite(mask, 0, 0, {
      mode: BlendMode.SRC_OVER,
      opacitySource: 0.5,
      opacityDest: 0.5,
    });

    const output = await cops.getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("should handle edges correctly", async () => {
    const background = new Jimp({ height: 100, width: 100, color: 0x0000ff });
    const cops = await Jimp.read(getTestImagePath("cops.jpg"));

    background.composite(cops, 0, -(cops.bitmap.height / 2), {
      mode: BlendMode.SRC_OVER,
      opacityDest: 1,
      opacitySource: 0.8,
    });

    const output = await background.getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  describe("blends a photo with a color chart", () => {
    // Hue changes across, and it goes from white at the top to black at
    // the bottom, through fully saturated colors in the middle
    function colorChart(width: number, height: number) {
      const chart = new Jimp({ width, height });

      chart.scan((x, y, idx) => {
        const hue = (x / width) * 6;
        const lightness = 1 - y / (height - 1);

        for (let channel = 0; channel < 3; channel++) {
          const k = (hue + [0, 4, 2][channel]!) % 6;
          const pure = 1 - Math.max(0, Math.min(1, Math.min(k, 4 - k)));
          const value =
            lightness > 0.5
              ? pure + (1 - pure) * (lightness - 0.5) * 2
              : pure * lightness * 2;

          chart.bitmap.data[idx + channel] = Math.round(value * 255);
        }

        chart.bitmap.data[idx + 3] = 255;
      });

      return chart;
    }

    for (const mode of Object.values(BlendMode)) {
      test(mode, async () => {
        const cops = await Jimp.read(getTestImagePath("cops.jpg"));
        cops.resize({ w: 128 });
        const chart = colorChart(cops.bitmap.width, cops.bitmap.height);

        cops.composite(chart, 0, 0, { mode });

        const output = await cops.getBuffer("image/png");
        expect(output).toMatchImageSnapshot();
      });
    }
  });
});
