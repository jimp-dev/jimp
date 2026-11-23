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
      "▾▾▾▾◆◆◆◆",
    ),
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
      "▾▾▾▾▾▾◆◆◆◆◆◆",
    ),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (HorizontalAlign as any)[horizontalAlign] |
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (VerticalAlign as any)[verticalAlign];

    test("vertical contain aligned to " + align, () => {
      expect(
        vertical.clone().cover({ w: 4, h: 4, align: alignValue }),
      ).toMatchSnapshot();
    });

    test("horizontal contain aligned to " + align, () => {
      expect(
        horizontal.clone().cover({ w: 4, h: 4, align: alignValue }),
      ).toMatchSnapshot();
    });
  });
});

describe("cover align", () => {
  const image = jimp.fromBitmap(
    makeTestImage(
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▴▴▴▴▸▸▸▸",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
      "▾▾▾▾◆◆◆◆",
    ),
  );

  test.each([
    ["both horizontal flags", HorizontalAlign.LEFT | HorizontalAlign.RIGHT],
    [
      "two horizontal flags and a vertical one",
      HorizontalAlign.LEFT | HorizontalAlign.RIGHT | VerticalAlign.TOP,
    ],
    [
      "two vertical flags and a horizontal one",
      HorizontalAlign.LEFT | VerticalAlign.TOP | VerticalAlign.BOTTOM,
    ],
    ["an unknown flag", 64],
    ["a fraction", 1.5],
  ])("throws for %s", (_, align) => {
    expect(() => image.clone().cover({ w: 4, h: 2, align })).toThrow(
      "align must combine at most one HorizontalAlign and one VerticalAlign flag",
    );
  });

  test.each([
    [{ w: 2, h: 4 }, VerticalAlign.TOP, HorizontalAlign.CENTER],
    [{ w: 4, h: 2 }, HorizontalAlign.RIGHT, VerticalAlign.MIDDLE],
  ])("centers the axis without a flag (%o)", (size, align, center) => {
    const withCenter = image.clone().cover({ ...size, align: align | center });

    expect(image.clone().cover({ ...size, align }).bitmap.data).toEqual(
      withCenter.bitmap.data,
    );
    // make sure the test can tell the difference
    expect(
      image.clone().cover({ ...size, align: 0b001001 }).bitmap.data,
    ).not.toEqual(withCenter.bitmap.data);
  });
});
