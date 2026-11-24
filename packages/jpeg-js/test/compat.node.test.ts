/**
 * jpeg-js's own tests, adapted: @jimp/jpeg-js must work as a drop-in
 * replacement. jpeg-js compared pixels with its own previous output; the
 * conformance tests compare them with libjpeg-turbo instead.
 */

import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import jpeg, { decode, encode } from "../src/index.js";

const fixture = (name: string) =>
  readFileSync(new URL(`corpus/jpeg-js/${name}`, import.meta.url));

function redBox(width: number, height: number) {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 0xff;
    data[i + 3] = 0xff;
  }

  return data;
}

describe("jpeg-js API", () => {
  test("default export", () => {
    expect(jpeg).toEqual({ decode, encode });
  });

  test("decodes a JPEG into a Buffer", () => {
    const image = decode(fixture("grumpycat.jpg"));

    expect(image.width).toBe(320);
    expect(image.height).toBe(180);
    expect(Buffer.isBuffer(image.data)).toBe(true);
    expect(image.data.length).toBe(320 * 180 * 4);
  });

  test("decodes a JPEG into a typed array", () => {
    const image = decode(new Uint8Array(fixture("grumpycat.jpg")), {
      useTArray: true,
    });

    expect(image.data).toBeInstanceOf(Uint8Array);
    expect(Buffer.isBuffer(image.data)).toBe(false);
    expect(image.data).toEqual(
      new Uint8Array(decode(fixture("grumpycat.jpg")).data),
    );
  });

  test("decodes from an ArrayBuffer and an array of numbers", () => {
    const data = new Uint8Array(fixture("redbox.jpg"));
    const expected = decode(data).data;

    expect(decode(data.buffer).data).toEqual(expected);
    expect(decode(Array.from(data)).data).toEqual(expected);
  });

  test("decodes into RGB", () => {
    const rgba = decode(fixture("grumpycat.jpg"), { useTArray: true }).data;
    const rgb = decode(fixture("grumpycat.jpg"), {
      useTArray: true,
      formatAsRGBA: false,
    }).data;

    expect(rgb.length).toBe(320 * 180 * 3);

    for (let i = 0; i < 320 * 180; i++) {
      expect(rgb.subarray(i * 3, i * 3 + 3)).toEqual(
        rgba.subarray(i * 4, i * 4 + 3),
      );
    }
  });

  test("decodes greyscale into RGBA", () => {
    const image = decode(fixture("apsara.jpg"));

    expect(image.width).toBe(580);
    expect(image.height).toBe(599);
    expect(image.data[0]).toBe(image.data[1]);
    expect(image.data[3]).toBe(255);
  });

  test("returns the comments", () => {
    expect(decode(fixture("apsara.jpg")).comments).toEqual([
      "File source: http://commons.wikimedia.org/wiki/File:Apsara-mit-Sitar.jpg",
    ]);
    expect(decode(fixture("grumpycat.jpg"))).not.toHaveProperty("comments");
  });

  test("decodes with colorTransform: false", () => {
    const image = decode(fixture("grumpycat.jpg"), { colorTransform: false });

    expect(image.data).not.toEqual(decode(fixture("grumpycat.jpg")).data);
  });

  test("decodes a progressive JPEG the same as a baseline one", () => {
    expect(decode(fixture("skater-progressive.jpg")).data).toEqual(
      decode(fixture("skater.jpg")).data,
    );
  });

  test("decodes a JPEG with trailing bytes", () => {
    expect(decode(fixture("redbox-with-trailing-bytes.jpg")).data).toEqual(
      decode(fixture("redbox.jpg")).data,
    );
  });

  test("encodes a JPEG", () => {
    const image = encode({ data: redBox(320, 180), width: 320, height: 180 });

    expect(image.width).toBe(320);
    expect(image.height).toBe(180);
    expect(Buffer.isBuffer(image.data)).toBe(true);

    const decoded = decode(image.data);

    expect(decoded.width).toBe(320);
    const [r, g, b, a] = decoded.data;

    expect(r).toBeGreaterThan(250);
    expect(g).toBeLessThan(5);
    expect(b).toBeLessThan(5);
    expect(a).toBe(255);
  });

  test("encodes comments", () => {
    const image = encode(
      {
        data: redBox(32, 16),
        width: 32,
        height: 16,
        comments: ["First comment", "Second comment"],
      },
      50,
    );

    expect(decode(image.data).comments).toEqual([
      "First comment",
      "Second comment",
    ]);
  });

  test("encodes and decodes EXIF data", () => {
    const image = decode(fixture("grumpycat.jpg"));

    expect(image.exifBuffer).toBeDefined();

    const encoded = encode(image);

    expect(decode(encoded.data).exifBuffer).toEqual(image.exifBuffer);
  });

  test("encodes with the default quality of 50", () => {
    const image = decode(fixture("grumpycat.jpg"));

    expect(encode(image).data).toEqual(encode(image, 50).data);
  });

  test("clamps the quality to 1..100", () => {
    const image = decode(fixture("redbox.jpg"));

    expect(encode(image, -5).data).toEqual(encode(image, 1).data);
    expect(encode(image, 1000).data).toEqual(encode(image, 100).data);
  });
});
