import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";

import { methods } from "./index.js";
import { createJimp } from "@jimp/core";

const jimp = createJimp({ plugins: [methods] });

describe("Shadow", () => {
  test("creates a shadow", async () => {
    const testImage = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(testImage.shadow({ x: -1, y: 1, blur: 1 })).toMatchSnapshot();
  });
});
