// Decodes randomly broken PngSuite images. Decoding must either work or
// throw a plain Error, never another error type, and never hang.
import { describe, expect, test } from "vitest";

import { PNG, decode } from "../src/index.js";
import { crc32 } from "../src/zlib.js";
import { random } from "./helpers.js";
import { readImage, validImages } from "./pngsuite.js";

const SEED = 20261124;
const MUTATIONS_PER_IMAGE = 40;
/** No decode of these small images should come close to this */
const MAX_DECODE_MS = 1000;

type Mutation = (data: Uint8Array, rand: () => number) => Uint8Array;

function randomInt(rand: () => number, max: number) {
  return Math.floor(rand() * max);
}

/** The start offsets of a PNG's chunks */
function chunkOffsets(data: Uint8Array) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const offsets: number[] = [];

  for (let offset = 8; offset + 12 <= data.length;) {
    offsets.push(offset);
    offset += 12 + view.getUint32(offset);
  }

  return offsets;
}

/** Recomputes the CRC of every chunk, so mutations get past the CRC check */
function fixCrcs(data: Uint8Array) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  for (const offset of chunkOffsets(data)) {
    const end = offset + 8 + view.getUint32(offset);

    if (end + 4 <= data.length) {
      view.setUint32(end, crc32(data.subarray(offset + 4, end)));
    }
  }

  return data;
}

const mutations: Record<string, Mutation> = {
  flipBits(data, rand) {
    const copy = data.slice();

    for (let i = 0, n = 1 + randomInt(rand, 8); i < n; i++) {
      const at = randomInt(rand, copy.length);

      copy[at] = copy[at]! ^ (1 << randomInt(rand, 8));
    }

    return copy;
  },
  setBytes(data, rand) {
    const copy = data.slice();
    const values = [0, 1, 0x7f, 0x80, 0xff];

    for (let i = 0, n = 1 + randomInt(rand, 4); i < n; i++) {
      copy[randomInt(rand, copy.length)] =
        values[randomInt(rand, values.length)]!;
    }

    return copy;
  },
  truncate(data, rand) {
    return data.slice(0, randomInt(rand, data.length));
  },
  insertBytes(data, rand) {
    const at = randomInt(rand, data.length);
    const insert = new Uint8Array(1 + randomInt(rand, 16)).map(() =>
      randomInt(rand, 256),
    );

    return new Uint8Array([
      ...data.subarray(0, at),
      ...insert,
      ...data.subarray(at),
    ]);
  },
  removeBytes(data, rand) {
    const at = randomInt(rand, data.length);

    return new Uint8Array([
      ...data.subarray(0, at),
      ...data.subarray(at + 1 + randomInt(rand, 16)),
    ]);
  },
  /** Changes a header field: size, bit depth, colour type, interlace */
  header(data, rand) {
    const copy = data.slice();
    const field = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

    copy[field[randomInt(rand, field.length)]!] = randomInt(rand, 256);

    return fixCrcs(copy);
  },
  /** Changes bytes inside a chunk and fixes its CRC */
  chunkData(data, rand) {
    return fixCrcs(mutations.flipBits!(data, rand));
  },
  /** Changes a chunk's length field */
  chunkLength(data, rand) {
    const copy = data.slice();
    const offsets = chunkOffsets(copy);
    const offset = offsets[randomInt(rand, offsets.length)]!;
    const view = new DataView(copy.buffer);
    const lengths = [0, 1, 0x7fffffff, 0xffffffff, view.getUint32(offset) + 1];

    view.setUint32(offset, lengths[randomInt(rand, lengths.length)]!);

    return copy;
  },
  /** Repeats or drops a chunk */
  chunkOrder(data, rand) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const offsets = chunkOffsets(data);
    const index = randomInt(rand, offsets.length);
    const start = offsets[index]!;
    const end = start + 12 + view.getUint32(start);
    const chunk = data.subarray(start, end);

    return rand() < 0.5
      ? new Uint8Array([...data.subarray(0, start), ...data.subarray(end)])
      : new Uint8Array([
          ...data.subarray(0, end),
          ...chunk,
          ...data.subarray(end),
        ]);
  },
};

function check(data: Uint8Array, checkCRC: boolean) {
  const start = performance.now();

  try {
    const image = decode(data, { checkCRC });

    expect(image.data.length).toBe(image.width * image.height * 4);
  } catch (error) {
    expect((error as Error).constructor).toBe(Error);
    expect((error as Error).message).not.toBe("");
  }

  expect(performance.now() - start).toBeLessThan(MAX_DECODE_MS);
}

/** The fuzz tests, run once per zlib backend */
export function testFuzz() {
  describe.each(Object.keys(mutations))("fuzzing: %s", (name) => {
    test("decodes or throws an Error", () => {
      const rand = random(SEED + name.length);
      const mutate = mutations[name]!;

      for (const image of validImages) {
        const data = readImage(image);

        for (let i = 0; i < MUTATIONS_PER_IMAGE; i++) {
          const mutated = mutate(data, rand);

          check(mutated, true);
          check(mutated, false);
        }
      }
    });
  });

  test("fuzzing the stream API: emits parsed or error, never throws", async () => {
    const rand = random(SEED);

    for (const image of validImages.slice(0, 40)) {
      const data = readImage(image);

      for (let i = 0; i < 10; i++) {
        const mutated = mutations.chunkData!(data, rand);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error(`${image} hung`)),
            MAX_DECODE_MS,
          );

          new PNG().parse(mutated, (error) => {
            clearTimeout(timeout);

            if (error && error.constructor !== Error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }
    }
  });
}
