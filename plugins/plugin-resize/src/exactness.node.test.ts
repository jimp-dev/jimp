import { expect, test, describe } from "vitest";

import { createJimp } from "@jimp/core";

import { methods, ResizeStrategy } from "./index.js";

const jimp = createJimp({ plugins: [methods], formats: [] });

/**
 * The resizers are tuned for speed, and must keep giving exactly the same
 * bytes. Each test resizes a few images to many sizes and snapshots a hash of
 * every result, so any change to a single byte shows up in the snapshot.
 *
 * Node only: Lanczos uses Math.sin, whose last bit differs between JavaScript
 * engines, which is enough to change a byte here and there.
 */

/** 53-bit hash (cyrb53) of the bytes, as hex */
function hash(data: ArrayLike<number>) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;

  for (let i = 0; i < data.length; i++) {
    h1 = Math.imul(h1 ^ data[i]!, 2654435761);
    h2 = Math.imul(h2 ^ data[i]!, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/** Pseudo random bytes, the same every run */
function random(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed & 255;
  };
}

/** Noise, with alpha anywhere from 0 to 255, or opaque */
function noise(width: number, height: number, opaque: boolean) {
  const next = random(width * 31 + height);
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i++) {
    data[i] = opaque && (i & 3) === 3 ? 255 : next();
  }

  return jimp.fromBitmap({ data, width, height });
}

/** Smooth gradients, with alpha fading out to the right */
function gradient(width: number, height: number) {
  const data = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(
        [
          Math.round((x * 255) / width),
          Math.round((y * 255) / height),
          (x * 7 + y * 13) & 255,
          255 - Math.round((x * 255) / width),
        ],
        (y * width + x) * 4,
      );
    }
  }

  return jimp.fromBitmap({ data, width, height });
}

const images = {
  "noise 1x1": noise(1, 1, false),
  "noise 2x3": noise(2, 3, false),
  "noise 7x5": noise(7, 5, false),
  "noise 13x11": noise(13, 11, false),
  "opaque noise 33x17": noise(33, 17, true),
  "gradient 40x24": gradient(40, 24),
  "noise 97x61": noise(97, 61, false),
};

// up, down by whole and fractional factors, one axis only, odd sizes,
// unchanged, and down to a single pixel
const sizes = [
  [1, 1],
  [2, 2],
  [3, 7],
  [5, 4],
  [6, 6],
  [9, 3],
  [13, 11],
  [16, 16],
  [17, 5],
  [20, 33],
  [32, 32],
  [48, 29],
  [211, 37],
] as const;

const modes = [undefined, ...Object.values(ResizeStrategy)];

for (const mode of modes) {
  for (const premultiplyAlpha of [true, false]) {
    describe(`${mode ?? "default"}, premultiplyAlpha: ${premultiplyAlpha}`, () => {
      test("gives exactly the same bytes", () => {
        const hashes: Record<string, string> = {};

        for (const [name, image] of Object.entries(images)) {
          const { width, height } = image.bitmap;
          // also each source size, and both axes swapped
          const targets = [...sizes, [width, height], [height, width]];

          for (const [w, h] of targets) {
            const { bitmap } = image
              .clone()
              .resize({ w: w!, h: h!, mode, premultiplyAlpha });

            hashes[`${name} to ${w}x${h}`] =
              `${bitmap.width}x${bitmap.height} ${hash(bitmap.data)}`;
          }
        }

        expect(hashes).toMatchSnapshot();
      });
    });
  }
}
