import { expect, test, describe } from "vitest";

import { indexImage } from "./quantize.js";

function distance(rgb: number, r: number, g: number, b: number) {
  return (
    (((rgb >> 16) & 0xff) - r) ** 2 +
    (((rgb >> 8) & 0xff) - g) ** 2 +
    ((rgb & 0xff) - b) ** 2
  );
}

describe("indexImage", () => {
  test("maps every pixel to its nearest palette color", () => {
    const width = 128;
    const height = 128;
    const data = new Uint8Array(width * height * 4);
    let seed = 1;

    for (let i = 0; i < data.length; i += 4) {
      seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
      data[i] = seed >>> 24;
      data[i + 1] = (seed >>> 16) & 0xff;
      data[i + 2] = (seed >>> 8) & 0xff;
      data[i + 3] = 255;
    }

    const { palette, indexes, transparentIndex } = indexImage(
      data,
      width,
      height
    );

    expect(palette).toHaveLength(256);
    expect(transparentIndex).toBe(null);

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const [r, g, b] = [data[i]!, data[i + 1]!, data[i + 2]!];
      const nearest = Math.min(...palette.map((c) => distance(c, r, g, b)));

      expect(distance(palette[indexes[j]!]!, r, g, b)).toBe(nearest);
    }
  });

  test("uses an exact palette when the colors fit", () => {
    const data = new Uint8Array([
      0, 0, 0, 0, 255, 0, 0, 255, 0, 0, 255, 255, 255, 0, 0, 255,
    ]);
    const image = indexImage(data, 4, 1);

    expect(image).toEqual({
      palette: [0x0000ff, 0xff0000, 0, 0],
      indexes: new Uint8Array([2, 1, 0, 1]),
      transparentIndex: 2,
    });
  });
});
