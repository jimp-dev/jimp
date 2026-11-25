import { describe, expect, test } from "vitest";

import webp from "./index.js";
import { readWebpSize } from "./header.js";

const format = webp();
const width = 37;
const height = 21;

function bitmap(alpha: number) {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    data.writeUInt32BE(((i * 7919) & 0xffffff00) | alpha, i);
  }

  return { width, height, data };
}

describe("readWebpSize", () => {
  test("reads lossy WebPs (VP8)", async () => {
    const data = await format.encode(bitmap(0xff), { quality: 50 });

    expect(String.fromCharCode(...data.subarray(12, 16))).toBe("VP8 ");
    expect(readWebpSize(data)).toEqual({ width, height });
  });

  test("reads lossless WebPs (VP8L)", async () => {
    const data = await format.encode(bitmap(0xff), { lossless: 1 });

    expect(String.fromCharCode(...data.subarray(12, 16))).toBe("VP8L");
    expect(readWebpSize(data)).toEqual({ width, height });
  });

  test("reads extended WebPs (VP8X)", async () => {
    const data = await format.encode(bitmap(0x80), { quality: 50 });

    expect(String.fromCharCode(...data.subarray(12, 16))).toBe("VP8X");
    expect(readWebpSize(data)).toEqual({ width, height });
  });

  test("returns undefined for other data", () => {
    expect(readWebpSize(new Uint8Array(40))).toBeUndefined();
  });
});
