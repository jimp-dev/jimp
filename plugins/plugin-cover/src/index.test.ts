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
      { w: 2, h: 4 },
      { w: 4, h: 2 },
    ]) {
      expect(image.clone().cover({ ...size, align }).bitmap.data).toEqual(
        image.clone().cover({ ...size, align: bits }).bitmap.data,
      );
    }
  });

  test("places the image part of the way along each axis", () => {
    const row = jimp.fromBitmap(makeTestImage("01234567"));
    const column = jimp.fromBitmap(
      makeTestImage("0", "1", "2", "3", "4", "5", "6", "7"),
    );

    expect(row.cover({ w: 4, h: 1, align: { x: 0.25 } }).bitmap).toEqual(
      makeTestImage("1234"),
    );
    expect(column.cover({ w: 1, h: 4, align: { y: 0.75 } }).bitmap).toEqual(
      makeTestImage("3", "4", "5", "6"),
    );
  });
});

describe("premultiplyAlpha", () => {
  // alpha 0 on the left, 255 on the right and partial in between, with the
  // same colour everywhere
  function texture() {
    const data = Buffer.alloc(16 * 16 * 4);

    for (let i = 0; i < 256; i++) {
      const x = i % 16;
      data.set([200, 100, 50, Math.max(0, Math.min(255, (x - 6) * 64))], i * 4);
    }

    return jimp.fromBitmap({ data, width: 16, height: 16 });
  }

  test("false keeps the colour of transparent pixels", () => {
    const { data } = texture().cover({
      w: 6,
      h: 4,
      premultiplyAlpha: false,
    }).bitmap;
    const premultiplied = texture().cover({ w: 6, h: 4 }).bitmap.data;

    for (let i = 0; i < data.length; i += 4) {
      expect([...data.subarray(i, i + 3)]).toEqual([200, 100, 50]);
      expect(data[i + 3]).toBe(premultiplied[i + 3]);
    }

    // by default transparent pixels have no colour
    expect([...premultiplied.subarray(0, 4)]).toEqual([0, 0, 0, 0]);
  });
});
