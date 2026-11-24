import { expect, test } from "vitest";

import jpeg, { decodeJpeg, encodeJpeg, JpegFormatError } from "../src/index.js";

async function fixture(name: string) {
  const response = await fetch(`/${name}`);

  return new Uint8Array(await response.arrayBuffer());
}

test("runs without Buffer", () => {
  expect("Buffer" in globalThis).toBe(false);
});

test("decodes JPEGs", async () => {
  for (const name of [
    "jpeg-js/grumpycat.jpg",
    "generated/p-420.jpg",
    "generated/b-12bit.jpg",
    "jpeg-js/tree-cmyk.jpg",
  ]) {
    const image = decodeJpeg(await fixture(name));

    expect(image.data).toBeInstanceOf(Uint8Array);
    expect(image.data.length).toBe(image.width * image.height * 4);
  }
});

test("encodes JPEGs", async () => {
  const image = decodeJpeg(await fixture("jpeg-js/grumpycat.jpg"));

  for (const progressive of [false, true]) {
    const encoded = encodeJpeg(image, { quality: 80, progressive });

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(decodeJpeg(encoded).width).toBe(320);
  }
});

test("has jpeg-js's API, returning Uint8Arrays", async () => {
  const image = jpeg.decode(await fixture("jpeg-js/grumpycat.jpg"));

  expect(image.data.constructor).toBe(Uint8Array);
  expect(jpeg.encode(image, 50).data.constructor).toBe(Uint8Array);
});

test("throws JpegErrors", () => {
  expect(() => decodeJpeg(new Uint8Array([1, 2, 3]))).toThrow(JpegFormatError);
});
