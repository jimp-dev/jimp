// Compares with pngjs 7.0.0, the package this is a fork of
import { PNG as UpstreamPNG } from "pngjs";
import { describe, expect, test } from "vitest";

import { readImage, validImages } from "../test/pngsuite.js";
import { PNG, decode, encode } from "./index.js";

/** Images with a tRNS colour, whose transparent pixels pngjs makes black */
const TRNS_IMAGES = new Set([
  "tbbn0g04.png",
  "tbbn2c16.png",
  "tbgn2c16.png",
  "tbrn2c08.png",
  "tbwn0g16.png",
]);

/** RGBA with transparent pixels made transparent black, as pngjs does */
function blackenTransparent(data: Uint8Array) {
  const copy = Uint8Array.from(data);

  for (let i = 0; i < copy.length; i += 4) {
    if (copy[i + 3] === 0) {
      copy.fill(0, i, i + 3);
    }
  }

  return copy;
}

describe("decoding matches pngjs", () => {
  test.each(validImages)("%s", (name) => {
    const data = readImage(name);
    const ours = PNG.sync.read(data);
    const upstream = UpstreamPNG.sync.read(Buffer.from(data));

    expect(ours.width).toBe(upstream.width);
    expect(ours.height).toBe(upstream.height);
    expect(ours.gamma).toBe(upstream.gamma);
    expect(ours.alpha).toBe(upstream.alpha);
    expect(ours.colorType).toBe(upstream.colorType);
    expect(ours.depth).toBe(upstream.depth);
    expect(
      Buffer.compare(
        TRNS_IMAGES.has(name) ? blackenTransparent(ours.data) : ours.data,
        upstream.data,
      ),
    ).toBe(0);
  });
});

describe("encoding matches pngjs byte for byte", () => {
  const options = [
    {},
    { colorType: 2 as const },
    { filterType: 4 },
    { filterType: 0, deflateLevel: 1 },
    { deflateLevel: 6, deflateStrategy: 0 },
    { inputHasAlpha: false, colorType: 2 as const },
  ];

  test.each(validImages)("%s", (name) => {
    const { width, height, data, gamma } = UpstreamPNG.sync.read(
      Buffer.from(readImage(name)),
    );

    for (const option of options) {
      const image = { width, height, data, gamma };

      expect(
        Buffer.compare(
          PNG.sync.write(image, option),
          UpstreamPNG.sync.write(image as UpstreamPNG, option),
        ),
      ).toBe(0);
    }

    // 16-bit
    const data16 = Uint16Array.from(data, (v) => v * 257);
    const image16 = { width, height, data: Buffer.from(data16.buffer), gamma };

    expect(
      Buffer.compare(
        PNG.sync.write(image16, { bitDepth: 16 }),
        UpstreamPNG.sync.write(image16 as UpstreamPNG, { bitDepth: 16 }),
      ),
    ).toBe(0);
  });
});

describe("pngjs decodes what we encode", () => {
  test.each(validImages)("%s", (name) => {
    const image = decode(readImage(name));

    for (const interlace of [false, true]) {
      const png = encode(image, { interlace });
      const upstream = UpstreamPNG.sync.read(Buffer.from(png));

      expect(Buffer.compare(upstream.data, image.data)).toBe(0);
    }
  });
});

describe("round trips", () => {
  test.each(validImages)("%s", (name) => {
    const data = readImage(name);
    const image8 = decode(data);
    const image16 = decode(data, { outputDepth: 16 });

    expect(Buffer.compare(decode(encode(image8)).data, image8.data)).toBe(0);
    expect(decode(encode(image16), { outputDepth: 16 }).data).toEqual(
      image16.data,
    );
  });
});
