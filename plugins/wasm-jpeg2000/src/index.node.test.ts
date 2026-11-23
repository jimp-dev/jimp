import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

import jpeg2000, { j2c, jpx } from "./index.js";

const Jimp = createJimp({ formats: [png, jpeg2000, j2c, jpx] });

/** The fixtures, made by generate.sh with OpenJPEG's opj_compress */
function fixture(name: string) {
  return readFile(new URL(`./images/${name}`, import.meta.url));
}

/** RGBA for gray samples of the fixtures' 23x17 size, scaled to 8 bits */
function expectedGray(sample: (x: number, y: number) => number, max: number) {
  const data = Buffer.alloc(23 * 17 * 4);

  for (let y = 0; y < 17; y++) {
    for (let x = 0; x < 23; x++) {
      const value = Math.round((sample(x, y) * 255) / max);
      data.set([value, value, value, 255], (y * 23 + x) * 4);
    }
  }

  return data;
}

describe("WASM JPEG 2000 (Node)", () => {
  test.each([
    ["rgb.jp2", "image/jp2", "rgb.png"],
    ["rgb.j2k", "image/j2c", "rgb.png"],
    // Lossy, against what opj_decompress decodes it to
    ["rgb-lossy.jp2", "image/jp2", "rgb-lossy.png"],
    ["grey.jp2", "image/jp2", "grey.png"],
    // 4:2:0 YCbCr, against what opj_decompress converts it to
    ["ycc420.j2k", "image/j2c", "ycc420.png"],
  ])("decodes %s exactly", async (name, mime, reference) => {
    const image = await Jimp.read(await fixture(name));
    const expected = await Jimp.read(await fixture(reference));

    expect(image.mime).toBe(mime);
    expect(image.width).toBe(expected.width);
    expect(image.height).toBe(expected.height);
    expect(image.bitmap.data).toEqual(expected.bitmap.data);
  });

  test.each([
    [
      "16-bit",
      "grey16.jp2",
      (x: number, y: number) => (x * 2909 + y * 4093) % 65536,
      65535,
    ],
    ["4-bit", "grey4.jp2", (x: number, y: number) => (x + y) % 16, 15],
    // -2048 to 2047, shifted to 0 to 4095
    [
      "signed 12-bit",
      "signed12.j2k",
      (x: number, y: number) => (x * 181 + y * 241) % 4096,
      4095,
    ],
  ])("scales %s samples to 8 bits", async (_, name, sample, max) => {
    const image = await Jimp.read(await fixture(name));

    expect(image.bitmap.data).toEqual(expectedGray(sample, max));
  });

  test("scales 12-bit RGB samples to 8 bits", async () => {
    const image = await Jimp.read(await fixture("rgb12.jp2"));
    const pixel = (x: number, y: number) =>
      [x * 178, y * 255, (x * y * 11) % 4096]
        .map((value) => Math.round((value * 255) / 4095))
        .concat(255);

    expect([...image.bitmap.data.subarray(4, 8)]).toEqual(pixel(1, 0));
    expect([...image.bitmap.data.subarray(-4)]).toEqual(pixel(22, 16));
  });

  test("decodes JPX files", async () => {
    const jp2 = await fixture("rgb.jp2");
    // The file type box's brand and compatibility list
    const file = Buffer.from(jp2);

    file.write("jpx ", 20, "latin1");
    file.write("jpx ", 28, "latin1");

    const image = await Jimp.read(file);
    const expected = await Jimp.read(jp2);

    expect(image.mime).toBe("image/jpx");
    expect(image.bitmap.data).toEqual(expected.bitmap.data);
  });

  test("reduces to the smallest resolution the image has", async () => {
    // Made with 3 resolutions, so 2 halvings at most
    const image = await Jimp.read(await fixture("rgb.jp2"), {
      "image/jp2": { reduce: 10 },
    });

    expect([image.width, image.height]).toEqual([6, 5]);
  });

  test("throws a clear error for images with alpha", async () => {
    await expect(Jimp.read(await fixture("rgba.jp2"))).rejects.toThrow(
      "Unsupported JPEG 2000 image with 4 components: only grayscale and RGB images can be decoded, without alpha",
    );
  });

  test("writes files OpenJPEG made identically", async () => {
    const image = await Jimp.read(await fixture("rgb.png"));
    const jp2 = await image.getBuffer("image/jp2");
    const reference = await fixture("rgb.jp2");

    // The same boxes before the codestream box, which differs
    const header = reference.indexOf("jp2c") - 4;

    expect(jp2.subarray(0, header)).toEqual(reference.subarray(0, header));
  });
});
