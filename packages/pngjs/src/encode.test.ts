import { describe, expect, test } from "vitest";

import { gradient, readChunks } from "../test/helpers.js";
import { ColorType, FilterType, decode, encode, readHeader } from "./index.js";
import type { BitDepth, ImageData } from "./index.js";

function header(png: Uint8Array) {
  const { colorType, depth, interlace } = readHeader(png);

  return { colorType, depth, interlace };
}

/** An image whose pixels are all taken from `colors` */
function fromColors(colors: number[][], width = 16, height = 16): ImageData {
  const data = new Uint8Array(width * height * 4);

  for (let p = 0; p < width * height; p++) {
    data.set(colors[(p * 7 + (p >> 3)) % colors.length]!, p * 4);
  }

  return { width, height, data };
}

function grays(values: number[], alpha = 255) {
  return values.map((v) => [v, v, v, alpha]);
}

describe("choosing the format", () => {
  test.each([
    ["black and white", grays([0, 255]), ColorType.GRAYSCALE, 1],
    ["4 gray levels", grays([0, 85, 170, 255]), ColorType.GRAYSCALE, 2],
    ["16 gray levels", grays([0, 17, 34, 255]), ColorType.GRAYSCALE, 4],
    ["other gray levels", grays([0, 1, 2]), ColorType.GRAYSCALE, 8],
    [
      "2 colours",
      [
        [255, 0, 0, 255],
        [0, 0, 255, 255],
      ],
      ColorType.PALETTE,
      1,
    ],
    ["transparent gray", grays([0, 100], 128), ColorType.PALETTE, 1],
    [
      "17 colours",
      Array.from({ length: 17 }, (_, i) => [i, 0, 0, 255]),
      ColorType.PALETTE,
      8,
    ],
  ])("%s", (_, colors, colorType, depth) => {
    const image = fromColors(colors);
    const png = encode(image);

    expect(header(png)).toEqual({ colorType, depth, interlace: false });
    expect([...decode(png).data]).toEqual([...image.data]);
  });

  test("many opaque colours: RGB", () => {
    expect(header(encode(gradient(32, 32, true))).colorType).toBe(
      ColorType.COLOR,
    );
  });

  test("many colours with alpha: RGBA", () => {
    expect(header(encode(gradient(32, 32))).colorType).toBe(
      ColorType.COLOR_ALPHA,
    );
  });

  test("many grays with alpha: gray and alpha", () => {
    const image = gradient(32, 32);

    for (let i = 0; i < image.data.length; i += 4) {
      image.data[i + 1] = image.data[i + 2] = image.data[i]!;
    }

    expect(header(encode(image)).colorType).toBe(ColorType.GRAYSCALE_ALPHA);
  });

  test("16-bit data that fits in 8 bits is written as 8 bits", () => {
    const image = gradient(32, 32);
    const data = Uint16Array.from(image.data, (v) => v * 257);

    expect(header(encode({ ...image, data }))).toEqual({
      colorType: ColorType.COLOR_ALPHA,
      depth: 8,
      interlace: false,
    });
  });

  test("16-bit data is written as 16 bits", () => {
    const image = gradient(32, 32);
    const data = Uint16Array.from(image.data, (v, i) => v * 256 + (i % 7));
    const png = encode({ ...image, data });

    expect(header(png).depth).toBe(16);
    expect([...decode(png, { outputDepth: 16 }).data]).toEqual([...data]);
  });

  test("a palette is ordered with transparent colours first", () => {
    const png = encode(
      fromColors([
        [255, 0, 0, 255],
        [0, 0, 255, 0],
        [0, 255, 0, 255],
      ]),
    );
    const chunks = Object.fromEntries(readChunks(png));

    expect([...chunks.PLTE!]).toEqual([0, 0, 255, 255, 0, 0, 0, 255, 0]);
    expect([...chunks.tRNS!]).toEqual([0]);
  });

  test("palette and low bit depth images aren't filtered", () => {
    const png = encode(fromColors(grays([0, 255])), { deflateLevel: 0 });
    const decoded = decode(png);

    expect(decoded.depth).toBe(1);
    // Every line of a stored deflate block starts with filter type 0
    expect(png.includes(1)).toBe(true);
  });
});

describe("round trips", () => {
  const image = gradient(37, 19);
  const opaqueGray = fromColors(grays([0, 17, 85, 255]), 37, 19);
  const cases: [string, ColorType, BitDepth, ImageData][] = [
    ["gray 1", ColorType.GRAYSCALE, 1, fromColors(grays([0, 255]), 37, 19)],
    ["gray 2", ColorType.GRAYSCALE, 2, fromColors(grays([0, 85, 255]), 37, 19)],
    ["gray 4", ColorType.GRAYSCALE, 4, opaqueGray],
    ["gray 8", ColorType.GRAYSCALE, 8, opaqueGray],
    ["gray 16", ColorType.GRAYSCALE, 16, opaqueGray],
    ["RGB 8", ColorType.COLOR, 8, gradient(37, 19, true)],
    ["RGB 16", ColorType.COLOR, 16, gradient(37, 19, true)],
    [
      "palette 1",
      ColorType.PALETTE,
      1,
      fromColors(
        [
          [1, 2, 3, 4],
          [5, 6, 7, 255],
        ],
        37,
        19,
      ),
    ],
    [
      "palette 2",
      ColorType.PALETTE,
      2,
      fromColors(
        [
          [1, 2, 3, 4],
          [5, 6, 7, 255],
          [9, 9, 9, 9],
        ],
        37,
        19,
      ),
    ],
    [
      "palette 4",
      ColorType.PALETTE,
      4,
      fromColors(grays([1, 2, 3, 4, 5], 7), 37, 19),
    ],
    [
      "palette 8",
      ColorType.PALETTE,
      8,
      fromColors(
        Array.from({ length: 200 }, (_, i) => [i, i, 0, i]),
        37,
        19,
      ),
    ],
    [
      "gray alpha 8",
      ColorType.GRAYSCALE_ALPHA,
      8,
      fromColors(grays([0, 3, 200], 90), 37, 19),
    ],
    [
      "gray alpha 16",
      ColorType.GRAYSCALE_ALPHA,
      16,
      fromColors(grays([0, 3, 200], 90), 37, 19),
    ],
    ["RGBA 8", ColorType.COLOR_ALPHA, 8, image],
    ["RGBA 16", ColorType.COLOR_ALPHA, 16, image],
  ];

  describe.each([false, true])("interlace: %s", (interlace) => {
    test.each(cases)("%s", (_, colorType, bitDepth, input) => {
      const png = encode(input, { colorType, bitDepth, interlace });

      expect(header(png)).toEqual({ colorType, depth: bitDepth, interlace });
      expect([...decode(png).data]).toEqual([...input.data]);
    });
  });

  test.each([1, 2, 3, 4, 5, 7, 8, 9, 15, 16, 17])(
    "interlaced %i pixel square images",
    (size) => {
      const input = gradient(size, size);
      const png = encode(input, { interlace: true });

      expect([...decode(png).data]).toEqual([...input.data]);
    },
  );

  test.each([
    FilterType.NONE,
    FilterType.SUB,
    FilterType.UP,
    FilterType.AVERAGE,
    FilterType.PAETH,
    FilterType.AUTO,
  ])("filter type %i", (filterType) => {
    const png = encode(image, { filterType });

    expect([...decode(png).data]).toEqual([...image.data]);
  });
});

describe("lossy conversions", () => {
  test("colour to gray uses the mean", () => {
    const png = encode(
      { width: 1, height: 1, data: new Uint8Array([30, 60, 120, 255]) },
      { colorType: ColorType.GRAYSCALE },
    );

    expect([...decode(png).data]).toEqual([70, 70, 70, 255]);
  });

  test("alpha is blended with the background when it's dropped", () => {
    const data = new Uint8Array([255, 0, 0, 128]);

    expect([
      ...decode(
        encode({ width: 1, height: 1, data }, { colorType: ColorType.COLOR }),
      ).data,
    ]).toEqual([255, 127, 127, 255]);
    expect([
      ...decode(
        encode(
          { width: 1, height: 1, data },
          {
            colorType: ColorType.COLOR,
            background: { red: 0, green: 0, blue: 0 },
          },
        ),
      ).data,
    ]).toEqual([128, 0, 0, 255]);
  });

  test("8-bit data is scaled up for 16-bit output", () => {
    const png = encode(
      { width: 1, height: 1, data: new Uint8Array([1, 2, 255, 255]) },
      { bitDepth: 16 },
    );

    expect([...decode(png, { outputDepth: 16 }).data]).toEqual([
      257, 514, 65535, 65535,
    ]);
  });
});

describe("metadata", () => {
  test("is written and read", () => {
    const exif = new Uint8Array([0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 0]);
    const png = encode(gradient(2, 2), {
      gamma: 0.45455,
      srgb: 0,
      physical: { x: 2835, y: 2835, unit: "meter" },
      exif,
      text: [{ keyword: "Software", text: "@jimp/pngjs" }],
    });
    const decoded = decode(png);

    expect(readChunks(png).map(([type]) => type)).toEqual([
      "IHDR",
      "gAMA",
      "sRGB",
      "PLTE",
      "tRNS",
      "pHYs",
      "eXIf",
      "tEXt",
      "IDAT",
      "IEND",
    ]);
    expect(decoded.gamma).toBe(0.45455);
    expect(decoded.srgb).toBe(0);
    expect(decoded.physical).toEqual({ x: 2835, y: 2835, unit: "meter" });
    expect([...decoded.exif!]).toEqual([...exif]);
    expect(decoded.text).toEqual([
      { keyword: "Software", text: "@jimp/pngjs" },
    ]);
  });

  test("keywords must be 1-79 Latin-1 characters", () => {
    for (const keyword of ["", "x".repeat(80), "😀"]) {
      expect(() =>
        encode(gradient(1, 1), { text: [{ keyword, text: "" }] }),
      ).toThrow("Invalid keyword");
    }
  });
});

describe("errors", () => {
  test("invalid sizes", () => {
    expect(() =>
      encode({ width: 0, height: 1, data: new Uint8Array(4) }),
    ).toThrow("Invalid image size 0x1");
    expect(() =>
      encode({ width: 1.5, height: 1, data: new Uint8Array(8) }),
    ).toThrow("Invalid image size");
  });

  test("not enough data", () => {
    expect(() =>
      encode({ width: 2, height: 2, data: new Uint8Array(15) }),
    ).toThrow("Not enough pixel data");
  });

  test("bit depths the colour type doesn't allow", () => {
    expect(() =>
      encode(gradient(2, 2), { colorType: ColorType.COLOR, bitDepth: 4 }),
    ).toThrow("Bit depth 4 isn't allowed for color type 2");
  });

  test("a bit depth that can't store the image", () => {
    expect(() => encode(gradient(8, 8), { bitDepth: 2 })).toThrow(
      "can't be stored with a bit depth of 2",
    );
  });

  test("too many colours for a palette", () => {
    expect(() =>
      encode(fromColors(grays([1, 2, 3, 4, 5]), 4, 4), {
        colorType: ColorType.PALETTE,
        bitDepth: 2,
      }),
    ).toThrow("more than 4 colors");
  });
});
