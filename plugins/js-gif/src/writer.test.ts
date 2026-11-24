import { expect, test, describe } from "vitest";

import { writeGif } from "./writer.js";

/**
 * SHA-256 hashes (the first 16 hex digits) of what omggif 1.0.10's
 * GifWriter wrote for each case, recorded before Jimp stopped depending on
 * omggif. The writer still writes the same bytes.
 */
const OMGGIF: Record<string, string> = {
  "2 colors, 1x1 random, transparent null": "c7d18f0a5deb0c6c",
  "2 colors, 1x1 random, transparent 1": "a42efef319b7887d",
  "2 colors, 17x5 random, transparent null": "7bb296c1e646335a",
  "2 colors, 17x5 random, transparent 1": "178cb59b31105427",
  "2 colors, 255x1 runs, transparent null": "828db93339ba5f13",
  "2 colors, 255x1 runs, transparent 1": "5e73e774f1d64202",
  "2 colors, 300x300 random, transparent null": "4cb06f5ef88c0199",
  "2 colors, 300x300 random, transparent 1": "852bf16801ba9a4d",
  "2 colors, 300x300 runs, transparent null": "9ed96d1b0b770276",
  "2 colors, 300x300 runs, transparent 1": "77e494c79ca7a2d1",
  "4 colors, 1x1 random, transparent null": "160e9d0bc9a2527e",
  "4 colors, 1x1 random, transparent 3": "e7009c4973e40ef5",
  "4 colors, 17x5 random, transparent null": "389c3d3ab1a7a725",
  "4 colors, 17x5 random, transparent 3": "2ccfd31eb697dbdb",
  "4 colors, 255x1 runs, transparent null": "44e30d484d62d864",
  "4 colors, 255x1 runs, transparent 3": "f9366b5605e2ef24",
  "4 colors, 300x300 random, transparent null": "395403f2eaf137ce",
  "4 colors, 300x300 random, transparent 3": "4343cedf013bd025",
  "4 colors, 300x300 runs, transparent null": "0cbf63937f35aab1",
  "4 colors, 300x300 runs, transparent 3": "6d531c500e87b574",
  "16 colors, 1x1 random, transparent null": "3331e5ac83dd43fd",
  "16 colors, 1x1 random, transparent 15": "f65c09dbeaf633c5",
  "16 colors, 17x5 random, transparent null": "5a4a7deb8322c9c7",
  "16 colors, 17x5 random, transparent 15": "066584821ae1d128",
  "16 colors, 255x1 runs, transparent null": "388899909fc3dbf5",
  "16 colors, 255x1 runs, transparent 15": "c4aac8b8493782fa",
  "16 colors, 300x300 random, transparent null": "ba55fc1a3c184c5e",
  "16 colors, 300x300 random, transparent 15": "2d55673a07efc0df",
  "16 colors, 300x300 runs, transparent null": "c761ab3a8fa04a46",
  "16 colors, 300x300 runs, transparent 15": "5204f993a8ff854e",
  "256 colors, 1x1 random, transparent null": "f91fafde91a040d3",
  "256 colors, 1x1 random, transparent 255": "a9ccc976047ba4b8",
  "256 colors, 17x5 random, transparent null": "281a30bec8255201",
  "256 colors, 17x5 random, transparent 255": "2a17d9dd954a957c",
  "256 colors, 255x1 runs, transparent null": "ea9499de79addfdb",
  "256 colors, 255x1 runs, transparent 255": "05ee93d47884c87f",
  "256 colors, 300x300 random, transparent null": "163338d5b274ba14",
  "256 colors, 300x300 random, transparent 255": "9c004ebb8764ec3d",
  "256 colors, 300x300 runs, transparent null": "166e8aff8b4d5c19",
  "256 colors, 300x300 runs, transparent 255": "771f8e8fdfe44715",
  "animated, loop null": "656138804ab96f45",
  "animated, loop 0": "dd0ced4ac77e061f",
  "animated, loop 5": "ff1f11975d6460b4",
};

async function hash(data: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest).subarray(0, 8), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

/** Deterministic pseudo random numbers in [0, 1) */
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed / 2 ** 32;
  };
}

describe("writeGif", () => {
  const next = random(1);

  // Random indexes fill the LZW code table quickly, so the larger sizes
  // also cover table resets.
  describe.each([2, 4, 16, 256])("with %i colors", (colors) => {
    test.each([
      [1, 1, "random"],
      [17, 5, "random"],
      [255, 1, "runs"],
      [300, 300, "random"],
      [300, 300, "runs"],
    ])(
      "writes the same %ix%i GIF as omggif (%s)",
      async (width, height, kind) => {
        const palette = Array.from({ length: colors }, () =>
          Math.floor(next() * 0x1000000)
        );
        const indexes = new Uint8Array(width * height);

        for (let i = 0; i < indexes.length; i++) {
          indexes[i] =
            kind === "random"
              ? Math.floor(next() * colors)
              : Math.floor(i / 37) % colors;
        }

        for (const transparentIndex of [null, colors - 1]) {
          const image = { palette, indexes, transparentIndex };

          expect(
            await hash(writeGif(width, height, [{ image, delay: 8 }], 0))
          ).toBe(
            OMGGIF[
              `${colors} colors, ${width}x${height} ${kind}, transparent ${transparentIndex}`
            ]
          );
        }
      }
    );
  });

  test("writes the same animated GIF as omggif, with local palettes", async () => {
    const width = 20;
    const height = 10;
    // The first and third frames have the same palette, so only the second
    // and fourth get a local one
    const frames = [2, 16, 2, 256].map((colors, i) => {
      const palette =
        colors === 2
          ? [0x000000, 0xffffff]
          : Array.from({ length: colors }, () =>
              Math.floor(next() * 0x1000000)
            );
      const indexes = new Uint8Array(width * height).map(() =>
        Math.floor(next() * colors)
      );

      return {
        image: { palette, indexes, transparentIndex: i === 1 ? 3 : null },
        delay: i * 7,
      };
    });

    for (const loop of [null, 0, 5]) {
      expect(await hash(writeGif(width, height, frames, loop))).toBe(
        OMGGIF[`animated, loop ${loop}`]
      );
    }
  });
});
