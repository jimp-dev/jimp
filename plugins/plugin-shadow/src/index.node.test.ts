import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import png from "@jimp/js-png";

import * as shadow from "./index.js";

const Jimp = createJimp({ formats: [png], plugins: [shadow.methods] });

describe("Shadow", () => {
  test("draws the shadow under an image with a transparent background", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    const output = await image.shadow().getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("shows the shadow through transparent areas inside the image", async () => {
    // An opaque green ring with a transparent hole, on a transparent background
    const image = new Jimp({ width: 200, height: 200, color: 0x00000000 });

    image.scan((x, y, idx) => {
      const distance = Math.hypot(x - 100, y - 100);

      if (distance >= 35 && distance <= 70) {
        image.bitmap.data[idx + 1] = 0xc0;
        image.bitmap.data[idx + 3] = 0xff;
      }
    });

    const output = await image
      .shadow({ x: -15, y: 15, size: 1, blur: 5 })
      .getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});
