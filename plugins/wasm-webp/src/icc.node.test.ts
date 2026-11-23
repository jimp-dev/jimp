import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import webp from "./index.js";

const Jimp = createJimp({ formats: [webp] });

/** The WebP's chunk types and its ICCP chunk */
function readChunks(data: Buffer) {
  const types: string[] = [];
  let profile: Buffer | undefined;
  let flags: number | undefined;
  let offset = 12;

  expect(data.readUInt32LE(4)).toBe(data.length - 8);

  while (offset < data.length) {
    const type = data.toString("latin1", offset, offset + 4);
    const size = data.readUInt32LE(offset + 4);

    if (type === "ICCP") {
      profile = data.subarray(offset + 8, offset + 8 + size);
    } else if (type === "VP8X") {
      flags = data[offset + 8];
    }

    types.push(type);
    offset += 8 + size + (size & 1);
  }

  return { types, profile, flags };
}

describe("ICC profile", () => {
  const p3Image = (color: number) =>
    new Jimp({ width: 5, height: 3, color, colorSpace: "display-p3" });

  test.each([
    ["lossy", 0xff0000ff, {}],
    ["lossy with alpha", 0xff000080, {}],
    ["lossless", 0xff0000ff, { lossless: 1 }],
    ["lossless with alpha", 0xff000080, { lossless: 1 }],
  ])("writes the ICC profile to %s WebP", async (_, color, options) => {
    const image = p3Image(color);
    const output = await image.getBuffer("image/webp", options);
    const { types, profile, flags } = readChunks(output);
    const hasAlpha = (color & 0xff) !== 0xff;

    expect(types.slice(0, 2)).toEqual(["VP8X", "ICCP"]);
    expect(profile).toEqual(image.iccProfile);
    expect(flags! & 0x20).toBe(0x20);
    expect(Boolean(flags! & 0x10)).toBe(hasAlpha);
    // The canvas size, stored minus one
    expect(output.readUIntLE(24, 3)).toBe(4);
    expect(output.readUIntLE(27, 3)).toBe(2);

    const reread = await Jimp.fromBuffer(output);

    expect(reread.colorSpace).toBe("display-p3");
    expect(reread.width).toBe(5);
    expect(reread.bitmap.data[3]).toBe(color & 0xff);
  });

  test("converts to sRGB with icc: false", async () => {
    const image = p3Image(0xff0000ff);
    const output = await image.getBuffer("image/webp", {
      lossless: 1,
      icc: false,
    });
    const reread = await Jimp.fromBuffer(output);

    expect(readChunks(output).profile).toBeUndefined();
    expect(reread.colorSpace).toBe("srgb");
    // Display P3 red is outside sRGB, so it's clipped to sRGB red
    expect(reread.getPixelColor(0, 0)).toBe(0xff0000ff);
  });
});
