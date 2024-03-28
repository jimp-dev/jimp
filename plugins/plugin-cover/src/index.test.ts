import { expect, test, describe } from "vitest";
import { HorizontalAlign, VerticalAlign, createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

describe("All align combinations for cover", () => {
  const vertical = jimp.fromBitmap(
    makeTestImage(
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆"
    )
  );

  const horizontal = jimp.fromBitmap(
    makeTestImage(
      "▴▴▴▴▴▴▸▸▸▸▸▸",
      "▴▴▴▴▴▴▸▸▸▸▸▸",
      "▴▴▴▴▴▴▸▸▸▸▸▸",
      "▴▴▴▴▴▴▸▸▸▸▸▸",
      "▾▾▾▾▾▾◆◆◆◆◆◆",
      "▾▾▾▾▾▾◆◆◆◆◆◆",
      "▾▾▾▾▾▾◆◆◆◆◆◆",
      "▾▾▾▾▾▾◆◆◆◆◆◆"
    )
  );

  const tests: Array<
    [keyof typeof HorizontalAlign, keyof typeof VerticalAlign]
  > = [
    ["LEFT", "TOP"],
    ["CENTER", "TOP"],
    ["RIGHT", "TOP"],
    ["LEFT", "MIDDLE"],
    ["CENTER", "MIDDLE"],
    ["RIGHT", "MIDDLE"],
    ["LEFT", "BOTTOM"],
    ["CENTER", "BOTTOM"],
    ["RIGHT", "BOTTOM"],
  ];

  tests.forEach(([horizontalAlign, verticalAlign]) => {
    const align = horizontalAlign + " " + verticalAlign;
    const alignValue =
      (HorizontalAlign as any)[horizontalAlign] |
      (VerticalAlign as any)[verticalAlign];

    test("vertical contain aligned to " + align, () => {
      expect(vertical.clone().cover(4, 4, alignValue)).toMatchSnapshot();
    });

    test("horizontal contain aligned to " + align, () => {
      expect(horizontal.clone().cover(4, 4, alignValue)).toMatchSnapshot();
    });
  });
});
