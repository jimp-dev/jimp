import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { createJimp, HorizontalAlign, VerticalAlign } from "@jimp/core";
import "@jimp/test-utils/image-snapshot";
import png from "@jimp/js-png";
import { methods as drawMethods } from "@jimp/plugin-draw";
import { promises as fs } from "fs";
import http from "http";
import type { AddressInfo } from "net";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { measureText, methods } from "./index.js";
import { loadTTF, type VectorFont } from "./load-ttf.js";

const Jimp = createJimp({ formats: [png], plugins: [methods, drawMethods] });

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures",
);
const fixture = (name: string) => path.join(fixtures, name);

let inter: VectorFont;
let openSans: VectorFont;

beforeAll(async () => {
  inter = await loadTTF(fixture("Inter-Regular.otf"));
  openSans = await loadTTF(fixture("OpenSans-Regular.ttf"));
});

async function snapshot(image: InstanceType<typeof Jimp>) {
  expect(await image.getBuffer("image/png")).toMatchImageSnapshot();
}

describe("loadTTF in Node", () => {
  let server: http.Server;
  let origin: string;

  beforeAll(async () => {
    const font = await fs.readFile(fixture("Inter-Regular.otf"));

    server = http.createServer((request, response) => {
      if (request.url === "/Inter-Regular.otf") {
        response.end(font);
      } else {
        response.statusCode = 404;
        response.end("Not found");
      }
    });

    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => {
    server.close();
  });

  test("loads paths, file: URLs and buffers", async () => {
    const expected = measureText(inter, "AVATAR", { size: 20 });
    const bytes = await fs.readFile(fixture("Inter-Regular.otf"));
    // A view into a bigger buffer
    const padded = new Uint8Array(bytes.length + 8);

    padded.set(bytes, 4);

    for (const source of [
      pathToFileURL(fixture("Inter-Regular.otf")),
      pathToFileURL(fixture("Inter-Regular.otf")).href,
      bytes,
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
      padded.subarray(4, 4 + bytes.length),
    ]) {
      expect(
        measureText(await loadTTF(source), "AVATAR", { size: 20 }),
      ).toStrictEqual(expected);
    }
  });

  test("loads URLs with fetch", async () => {
    const font = await loadTTF(`${origin}/Inter-Regular.otf`);

    expect(measureText(font, "AVATAR", { size: 20 })).toStrictEqual(
      measureText(inter, "AVATAR", { size: 20 }),
    );
  });

  test("throws for a URL that 404s", async () => {
    await expect(loadTTF(`${origin}/missing.ttf`)).rejects.toThrow(
      `loadTTF: couldn't load "${origin}/missing.ttf": HTTP 404 Not Found`,
    );
  });

  test("throws for a URL that can't be fetched", async () => {
    await expect(loadTTF("http://127.0.0.1:1/font.ttf")).rejects.toThrow(
      'loadTTF: couldn\'t fetch "http://127.0.0.1:1/font.ttf": fetch failed',
    );
  });

  test("throws for a missing file", async () => {
    await expect(loadTTF("fonts/missing.ttf")).rejects.toThrow(
      'loadTTF: font file not found: "fonts/missing.ttf". Pass a path to a .ttf, .otf or .woff file, a URL, or the font\'s bytes.',
    );
  });

  test("throws for a broken font", async () => {
    const bytes = await fs.readFile(fixture("Inter-Regular.otf"));

    await expect(loadTTF(bytes.subarray(0, 100))).rejects.toThrow(
      /^loadTTF: couldn't read the OpenType font: /,
    );
    await expect(
      loadTTF(await fs.readFile(fixture("Inter-OFL.txt"))),
    ).rejects.toThrow(
      'loadTTF: the data isn\'t a TrueType, OpenType or WOFF font (it starts with "Copy").',
    );
  });
});

describe("vector font snapshots", () => {
  test("a word", async () => {
    const image = new Jimp({ width: 200, height: 60, color: 0xffffffff });

    image.print({ font: inter, size: 40, x: 10, y: 5, text: "Jimp!" });

    await snapshot(image);
  });

  test("a wrapped paragraph", async () => {
    const image = new Jimp({ width: 300, height: 170, color: 0xffffffff });

    image.print({
      font: inter,
      size: 16,
      x: 10,
      y: 10,
      maxWidth: 280,
      text: "Jimp draws TrueType, OpenType and WOFF fonts from their outlines, antialiased, at any size. Text wraps between words at maxWidth, and a line break\nstarts a new line, like print does.",
    });

    await snapshot(image);
  });

  test("alignment", async () => {
    const image = new Jimp({ width: 300, height: 300, color: 0xffffffff });

    const rows = [
      ["top", VerticalAlign.TOP],
      ["middle", VerticalAlign.MIDDLE],
      ["bottom", VerticalAlign.BOTTOM],
    ] as const;
    const columns = [
      ["left", HorizontalAlign.LEFT],
      ["center", HorizontalAlign.CENTER],
      ["right", HorizontalAlign.RIGHT],
    ] as const;

    for (const [row, [vertical, alignmentY]] of rows.entries()) {
      for (const [column, [horizontal, alignmentX]] of columns.entries()) {
        const x = column * 100 + 5;
        const y = row * 100 + 5;

        image.drawRect({
          x,
          y,
          w: 90,
          h: 90,
          fill: "#f1faee",
          stroke: "#a8dadc",
        });
        image.print({
          font: inter,
          size: 14,
          x,
          y,
          maxWidth: 90,
          maxHeight: 90,
          text: {
            text: `${horizontal}\n${vertical}`,
            alignmentX,
            alignmentY,
          },
        });
      }
    }

    await snapshot(image);
  });

  test("blank lines and runs of spaces", async () => {
    const image = new Jimp({ width: 160, height: 130, color: 0xffffffff });

    image.print({
      font: inter,
      size: 20,
      x: 10,
      y: 5,
      text: "one\n\nthree\r\n   four  spaces",
    });

    await snapshot(image);
  });

  test("kerning and ligatures", async () => {
    const image = new Jimp({ width: 260, height: 150, color: 0xffffffff });

    // Kerned with GPOS, and with and without the fi ligature
    image.print({ font: inter, size: 56, x: 10, y: 0, text: "AVATAR" });
    image.print({ font: openSans, size: 40, x: 10, y: 80, text: "fine" });
    image.print({
      font: openSans,
      size: 40,
      x: 130,
      y: 80,
      text: "fine",
      letterSpacing: 1,
    });

    await snapshot(image);
  });

  test("gradient fill and stroke", async () => {
    const image = new Jimp({ width: 320, height: 110, color: 0xffffffff });

    image.print({
      font: inter,
      size: 80,
      x: 0,
      y: 0,
      text: {
        text: "Jimp",
        alignmentX: HorizontalAlign.CENTER,
        alignmentY: VerticalAlign.MIDDLE,
      },
      color: {
        type: "linear",
        x1: 0,
        y1: 20,
        x2: 0,
        y2: 90,
        stops: [
          { offset: 0, color: "#ffd166" },
          { offset: 1, color: "#e63946" },
        ],
      },
      stroke: "#1d3557",
      strokeWidth: 3,
    });

    await snapshot(image);
  });

  test("stroke only", async () => {
    const image = new Jimp({ width: 220, height: 80, color: 0xffffffff });

    image.print({
      font: openSans,
      size: 60,
      x: 10,
      y: 0,
      text: "Outline",
      stroke: "black",
      strokeWidth: 1.5,
    });

    await snapshot(image);
  });

  test("missing glyphs", async () => {
    const image = new Jimp({ width: 220, height: 50, color: 0xffffffff });

    // é and the emoji aren't in the font subset
    image.print({ font: inter, size: 32, x: 10, y: 5, text: "café 😀!" });

    await snapshot(image);
  });
});

test("lays out a long paragraph quickly", () => {
  const text = "The quick brown fox jumps over the lazy dog. ".repeat(500);
  const image = new Jimp({ width: 1000, height: 1000, color: 0xffffffff });
  const start = performance.now();

  image.print({ font: inter, size: 16, x: 0, y: 0, text, maxWidth: 1000 });

  expect(performance.now() - start).toBeLessThan(2000);
});
