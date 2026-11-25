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

describe("smart align", () => {
  type RGBA = [number, number, number, number];

  /** A `width` × `height` image, with `paint` choosing each pixel */
  function image(
    width: number,
    height: number,
    paint: (x: number, y: number) => RGBA,
  ) {
    const data = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        data.set(paint(x, y), (y * width + x) * 4);
      }
    }

    return jimp.fromBitmap({ data, width, height });
  }

  const grey: RGBA = [128, 128, 128, 255];
  // a deterministic pattern of 16 grey levels
  const noise = (x: number, y: number): RGBA => {
    const v = ((x * 7 + y * 13 + ((x * y) % 5) * 31) % 16) * 16;
    return [v, v, v, 255];
  };
  const skin: RGBA = [224, 172, 140, 255];
  const insideSquare = (x: number, y: number, cx: number, cy: number) =>
    Math.abs(x - cx) < 6 && Math.abs(y - cy) < 6;

  test("entropy keeps the detailed part", () => {
    // flat grey with a noisy patch on the right
    const wide = image(80, 20, (x, y) => (x >= 58 ? noise(x, y) : grey));
    const rect = wide.coverRect({ w: 20, h: 20, align: "entropy" });

    // windows within 1% of the best are ties, and the one nearest the middle
    // wins: here the one with a single flat column
    expect(rect).toEqual({ x: 57, y: 0, w: 20, h: 20 });
  });

  test("attention keeps skin tones", () => {
    // flat grey with a skin-coloured square on the left
    const wide = image(80, 20, (x, y) =>
      insideSquare(x, y, 12, 10) ? skin : grey,
    );
    const rect = wide.coverRect({ w: 20, h: 20, align: "attention" });

    // the square is x 7-17, centred to within a pixel
    expect(rect).toEqual({ x: 3, y: 0, w: 20, h: 20 });
  });

  test("attention keeps saturated colour and edges", () => {
    // flat grey with a red square at the bottom
    const tall = image(20, 80, (x, y) =>
      insideSquare(x, y, 10, 65) ? [255, 0, 0, 255] : grey,
    );
    const rect = tall.coverRect({ w: 20, h: 20, align: "attention" });

    expect(rect).toEqual({ x: 0, y: 55, w: 20, h: 20 });
  });

  test.each(["entropy", "attention"] as const)(
    "%s centres a flat image",
    (align) => {
      const flat = image(80, 20, () => grey);

      expect(flat.coverRect({ w: 20, h: 20, align })).toEqual({
        x: 30,
        y: 0,
        w: 20,
        h: 20,
      });
    },
  );

  test.each(["entropy", "attention"] as const)(
    "%s ignores transparent pixels",
    (align) => {
      // the noisy, colourful patch on the right is fully transparent
      const wide = image(80, 20, (x, y) => {
        if (x >= 58) {
          return [255, 0, (x * 40) % 256, 0];
        }

        return x < 22 ? noise(x, y) : grey;
      });

      expect(wide.coverRect({ w: 20, h: 20, align }).x).toBeLessThan(10);
    },
  );

  test("cover crops the same part coverRect measures", () => {
    const paint = (x: number, y: number) => (x >= 58 ? noise(x, y) : grey);
    const wide = image(80, 20, paint);
    const rect = wide.coverRect({ w: 20, h: 20, align: "entropy" });

    // no scaling, so the result is the pixels in the rectangle
    expect(wide.cover({ w: 20, h: 20, align: "entropy" }).bitmap).toEqual(
      image(20, 20, (x, y) => paint(x + rect.x, y + rect.y)).bitmap,
    );
  });

  test("analyses large images on a downscaled copy", () => {
    // 2000 px wide, with the detail at the right
    const wide = image(2000, 200, (x, y) => (x >= 1700 ? noise(x, y) : grey));
    const rect = wide.coverRect({ w: 100, h: 100, align: "entropy" });

    expect(rect.w).toBe(200);
    expect(rect.x).toBeGreaterThanOrEqual(1650);
    expect(rect.x + rect.w).toBeLessThanOrEqual(2000);
  });

  test("is deterministic", () => {
    const wide = image(300, 100, noise);
    const rect = wide.coverRect({ w: 50, h: 50, align: "attention" });

    for (let i = 0; i < 3; i++) {
      expect(wide.coverRect({ w: 50, h: 50, align: "attention" })).toEqual(
        rect,
      );
    }
  });

  test("throws for an unknown strategy", () => {
    const wide = image(8, 4, () => grey);

    expect(() =>
      // @ts-expect-error not a strategy
      wide.cover({ w: 4, h: 4, align: "faces" }),
    ).toThrow();
  });

  test("apply accepts a smart align", () => {
    const wide = image(80, 20, (x, y) => (x >= 58 ? noise(x, y) : grey));

    expect(
      wide.clone().apply([["cover", { w: 20, h: 20, align: "entropy" }]])
        .bitmap,
    ).toEqual(wide.clone().cover({ w: 20, h: 20, align: "entropy" }).bitmap);
  });
});

describe("coverRect", () => {
  const image = jimp.fromBitmap(
    makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆"),
  );

  test.each([
    [
      { w: 2, h: 2 },
      { x: 2, y: 0, w: 4, h: 4 },
    ],
    [
      { w: 2, h: 2, align: HorizontalAlign.RIGHT },
      { x: 4, y: 0, w: 4, h: 4 },
    ],
    [
      { w: 4, h: 1, align: { y: 1 } },
      { x: 0, y: 2, w: 8, h: 2 },
    ],
    [
      { w: 16, h: 8 },
      { x: 0, y: 0, w: 8, h: 4 },
    ],
    [
      { w: 3, h: 2 },
      { x: 1, y: 0, w: 6, h: 4 },
    ],
  ])("%o measures %o", (options, rect) => {
    expect(image.coverRect(options)).toEqual(rect);
  });

  test("doesn't change the image", () => {
    const copy = image.clone();

    copy.coverRect({ w: 2, h: 2, align: "attention" });

    expect(copy.bitmap).toEqual(image.bitmap);
  });

  test("throws for invalid flags, like cover", () => {
    expect(() => image.coverRect({ w: 4, h: 2, align: 64 })).toThrow(
      "align must combine at most one HorizontalAlign and one VerticalAlign flag",
    );
  });
});
