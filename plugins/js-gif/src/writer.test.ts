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

        expect(writeGif(width, height, [{ image, delay: 8 }], 0)).toEqual(
          writeWithOmggif(width, height, palette, indexes, transparentIndex)
        );
      }
    });
  });

  test("writes the same animated GIF as omggif, with local palettes", () => {
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
    const globalPalette = frames[0]!.image.palette;

    for (const loop of [null, 0, 5]) {
      const buffer = new Uint8Array(65536);
      const writer = new GIF.GifWriter(buffer, width, height, {
        palette: globalPalette,
        loop: loop ?? undefined,
      });

      for (const { image, delay } of frames) {
        writer.addFrame(
          0,
          0,
          width,
          height,
          image.indexes as unknown as number[],
          {
            delay,
            disposal: 2,
            transparent: image.transparentIndex ?? undefined,
            palette:
              image.palette.join() === globalPalette.join()
                ? undefined
                : image.palette,
          }
        );
      }

      expect(writeGif(width, height, frames, loop)).toEqual(
        buffer.slice(0, writer.end())
      );
    }
  });
});
