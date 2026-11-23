import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";

import { methods as threshold, otsuThreshold } from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [threshold] });

describe("Otsu", () => {
  test("thresholds a photo at the level Otsu picks", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));

    // scikit-image's threshold_otsu gives 92 on this image's greyscale values
    expect(otsuThreshold(image)).toBe(93);

    const output = await image
      .threshold({ max: "otsu", replace: 255 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });
});
