import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import * as blur from "./index.js";

const Jimp = createJimp({ plugins: [blur.methods] });

type Image = InstanceType<typeof Jimp>;

function pixelAt(image: Image, x: number, y: number) {
  const idx = (y * image.bitmap.width + x) << 2;
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

/** A small, repeatable pseudo-random number generator */
function random(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/** An image of random colors, opaque unless `alpha` is set */
function noise(width: number, height: number, alpha = false, seed = 1) {
  const image = new Jimp({ width, height });
  const next = random(seed);
  const { data } = image.bitmap;

  for (let idx = 0; idx < data.length; idx += 4) {
    data[idx] = Math.floor(next() * 256);
    data[idx + 1] = Math.floor(next() * 256);
    data[idx + 2] = Math.floor(next() * 256);
    // Some fully transparent pixels, the rest partly or fully opaque
    data[idx + 3] = !alpha ? 255 : next() < 0.3 ? 0 : Math.floor(next() * 256);
  }

  return image;
}

/**
 * The median filter written out directly: sort the window of each pixel.
 * Colors are weighted by alpha, and the median is the smallest value whose
 * cumulative weight is more than half of the total.
 */
function referenceMedian(image: Image, radius: number) {
  const { width, height, data } = image.bitmap;
  const out = new Uint8Array(data.length);

  const weightedMedian = (values: [number, number][]) => {
    const total = values.reduce((sum, [, w]) => sum + w, 0);
    let cumulative = 0;

    if (total === 0) {
      return -1;
    }

    for (const [value, weight] of values.sort((a, b) => a[0] - b[0])) {
      cumulative += weight;

      if (cumulative * 2 > total) {
        return value;
      }
    }

    throw new Error("unreachable");
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const channels: [number, number][][] = [[], [], [], []];

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x1 = Math.min(width - 1, Math.max(0, x + dx));
          const y1 = Math.min(height - 1, Math.max(0, y + dy));
          const idx = (y1 * width + x1) << 2;
          const a = data[idx + 3]!;

          for (let c = 0; c < 3; c++) {
            channels[c]!.push([data[idx + c]!, a]);
          }

          channels[3]!.push([a, 1]);
        }
      }

      const a = weightedMedian(channels[3]!);
      const idx = (y * width + x) << 2;

      if (a === 0) {
        continue;
      }

      for (let c = 0; c < 3; c++) {
        out[idx + c] = weightedMedian(channels[c]!);
      }

      out[idx + 3] = a;
    }
  }

  return out;
}

describe("median", () => {
  test.each([1, 2, 3])("matches sorting each window, radius %d", (radius) => {
    const image = noise(23, 17);
    const expected = referenceMedian(image, radius);

    expect([...image.median(radius).bitmap.data]).toEqual([...expected]);
  });

  test.each([1, 2])(
    "matches sorting each window with transparency, radius %d",
    (radius) => {
      const image = noise(19, 13, true, 7);
      const expected = referenceMedian(image, radius);

      expect([...image.median(radius).bitmap.data]).toEqual([...expected]);
    },
  );

  test("works with a radius larger than the image", () => {
    const image = noise(5, 4);
    const expected = referenceMedian(image, 9);

    expect([...image.median(9).bitmap.data]).toEqual([...expected]);
  });

  test("works on a 1x1 image", () => {
    const image = new Jimp({ width: 1, height: 1, color: 0x3c8ae1ff });

    expect(pixelAt(image.median(3), 0, 0)).toEqual([0x3c, 0x8a, 0xe1, 0xff]);
  });

  test("leaves a uniform image unchanged", () => {
    const image = new Jimp({ width: 30, height: 20, color: 0x3c8ae180 });

    image.median(2);

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        expect(pixelAt(image, x, y)).toEqual([0x3c, 0x8a, 0xe1, 0x80]);
      }
    }
  });

  test("removes salt-and-pepper noise", () => {
    const image = new Jimp({ width: 40, height: 40, color: 0x808080ff });
    const next = random(3);

    // Turn one pixel in 20 black or white
    image.scan((_, __, idx) => {
      if (next() < 0.05) {
        const value = next() < 0.5 ? 0 : 255;
        image.bitmap.data.set([value, value, value], idx);
      }
    });

    image.median(1);

    // Past the edges, the edge pixels repeat, so a speck in a corner counts
    // 4 times. Inside, every speck is gone.
    image.scan(1, 1, 38, 38, (x, y) => {
      expect(pixelAt(image, x, y)).toEqual([0x80, 0x80, 0x80, 0xff]);
    });
  });

  test("keeps a step edge sharp", () => {
    const image = new Jimp({ width: 20, height: 10, color: 0x000000ff });

    image.scan(10, 0, 10, 10, (_, __, idx) => {
      image.bitmap.data.set([0xff, 0xff, 0xff], idx);
    });

    const original = [...image.bitmap.data];

    expect([...image.median(3).bitmap.data]).toEqual(original);
  });

  test("keeps the color of a shape's edge instead of darkening it", () => {
    // An opaque 0xffcc00ff square on a transparent black canvas
    const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

    image.scan(15, 15, 10, 10, (_, __, idx) => {
      image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
    });

    // Fade the square's edge so the median of alpha varies there
    image.scan(15, 15, 10, 1, (_, __, idx) => {
      image.bitmap.data[idx + 3] = 0x80;
    });

    const { data } = image.median(2).bitmap;

    for (let idx = 0; idx < data.length; idx += 4) {
      if (data[idx + 3]! > 0) {
        expect([...data.subarray(idx, idx + 3)]).toEqual([0xff, 0xcc, 0x00]);
      } else {
        expect([...data.subarray(idx, idx + 3)]).toEqual([0, 0, 0]);
      }
    }
  });

  test("rounds the radius", () => {
    expect(noise(12, 9).median(1.4).bitmap.data).toEqual(
      noise(12, 9).median(1).bitmap.data,
    );
    expect(noise(12, 9).median(2.5).bitmap.data).toEqual(
      noise(12, 9).median(3).bitmap.data,
    );
    expect(noise(12, 9).median(0.2).bitmap.data).toEqual(
      noise(12, 9).median(1).bitmap.data,
    );
    expect(noise(12, 9).median(1e9).bitmap.data).toEqual(
      noise(12, 9).median(256).bitmap.data,
    );
  });

  test.each([0, -1, Number.NaN, "2"])("throws for a radius of %s", (r) => {
    expect(() => noise(4, 4).median(r as number)).toThrow();
  });
});
