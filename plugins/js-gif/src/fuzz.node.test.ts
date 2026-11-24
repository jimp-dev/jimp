import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { getTestImagePath } from "@jimp/test-utils";

import gif from "./index.js";

/** Deterministic pseudo random numbers in [0, 1) */
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed / 2 ** 32;
  };
}

const next = random(0x6a1f);
const pick = (max: number) => Math.floor(next() * max);

/** Bytes that mean something in a GIF, so mutations reach more code */
const INTERESTING = [
  0, 1, 2, 3, 4, 7, 8, 11, 12, 0x21, 0x2c, 0x3b, 0x7f, 0x80, 0xf9, 0xfe, 0xff,
];

/** The signature is left alone, so mutations get past it */
const SIGNATURE = 6;

/** Change a GIF a little: flip bits, change, insert or remove bytes, cut it */
function mutate(seed: Uint8Array) {
  let data = Array.from(seed);
  const edits = 1 + pick(4);

  for (let i = 0; i < edits && data.length > SIGNATURE; i++) {
    const at = SIGNATURE + pick(data.length - SIGNATURE);

    switch (pick(7)) {
      case 0:
        data[at] = data[at]! ^ (1 << pick(8));
        break;
      case 1:
        data[at] = INTERESTING[pick(INTERESTING.length)]!;
        break;
      case 2:
        data[at] = pick(256);
        break;
      case 3:
        data.splice(
          at,
          0,
          ...Array.from({ length: 1 + pick(16) }, () => pick(256))
        );
        break;
      case 4:
        data.splice(at, 1 + pick(16));
        break;
      case 5:
        data = data.slice(0, at);
        break;
      default: {
        // Repeat a block, which repeats frames and extensions
        const start = pick(data.length);
        data.splice(at, 0, ...data.slice(start, start + 1 + pick(64)));
      }
    }
  }

  return Uint8Array.from(data);
}

const corpus = new URL("../test/corpus/", import.meta.url);
const seeds = [
  readFileSync(getTestImagePath("animated-disposal.gif")),
  ...["synthetic", "libnsgif", "skia", "chromium"].flatMap((dir) =>
    readdirSync(new URL(`${dir}/`, corpus))
      .filter((name) => name.endsWith(".gif"))
      .map((name) => readFileSync(new URL(`${dir}/${name}`, corpus)))
  ),
]
  // Small files that decode, so the mutations hit the structure more than
  // the pixel data
  .filter((data) => {
    try {
      return data.length < 4096 && gif().decode(data).width > 0;
    } catch {
      return false;
    }
  });

const MUTATIONS = 20_000;
/** Small, so allocations are bounded by it rather than by memory */
const maxResolutionInMP = 1;

/** The errors decoding can throw */
const ERRORS = [
  /^Invalid GIF file: missing GIF87a or GIF89a header$/,
  /^Invalid GIF file: no frames found$/,
  /^Invalid GIF dimensions \d+x\d+$/,
  /exceeds? the maximum resolution of 1 megapixels/,
];

test(`decodes ${MUTATIONS} mutated GIFs or throws an Error`, async () => {
  let decoded = 0;

  for (let i = 0; i < MUTATIONS; i++) {
    const data = mutate(seeds[i % seeds.length]!);

    try {
      const { frames, loop } = await gif().decodeFrames(
        Buffer.from(data),
        { maxResolutionInMP },
        { maxFrames: 64 }
      );
      let pixels = 0;

      for (const { bitmap, delay } of frames) {
        expect(bitmap.data.length).toBe(bitmap.width * bitmap.height * 4);
        expect(delay).toBeGreaterThanOrEqual(0);
        pixels += bitmap.width * bitmap.height;
      }

      expect(frames.length).toBeGreaterThan(0);
      expect(pixels).toBeLessThanOrEqual(maxResolutionInMP * 1_000_000);
      expect(loop === null || (loop >= 0 && loop <= 65535)).toBe(true);
      decoded++;
    } catch (error) {
      // Not a TypeError or RangeError from a bug
      if (
        (error as Error).constructor !== Error ||
        !ERRORS.some((pattern) => pattern.test((error as Error).message))
      ) {
        throw error;
      }
    }
  }

  // Many mutations still decode, so they test more than the header checks
  expect(decoded).toBeGreaterThan(MUTATIONS * 0.4);
}, 60_000);
