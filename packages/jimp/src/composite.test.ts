import { expect, test, describe } from "vitest";
import fs from "fs";

import { getTestImagePath } from "@jimp/test-utils";

import { Jimp, BlendMode } from "./index.js";

describe("composite", () => {
  test("can apply more than one color transformation", async () => {
    const mask = new Jimp({ height: 100, width: 100, color: 0x0000ff });
    const cops = await Jimp.fromBuffer(
      fs.readFileSync(getTestImagePath("cops.jpg"))
    );

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
    const cops = await Jimp.fromBuffer(
      fs.readFileSync(getTestImagePath("cops.jpg"))
    );

    background.composite(cops, 0, -(cops.bitmap.height / 2), {
      mode: BlendMode.SRC_OVER,
      opacityDest: 1,
      opacitySource: 0.8,
    });

    const output = await background.getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });
});
