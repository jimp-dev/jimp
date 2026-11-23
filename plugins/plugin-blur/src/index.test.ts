import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import * as blur from "./index.js";

const Jimp = createJimp({ plugins: [blur.methods] });

// An opaque 0xffcc00ff square on a transparent black canvas
function makeSquare() {
  const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

  image.scan(15, 15, 10, 10, (_, __, idx) => {
    image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
  });

  return image;
}

function pixelAt(image: ReturnType<typeof makeSquare>, x: number, y: number) {
  const idx = (y * image.bitmap.width + x) << 2;
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

describe.each([
  ["blur", (image: ReturnType<typeof makeSquare>) => image.blur(4)],
  ["gaussian", (image: ReturnType<typeof makeSquare>) => image.gaussian(3)],
])("%s with transparency", (_, applyBlur) => {
  test("keeps the color of the edge instead of darkening it", () => {
    const [r, g, b, a] = pixelAt(applyBlur(makeSquare()), 11, 20);

    expect(r).toBe(0xff);
    expect(g).toBeGreaterThanOrEqual(0xcc - 4);
    expect(g).toBeLessThanOrEqual(0xcc + 4);
    expect(b).toBe(0x00);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(0xff);
  });

  test("does not add a dark fringe anywhere", () => {
    const { data } = applyBlur(makeSquare()).bitmap;

    for (let idx = 0; idx < data.length; idx += 4) {
      if (data[idx + 3]! > 0) {
        expect(data[idx]).toBe(0xff);
        expect(data[idx + 2]).toBe(0x00);
      }
    }
  });
});

describe("blur radius", () => {
  test.each([2.5, 2.4, 0.5, 300, 1000])(
    "blurs instead of making the image transparent for %d",
    (r) => {
      // a big square, so it still shows when the radius is clamped to 256
      const image = new Jimp({ width: 40, height: 40, color: 0x00000000 });

      image.scan(0, 0, 30, 40, (_, __, idx) => {
        image.bitmap.data.set([0xff, 0xcc, 0x00, 0xff], idx);
      });
      image.blur(r);

      const [red, , , alpha] = pixelAt(image, 20, 20);

      expect(red).toBe(0xff);
      expect(alpha).toBeGreaterThan(0);
    },
  );

  test.each([145, 200, 255, 256])(
    "keeps an opaque image opaque with a radius of %d",
    (r) => {
      const image = new Jimp({ width: 20, height: 20, color: 0xffcc00ff });

      expect(pixelAt(image.blur(r), 10, 10)).toEqual([0xff, 0xcc, 0x00, 0xff]);
    },
  );

  test("rounds the radius", () => {
    expect(makeSquare().blur(2.5).bitmap.data).toEqual(
      makeSquare().blur(3).bitmap.data,
    );
    expect(makeSquare().blur(0.2).bitmap.data).toEqual(
      makeSquare().blur(1).bitmap.data,
    );
    expect(makeSquare().blur(1000).bitmap.data).toEqual(
      makeSquare().blur(256).bitmap.data,
    );
  });

  test.each(["blur", "gaussian"] as const)(
    "%s throws for a radius of 0 or less",
    (method) => {
      expect(() => makeSquare()[method](0)).toThrow("r must be greater than 0");
      expect(() => makeSquare()[method](-1)).toThrow(
        "r must be greater than 0",
      );
    },
  );

  test("gaussian accepts a fractional radius below 1", () => {
    const [red, , , alpha] = pixelAt(makeSquare().gaussian(0.5), 15, 20);

    expect(red).toBe(0xff);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(0xff);
  });
});

describe("gaussian", () => {
  test("blurs a single pixel symmetrically", () => {
    const size = 21;
    const center = 10;
    const image = new Jimp({ width: size, height: size, color: 0x000000ff });

    image.bitmap.data.set(
      [0xff, 0xff, 0xff, 0xff],
      (center * size + center) << 2,
    );
    image.gaussian(2);

    const red = (x: number, y: number) => pixelAt(image, x, y)[0];

    for (let dy = -center; dy <= center; dy++) {
      for (let dx = -center; dx <= center; dx++) {
        const value = red(center + dx, center + dy);

        expect(red(center - dx, center + dy)).toBe(value);
        expect(red(center + dx, center - dy)).toBe(value);
        expect(red(center + dy, center + dx)).toBe(value);
      }
    }

    // The center is the brightest pixel and the falloff matches sigma = r
    expect(red(center, center)).toBe(10);
    expect(red(center + 1, center)).toBe(9);
    expect(red(center + 2, center)).toBe(6);
  });

  test("keeps the exact color at alpha edges", () => {
    const { data } = makeSquare().gaussian(3).bitmap;

    for (let idx = 0; idx < data.length; idx += 4) {
      if (data[idx + 3]! > 0) {
        expect([...data.subarray(idx, idx + 3)]).toEqual([0xff, 0xcc, 0x00]);
      }
    }
  });

  test("leaves a uniform image unchanged", () => {
    const image = new Jimp({ width: 30, height: 20, color: 0x3c8ae180 });

    image.gaussian(5);

    for (let y = 0; y < image.bitmap.height; y++) {
      for (let x = 0; x < image.bitmap.width; x++) {
        expect(pixelAt(image, x, y)).toEqual([0x3c, 0x8a, 0xe1, 0x80]);
      }
    }
  });
});
