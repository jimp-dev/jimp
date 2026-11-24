import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import jpeg, { decode, decodeJpeg, encode, encodeJpeg } from "./index.js";

const fixture = (name: string) =>
  readFileSync(new URL(`../test/corpus/jpeg-js/${name}`, import.meta.url));

describe("@jimp/jpeg-js", () => {
  test("decodes a JPEG", () => {
    const image = decodeJpeg(fixture("grumpycat.jpg"));

    expect(image.width).toBe(320);
    expect(image.height).toBe(180);
    expect(image.data.length).toBe(320 * 180 * 4);
  });

  test("round-trips through the encoder", () => {
    const image = decodeJpeg(fixture("grumpycat.jpg"));
    const encoded = encodeJpeg(image, { quality: 90 });
    const decoded = decodeJpeg(encoded);

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
  });

  test("has jpeg-js's API", () => {
    expect(jpeg.decode).toBe(decode);
    expect(jpeg.encode).toBe(encode);

    const image = decode(fixture("grumpycat.jpg"));

    expect(Buffer.isBuffer(image.data)).toBe(true);
    expect(
      Buffer.isBuffer(
        decode(fixture("grumpycat.jpg"), { useTArray: true }).data,
      ),
    ).toBe(false);
    expect(Buffer.isBuffer(encode(image).data)).toBe(true);
  });
});
