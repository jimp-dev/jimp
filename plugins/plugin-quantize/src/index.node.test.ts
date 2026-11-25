import { expect, test, describe } from "vitest";
import "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";

import png from "@jimp/js-png";
import { createJimp } from "@jimp/core";

import { methods as quantize } from "./index.js";

const jimp = createJimp({ formats: [png], plugins: [quantize] });

describe("Quantize", () => {
  test("defines default threshold for lighter backgrounds", async () => {
    const testImage = await jimp.read(__dirname + "/images/colorful.png");
    const output = await testImage
      .quantize({
        colors: 8,
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("only reads the bytes of a Buffer view", () => {
    const backing = Buffer.alloc(64, 0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const image = new jimp({ width: 2, height: 2, data }).quantize({
      colors: 2,
    });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);
  });

  test.each([0, -1, 0.5])("rejects %d colors", (colors) => {
    const image = new jimp({ width: 2, height: 2, color: 0xff0000ff });

    expect(() => image.quantize({ colors })).toThrow(
      "colors must be at least 1",
    );
  });

  test("rejects fewer than 2 colors for rgbquant", () => {
    const image = new jimp({ width: 2, height: 2, color: 0xff0000ff });

    expect(() =>
      image.quantize({ colors: 1, paletteQuantization: "rgbquant" }),
    ).toThrow("colors must be at least 2 for rgbquant");
    expect(() =>
      image.quantize({ colors: 2, paletteQuantization: "rgbquant" }),
    ).not.toThrow();
  });

  test("reduces the image to a single color", () => {
    const image = new jimp({ width: 2, height: 1, color: 0xff0000ff });
    image.setPixelColor(0x0000ffff, 1, 0);
    image.quantize({ colors: 1 });

    expect(image.getPixelColor(0, 0)).toBe(image.getPixelColor(1, 0));
  });
});

/** A width x 1 image: `counts[i]` pixels of `colors[i]`, left to right */
function stripes(colors: number[], counts: number[]) {
  const width = counts.reduce((a, b) => a + b, 0);
  const image = new jimp({ width, height: 1 });
  let x = 0;

  colors.forEach((color, i) => {
    for (let n = 0; n < counts[i]!; n++) {
      image.setPixelColor(color, x++, 0);
    }
  });

  return image;
}

describe("palette", () => {
  test("returns the colors most common first, with their share", () => {
    const image = stripes([0x0000ffff, 0xff0000ff, 0x00ff00ff], [10, 60, 30]);

    expect(image.palette(3)).toEqual([
      { color: 0xff0000ff, weight: 0.6 },
      { color: 0x00ff00ff, weight: 0.3 },
      { color: 0x0000ffff, weight: 0.1 },
    ]);
  });

  test("returns colors in the same form as getPixelColor", () => {
    const image = new jimp({ width: 4, height: 4, color: "#1b2a4e" });

    expect(image.palette(5)).toEqual([
      { color: image.getPixelColor(0, 0), weight: 1 },
    ]);
  });

  test("returns fewer colors than asked for if the image has fewer", () => {
    const image = stripes([0xff0000ff, 0x00ff00ff], [3, 1]);

    expect(image.palette(8)).toHaveLength(2);
  });

  test("groups similar colors and averages them", () => {
    const image = stripes(
      [0xff0000ff, 0xfd0202ff, 0x0000ffff, 0x0202fdff],
      [1, 1, 1, 1],
    );

    expect(image.palette(2)).toEqual([
      { color: 0xfe0101ff, weight: 0.5 },
      { color: 0x0101feff, weight: 0.5 },
    ]);
  });

  test("weights add up to 1", async () => {
    const image = await jimp.read(__dirname + "/images/colorful.png");
    const palette = image.palette(8);
    const total = palette.reduce((sum, { weight }) => sum + weight, 0);

    expect(palette).toHaveLength(8);
    expect(total).toBeCloseTo(1, 10);
  });

  test("doesn't change the image", async () => {
    const image = await jimp.read(__dirname + "/images/colorful.png");
    const before = new Uint8Array(image.bitmap.data);

    image.palette(5);
    image.dominantColor();

    expect(new Uint8Array(image.bitmap.data)).toEqual(before);
  });

  test("ignores transparent pixels", () => {
    const image = stripes([0x00000000, 0xff0000ff], [90, 10]);

    expect(image.palette(3)).toEqual([{ color: 0xff0000ff, weight: 1 }]);
  });

  test("weights partially transparent pixels by alpha, and returns them opaque", () => {
    const image = stripes([0xff000040, 0x0000ffff], [2, 1]);

    expect(image.palette(2)).toEqual([
      { color: 0x0000ffff, weight: 255 / (255 + 2 * 64) },
      { color: 0xff0000ff, weight: (2 * 64) / (255 + 2 * 64) },
    ]);
  });

  test("returns nothing for a fully transparent image", () => {
    const image = new jimp({ width: 4, height: 4, color: 0x00000000 });

    expect(image.palette(3)).toEqual([]);
  });

  test("samples large images", () => {
    // Left half red, right half blue
    const image = new jimp({ width: 2000, height: 1000, color: 0xff0000ff });
    image.scan(1000, 0, 1000, 1000, (_, __, idx) => {
      image.bitmap.data[idx] = 0;
      image.bitmap.data[idx + 2] = 255;
    });

    for (const options of [{}, { sampleSize: 50 }]) {
      const [first, second] = image.palette(2, options);

      expect([first!.color, second!.color].sort()).toEqual(
        [0x0000ffff, 0xff0000ff].sort(),
      );
      expect(first!.weight).toBeCloseTo(0.5, 1);
    }
  });

  test("looks at every pixel when sampleSize covers the image", () => {
    const image = new jimp({ width: 200, height: 200, color: 0xff0000ff });
    // The default samples every other pixel, from (1, 1)
    image.setPixelColor(0x0000ffff, 6, 12);

    expect(image.palette(2)).toHaveLength(1);
    expect(image.palette(2, { sampleSize: 200 * 200 })).toEqual([
      { color: 0xff0000ff, weight: (200 * 200 - 1) / (200 * 200) },
      { color: 0x0000ffff, weight: 1 / (200 * 200) },
    ]);
  });

  test.each([
    [0, "count must be at least 1"],
    [-1, "count must be at least 1"],
    [1.5, "count must be a whole number"],
    [257, "count must be at most 256"],
  ])("rejects a count of %d", (count, message) => {
    const image = new jimp({ width: 2, height: 2, color: 0xff0000ff });

    expect(() => image.palette(count)).toThrow(message);
  });

  test("allows up to 256 colors", () => {
    const image = new jimp({ width: 64, height: 64 });
    image.scan((x, y, idx) => {
      image.bitmap.data[idx] = x * 4;
      image.bitmap.data[idx + 1] = y * 4;
      image.bitmap.data[idx + 3] = 255;
    });

    expect(image.palette(256).length).toBeGreaterThan(100);
  });

  test("rejects a sampleSize below 1", () => {
    const image = new jimp({ width: 2, height: 2, color: 0xff0000ff });

    expect(() => image.palette(2, { sampleSize: 0 })).toThrow(
      "sampleSize must be at least 1",
    );
    expect(() => image.dominantColor({ sampleSize: 0 })).toThrow(
      "sampleSize must be at least 1",
    );
  });
});

describe("dominantColor", () => {
  test("returns the color that covers most of the image", () => {
    const image = stripes([0x0000ffff, 0x1b2a4eff, 0xe8c07aff], [20, 50, 30]);

    expect(image.dominantColor()).toBe(0x1b2a4eff);
  });

  test("gives a logo's color on a transparent background", () => {
    // A red logo with a soft edge, on a large transparent background whose
    // faint pixels are black
    const image = new jimp({ width: 100, height: 100, color: 0x00000000 });
    image.scan(0, 0, 100, 100, (x, y, idx) => {
      const d = Math.hypot(x - 50, y - 50);

      if (d < 20) {
        image.bitmap.data.writeUInt32BE(0xe0102aff, idx);
      } else if (d < 45) {
        image.bitmap.data.writeUInt32BE(0x0000000c, idx);
      }
    });

    expect(image.dominantColor()).toBe(0xe0102aff);
  });

  test("is the top color of the palette", async () => {
    const image = await jimp.read(__dirname + "/images/colorful.png");

    expect(image.dominantColor()).toBe(image.palette(5)[0]!.color);
  });

  test("returns undefined for a fully transparent image", () => {
    const image = new jimp({ width: 4, height: 4, color: 0x00000000 });

    expect(image.dominantColor()).toBeUndefined();
  });
});
