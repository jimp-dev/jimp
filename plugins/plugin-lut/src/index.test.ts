import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { ZodError } from "zod";

import { methods, parseCubeLut, type Lut } from "./index.js";

const Jimp = createJimp({ plugins: [methods] });

type Rgb = [number, number, number];

/** A LUT of `look`, sampled on a grid of `size` points per axis */
function makeLut(size: number, look: (rgb: Rgb) => Rgb, extra = {}): Lut {
  const data = new Float32Array(size ** 3 * 3);

  for (let i = 0; i < size ** 3; i++) {
    const rgb = look([
      (i % size) / (size - 1),
      (Math.floor(i / size) % size) / (size - 1),
      Math.floor(i / size ** 2) / (size - 1),
    ]);

    data.set(rgb, i * 3);
  }

  return { size, data, ...extra };
}

/** The same LUT as a .cube file */
function toCube(lut: Lut, header: string[] = []) {
  const lines = [...header, `LUT_3D_SIZE ${lut.size}`];

  for (let i = 0; i < lut.data.length; i += 3) {
    lines.push(Array.from(lut.data.slice(i, i + 3)).join(" "));
  }

  return lines.join("\n");
}

/** A level `level` Hald CLUT image of `look` */
function makeHald(level: number, look: (rgb: Rgb) => Rgb) {
  const lut = makeLut(level * level, look);
  const image = new Jimp({ width: level ** 3, height: level ** 3 });

  for (let i = 0; i < lut.size ** 3; i++) {
    for (let c = 0; c < 3; c++) {
      image.bitmap.data[i * 4 + c] = Math.round(lut.data[i * 3 + c]! * 255);
    }

    image.bitmap.data[i * 4 + 3] = 255;
  }

  return image;
}

/** An image with pseudo-random colors and alpha */
function noise(width = 32, height = 32) {
  const image = new Jimp({ width, height });
  let seed = 1;

  for (let i = 0; i < image.bitmap.data.length; i++) {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    image.bitmap.data[i] = seed >> 23;
  }

  // Include black, white and the primaries, at the corners of the cube
  [0x000000ff, 0xffffffff, 0xff0000ff, 0x00ff00ff, 0x0000ffff].forEach(
    (color, x) => image.setPixelColor(color, x, 0),
  );

  return image;
}

const identity = (rgb: Rgb) => rgb;
/** An affine look, which both LUT grids represent exactly */
const swapAndInvert = ([r, g, b]: Rgb): Rgb => [1 - g, 0.5 * b + 0.25, r];

describe("parseCubeLut", () => {
  test("reads the title, size, domain and data", () => {
    const lut = parseCubeLut(
      [
        "# Made by hand",
        'TITLE "Warm look"',
        "LUT_3D_SIZE 2",
        "DOMAIN_MIN 0 0.1 0",
        "DOMAIN_MAX 1 0.9 1",
        "",
        "0 0 0",
        "1 0 0",
        "0 1 0",
        "1 1 0",
        "0 0 1",
        "1 0 1",
        "0 1 1",
        "1e0 1.0 .5",
      ].join("\n"),
    );

    expect(lut.title).toBe("Warm look");
    expect(lut.size).toBe(2);
    expect(lut.domainMin).toEqual([0, 0.1, 0]);
    expect(lut.domainMax).toEqual([1, 0.9, 1]);
    expect(lut.data).toBeInstanceOf(Float32Array);
    expect(Array.from(lut.data.slice(-6))).toEqual([0, 1, 1, 1, 1, 0.5]);
  });

  test("defaults the domain to 0 to 1, and has no title without TITLE", () => {
    const lut = parseCubeLut(toCube(makeLut(2, identity)));

    expect(lut).not.toHaveProperty("title");
    expect(lut.domainMin).toEqual([0, 0, 0]);
    expect(lut.domainMax).toEqual([1, 1, 1]);
  });

  test("skips comments, blank lines, extra spaces, a BOM and unknown keywords", () => {
    const text = [
      "\uFEFF# comment",
      "LUT_IN_VIDEO_RANGE",
      "   LUT_3D_SIZE   2   ",
      "",
      "\t# another comment",
      ...toCube(makeLut(2, identity))
        .split("\n")
        .slice(1)
        .map((l) => ` ${l}\t`),
    ].join("\r\n");

    expect(Array.from(parseCubeLut(text).data)).toEqual(
      Array.from(makeLut(2, identity).data),
    );
  });

  test("reads Resolve's LUT_3D_INPUT_RANGE as the domain", () => {
    const lut = parseCubeLut(
      toCube(makeLut(2, identity), ["LUT_3D_INPUT_RANGE -0.25 1.25"]),
    );

    expect(lut.domainMin).toEqual([-0.25, -0.25, -0.25]);
    expect(lut.domainMax).toEqual([1.25, 1.25, 1.25]);
  });

  test("keeps outputs outside 0 to 1", () => {
    const lut = parseCubeLut(
      toCube(makeLut(2, ([r, g, b]) => [r * 2 - 0.5, g, b])),
    );

    expect(lut.data[0]).toBe(-0.5);
    expect(lut.data[3]).toBe(1.5);
  });

  test.each([
    [
      "a 1D LUT",
      "LUT_1D_SIZE 2\n0 0 0\n1 1 1",
      "Invalid .cube LUT, line 1: LUT_1D_SIZE is for 1D LUTs, which aren't supported. Only 3D LUTs (LUT_3D_SIZE) can be applied.",
    ],
    [
      "a 1D shaper before a 3D LUT",
      `LUT_1D_INPUT_RANGE 0 1\n${toCube(makeLut(2, identity))}`,
      "Invalid .cube LUT, line 1: LUT_1D_INPUT_RANGE is for 1D LUTs",
    ],
    ["no size", "# empty\n", "Invalid .cube LUT: it has no LUT_3D_SIZE"],
    [
      "data before the size",
      "0 0 0\nLUT_3D_SIZE 2",
      "Invalid .cube LUT, line 1: LUT_3D_SIZE must come before the LUT data",
    ],
    [
      "a size of 1",
      "LUT_3D_SIZE 1\n0 0 0",
      "Invalid .cube LUT, line 1: LUT_3D_SIZE must be a whole number from 2 to 256, got 1",
    ],
    [
      "a fractional size",
      "LUT_3D_SIZE 2.5",
      "LUT_3D_SIZE must be a whole number from 2 to 256, got 2.5",
    ],
    [
      "two sizes",
      "LUT_3D_SIZE 2\nLUT_3D_SIZE 2",
      "Invalid .cube LUT, line 2: LUT_3D_SIZE is given more than once",
    ],
    [
      "too few data lines",
      toCube(makeLut(2, identity)).split("\n").slice(0, -1).join("\n"),
      "Invalid .cube LUT: LUT_3D_SIZE 2 needs 8 data lines, found 7",
    ],
    [
      "too many data lines",
      `${toCube(makeLut(2, identity))}\n0 0 0`,
      "Invalid .cube LUT, line 10: too many data lines: LUT_3D_SIZE 2 needs 8",
    ],
    [
      "a data line with 2 numbers",
      "LUT_3D_SIZE 2\n0 0",
      "Invalid .cube LUT, line 2: A data line needs 3 numbers, got 2",
    ],
    [
      "a value that isn't a number",
      "LUT_3D_SIZE 2\n0 0 abc",
      'Invalid .cube LUT, line 2: "abc" isn\'t a number',
    ],
    ["a hex number", "LUT_3D_SIZE 2\n0 0 0x1", '"0x1" isn\'t a number'],
    [
      "a keyword after the data",
      `${toCube(makeLut(2, identity))}\nTITLE "Late"`,
      "Invalid .cube LUT, line 10: keywords must come before the LUT data",
    ],
    [
      "a TITLE without quotes",
      "TITLE Film\nLUT_3D_SIZE 2",
      'Invalid .cube LUT, line 1: TITLE must be in quotes, like TITLE "Film"',
    ],
    [
      "a DOMAIN_MIN with 2 numbers",
      "DOMAIN_MIN 0 0",
      "Invalid .cube LUT, line 1: DOMAIN_MIN needs 3 numbers, got 2",
    ],
    [
      "an empty domain",
      toCube(makeLut(2, identity), [
        "DOMAIN_MIN 0 0.5 0",
        "DOMAIN_MAX 1 0.5 1",
      ]),
      "Invalid .cube LUT: DOMAIN_MIN must be less than DOMAIN_MAX in each channel, got 0 0.5 0 and 1 0.5 1",
    ],
  ])("rejects %s", (_, text, message) => {
    expect(() => parseCubeLut(text)).toThrow(message);
  });

  test("rejects input that isn't text", () => {
    expect(() => parseCubeLut(new Uint8Array(4) as never)).toThrow(
      "parseCubeLut needs the text of a .cube file",
    );
  });
});

describe("colorGrade", () => {
  test.each([2, 3, 17, 33])(
    "a size %i identity LUT changes nothing",
    (size) => {
      const image = noise();
      const original = Buffer.from(image.bitmap.data);

      image.colorGrade(makeLut(size, identity));

      expect(image.bitmap.data).toEqual(original);
    },
  );

  test.each([2, 4, 8])(
    "a level %i identity Hald image changes nothing",
    (level) => {
      const image = noise();
      const original = Buffer.from(image.bitmap.data);

      image.colorGrade(makeHald(level, identity));

      expect(image.bitmap.data).toEqual(original);
    },
  );

  test.each([
    ["a LUT", (size: number) => makeLut(size, swapAndInvert)],
    [
      "a Hald image",
      (size: number) => makeHald(Math.sqrt(size), swapAndInvert),
    ],
  ])("maps colors exactly through %s of an affine look", (_, make) => {
    for (const size of [4, 16]) {
      const image = noise();
      const original = Buffer.from(image.bitmap.data);

      image.colorGrade(make(size));

      for (let i = 0; i < original.length; i += 4) {
        const rgb = [original[i]!, original[i + 1]!, original[i + 2]!].map(
          (v) => v / 255,
        ) as Rgb;
        const expected = swapAndInvert(rgb).map((v) => v * 255);
        const actual = [...image.bitmap.data.subarray(i, i + 3)];

        actual.forEach((value, c) => {
          // A Hald image stores 8-bit values, so it's off by rounding
          expect(Math.abs(value - expected[c]!)).toBeLessThanOrEqual(1);
        });
        expect(image.bitmap.data[i + 3]).toBe(original[i + 3]);
      }
    }
  });

  test("interpolates between the points of a coarse LUT", () => {
    // Squares red: 0 -> 0, 0.5 -> 0.25, 1 -> 1, so 0.25 is half way to 0.25
    const lut = makeLut(3, ([r, g, b]) => [r * r, g, b]);
    const image = new Jimp({ width: 1, height: 1, color: 0x40000000 });

    image.colorGrade(lut);

    expect(image.bitmap.data[0]).toBe(Math.round((64 / 127.5) * 0.25 * 255));
  });

  test("uses tetrahedral interpolation", () => {
    // Only the cell's last corner is lit. Trilinear gives r × g × b, and
    // tetrahedral the smallest of the three fractions.
    const lut = makeLut(2, ([r, g, b]) =>
      r && g && b ? [1, 1, 1] : [0, 0, 0],
    );
    const image = new Jimp({ width: 1, height: 1, color: 0x80c0ffff });

    image.colorGrade(lut);

    expect(image.bitmap.data[0]).toBe(0x80);
  });

  test("maps inputs through the LUT's domain, clamping those outside it", () => {
    const lut = makeLut(5, ([r, g, b]) => [0.25 + r * 0.5, g, b], {
      domainMin: [0.25, 0, 0],
      domainMax: [0.75, 1, 1],
    });
    const image = new Jimp({ width: 4, height: 1 });

    [0x000000ff, 0x400000ff, 0x800000ff, 0xff0000ff].forEach((color, x) =>
      image.setPixelColor(color, x, 0),
    );
    image.colorGrade(lut);

    const reds = [0, 1, 2, 3].map((x) => image.bitmap.data[x * 4]);

    // Red in the domain is unchanged, and outside it is clamped to its ends
    expect(reds).toEqual([64, 64, 128, 191]);
  });

  test("clamps outputs to 0-255", () => {
    const lut = makeLut(2, ([r, g, b]) => [r * 3 - 1, g, b]);
    const image = new Jimp({ width: 2, height: 1 });

    image.setPixelColor(0x100000ff, 0, 0);
    image.setPixelColor(0xf00000ff, 1, 0);
    image.colorGrade(lut);

    expect(image.bitmap.data[0]).toBe(0);
    expect(image.bitmap.data[4]).toBe(255);
  });

  test("blends with the original by strength", () => {
    const lut = makeLut(2, swapAndInvert);
    const original = noise();
    const full = original.clone().colorGrade(lut);
    const half = original.clone().colorGrade(lut, { strength: 0.5 });

    for (let i = 0; i < original.bitmap.data.length; i++) {
      const expected =
        i % 4 === 3
          ? original.bitmap.data[i]!
          : (original.bitmap.data[i]! + full.bitmap.data[i]!) / 2;

      expect(Math.abs(half.bitmap.data[i]! - expected)).toBeLessThanOrEqual(1);
    }
  });

  test("clamps strength to 0-1", () => {
    const lut = makeLut(2, swapAndInvert);
    const original = noise();

    expect(
      original.clone().colorGrade(lut, { strength: 0 }).bitmap.data,
    ).toEqual(original.bitmap.data);
    expect(
      original.clone().colorGrade(lut, { strength: -1 }).bitmap.data,
    ).toEqual(original.bitmap.data);
    expect(
      original.clone().colorGrade(lut, { strength: 3 }).bitmap.data,
    ).toEqual(original.clone().colorGrade(lut).bitmap.data);
  });

  test("gives the same result for a .cube LUT, a Hald image and plain arrays", () => {
    const look = ([r, g, b]: Rgb): Rgb => [r * r, Math.sqrt(g), (r + b) / 2];
    const lut = parseCubeLut(toCube(makeLut(16, look)));
    const fromJson = JSON.parse(
      JSON.stringify({ ...lut, data: Array.from(lut.data) }),
    );
    const viaLut = noise().colorGrade(lut);
    const viaJson = noise().colorGrade(fromJson);
    const viaHald = noise().colorGrade(makeHald(4, look));

    expect(viaJson.bitmap.data).toEqual(viaLut.bitmap.data);

    viaHald.bitmap.data.forEach((value, i) => {
      expect(Math.abs(value - viaLut.bitmap.data[i]!)).toBeLessThanOrEqual(1);
    });
  });

  test("can grade a Hald image with itself", () => {
    const hald = makeHald(2, ([r, g, b]) => [g, b, r]);
    const expected = hald.clone().colorGrade(hald.clone());

    hald.colorGrade(hald);

    expect(hald.bitmap.data).toEqual(expected.bitmap.data);
  });

  test("works in apply", () => {
    const lut = makeLut(2, swapAndInvert);

    expect(
      noise().apply([["colorGrade", lut, { strength: 0.5 }]]).bitmap.data,
    ).toEqual(noise().colorGrade(lut, { strength: 0.5 }).bitmap.data);
  });

  test("rejects a Hald image that isn't level³ pixels square", () => {
    expect(() =>
      noise().colorGrade(new Jimp({ width: 64, height: 32 })),
    ).toThrow(
      "A Hald CLUT image must be square, with a side of level³ pixels, like 512 × 512 for level 8. This one is 64 × 32.",
    );
    expect(() =>
      noise().colorGrade(new Jimp({ width: 50, height: 50 })),
    ).toThrow("This one is 50 × 50.");
    expect(() => noise().colorGrade(new Jimp({ width: 1, height: 1 }))).toThrow(
      "This one is 1 × 1.",
    );
  });

  test.each([
    [
      "data of the wrong length",
      { size: 2, data: new Float32Array(23) },
      "data must have size³ × 3 = 24 numbers, got 23",
    ],
    ["a size below 2", { size: 1, data: [0, 0, 0] }, "Too small"],
    [
      "data that isn't numbers",
      { size: 2, data: "0 0 0" },
      "data must be a Float32Array",
    ],
    [
      "an empty domain",
      {
        size: 2,
        data: makeLut(2, identity).data,
        domainMin: [0, 0, 1],
        domainMax: [1, 1, 1],
      },
      "domainMin must be less than domainMax in each channel",
    ],
  ])("rejects a LUT with %s", (_, lut, message) => {
    expect(() => noise().colorGrade(lut as never)).toThrow(ZodError);
    expect(() => noise().colorGrade(lut as never)).toThrow(message);
  });

  test("rejects options that aren't valid", () => {
    expect(() =>
      noise().colorGrade(makeLut(2, identity), { strength: "1" as never }),
    ).toThrow(ZodError);
  });
});
