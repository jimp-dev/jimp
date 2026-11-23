import { afterAll, beforeAll, describe, expect, test } from "vitest";
import "@jimp/test-utils/image-snapshot";
import { HorizontalAlign, VerticalAlign, createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { promises as fs } from "fs";
import http from "http";
import { AddressInfo } from "net";
import os from "os";
import path from "path";

import { methods, measureText, measureTextHeight } from "./index.js";
import { splitLines } from "./measure-text.js";
import { loadFont } from "./load-font.js";
import { resolvePagePath } from "./load-bitmap-font.js";
import * as fonts from "./fonts.js";

const Jimp = createJimp({ plugins: [methods], formats: [png, jpeg] });

function createFontFile(page: string) {
  return [
    "common lineHeight=4 base=4 scaleW=4 scaleH=4 pages=1",
    `page id=0 file="${page}"`,
    "char id=65 x=0 y=0 width=4 height=4 xoffset=0 yoffset=0 xadvance=4 page=0",
  ].join("\n");
}

const EMOJI = "😀"; // U+1F600, outside the BMP
const KANJI = "日"; // U+65E5

/**
 * Writes a font with 4x4 glyphs for 😀 (red), 日 (green) and A (blue), with
 * kerning of 2 from 😀 to A, 1 from 😀 to a space and 1 from A to 😀.
 */
async function createAstralFont(dir: string) {
  const page = new Jimp({ width: 12, height: 4, color: 0xff0000ff });

  page.scan(4, 0, 4, 4, (_, __, idx) => {
    page.bitmap.data.writeUInt32BE(0x00ff00ff, idx);
  });
  page.scan(8, 0, 4, 4, (_, __, idx) => {
    page.bitmap.data.writeUInt32BE(0x0000ffff, idx);
  });

  const char = (char: string, x: number) =>
    `char id=${char.codePointAt(0)} x=${x} y=0 width=4 height=4 xoffset=0 yoffset=0 xadvance=4 page=0`;
  const fontFile = path.join(dir, "astral.fnt");

  await fs.writeFile(
    path.join(dir, "astral.png"),
    await page.getBuffer("image/png"),
  );
  await fs.writeFile(
    fontFile,
    [
      "common lineHeight=4 base=4 scaleW=12 scaleH=4 pages=1",
      'page id=0 file="astral.png"',
      char(EMOJI, 0),
      char(KANJI, 4),
      char("A", 8),
      `kerning first=${EMOJI.codePointAt(0)} second=65 amount=2`,
      `kerning first=${EMOJI.codePointAt(0)} second=32 amount=1`,
      `kerning first=65 second=${EMOJI.codePointAt(0)} amount=1`,
    ].join("\n"),
  );

  return loadFont(fontFile);
}

/**
 * Writes a font with a 4 wide A (blue) and a space 2 wide, and, if
 * `questionMark` is set, a 6 wide ? (red), with kerning of 1 from A to ? and
 * 2 from ? to A.
 */
async function createQuestionMarkFont(dir: string, questionMark: boolean) {
  const page = new Jimp({ width: 10, height: 4, color: 0x0000ffff });

  page.scan(4, 0, 6, 4, (_, __, idx) => {
    page.bitmap.data.writeUInt32BE(0xff0000ff, idx);
  });

  const name = questionMark ? "question" : "no-question";
  const fontFile = path.join(dir, `${name}.fnt`);

  await fs.writeFile(
    path.join(dir, `${name}.png`),
    await page.getBuffer("image/png"),
  );
  await fs.writeFile(
    fontFile,
    [
      "common lineHeight=4 base=4 scaleW=10 scaleH=4 pages=1",
      `page id=0 file="${name}.png"`,
      "char id=65 x=0 y=0 width=4 height=4 xoffset=0 yoffset=0 xadvance=4 page=0",
      "char id=32 x=0 y=0 width=0 height=0 xoffset=0 yoffset=0 xadvance=2 page=0",
      ...(questionMark
        ? [
            "char id=63 x=4 y=0 width=6 height=4 xoffset=0 yoffset=0 xadvance=6 page=0",
            "kerning first=65 second=63 amount=1",
            "kerning first=63 second=65 amount=2",
          ]
        : []),
    ].join("\n"),
  );

  return loadFont(fontFile);
}

/** The columns of `image` that have anything drawn on them */
function inkedColumns(image: InstanceType<typeof Jimp>) {
  const columns: number[] = [];

  for (let x = 0; x < image.bitmap.width; x++) {
    for (let y = 0; y < image.bitmap.height; y++) {
      if (image.getPixelColor(x, y) !== 0xffffffff) {
        columns.push(x);
        break;
      }
    }
  }

  return columns;
}

async function createTextImage(
  width: number,
  height: number,
  font: string,
  {
    x = 0,
    y = 0,
    text,
    maxWidth,
    maxHeight,
  }: {
    text:
      | string
      | {
          text: string;
          alignmentX?: HorizontalAlign;
          alignmentY?: VerticalAlign;
        };
    maxWidth?: number;
    maxHeight?: number;
    x?: number;
    y?: number;
  },
) {
  const loadedFont = await loadFont(font);
  const image = new Jimp({ width, height, color: 0xffffffff });

  return image
    .print({ font: loadedFont, x, y, text, maxWidth, maxHeight })
    .getBuffer("image/png");
}

describe("Write text over image", function () {
  const fontDefs = {
    SANS_8_BLACK: { w: 28, h: 28, bg: 0xffffffff },

    SANS_16_BLACK: { w: 54, h: 54, bg: 0xffffffff },
    SANS_32_BLACK: { w: 114, h: 114, bg: 0xffffffff },
    SANS_64_BLACK: { w: 220, h: 220, bg: 0xffffffff },

    SANS_8_WHITE: { w: 28, h: 28, bg: 0x000000ff },

    SANS_16_WHITE: { w: 54, h: 54, bg: 0x000000ff },
    SANS_32_WHITE: { w: 114, h: 114, bg: 0x000000ff },
    SANS_64_WHITE: { w: 220, h: 220, bg: 0x000000ff },
  };

  Object.entries(fontDefs).forEach(([fontName, conf]) => {
    test("Jimp preset " + fontName + " bitmap font", async () => {
      const font = await loadFont(fonts[fontName as keyof typeof fonts]);
      const image = new Jimp({ width: conf.w, height: conf.h, color: conf.bg });
      const output = await image
        .print({
          font,
          x: 0,
          y: 0,
          text: "This is only a test.",
          maxWidth: image.bitmap.width,
        })
        .getBuffer("image/png");

      expect(output).toMatchImageSnapshot();
    });
  });

  test("Jimp preset SANS_16_BLACK bitmap font positioned", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const image = new Jimp({ width: 300, height: 100, color: 0xff8800ff });
    const output = await image
      .print({
        font,
        x: 150,
        y: 50,
        text: "This is only a test.",
        maxWidth: 100,
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("Jimp loads font from URL", async () => {
    const font = await loadFont(
      "https://raw.githubusercontent.com/jimp-dev/jimp/main/plugins/plugin-print/fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt",
    );
    const image = new Jimp({ width: 300, height: 100, color: 0xff8800ff });
    const output = await image
      .print({
        font,
        x: 150,
        y: 50,
        text: "This is only a test.",
        maxWidth: 100,
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("Max width works without spaces", async () => {
    const font = await loadFont(
      "https://raw.githubusercontent.com/jimp-dev/jimp/main/plugins/plugin-print/fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt",
    );
    const image = new Jimp({ width: 300, height: 100, color: 0xff8800ff });
    const output = await image
      .print({
        font,
        x: 150,
        y: 50,
        text: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        maxWidth: 100,
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("Jimp does not load font pages outside of the font directory", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
    const fontFile = path.join(dir, "fonts", "font.fnt");
    const secret = new Jimp({ width: 4, height: 4, color: 0xff0000ff });

    try {
      await fs.mkdir(path.dirname(fontFile));
      await fs.writeFile(
        path.join(dir, "secret.png"),
        await secret.getBuffer("image/png"),
      );
      await fs.writeFile(fontFile, createFontFile("../secret.png"));

      await expect(loadFont(fontFile)).rejects.toThrow(
        "Font page is outside of the font directory",
      );
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  test("loadFont throws a clear error when not given a path", async () => {
    // e.g. v0's Jimp.FONT_SANS_32_BLACK, which is undefined in v1
    await expect(loadFont(undefined as unknown as string)).rejects.toThrow(
      'loadFont expects a path or URL to a font file, but received undefined. Fonts are named exports of "jimp/fonts"',
    );
  });

  test("Jimp does not load font pages outside of a remote font's directory", async () => {
    const page = await new Jimp({
      width: 4,
      height: 4,
      color: 0xff0000ff,
    }).getBuffer("image/png");
    const requests: string[] = [];
    const server = http.createServer((req, res) => {
      const url = new URL(req.url!, "http://localhost");
      requests.push(url.pathname);

      if (url.pathname.endsWith(".fnt")) {
        res.end(createFontFile(url.searchParams.get("page")!));
      } else {
        res.end(page);
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    const fontUrl = (page: string) =>
      `http://127.0.0.1:${port}/fonts/font.fnt?page=${encodeURIComponent(page)}`;

    try {
      const font = await loadFont(fontUrl("sub/page.png"));
      expect(font.pages[0]!.bitmap.width).toBe(4);
      expect(requests).toEqual(["/fonts/font.fnt", "/fonts/sub/page.png"]);

      for (const evil of [
        "../secret.png",
        "%2e%2e/secret.png",
        "..\\secret.png",
        "sub%2f..%2f..%2fsecret.png",
        "//localhost/secret.png",
        "http://localhost/secret.png",
        "../../../http://localhost/secret.png",
      ]) {
        requests.length = 0;
        await expect(loadFont(fontUrl(evil))).rejects.toThrow(
          "Font page is outside of the font directory",
        );
        expect(requests).toEqual(["/fonts/font.fnt"]);
      }
    } finally {
      server.close();
    }
  });

  test("resolvePagePath keeps pages inside the font directory", () => {
    const inside = [
      ["/fonts/a.fnt", "a.png", path.join("/fonts", "a.png")],
      ["/fonts/a.fnt", "sub/a.png", path.join("/fonts", "sub/a.png")],
      ["/fonts/a.fnt", "sub/../a.png", path.join("/fonts", "a.png")],
      ["/fonts/a.fnt", "/a.png", path.join("/fonts", "a.png")],
      ["a.fnt", "a.png", "a.png"],
      ["http://host/fonts/a.fnt", "a.png", "http://host/fonts/a.png"],
      ["https://host/f/a.fnt?v=1", "sub/a.png", "https://host/f/sub/a.png"],
      ["https://host/o/fonts%2Fa.fnt", "a.png", "https://host/o/a.png"],
    ];

    for (const [file, page, expected] of inside) {
      expect(resolvePagePath(file!, page!)).toBe(expected);
    }

    const outside = [
      ["/fonts/a.fnt", "../a.png"],
      ["/fonts/a.fnt", ".."],
      ["/fonts/a.fnt", "sub/../../a.png"],
      ["/fonts/a.fnt", "..\\a.png"],
      ["/fonts/a.fnt", "%2e%2e/a.png"],
      ["a.fnt", "../a.png"],
      ["a.fnt", "http://host/a.png"],
      ["a.fnt", "data:image/png;base64,AAAA"],
      ["http://host/fonts/a.fnt", "../a.png"],
      ["http://host/fonts/a.fnt", "%2E%2E/a.png"],
      ["http://host/fonts/a.fnt", "..\\a.png"],
      ["http://host/fonts/a.fnt", "..%2fa.png"],
      ["http://host/fonts/a.fnt", "//other/fonts/a.png"],
      ["http://host/fonts/a.fnt", "https://host/fonts/a.png"],
    ];

    for (const [file, page] of outside) {
      expect(() => resolvePagePath(file!, page!), `${file} ${page}`).toThrow(
        "Font page is outside of the font directory",
      );
    }
  });

  test("Jimp renders ? for unknown characters", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const image = new Jimp({ width: 300, height: 100, color: 0xff8800ff });
    const output = await image
      .print({ font, x: 0, y: 0, text: "ツ ツ ツ", maxWidth: 100 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  describe("characters the font has no glyph for", () => {
    let dir: string;
    let font: Awaited<ReturnType<typeof loadFont>>;
    let fontWithoutQuestionMark: Awaited<ReturnType<typeof loadFont>>;

    beforeAll(async () => {
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      font = await createQuestionMarkFont(dir, true);
      fontWithoutQuestionMark = await createQuestionMarkFont(dir, false);
    });

    afterAll(async () => {
      await fs.rm(dir, { recursive: true, force: true });
    });

    test("measureText measures them as the ? that print draws", () => {
      // A (4), kerning A to ? (1), ? (6), kerning ? to A (2), A (4)
      expect(measureText(font, "AxA")).toBe(17);
      expect(measureText(font, "x")).toBe(6);

      const image = new Jimp({ width: 30, height: 4, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: "AxA" });

      // A, then ? after a kerning of 1, then A after a kerning of 2
      expect(inkedColumns(image)).toEqual([
        0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 13, 14, 15, 16,
      ]);
    });

    test("they are skipped if the font has no ? either", () => {
      expect(measureText(fontWithoutQuestionMark, "AxA")).toBe(8);
    });

    test("lines with them wrap at maxWidth", () => {
      // "A x" is 12 wide, "A x A" 18
      expect(splitLines(font, "A x A", 12).lines).toEqual([["A", "x"], ["A"]]);
      expect(measureTextHeight(font, "A x A", 12)).toBe(8);

      const image = new Jimp({ width: 30, height: 8, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: "A x A", maxWidth: 12 });

      expect(Math.max(...inkedColumns(image))).toBeLessThan(12);
    });

    test("words with them are split at maxWidth, with kerning", () => {
      // "Ax" is 11 wide and "xA" 12, so neither fits in 10
      expect(splitLines(font, "AxA", 10).lines).toEqual([["A"], ["x"], ["A"]]);
    });

    test("right-align text with them", () => {
      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({
        font,
        x: 0,
        y: 0,
        text: { text: "x", alignmentX: HorizontalAlign.RIGHT },
        maxWidth: 20,
      });

      expect(inkedColumns(image)).toEqual([14, 15, 16, 17, 18, 19]);
    });

    test("center-align text with them", () => {
      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({
        font,
        x: 0,
        y: 0,
        text: { text: "x", alignmentX: HorizontalAlign.CENTER },
        maxWidth: 20,
      });

      expect(inkedColumns(image)).toEqual([7, 8, 9, 10, 11, 12]);
    });
  });

  describe("characters outside the BMP", () => {
    let dir: string;
    let font: Awaited<ReturnType<typeof loadFont>>;

    beforeAll(async () => {
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      font = await createAstralFont(dir);
    });

    afterAll(async () => {
      await fs.rm(dir, { recursive: true, force: true });
    });

    test("glyphs and kernings are keyed by code point", () => {
      expect(font.chars[EMOJI]?.id).toBe(0x1f600);
      expect(font.chars[KANJI]?.id).toBe(0x65e5);
      // Not under the truncated String.fromCharCode(0x1f600), U+F600
      expect(font.chars[String.fromCharCode(0x1f600)]).toBeUndefined();
      expect(font.kernings[EMOJI]?.["A"]).toBe(2);
    });

    test("prints each glyph once, with kerning", () => {
      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: `${KANJI}${EMOJI}A` });

      const colors = Array.from({ length: 20 }, (_, x) =>
        image.getPixelColor(x, 0),
      );

      expect(colors).toEqual([
        ...Array(4).fill(0x00ff00ff),
        ...Array(4).fill(0xff0000ff),
        ...Array(2).fill(0xffffffff),
        ...Array(4).fill(0x0000ffff),
        ...Array(6).fill(0xffffffff),
      ]);
    });

    test("measureText counts each character once, with kerning", () => {
      expect(measureText(font, EMOJI)).toBe(4);
      expect(measureText(font, `${KANJI}${EMOJI}A`)).toBe(14);
    });

    test("splitLines doesn't split surrogate pairs", () => {
      expect(splitLines(font, EMOJI.repeat(3), 9).lines).toEqual([
        [EMOJI.repeat(2)],
        [EMOJI],
      ]);
      expect(measureTextHeight(font, EMOJI.repeat(3), 9)).toBe(8);
    });

    test("splitLines applies kerning around characters outside the BMP", () => {
      // 😀A is 10 wide with kerning, so it doesn't fit in 9
      expect(splitLines(font, `${EMOJI}A${EMOJI}A`, 9).lines).toEqual([
        [EMOJI],
        [`A${EMOJI}`],
        ["A"],
      ]);
      // A😀 is 9 wide with kerning, so it doesn't fit in 8.5
      expect(splitLines(font, `A${EMOJI}${EMOJI}`, 8.5).lines).toEqual([
        ["A"],
        [EMOJI.repeat(2)],
      ]);
      // Includes the kerning between the first word and the space after it
      const text = `${EMOJI} ${EMOJI}A`;
      expect(measureText(font, text)).toBe(15);
      expect(splitLines(font, text, Infinity).longestLine).toBe(15);
    });
  });

  test("Jimp can print numbers too", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const image = new Jimp({ width: 300, height: 100, color: 0xff8800ff });
    const output = await image
      .print({ font, x: 0, y: 0, text: 12345678, maxWidth: 100 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("text printed on a transparent image keeps its color at the edges", async () => {
    const font = await loadFont(fonts.SANS_32_WHITE);
    const image = new Jimp({ width: 200, height: 60, color: 0x00000000 });
    image.print({ font, x: 10, y: 10, text: "Hello" });

    let edgePixels = 0;
    const darkened: number[][] = [];

    image.scan((_, __, idx) => {
      const [r, g, b, a] = image.bitmap.data.subarray(idx, idx + 4);

      if (a! > 0 && a! < 255) {
        edgePixels++;
      }

      // Anti-aliased edges used to be darkened towards the transparent black
      // background, e.g. (190, 190, 190, 191). The font page itself has some
      // 254s in it.
      if (a! > 0 && Math.min(r!, g!, b!) < 254) {
        darkened.push([r!, g!, b!, a!]);
      }
    });

    expect(edgePixels).toBeGreaterThan(0);
    expect(darkened).toEqual([]);
  });

  test("left-align text by default", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: "This is only a test.",
      maxWidth: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("left-align text by default when passing object", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: { text: "This is only a test." },
      maxWidth: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("left-align text when passing object with alignmentX", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: {
        text: "This is only a test.",
        alignmentX: HorizontalAlign.LEFT,
      },
      maxWidth: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("center-align text when passing object with alignmentX", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: {
        text: "This is only a test.",
        alignmentX: HorizontalAlign.CENTER,
      },
      maxWidth: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("right-align text when passing object with alignmentX", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: {
        text: "This is only a test.",
        alignmentX: HorizontalAlign.RIGHT,
      },
      maxWidth: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("middle-align text when passing object with alignmentY", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: {
        text: "This is only a test.",
        alignmentY: VerticalAlign.MIDDLE,
      },
      maxWidth: 100,
      maxHeight: 240,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("middle-align text when passing object with alignmentY can offset y", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      y: 50,
      text: {
        text: "This is only a test.",
        alignmentY: VerticalAlign.MIDDLE,
      },
      maxWidth: 100,
      maxHeight: 240,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("bottom-align text when passing object with alignmentY", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      text: {
        text: "This is only a test.",
        alignmentY: VerticalAlign.BOTTOM,
      },
      maxWidth: 100,
      maxHeight: 240,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("bottom-align text when passing object with alignmentY offset y", async () => {
    const textImage = await createTextImage(320, 240, fonts.SANS_16_BLACK, {
      y: 100,
      text: {
        text: "This is only a test.",
        alignmentY: VerticalAlign.BOTTOM,
      },
      maxWidth: 100,
      maxHeight: 100,
    });

    expect(textImage).toMatchImageSnapshot();
  });

  test("exposes print y position in cb", async () => {
    const loadedFont = await loadFont(fonts.SANS_16_BLACK);
    const image = new Jimp({ width: 500, height: 500, color: 0xffffffff });

    image.print({
      font: loadedFont,
      x: 0,
      y: 0,
      text: "One two three four fix six seven eight nine ten eleven twelve",
      maxWidth: 250,
      cb: ({ x, y }) => {
        image.print({
          font: loadedFont,
          x,
          y: y + 50,
          text: "thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty",
          maxWidth: 250,
        });
      },
    });

    const output = await image.getBuffer("image/png");
    expect(output).toMatchImageSnapshot();
  });

  test("measureText is consistent with measureTextWidth", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);

    const text = "n n n";
    const width = measureText(font, text);
    const height = measureTextHeight(font, text, width);
    const lineHeight = measureTextHeight(font, text, Infinity);

    expect(height).toEqual(lineHeight);
  });

  test("words wider than maxWidth keep their last characters", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const maxWidth = measureText(font, "x".repeat(12)) + 1;
    const { lines } = splitLines(font, `${"x".repeat(30)} yy`, maxWidth);

    expect(lines).toEqual([
      ["x".repeat(12)],
      ["x".repeat(12)],
      ["xxxxxx", "yy"],
    ]);
  });

  test("words that only overflow with their trailing space are kept", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const maxWidth = measureText(font, "xxxx") + 1;
    const { lines } = splitLines(font, "xxxx yy", maxWidth);

    expect(lines).toEqual([["xxxx"], ["yy"]]);
  });

  test("line wrapping does not re-measure the whole line for every word", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    let lookups = 0;
    const chars = new Proxy(font.chars, {
      get(target, key, receiver) {
        lookups++;
        return Reflect.get(target, key, receiver);
      },
    });
    const text = "n ".repeat(2000);

    measureTextHeight({ ...font, chars }, text, Infinity);

    expect(lookups).toBeLessThan(text.length * 10);
  });

  test("text with newlines, default alignment", async () => {
    const textImage = await createTextImage(100, 240, fonts.SANS_16_BLACK, {
      text: "This \nis only \na \ntest.",
      maxWidth: 300,
    });

    expect(textImage).toMatchImageSnapshot();
  });
});
