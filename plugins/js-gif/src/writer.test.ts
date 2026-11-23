import { expect, test, describe } from "vitest";
import GIF from "omggif";

import { writeGif } from "./writer.js";

/** Deterministic pseudo random numbers in [0, 1) */
function random(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    return seed / 2 ** 32;
  };
}

function writeWithOmggif(
  width: number,
  height: number,
  palette: number[],
  indexes: Uint8Array,
  transparentIndex: number | null
) {
  const buffer = new Uint8Array(width * height * 2 + 4096);
  const writer = new GIF.GifWriter(buffer, width, height, { palette, loop: 0 });

  writer.addFrame(0, 0, width, height, indexes as unknown as number[], {
    delay: 8,
    disposal: 2,
    transparent: transparentIndex ?? undefined,
  });

  return buffer.slice(0, writer.end());
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
    ])("writes the same %ix%i GIF as omggif (%s)", (width, height, kind) => {
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

        expect(writeGif(width, height, image)).toEqual(
          writeWithOmggif(width, height, palette, indexes, transparentIndex)
        );
      }
    });
  });
});
