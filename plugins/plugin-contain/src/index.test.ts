import { expect, test, describe } from "vitest";

import { makeTestImage } from "@jimp/test-utils";
import { HorizontalAlign, VerticalAlign, createJimp } from "@jimp/core";

import { methods as resizeMethods } from "@jimp/plugin-resize";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

describe("All align combinations for contain", () => {
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
  // stores the Jimp instances of the JGD images above.
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
        vertical.clone().contain({ w: 6, h: 6, align: alignValue }),
      ).toMatchSnapshot();
    });

    test("horizontal contain aligned to " + align, () => {
      expect(
        horizontal.clone().contain({ w: 6, h: 6, align: alignValue }),
      ).toMatchSnapshot();
    });
  });
});

describe("contain align", () => {
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
    expect(() => image.clone().contain({ w: 4, h: 2, align })).toThrow(
      "align must combine at most one HorizontalAlign and one VerticalAlign flag",
    );
  });

  test.each([
    [{ w: 4, h: 2 }, VerticalAlign.TOP, HorizontalAlign.CENTER],
    [{ w: 2, h: 4 }, HorizontalAlign.RIGHT, VerticalAlign.MIDDLE],
  ])("centers the axis without a flag (%o)", (size, align, center) => {
    const withCenter = image
      .clone()
      .contain({ ...size, align: align | center });

    expect(image.clone().contain({ ...size, align }).bitmap.data).toEqual(
      withCenter.bitmap.data,
    );
    // make sure the test can tell the difference
    expect(
      image.clone().contain({ ...size, align: 0b001001 }).bitmap.data,
    ).not.toEqual(withCenter.bitmap.data);
  });
});

describe("fractional align", () => {
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
    [{ x: 0, y: 0 }, HorizontalAlign.LEFT | VerticalAlign.TOP],
    [{ x: 0.5, y: 0.5 }, HorizontalAlign.CENTER | VerticalAlign.MIDDLE],
    [{ x: 1, y: 1 }, HorizontalAlign.RIGHT | VerticalAlign.BOTTOM],
    [{ y: 0 }, VerticalAlign.TOP],
    [{ x: 1 }, HorizontalAlign.RIGHT],
    [{}, HorizontalAlign.CENTER | VerticalAlign.MIDDLE],
    [{ x: -1, y: 2 }, HorizontalAlign.LEFT | VerticalAlign.BOTTOM],
  ])("%o matches the bitmask %i", (align, bits) => {
    for (const size of [
      { w: 4, h: 2 },
      { w: 2, h: 4 },
    ]) {
      expect(image.clone().contain({ ...size, align }).bitmap.data).toEqual(
        image.clone().contain({ ...size, align: bits }).bitmap.data,
      );
    }
  });

  test("places the image part of the way along each axis", () => {
    const square = jimp.fromBitmap(makeTestImage("▴▴", "▴▴"));

    expect(
      square.clone().contain({ w: 8, h: 2, align: { x: 1 / 3 } }).bitmap,
    ).toEqual(makeTestImage("  ▴▴    ", "  ▴▴    "));
    expect(
      square.clone().contain({ w: 2, h: 8, align: { y: 0.2 } }).bitmap,
    ).toEqual(makeTestImage("  ", "▴▴", "▴▴", "  ", "  ", "  ", "  ", "  "));
  });
});

describe("premultiplyAlpha", () => {
  // 16x8: alpha 0 on the left, 255 on the right and partial in between, with
  // the same colour everywhere, letter boxed in opaque blue
  function texture() {
    const data = Buffer.alloc(16 * 8 * 4);

    for (let i = 0; i < 128; i++) {
      const x = i % 16;
      data.set([200, 100, 50, Math.max(0, Math.min(255, (x - 6) * 64))], i * 4);
    }

    const image = jimp.fromBitmap({ data, width: 16, height: 8 });
    image.background = 0x0000ffff;

    return image;
  }

  test("false keeps the colour of transparent pixels and copies them into the letter box", () => {
    const image = texture().contain({ w: 8, h: 8, premultiplyAlpha: false });
    const scaled = resizeMethods.scale(texture(), {
      f: 0.5,
      premultiplyAlpha: false,
    });

    // rows 2 to 5 are the image as it is, the rest is the background
    expect(image.bitmap.data.subarray(2 * 8 * 4, 6 * 8 * 4)).toEqual(
      scaled.bitmap.data,
    );

    for (const y of [0, 1, 6, 7]) {
      expect(image.getPixelColor(0, y)).toBe(0x0000ffff);
      expect(image.getPixelColor(7, y)).toBe(0x0000ffff);
    }

    for (let i = 2 * 8 * 4; i < 6 * 8 * 4; i += 4) {
      expect([...image.bitmap.data.subarray(i, i + 3)]).toEqual([200, 100, 50]);
    }
  });

  test("by default the image is drawn over the background", () => {
    const image = texture().contain({ w: 8, h: 8 });

    // the transparent left side shows the background
    expect(image.getPixelColor(0, 3)).toBe(0x0000ffff);
  });
});
