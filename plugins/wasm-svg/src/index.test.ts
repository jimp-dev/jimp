import { afterEach, describe, expect, test, vi } from "vitest";
import { makeTestImage } from "@jimp/test-utils";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";

import { isSvg } from "./detect.js";
import svg from "./index.js";

const Jimp = createJimp({ formats: [png, jpeg, svg] });
const format = svg();

/** An SVG document of the given size */
function makeSvg(attributes: string, content = "") {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${content}</svg>`,
  );
}

/** A 4x4 SVG with a red square in the middle, on a blue top row */
const squares = makeSvg(
  'width="4" height="4"',
  '<rect width="4" height="1" fill="blue"/><rect x="1" y="1" width="2" height="2" fill="red"/>',
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WASM SVG", () => {
  test("renders shapes at the SVG's size", async () => {
    // Run two at once so both race to initialize resvg
    const [image] = await Promise.all([
      format.decode(squares),
      format.decode(squares),
    ]);

    expect(image).toEqual(makeTestImage("▾▾▾▾", " ▴▴ ", " ▴▴ ", "    "));
  });

  test("renders paths", async () => {
    const image = await format.decode(
      makeSvg('width="3" height="2"', '<path d="M1 0H3V2H1Z" fill="#00ff00"/>'),
    );

    expect(image).toEqual(makeTestImage(" ▸▸", " ▸▸"));
  });

  test("returns straight, not premultiplied, alpha", async () => {
    const image = await format.decode(
      makeSvg(
        'width="1" height="1"',
        '<rect width="1" height="1" fill="#ff8000" fill-opacity="0.5"/>',
      ),
    );

    expect([...image.data]).toEqual([255, 128, 0, 128]);
  });

  test("uses the viewBox's size when there's no width and height", async () => {
    const image = await format.decode(
      makeSvg('viewBox="0 0 30 20"', '<rect width="30" height="20"/>'),
    );

    expect([image.width, image.height]).toEqual([30, 20]);
  });

  test("scales the viewBox to the width and height", async () => {
    const image = await format.decode(
      makeSvg(
        'width="4" height="2" viewBox="0 0 2 1"',
        '<rect width="1" height="1" fill="red"/>',
      ),
    );

    expect(image).toEqual(makeTestImage("▴▴  ", "▴▴  "));
  });

  test("is 100x100 without a size or viewBox", async () => {
    const image = await format.decode(makeSvg(""));

    expect([image.width, image.height]).toEqual([100, 100]);
  });

  test("renders at a width, keeping the aspect ratio", async () => {
    const image = await format.decode(squares, { width: 8 });

    expect([image.width, image.height]).toEqual([8, 8]);
    expect(image.data.readUInt32BE((2 * 8 + 2) * 4)).toBe(0xff0000ff);
  });

  test("renders at a height, keeping the aspect ratio", async () => {
    const image = await format.decode(makeSvg('viewBox="0 0 30 20"'), {
      height: 10,
    });

    expect([image.width, image.height]).toEqual([15, 10]);
  });

  test("fits inside a width and height", async () => {
    const wide = makeSvg('viewBox="0 0 30 20"');

    const byWidth = await format.decode(wide, { width: 15, height: 15 });
    const byHeight = await format.decode(wide, { width: 100, height: 4 });

    expect([byWidth.width, byWidth.height]).toEqual([15, 10]);
    expect([byHeight.width, byHeight.height]).toEqual([6, 4]);
  });

  test("renders at a scale", async () => {
    const twice = await format.decode(squares, { scale: 2 });
    const tiny = await format.decode(squares, { scale: 0.001 });

    expect(twice).toEqual(
      makeTestImage(
        "▾▾▾▾▾▾▾▾",
        "▾▾▾▾▾▾▾▾",
        "  ▴▴▴▴  ",
        "  ▴▴▴▴  ",
        "  ▴▴▴▴  ",
        "  ▴▴▴▴  ",
        "        ",
        "        ",
      ),
    );
    // At least a pixel
    expect([tiny.width, tiny.height]).toEqual([1, 1]);
  });

  test("rejects a scale combined with a size", async () => {
    await expect(
      format.decode(squares, { scale: 2, width: 3 }),
    ).rejects.toThrow("Pass either scale or width and height, not both");
  });

  test("rejects options it doesn't support", async () => {
    await expect(
      // @ts-expect-error SVGs are rendered, not decoded with a quality
      format.decode(squares, { quality: 80 }),
    ).rejects.toThrow();
  });

  test.each([
    ["a CSS colour", "rgba(0, 0, 255, 0.5)"],
    ["a number", 0x0000ff80],
  ])("fills the background with %s", async (_, background) => {
    const image = await format.decode(squares, { background });

    // Behind the transparent pixels, but not the shapes
    expect(image.data.readUInt32BE((3 * 4 + 3) * 4)).toBe(0x0000ff80);
    expect(image.data.readUInt32BE((1 * 4 + 1) * 4)).toBe(0xff0000ff);
  });

  test("throws for an invalid background colour", async () => {
    await expect(
      format.decode(squares, { background: "not-a-color" }),
    ).rejects.toThrow('Invalid color "not-a-color"');
  });

  test("renders images in data URLs", async () => {
    const red = await new Jimp({
      width: 2,
      height: 2,
      color: 0xff0000ff,
    }).getBuffer("image/png");
    const image = await format.decode(
      makeSvg(
        'width="4" height="2"',
        `<image width="2" height="2" href="data:image/png;base64,${red.toString("base64")}"/>`,
      ),
    );

    expect(image).toEqual(makeTestImage("▴▴  ", "▴▴  "));
  });

  test("doesn't fetch external images or stylesheets", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    // Load the wasm first, which the browser fetches
    await format.decode(squares);
    fetch.mockClear();

    const image = await format.decode(
      makeSvg(
        'width="2" height="2" xmlns:xlink="http://www.w3.org/1999/xlink"',
        `<style>@import url("https://example.com/style.css");</style>
        <image width="2" height="2" href="https://example.com/image.png"/>
        <image width="2" height="2" xlink:href="https://example.com/image.png"/>
        <image width="2" height="2" href="/etc/hosts"/>
        <use href="https://example.com/sprite.svg#icon"/>`,
      ),
    );

    expect(fetch).not.toHaveBeenCalled();
    expect(image).toEqual(makeTestImage("  ", "  "));
  });

  test("loads external images with resolveImage", async () => {
    const red = await new Jimp({
      width: 1,
      height: 1,
      color: 0xff0000ff,
    }).getBuffer("image/png");
    const resolveImage = vi.fn(async () => red);
    const image = await format.decode(
      makeSvg(
        'width="2" height="1"',
        '<image width="1" height="1" href="https://example.com/red.png"/>',
      ),
      { resolveImage },
    );

    expect(resolveImage).toHaveBeenCalledWith("https://example.com/red.png");
    expect(image).toEqual(makeTestImage("▴ "));
  });

  test("rejects images larger than maxResolutionInMP before rendering", async () => {
    const huge = makeSvg('width="100000" height="100000"');

    await expect(format.decode(huge)).rejects.toThrow(
      "SVG dimensions 100000x100000 exceed the maximum resolution of 100 megapixels",
    );
    await expect(
      format.decode(squares, { width: 2000, maxResolutionInMP: 1 }),
    ).rejects.toThrow("SVG dimensions 2000x2000 exceed");
    // Small enough at a smaller size
    expect((await format.decode(huge, { width: 10 })).height).toBe(10);
  });

  test.each([
    ["text", Buffer.from("hello")],
    ["HTML", Buffer.from("<html><body></body></html>")],
    ["broken SVG", Buffer.from("<svg><rect></svg>")],
    ["binary data", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0xff, 0x00])],
  ])("throws for %s", async (_, data) => {
    await expect(format.decode(data)).rejects.toThrow();
  });

  test("can't write SVG", async () => {
    const image = await Jimp.read(squares);

    await expect(image.getBuffer("image/svg+xml")).rejects.toThrow(
      "Jimp can read SVG but can't write it",
    );
  });
});

describe("reading SVG with Jimp", () => {
  test("detects SVG data and reads it as sRGB", async () => {
    const image = await Jimp.read(squares, {
      "image/svg+xml": { width: 8 },
    });

    expect(image.mime).toBe("image/svg+xml");
    expect(image.width).toBe(8);
    expect(image.colorSpace).toBe("srgb");
  });

  test.each([
    ["an XML declaration", `<?xml version="1.0" encoding="UTF-8"?>\n`],
    ["a BOM", "﻿"],
    ["a BOM and XML declaration", '﻿<?xml version="1.0"?>'],
    ["comments", "<!-- Generator: an editor -->\n<!-- another -->\n"],
    [
      "a doctype",
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
    ],
    [
      "a doctype with entities",
      '<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY ns_svg "http://www.w3.org/2000/svg"> <!ENTITY red "red">]>',
    ],
    ["whitespace", "\r\n\t  "],
  ])("detects SVG after %s", async (_, prefix) => {
    const data = Buffer.concat([Buffer.from(prefix), squares]);
    const image = await Jimp.read(data);

    expect(isSvg(data)).toBe(true);
    expect(image.mime).toBe("image/svg+xml");
    expect(image.width).toBe(4);
  });

  test.each([
    ["text", "hello"],
    ["HTML", "<!DOCTYPE html><html></html>"],
    ["other XML", '<?xml version="1.0"?><rss version="2.0"/>'],
    ["an element named like svg", "<svgfoo/>"],
    ["an unclosed comment", "<!-- <svg>"],
    ["SVG after other content", "<p><svg></svg></p>"],
    ["nothing", ""],
  ])("doesn't detect %s", async (_, text) => {
    expect(isSvg(Buffer.from(text))).toBe(false);
  });

  test("only looks at the start of the data", () => {
    const comment = `<!-- ${"x".repeat(20_000)} -->`;

    expect(isSvg(Buffer.concat([Buffer.from(comment), squares]))).toBe(false);
  });

  test("still detects PNG and JPEG", async () => {
    const image = new Jimp({ width: 2, height: 2, color: 0xff0000ff });

    for (const mime of ["image/png", "image/jpeg"] as const) {
      const read = await Jimp.read(await image.getBuffer(mime));
      expect(read.mime).toBe(mime);
    }
  });

  test("still fails for data no format reads", async () => {
    await expect(Jimp.read(Buffer.from("hello"))).rejects.toThrow(
      "Could not find MIME for Buffer",
    );
  });
});
