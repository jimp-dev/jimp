import { beforeAll, describe, expect, test } from "vitest";
import { createJimp, HorizontalAlign, VerticalAlign } from "@jimp/core";

import { measureVectorText, methods } from "./index.js";
import { loadTTF, type VectorFont } from "./load-ttf.js";

const Jimp = createJimp({ plugins: [methods] });

type Image = InstanceType<typeof Jimp>;

const fixture = (name: string) =>
  new URL(`../fixtures/${name}`, import.meta.url);

/** Inter, from the .otf: CFF outlines and GPOS kerning */
let inter: VectorFont;
/** Open Sans, from the .ttf: TrueType outlines, an fi ligature, no kerning */
let openSans: VectorFont;

beforeAll(async () => {
  inter = await loadTTF(fixture("Inter-Regular.otf"));
  openSans = await loadTTF(fixture("OpenSans-Regular.ttf"));
});

function makeImage(width: number, height: number, color = 0x00000000) {
  return new Jimp({ width, height, color });
}

/** The [r, g, b, a] of a pixel */
function pixel(image: Image, x: number, y: number) {
  const idx = image.getPixelIndex(x, y);
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

/** The smallest box around the pixels that aren't transparent */
function inkBounds(image: Image) {
  const { width, height, data } = image.bitmap;
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! > 0) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x + 1);
        bottom = Math.max(bottom, y + 1);
      }
    }
  }

  return { left, top, right, bottom };
}

/** A pixel the text covers completely */
function solidPixel(image: Image) {
  const { data } = image.bitmap;

  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 255) {
      return [...data.subarray(i - 3, i + 1)];
    }
  }

  throw new Error("no solid pixel");
}

/** The advance of a single glyph at `size` */
function advance(font: VectorFont, char: string, size: number) {
  const [glyph] = font.opentype.stringToGlyphs(char);

  return (glyph!.advanceWidth! * size) / font.opentype.unitsPerEm;
}

describe("loadTTF", () => {
  test("loads OpenType, TrueType and WOFF fonts", async () => {
    const woff = await loadTTF(fixture("Inter-Regular.woff"));

    expect(inter.opentype.unitsPerEm).toBe(2048);
    expect(openSans.opentype.unitsPerEm).toBe(2048);
    // The WOFF is the same font as the .otf
    expect(measureVectorText(woff, 32, "AVATAR")).toStrictEqual(
      measureVectorText(inter, 32, "AVATAR"),
    );
  });

  test("reads kerning from GPOS extension lookups", async () => {
    const [a, v] = inter.opentype.stringToGlyphs("AV");

    expect(inter.kerning(a!.index, v!.index)).toBe(-140);
    // Including from the compressed tables of a WOFF
    const woff = await loadTTF(fixture("Inter-Regular.woff"));

    expect(woff.kerning(a!.index, v!.index)).toBe(-140);
    // Open Sans has no kerning
    const [a2, v2] = openSans.opentype.stringToGlyphs("AV");

    expect(openSans.kerning(a2!.index, v2!.index)).toBe(0);
  });

  test("throws for data that isn't a font", async () => {
    await expect(loadTTF(new Uint8Array([1, 2, 3, 4, 5, 6]))).rejects.toThrow(
      'loadTTF: the data isn\'t a TrueType, OpenType or WOFF font (it starts with "\\u0001\\u0002\\u0003\\u0004").',
    );
    await expect(loadTTF(new ArrayBuffer(0))).rejects.toThrow(
      "loadTTF: the data isn't a TrueType, OpenType or WOFF font (it's empty).",
    );
  });

  test("explains that WOFF2 isn't supported", async () => {
    const woff2 = new TextEncoder().encode("wOF2\0\x01\0\0");

    await expect(loadTTF(woff2)).rejects.toThrow(
      "loadTTF: WOFF2 fonts aren't supported. Convert the font to WOFF, TTF or OTF",
    );
  });

  test("throws for things that aren't a path, URL or bytes", async () => {
    await expect(loadTTF(42 as unknown as string)).rejects.toThrow(
      "loadTTF expects a path, URL, Buffer or ArrayBuffer, but received number.",
    );
    await expect(loadTTF(null as unknown as string)).rejects.toThrow(
      "but received null.",
    );
  });
});

describe("measureVectorText", () => {
  test("measures a line", () => {
    const { width, height, lines } = measureVectorText(openSans, 32, "Hi");

    expect(width).toBe(advance(openSans, "H", 32) + advance(openSans, "i", 32));
    // Open Sans's ascender, descender and line gap (2189, -600 and 0)
    expect(height).toBe(((2189 + 600) * 32) / 2048);
    expect(lines).toStrictEqual(["Hi"]);
  });

  test("applies kerning", () => {
    const kerned = measureVectorText(inter, 100, "AV").width;
    const unkerned = advance(inter, "A", 100) + advance(inter, "V", 100);

    expect(kerned).toBeCloseTo(unkerned - (140 * 100) / 2048, 10);
  });

  test("applies ligatures", () => {
    const [ligature] = openSans.opentype.stringToGlyphs("fi");

    expect(openSans.opentype.stringToGlyphs("fi")).toHaveLength(1);
    expect(measureVectorText(openSans, 2048, "fi").width).toBe(
      ligature!.advanceWidth,
    );
  });

  test("adds letter spacing between characters, without ligatures", () => {
    expect(
      measureVectorText(openSans, 32, "fi", undefined, { letterSpacing: 3 })
        .width,
    ).toBe(advance(openSans, "f", 32) + advance(openSans, "i", 32) + 3);
    expect(
      measureVectorText(inter, 32, "Hello", undefined, { letterSpacing: -1 })
        .width,
    ).toBe(measureVectorText(inter, 32, "Hello").width - 4);
  });

  test("measures missing characters with .notdef, one per code point", () => {
    const notdef =
      (inter.opentype.stringToGlyphs("\0")[0]!.advanceWidth! * 32) / 2048;

    expect(measureVectorText(inter, 32, "é").width).toBe(notdef);
    // An emoji is two UTF-16 code units but one code point
    expect(measureVectorText(inter, 32, "😀").width).toBe(notdef);
  });

  test("breaks lines at \\n, \\r\\n and \\r, keeping empty lines", () => {
    const lineHeight = measureVectorText(inter, 20, "").height;
    const { lines, height } = measureVectorText(inter, 20, "a\r\nb\rc\n\nd\n");

    expect(lines).toStrictEqual(["a", "b", "c", "", "d", ""]);
    expect(height).toBe(6 * lineHeight);
  });

  test("measures empty text as one empty line", () => {
    const { width, height, lines } = measureVectorText(inter, 20, "");

    expect(width).toBe(0);
    expect(height).toBeGreaterThan(0);
    expect(lines).toStrictEqual([""]);
  });

  test("measures numbers", () => {
    expect(measureVectorText(inter, 20, 42)).toStrictEqual(
      measureVectorText(inter, 20, "42"),
    );
  });

  test("wraps whole words at maxWidth", () => {
    const text = "the quick brown fox jumps over the lazy dog";
    const width = measureVectorText(inter, 20, "the quick brown").width;
    const { lines } = measureVectorText(inter, 20, text, width);

    expect(lines).toStrictEqual([
      "the quick brown",
      "fox jumps over",
      "the lazy dog",
    ]);

    for (const line of lines) {
      expect(measureVectorText(inter, 20, line).width).toBeLessThanOrEqual(
        width,
      );
    }
  });

  test("only wraps at maxWidth", () => {
    const text = "the quick brown fox jumps over the lazy dog";

    expect(measureVectorText(inter, 20, text).lines).toStrictEqual([text]);
  });

  test("breaks words wider than maxWidth between characters", () => {
    const width = measureVectorText(inter, 20, "abcd").width;

    expect(
      measureVectorText(inter, 20, "abcdefghij", width).lines,
    ).toStrictEqual(["abcd", "efgh", "ij"]);
    // Filling the line the word starts on
    expect(
      measureVectorText(inter, 20, "a bcdefghij", width).lines,
    ).toStrictEqual(["a bc", "defg", "hij"]);
    // A line holds at least one character, however narrow
    expect(measureVectorText(inter, 20, "ab", 1).lines).toStrictEqual([
      "a",
      "b",
    ]);
  });

  test("keeps runs of spaces, but drops spaces where text wraps", () => {
    const width = measureVectorText(inter, 20, "aaa bbb").width;

    expect(measureVectorText(inter, 20, "a  b", width).lines).toStrictEqual([
      "a  b",
    ]);
    expect(measureVectorText(inter, 20, "  a", width).lines).toStrictEqual([
      "  a",
    ]);
    expect(
      measureVectorText(inter, 20, "aaa bbb    ccc", width).lines,
    ).toStrictEqual(["aaa bbb", "ccc"]);
    expect(measureVectorText(inter, 20, "aaa   ", 1).lines).toStrictEqual([
      "a",
      "a",
      "a",
    ]);
  });

  test("uses lineHeight", () => {
    expect(
      measureVectorText(inter, 20, "a\nb", undefined, { lineHeight: 30 })
        .height,
    ).toBe(60);
  });

  test("throws for invalid options", () => {
    expect(() => measureVectorText(inter, NaN, "a")).toThrow();
    expect(() => measureVectorText(inter, -1, "a")).toThrow();
    expect(() => measureVectorText({} as VectorFont, 20, "a")).toThrow(
      "measureVectorText expects a font loaded with loadTTF, but received object.",
    );
  });
});

describe("printText", () => {
  test("draws text in the box at x, y", () => {
    const image = makeImage(100, 60).printText({
      font: inter,
      size: 32,
      x: 10,
      y: 10,
      text: "Hi",
    });
    const { width, height } = measureVectorText(inter, 32, "Hi");
    const bounds = inkBounds(image);

    expect(bounds.left).toBeGreaterThanOrEqual(10);
    expect(bounds.top).toBeGreaterThanOrEqual(10);
    expect(bounds.right).toBeLessThanOrEqual(Math.ceil(10 + width));
    expect(bounds.bottom).toBeLessThanOrEqual(Math.ceil(10 + height));
    // Black by default
    expect(solidPixel(image)).toStrictEqual([0, 0, 0, 255]);
  });

  test("draws nothing for empty text and spaces", () => {
    const empty = makeImage(20, 20);

    empty.printText({ font: inter, size: 16, x: 0, y: 0, text: "  \n " });

    expect(empty.bitmap.data.every((value) => value === 0)).toBe(true);
  });

  test("draws missing characters with .notdef", () => {
    const image = makeImage(40, 40).printText({
      font: inter,
      size: 32,
      x: 0,
      y: 0,
      text: "é",
    });

    expect(inkBounds(image).right).toBeGreaterThan(0);
  });

  test("aligns lines within maxWidth", () => {
    const text = "Hi";
    const { width } = measureVectorText(inter, 20, text);
    const draw = (options: Partial<Parameters<Image["printText"]>[0]>) =>
      makeImage(100, 40).printText({
        font: inter,
        size: 20,
        x: 5,
        y: 0,
        text,
        ...options,
      }).bitmap.data;

    expect(
      draw({ maxWidth: 80, alignmentX: HorizontalAlign.CENTER }),
    ).toStrictEqual(draw({ x: 5 + (80 - width) / 2 }));
    expect(
      draw({ maxWidth: 80, alignmentX: HorizontalAlign.RIGHT }),
    ).toStrictEqual(draw({ x: 5 + 80 - width }));
    // Without maxWidth, within the rest of the image
    expect(draw({ alignmentX: HorizontalAlign.RIGHT })).toStrictEqual(
      draw({ x: 100 - width }),
    );
  });

  test("aligns each line on its own", () => {
    const draw = (text: string, x = 0, y = 0) =>
      makeImage(100, 80).printText({
        font: inter,
        size: 20,
        x,
        y,
        text,
        maxWidth: 100,
        alignmentX: HorizontalAlign.CENTER,
      });
    const lineHeight = measureVectorText(inter, 20, "").height;
    const expected = draw("Hello");

    expected.printText({
      font: inter,
      size: 20,
      x: 0,
      y: lineHeight,
      text: "Hi",
      maxWidth: 100,
      alignmentX: HorizontalAlign.CENTER,
    });

    expect(draw("Hello\nHi").bitmap.data).toStrictEqual(expected.bitmap.data);
  });

  test("aligns text within maxHeight", () => {
    const text = "Hi\nthere";
    const { height } = measureVectorText(inter, 20, text);
    const draw = (options: Partial<Parameters<Image["printText"]>[0]>) =>
      makeImage(60, 100).printText({
        font: inter,
        size: 20,
        x: 0,
        y: 4,
        text,
        ...options,
      }).bitmap.data;

    expect(
      draw({ maxHeight: 90, alignmentY: VerticalAlign.MIDDLE }),
    ).toStrictEqual(draw({ y: 4 + (90 - height) / 2 }));
    expect(
      draw({ maxHeight: 90, alignmentY: VerticalAlign.BOTTOM }),
    ).toStrictEqual(draw({ y: 4 + 90 - height }));
    // Without maxHeight, within the rest of the image
    expect(draw({ alignmentY: VerticalAlign.BOTTOM })).toStrictEqual(
      draw({ y: 100 - height }),
    );
  });

  test("doesn't clip text taller than maxHeight", () => {
    const image = makeImage(60, 100).printText({
      font: inter,
      size: 20,
      x: 0,
      y: 0,
      text: "a\nb\nc",
      maxHeight: 10,
    });

    expect(inkBounds(image).bottom).toBeGreaterThan(40);
  });

  test("wraps at maxWidth like line breaks", () => {
    const maxWidth = measureVectorText(inter, 20, "Hello\nworld").width;
    const draw = (text: string, options = {}) =>
      makeImage(80, 80).printText({
        font: inter,
        size: 20,
        x: 0,
        y: 0,
        text,
        ...options,
      }).bitmap.data;

    expect(draw("Hello world", { maxWidth })).toStrictEqual(
      draw("Hello\nworld"),
    );
  });

  test("keeps blank lines", () => {
    const lineHeight = measureVectorText(inter, 20, "").height;
    const expected = makeImage(40, 100)
      .printText({ font: inter, size: 20, x: 0, y: 0, text: "a" })
      .printText({ font: inter, size: 20, x: 0, y: 2 * lineHeight, text: "b" });

    expect(
      makeImage(40, 100).printText({
        font: inter,
        size: 20,
        x: 0,
        y: 0,
        text: "a\n\nb",
      }).bitmap.data,
    ).toStrictEqual(expected.bitmap.data);
  });

  test("centers the glyphs in lineHeight", () => {
    const lineHeight = measureVectorText(inter, 20, "").height;
    const draw = (y: number, options = {}) =>
      makeImage(40, 80).printText({
        font: inter,
        size: 20,
        x: 0,
        y,
        text: "H",
        ...options,
      }).bitmap.data;

    expect(draw(0, { lineHeight: lineHeight + 20 })).toStrictEqual(draw(10));
  });

  test("kerns text", () => {
    const draw = (text: string) =>
      inkBounds(
        makeImage(200, 100).printText({
          font: inter,
          size: 64,
          x: 0,
          y: 0,
          text,
        }),
      );

    // AV is narrower than A and V side by side
    expect(draw("AV").right).toBeLessThan(
      draw("A").right + Math.round(advance(inter, "V", 64)) - 2,
    );
  });

  test("fills with colors", () => {
    const draw = (
      color: Parameters<Image["printText"]>[0]["color"],
      image = makeImage(80, 80),
    ) =>
      solidPixel(
        image.printText({
          font: inter,
          size: 64,
          x: 0,
          y: 0,
          text: "I",
          color,
        }),
      );

    expect(draw(0x112233ff)).toStrictEqual([0x11, 0x22, 0x33, 0xff]);
    expect(draw("#112233")).toStrictEqual([0x11, 0x22, 0x33, 0xff]);
    expect(draw({ r: 17, g: 34, b: 51 })).toStrictEqual([17, 34, 51, 255]);
  });

  test("converts CSS colors to the image's colour space", () => {
    const image = new Jimp({
      width: 80,
      height: 80,
      color: 0,
      colorSpace: "display-p3",
    });

    image.printText({
      font: inter,
      size: 64,
      x: 0,
      y: 0,
      text: "I",
      color: "red",
    });

    // sRGB red in Display P3
    expect(solidPixel(image)).toStrictEqual([0xea, 0x33, 0x23, 0xff]);
  });

  test("fills with gradients in image coordinates", () => {
    const image = makeImage(200, 80).printText({
      font: inter,
      size: 64,
      x: 0,
      y: 0,
      text: "IIIIIIII",
      color: {
        type: "linear",
        x1: 0,
        y1: 0,
        x2: 200,
        y2: 0,
        stops: [
          { offset: 0, color: "#ff0000" },
          { offset: 1, color: "#0000ff" },
        ],
      },
    });
    const { left, right, top, bottom } = inkBounds(image);
    const y = Math.floor((top + bottom) / 2);
    const first = [...Array(right - left).keys()]
      .map((i) => pixel(image, left + i, y))
      .find((p) => p[3] === 255)!;
    const last = [...Array(right - left).keys()]
      .map((i) => pixel(image, right - 1 - i, y))
      .find((p) => p[3] === 255)!;

    expect(first[0]).toBeGreaterThan(first[2]!);
    expect(last[2]).toBeGreaterThan(last[0]!);
  });

  test("strokes glyph outlines", () => {
    const draw = (options = {}) =>
      makeImage(80, 80).printText({
        font: inter,
        size: 64,
        x: 0,
        y: 0,
        text: "I",
        ...options,
      });
    const filled = draw();
    const outlined = draw({ stroke: "#ff0000", strokeWidth: 1 });
    const { left, right, top, bottom } = inkBounds(filled);
    const middle = pixel(
      outlined,
      Math.floor((left + right) / 2),
      Math.floor((top + bottom) / 2),
    );

    // With only a stroke, the inside of the stem isn't filled
    expect(middle).toStrictEqual([0, 0, 0, 0]);
    expect(pixel(outlined, left, Math.floor((top + bottom) / 2))[0]).toBe(255);
    // The stroke is centered on the outline, so it reaches outside the fill
    expect(inkBounds(outlined).left).toBeLessThanOrEqual(left);
    expect(inkBounds(outlined).right).toBeGreaterThanOrEqual(right);

    // Filled and stroked
    const both = draw({ color: "#00ff00", stroke: "#ff0000", strokeWidth: 1 });

    expect(
      pixel(
        both,
        Math.floor((left + right) / 2),
        Math.floor((top + bottom) / 2),
      ),
    ).toStrictEqual([0, 255, 0, 255]);
  });

  test("throws for invalid colors without drawing anything", () => {
    const image = makeImage(40, 40);
    const draw = (options = {}) =>
      image.printText({
        font: inter,
        size: 20,
        x: 0,
        y: 0,
        text: "Hi",
        ...options,
      });

    expect(() => draw({ color: "notacolor" })).toThrow(
      'Invalid color "notacolor"',
    );
    expect(() => draw({ stroke: "nope" })).toThrow('Invalid color "nope"');
    expect(() => draw({ color: "red", stroke: "nope" })).toThrow(
      'Invalid color "nope"',
    );
    expect(image.bitmap.data.every((value) => value === 0)).toBe(true);
  });

  test("throws for invalid options", () => {
    const image = makeImage(10, 10);
    const draw = (options: object) =>
      image.printText({
        font: inter,
        size: 20,
        x: 0,
        y: 0,
        text: "a",
        ...options,
      });

    expect(() => draw({ size: NaN })).toThrow();
    expect(() => draw({ x: Infinity })).toThrow();
    expect(() => draw({ strokeWidth: -1 })).toThrow();
    expect(() => draw({ font: undefined })).toThrow(
      "printText expects a font loaded with loadTTF, but received undefined.",
    );
    expect(() => draw({ font: { chars: {}, pages: [] } })).toThrow(
      "printText expects a font loaded with loadTTF, but received a bitmap font from loadFont. Draw bitmap fonts with print instead.",
    );
  });

  test("clips text outside the image", () => {
    const image = makeImage(20, 20).printText({
      font: inter,
      size: 64,
      x: -30,
      y: -30,
      text: "Hello",
    });

    expect(image.bitmap.width).toBe(20);
  });
});
