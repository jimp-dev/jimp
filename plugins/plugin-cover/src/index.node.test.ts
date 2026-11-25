import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import "@jimp/test-utils/image-snapshot";
import { getTestImagePath } from "@jimp/test-utils";

import { methods } from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [methods] });

describe("smart align on a photo", () => {
  // two figures side by side, cropped to a tall card that only fits one
  test.each(["entropy", "attention"] as const)("%s", async (align) => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const output = await image
      .cover({ w: 120, h: 300, align })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("analyses a large photo quickly", async () => {
    const image = await Jimp.read(getTestImagePath("panoramic.jpg"));
    const start = performance.now();

    image.coverRect({ w: 200, h: 200, align: "attention" });
    image.coverRect({ w: 200, h: 200, align: "entropy" });

    // a generous bound: it takes a few ms, but CI machines vary
    expect(performance.now() - start).toBeLessThan(500);
  });
});
