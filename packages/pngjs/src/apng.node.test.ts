// APNG frames, compared with ffmpeg's APNG decoder. See
// scripts/generate-apng-fixtures.mjs.
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, test } from "vitest";

import { decode, decodeFrames, encode } from "./index.js";

const dir = new URL("../test/apng/", import.meta.url);

function read(name: string) {
  return new Uint8Array(readFileSync(new URL(`${name}.png`, dir)));
}

/** ffmpeg's frames */
function readReference(name: string, frameSize: number) {
  const data = gunzipSync(readFileSync(new URL(`${name}.rgba.gz`, dir)));
  const frames: number[][] = [];

  for (let offset = 0; offset < data.length; offset += frameSize) {
    frames.push([...data.subarray(offset, offset + frameSize)]);
  }

  return frames;
}

/**
 * ffmpeg rounds "over" blending of semi-transparent pixels onto
 * semi-transparent ones differently, so allow 1 off in blend-dispose
 */
function maxDifference(actual: ArrayLike<number>, expected: number[]) {
  let max = 0;

  for (let i = 0; i < expected.length; i++) {
    max = Math.max(max, Math.abs(actual[i]! - expected[i]!));
  }

  return max;
}

describe("matches ffmpeg", () => {
  test.each([
    ["ffmpeg", 48, 32, 8, 3, 0],
    ["blend-dispose", 32, 32, 6, 0, 1],
    ["first-dispose-previous", 32, 32, 2, 1, 0],
    ["hidden-default", 16, 16, 2, 2, 0],
  ])("%s", (name, width, height, count, plays, tolerance) => {
    const result = decodeFrames(read(name));
    const reference = readReference(name, width * height * 4);

    expect(result.width).toBe(width);
    expect(result.height).toBe(height);
    expect(result.plays).toBe(plays);
    expect(result.frames).toHaveLength(count);
    expect(reference).toHaveLength(count);

    result.frames.forEach((frame, i) => {
      expect(maxDifference(frame.data, reference[i]!)).toBeLessThanOrEqual(
        tolerance,
      );
    });
  });
});

describe("decodeFrames", () => {
  test("has the delay of each frame in milliseconds", () => {
    expect(
      decodeFrames(read("blend-dispose")).frames.map((frame) => frame.delay),
    ).toEqual([100, 50, 100, 0, 100, 100]);
  });

  test("stops after maxFrames", () => {
    expect(
      decodeFrames(read("blend-dispose"), { maxFrames: 2 }).frames,
    ).toHaveLength(2);
  });

  test("16-bit output", () => {
    const frames8 = decodeFrames(read("ffmpeg")).frames;
    const frames16 = decodeFrames(read("ffmpeg"), { outputDepth: 16 }).frames;

    expect(frames16[3]!.data).toBeInstanceOf(Uint16Array);
    expect([...frames16[3]!.data].map((v) => v / 257)).toEqual([
      ...frames8[3]!.data,
    ]);
  });

  test("decode() returns the default image", () => {
    expect([...decode(read("hidden-default")).data.subarray(0, 4)]).toEqual([
      9, 9, 9, 255,
    ]);
  });

  test("a PNG that isn't animated has one frame", () => {
    const image = {
      width: 2,
      height: 1,
      data: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    };
    const result = decodeFrames(encode(image));

    expect(result.plays).toBeUndefined();
    expect(result.frames).toHaveLength(1);
    expect([...result.frames[0]!.data]).toEqual([...image.data]);
  });

  test("frames after a broken one are dropped", () => {
    const data = read("blend-dispose").slice();
    const view = new DataView(data.buffer);
    let fdat = 0;

    // Break the third fdAT chunk's data and fix its CRC
    for (let offset = 8; offset < data.length;) {
      const length = view.getUint32(offset);
      const type = String.fromCharCode(
        ...data.subarray(offset + 4, offset + 8),
      );

      if (type === "fdAT" && ++fdat === 3) {
        data.fill(0, offset + 12, offset + 8 + length);
        view.setUint32(offset + 8 + length, 0);
      }

      offset += 12 + length;
    }

    expect(decodeFrames(data, { checkCRC: false }).frames).toHaveLength(3);
  });
});
