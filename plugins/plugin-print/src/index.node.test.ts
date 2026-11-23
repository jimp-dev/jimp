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

/** The rows of `image` that have anything drawn on them */
function inkedRows(image: InstanceType<typeof Jimp>) {
  const rows: number[] = [];

  for (let y = 0; y < image.bitmap.height; y++) {
    for (let x = 0; x < image.bitmap.width; x++) {
      if (image.getPixelColor(x, y) !== 0xffffffff) {
        rows.push(y);
        break;
      }
    }
  }

  return rows;
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

  describe("loadFont errors (#1339)", () => {
    async function withoutFetch<T>(fn: () => Promise<T>) {
      const { fetch } = globalThis;
      // @ts-expect-error Simulate runtimes without fetch
      delete globalThis.fetch;

      try {
        return await fn();
      } finally {
        globalThis.fetch = fetch;
      }
    }

    test("throws a clear error when given the contents of a font", async () => {
      const xml = await fs.readFile(fonts.SANS_16_BLACK, "utf-8");
      const ascii = createFontFile("page.png");
      const message =
        "loadFont expects a path or URL to a font file, but received the contents of one";

      await expect(loadFont(xml)).rejects.toThrow(message);
      await expect(loadFont(ascii)).rejects.toThrow(message);
      await expect(loadFont(ascii.split("\n")[0]!)).rejects.toThrow(message);
      await expect(
        loadFont('<?xml version="1.0"?><font></font>'),
      ).rejects.toThrow(message);
      await withoutFetch(() => expect(loadFont(xml)).rejects.toThrow(message));
    });

    test("throws a clear error when the font file doesn't exist", async () => {
      const error =
        'loadFont: font file not found: "fonts/open-sans-16-blak.fnt". Pass a path to a .fnt file, a URL, or a SANS_* constant from jimp/fonts.';

      await expect(loadFont("fonts/open-sans-16-blak.fnt")).rejects.toThrow(
        error,
      );
      await withoutFetch(() =>
        expect(loadFont("fonts/open-sans-16-blak.fnt")).rejects.toThrow(error),
      );
    });

    test("throws a clear error when a page of a font on disk doesn't exist", async () => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      const fontFile = path.join(dir, "font.fnt");

      try {
        await fs.writeFile(fontFile, createFontFile("missing.png"));

        await expect(loadFont(fontFile)).rejects.toThrow(
          `loadFont: font page not found: ${JSON.stringify(path.join(dir, "missing.png"))}`,
        );
      } finally {
        await fs.rm(dir, { recursive: true, force: true });
      }
    });

    test("throws a clear error when a page isn't a PNG (#1024)", async () => {
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      const fontFile = path.join(dir, "font.fnt");
      // An uncompressed 32-bit 4x4 TGA, BMFont's default page format
      const tgaHeader = Buffer.alloc(18);
      tgaHeader[2] = 2;
      tgaHeader.writeUInt16LE(4, 12);
      tgaHeader.writeUInt16LE(4, 14);
      tgaHeader[16] = 32;
      tgaHeader[17] = 0x28;
      const tga = Buffer.concat([tgaHeader, Buffer.alloc(4 * 4 * 4, 0xff)]);
      const advice =
        "Jimp fonts need PNG pages. In BMFont, set the texture format to png when exporting.";

      try {
        await fs.writeFile(path.join(dir, "font_0.tga"), tga);
        await fs.writeFile(fontFile, createFontFile("font_0.tga"));

        await expect(loadFont(fontFile)).rejects.toThrow(
          `loadFont: font page ${JSON.stringify(path.join(dir, "font_0.tga"))} is a TGA image; ${advice}`,
        );

        // A page that isn't a PNG whatever its name says
        await fs.writeFile(path.join(dir, "font_0.png"), tga);
        await fs.writeFile(fontFile, createFontFile("font_0.png"));

        await expect(loadFont(fontFile)).rejects.toThrow(
          `loadFont: font page ${JSON.stringify(path.join(dir, "font_0.png"))} isn't a PNG image; ${advice}`,
        );

        await fs.writeFile(
          path.join(dir, "font_0.png"),
          await new Jimp({ width: 4, height: 4 }).getBuffer("image/jpeg"),
        );

        await expect(loadFont(fontFile)).rejects.toThrow(
          `loadFont: font page ${JSON.stringify(path.join(dir, "font_0.png"))} isn't a PNG image; ${advice}`,
        );
      } finally {
        await fs.rm(dir, { recursive: true, force: true });
      }
    });

    test("loads fonts and their pages from disk without fetch", async () => {
      await withoutFetch(async () => {
        const font = await loadFont(fonts.SANS_16_BLACK);
        expect(font.pages[0]!.bitmap.width).toBeGreaterThan(0);

        const fromUrl = await loadFont(
          new URL(`file://${path.resolve(fonts.SANS_8_BLACK)}`).href,
        );
        expect(fromUrl.pages[0]!.bitmap.width).toBeGreaterThan(0);
      });
    });

    test("throws a clear error when loading a URL without fetch", async () => {
      await withoutFetch(() =>
        expect(loadFont("https://example.com/font.fnt")).rejects.toThrow(
          'loadFont: can\'t load "https://example.com/font.fnt" because this runtime has no global fetch.',
        ),
      );
    });

    test("throws a clear error when the server responds with an error", async () => {
      const server = http.createServer((_, res) => {
        res.writeHead(404, "Not Found", { "Content-Type": "text/html" });
        res.end("<html><body class=error>Not found</body></html>");
      });

      await new Promise<void>((resolve) => server.listen(0, resolve));

      try {
        const { port } = server.address() as AddressInfo;
        const url = `http://localhost:${port}/fonts/font.fnt`;

        await expect(loadFont(url)).rejects.toThrow(
          `loadFont: couldn't load ${JSON.stringify(url)}: HTTP 404 Not Found`,
        );
      } finally {
        server.close();
      }
    });

    test("throws a clear error when fetch fails", async () => {
      const { fetch } = globalThis;
      globalThis.fetch = () => Promise.reject(new TypeError("fetch failed"));

      try {
        await expect(loadFont("https://example.com/font.fnt")).rejects.toThrow(
          'loadFont: couldn\'t fetch "https://example.com/font.fnt": fetch failed',
        );
      } finally {
        globalThis.fetch = fetch;
      }
    });
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

  test("words that fit on a line of their own are wrapped, not split", async () => {
    const font = await loadFont(fonts.SANS_16_BLACK);
    const maxWidth = measureText(font, "wide") + 1;

    expect(splitLines(font, "Hi wide", maxWidth).lines).toEqual([
      ["Hi"],
      ["wide"],
    ]);
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

  test("text with blank lines", async () => {
    const textImage = await createTextImage(100, 240, fonts.SANS_16_BLACK, {
      text: "One\n\nTwo\r\n\r\n\r\nThree",
    });

    expect(textImage).toMatchImageSnapshot();
  });

  describe("blank lines and spaces", () => {
    let dir: string;
    let font: Awaited<ReturnType<typeof loadFont>>;

    beforeAll(async () => {
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      // A is 4x4, a space is 2 wide and lines are 4 high
      font = await createQuestionMarkFont(dir, true);
    });

    afterAll(async () => {
      await fs.rm(dir, { recursive: true, force: true });
    });

    test("every line break starts a new line", () => {
      expect(splitLines(font, "A\n\nA", Infinity).lines).toEqual([
        ["A"],
        [""],
        ["A"],
      ]);
      expect(splitLines(font, "\n\nA", Infinity).lines).toEqual([
        [""],
        [""],
        ["A"],
      ]);
      expect(splitLines(font, "A\n\n", Infinity).lines).toEqual([
        ["A"],
        [""],
        [""],
      ]);
      expect(splitLines(font, "A\r\n\r\nA\r\rA", Infinity).lines).toEqual([
        ["A"],
        [""],
        ["A"],
        [""],
        ["A"],
      ]);
      expect(splitLines(font, "", Infinity).lines).toEqual([[""]]);
    });

    test("measureTextHeight counts empty lines", () => {
      expect(measureTextHeight(font, "A\n\nA")).toBe(12);
      expect(measureTextHeight(font, "A\r\n\r\nA")).toBe(12);
      expect(measureTextHeight(font, "\nA\n")).toBe(12);
      expect(measureTextHeight(font, "\n")).toBe(8);
      expect(measureTextHeight(font, "A A\n\nA", 5)).toBe(16);
    });

    test("measureText measures empty lines as 0 wide", () => {
      expect(measureText(font, "\n\nA A\n\n")).toBe(10);
      expect(measureText(font, "\n\n")).toBe(0);
    });

    test("print leaves empty lines blank", () => {
      const image = new Jimp({ width: 4, height: 20, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: "\nA\r\n\r\nA" });

      expect(inkedRows(image)).toEqual([4, 5, 6, 7, 12, 13, 14, 15]);
    });

    test("empty lines count when aligning vertically", () => {
      const image = new Jimp({ width: 4, height: 20, color: 0xffffffff });
      image.print({
        font,
        x: 0,
        y: 0,
        text: { text: "A\n\n", alignmentY: VerticalAlign.BOTTOM },
      });

      expect(inkedRows(image)).toEqual([8, 9, 10, 11]);
    });

    test("cb gets the bottom of the last line, even if it's empty", () => {
      const ends: { x: number; y: number }[] = [];

      for (const text of ["A\n\n", "\n\nA", "A\r\n\r\nA A"]) {
        new Jimp({ width: 20, height: 20, color: 0xffffffff }).print({
          font,
          x: 2,
          y: 1,
          text,
          cb: (end) => ends.push(end),
        });
      }

      expect(ends).toEqual([
        { x: 6, y: 13 },
        { x: 6, y: 13 },
        { x: 12, y: 13 },
      ]);
    });

    test("runs of spaces and lines of only spaces are kept", () => {
      expect(splitLines(font, "A  A\n   \nA", Infinity).lines).toEqual([
        ["A", "", "A"],
        ["", "", "", ""],
        ["A"],
      ]);

      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: "  A  A" });

      expect(inkedColumns(image)).toEqual([4, 5, 6, 7, 12, 13, 14, 15]);
    });

    test("spaces where a line wraps don't make a line of their own", () => {
      expect(splitLines(font, "A   A", 5).lines).toEqual([["A"], ["A"]]);
      expect(splitLines(font, "   A A", 5).lines).toEqual([["A"], ["A"]]);
      expect(splitLines(font, "A A   ", 5).lines).toEqual([["A"], ["A"]]);
      expect(measureTextHeight(font, "A   A", 5)).toBe(8);
    });

    test("words after a line break are split at maxWidth too", () => {
      expect(splitLines(font, "A\nAAAAA", 9).lines).toEqual([
        ["A"],
        ["AA"],
        ["AA"],
        ["A"],
      ]);
    });
  });

  describe("alignment without maxWidth or maxHeight", () => {
    let dir: string;
    let font: Awaited<ReturnType<typeof loadFont>>;

    beforeAll(async () => {
      dir = await fs.mkdtemp(path.join(os.tmpdir(), "jimp-font-"));
      font = await createQuestionMarkFont(dir, true);
    });

    afterAll(async () => {
      await fs.rm(dir, { recursive: true, force: true });
    });

    test("center-aligns within the image right of x", () => {
      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({
        font,
        x: 4,
        y: 0,
        text: { text: "A", alignmentX: HorizontalAlign.CENTER },
      });

      // A box from 4 to 20, so the 4 wide A starts at 4 + (16 - 4) / 2
      expect(inkedColumns(image)).toEqual([10, 11, 12, 13]);
    });

    test("right-aligns to the right edge of the image", () => {
      const image = new Jimp({ width: 20, height: 4, color: 0xffffffff });
      image.print({
        font,
        x: 4,
        y: 0,
        text: { text: "A", alignmentX: HorizontalAlign.RIGHT },
      });

      expect(inkedColumns(image)).toEqual([16, 17, 18, 19]);
    });

    test("aligns each line, without wrapping", () => {
      // The image is one line high, so y: -4 shows the second line
      const [first, second] = [0, -4].map((y) =>
        new Jimp({ width: 20, height: 4, color: 0xffffffff }).print({
          font,
          x: 0,
          y,
          text: { text: "A A\nA", alignmentX: HorizontalAlign.RIGHT },
        }),
      );

      // "A A" (10 wide) stays on one line
      expect(inkedColumns(first!)).toEqual([10, 11, 12, 13, 16, 17, 18, 19]);
      expect(inkedColumns(second!)).toEqual([16, 17, 18, 19]);
    });

    test("middle-aligns within the image below y", () => {
      const image = new Jimp({ width: 4, height: 20, color: 0xffffffff });
      image.print({
        font,
        x: 0,
        y: 4,
        text: { text: "A", alignmentY: VerticalAlign.MIDDLE },
      });

      expect(inkedRows(image)).toEqual([10, 11, 12, 13]);
    });

    test("bottom-aligns to the bottom edge of the image", () => {
      const image = new Jimp({ width: 4, height: 20, color: 0xffffffff });
      image.print({
        font,
        x: 0,
        y: 4,
        text: { text: "A", alignmentY: VerticalAlign.BOTTOM },
      });

      expect(inkedRows(image)).toEqual([16, 17, 18, 19]);
    });

    test("maxHeight only aligns, it doesn't clip", () => {
      const image = new Jimp({ width: 4, height: 20, color: 0xffffffff });
      image.print({ font, x: 0, y: 0, text: "A\nA\nA", maxHeight: 4 });

      expect(inkedRows(image)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });
  });

  describe("measuring text with newlines or without maxWidth", () => {
    test("measureTextHeight without maxWidth only breaks at newlines", async () => {
      const font = await loadFont(fonts.SANS_32_BLACK);
      const { lineHeight } = font.common;

      expect(lineHeight).toBe(36);
      expect(measureTextHeight(font, "Hello")).toBe(lineHeight);
      expect(measureTextHeight(font, "Hello world")).toBe(lineHeight);
      expect(measureTextHeight(font, "Hello\nworld")).toBe(lineHeight * 2);
    });

    test("measureText measures the widest line", async () => {
      const font = await loadFont(fonts.SANS_32_BLACK);
      const hello = measureText(font, "Hello");
      const world = measureText(font, "wide world");

      expect(world).toBeGreaterThan(hello);
      expect(measureText(font, "Hello\nHello")).toBe(hello);
      expect(measureText(font, "Hello\nwide world")).toBe(world);
      expect(measureText(font, "wide world\r\nHello")).toBe(world);
      expect(measureText(font, "Hello\rwide world\n")).toBe(world);
    });

    test("measureText ignores the newline glyph some fonts have", async () => {
      // The 10, 12 and 14px fonts have a glyph for \n
      const font = await loadFont(fonts.SANS_10_BLACK);

      expect(font.chars["\n"]).toBeDefined();
      expect(measureText(font, "Hello\nHello")).toBe(
        measureText(font, "Hello"),
      );
    });

    test("cb gets the end of the widest line, even after a wrap or newline", async () => {
      const font = await loadFont(fonts.SANS_32_BLACK);
      const wide = measureText(font, "wide world");
      const image = new Jimp({ width: 400, height: 200, color: 0xffffffff });
      const ends: { x: number; y: number }[] = [];

      image.print({
        font,
        x: 10,
        y: 0,
        text: "Hi\nwide world",
        cb: (end) => ends.push(end),
      });
      image.print({
        font,
        x: 10,
        y: 0,
        text: "Hi wide",
        maxWidth: measureText(font, "wide") + 1,
        cb: (end) => ends.push(end),
      });

      expect(ends).toEqual([
        { x: 10 + wide, y: 72 },
        { x: 10 + measureText(font, "wide"), y: 72 },
      ]);
    });
  });
});
