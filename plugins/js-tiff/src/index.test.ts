import { expect, test, describe } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import tiff from "./index.js";

const jimp = createJimp({ formats: [tiff] });

type Entry = [tag: number, type: number, count: number, value: number];

const SHORT = 3;
const LONG = 4;

/**
 * Build a little endian TIFF with one IFD at offset 8. Entry values are
 * written inline, and `pixels` is placed straight after the IFD.
 */
function createTiff(
  getEntries: (pixelOffset: number) => Entry[],
  { pixels = [], nextIfd = 0 }: { pixels?: number[]; nextIfd?: number } = {}
) {
  const count = getEntries(0).length;
  const pixelOffset = 8 + 2 + count * 12 + 4;
  const entries = getEntries(pixelOffset);
  const buffer = Buffer.alloc(pixelOffset + pixels.length);

  buffer.write("II", 0);
  buffer.writeUInt16LE(42, 2);
  buffer.writeUInt32LE(8, 4);
  buffer.writeUInt16LE(count, 8);
  entries.forEach(([tag, type, valueCount, value], i) => {
    const offset = 10 + i * 12;
    buffer.writeUInt16LE(tag, offset);
    buffer.writeUInt16LE(type, offset + 2);
    buffer.writeUInt32LE(valueCount, offset + 4);
    buffer.writeUInt32LE(value, offset + 8);
  });
  buffer.writeUInt32LE(nextIfd, pixelOffset - 4);
  buffer.set(pixels, pixelOffset);

  return buffer;
}

/** Build an uncompressed 8 bit RGB TIFF */
function createRgbTiff({
  width,
  height,
  pixels = [],
  compression = 1,
  extra = [],
}: {
  width: number;
  height: number;
  pixels?: number[];
  compression?: number;
  extra?: Entry[];
}) {
  return createTiff(
    (pixelOffset) => [
      [256, LONG, 1, width],
      [257, LONG, 1, height],
      [258, SHORT, 1, 8],
      [259, SHORT, 1, compression],
      [262, SHORT, 1, 2],
      [273, LONG, 1, pixelOffset],
      [277, SHORT, 1, 3],
      [278, LONG, 1, height],
      [279, LONG, 1, pixels.length],
      ...extra,
    ],
    { pixels }
  );
}

describe("TIFF", () => {
  test("load TIFF", async () => {
    const image = await jimp.read(getTestImagePath("rgb.tiff"));

    expect(image.getPixelColor(10, 10)).toBe(0xa4988bff);
    expect(image.getPixelColor(220, 190)).toBe(0xe0d7ddff);
    expect(image.getPixelColor(350, 130)).toBe(0x565433ff);
  });

  test("export TIFF", async () => {
    const image = jimp.fromBitmap({
      width: 3,
      height: 3,
      data: [
        0xff0000ff, 0xff0080ff, 0xff00ffff, 0xff0080ff, 0xff00ffff, 0x8000ffff,
        0xff00ffff, 0x8000ffff, 0x0000ffff,
      ],
    });
    const buffer = await image.getBuffer("image/tiff");

    // eslint-disable-next-line no-control-regex
    expect(buffer.toString()).toMatch(/^MM\u0000*\u0000/);
  });

  test("round trips an exported TIFF", async () => {
    const image = new jimp({ width: 5, height: 3, color: 0x336699ff });
    const decoded = await jimp.read(await image.getBuffer("image/tiff"));

    expect(decoded.width).toBe(5);
    expect(decoded.height).toBe(3);
    expect(decoded.getPixelColor(4, 2)).toBe(0x336699ff);
  });

  test("decodes an uncompressed RGB TIFF", async () => {
    const image = await jimp.read(
      createRgbTiff({
        width: 2,
        height: 1,
        pixels: [0xff, 0, 0, 0, 0, 0xff],
      })
    );

    expect(image.width).toBe(2);
    expect(image.height).toBe(1);
    expect(image.getPixelColor(0, 0)).toBe(0xff0000ff);
    expect(image.getPixelColor(1, 0)).toBe(0x0000ffff);
  });

  test("rejects TIFFs larger than the maximum resolution", async () => {
    const crafted = createRgbTiff({ width: 0xffffffff, height: 0xffffffff });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "TIFF dimensions 4294967295x4294967295 exceed the maximum resolution of 100 megapixels"
    );
  });

  test("rejects an uncompressed TIFF whose dimensions don't fit its data", async () => {
    const crafted = createRgbTiff({
      width: 5000,
      height: 5000,
      pixels: [0, 0, 0],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "TIFF data is too short for an uncompressed image of 5000x5000 at 24 bits per pixel"
    );
  });

  test("maxResolutionInMP can be configured", async () => {
    const buffer = createRgbTiff({
      width: 2,
      height: 2,
      pixels: new Array(12).fill(0xff),
    });

    await expect(
      jimp.read(buffer, { "image/tiff": { maxResolutionInMP: 0.000003 } })
    ).rejects.toThrow("exceed the maximum resolution of 0.000003 megapixels");

    const image = await jimp.read(buffer, {
      "image/tiff": { maxResolutionInMP: 0.00001 },
    });

    expect(image.width).toBe(2);
  });

  test.each([
    [0, 10],
    [10, 0],
  ])("rejects a TIFF with dimensions %ix%i", async (width, height) => {
    const crafted = createRgbTiff({ width, height });

    await expect(jimp.read(crafted)).rejects.toThrow(
      `Invalid TIFF dimensions ${width}x${height}`
    );
  });

  test("rejects absurd bits per sample", async () => {
    const crafted = createRgbTiff({
      width: 100,
      height: 100,
      // LZW, so the data size isn't checked
      compression: 5,
      extra: [[258, SHORT, 1, 65535]],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Unsupported TIFF bits per pixel 196605"
    );
  });

  test("rejects tiles larger than the maximum resolution", async () => {
    const crafted = createRgbTiff({
      width: 16,
      height: 16,
      compression: 5,
      extra: [
        [322, LONG, 1, 0xffffffff],
        [323, LONG, 1, 0xffffffff],
      ],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "TIFF tile size 4294967295x4294967295 exceeds the maximum resolution of 100 megapixels"
    );
  });

  test("rejects a zero tile size", async () => {
    const crafted = createRgbTiff({
      width: 16,
      height: 16,
      compression: 5,
      extra: [
        [322, LONG, 1, 0],
        [323, LONG, 1, 16],
      ],
    });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF tile size 0x16"
    );
  });

  test("rejects a tag with more values than the file holds", async () => {
    const crafted = createTiff(() => [[273, LONG, 200_000_000, 0]]);

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFDs declare more data than the file holds"
    );
  });

  test("rejects tags that together claim more values than the file holds", async () => {
    // Each tag fits in the file on its own, but they all point at the same bytes
    const crafted = createTiff(
      () =>
        Array.from({ length: 20 }, (_, i): Entry => [1000 + i, LONG, 50, 8]),
      { pixels: new Array(200).fill(0) }
    );

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFDs declare more data than the file holds"
    );
  });

  test("rejects an IFD with more entries than the file holds", async () => {
    const crafted = createTiff(() => [[256, SHORT, 1, 1]]);
    crafted.writeUInt16LE(0xffff, 8);

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFDs declare more data than the file holds"
    );
  });

  test("rejects an IFD chain that loops", async () => {
    const crafted = createTiff(() => [[256, SHORT, 1, 1]], { nextIfd: 8 });

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFD at offset 8 is referenced more than once"
    );
  });

  test("rejects a sub-IFD that points back to its parent", async () => {
    const crafted = createTiff(() => [[330, LONG, 1, 8]]);

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFD at offset 8 is referenced more than once"
    );
  });

  test("rejects DNG private data that points back to its IFD", async () => {
    // 4 inline bytes holding the offset 8
    const crafted = createTiff(() => [[50740, 1, 4, 8]]);

    await expect(jimp.read(crafted)).rejects.toThrow(
      "Invalid TIFF file: IFD at offset 8 is referenced more than once"
    );
  });

  test("rejects an unknown byte order", async () => {
    expect(() => tiff().decode(Buffer.from("XX*\0\0\0\0\0"))).toThrow(
      "Invalid TIFF file: unknown byte order"
    );
  });
});
