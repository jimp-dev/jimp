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

  test("reads VP8L sizes from the shortest files", async () => {
    const data = await format.encode(bitmap(0xff), { lossless: 1 });

    expect(readWebpSize(data.subarray(0, 25))).toEqual({ width, height });
  });

  test("decode refuses files it can't read the size of when there's a limit", async () => {
    const data = await format.encode(bitmap(0xff), { lossless: 1 });
    // A bare VP8L bitstream after the RIFF header, without the chunk tag
    const bare = Buffer.concat([data.subarray(0, 12), data.subarray(20)]);

    expect(readWebpSize(bare)).toBeUndefined();
    await expect(
      format.decode(bare, { maxResolutionInMP: 100 }),
    ).rejects.toThrow(
      "Couldn't read the WebP's dimensions to check maxResolutionInMP",
    );
  });

  test("returns undefined for other data", () => {
    expect(readWebpSize(new Uint8Array(40))).toBeUndefined();
  });
});
