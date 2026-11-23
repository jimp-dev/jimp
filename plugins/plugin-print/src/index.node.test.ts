import { expect, test, describe } from "vitest";
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
