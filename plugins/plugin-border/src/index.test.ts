import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";

import { methods } from "./index.js";

const Jimp = createJimp({ plugins: [methods] });

function makeImage(width: number, height: number, color = 0xff0000ff) {
  return new Jimp({ width, height, color });
}

/** The [r, g, b, a] of a pixel */
function pixel(image: InstanceType<typeof Jimp>, x: number, y: number) {
  const idx = image.getPixelIndex(x, y);
  return [...image.bitmap.data.subarray(idx, idx + 4)];
}

function alpha(image: InstanceType<typeof Jimp>, x: number, y: number) {
  return image.bitmap.data[image.getPixelIndex(x, y) + 3];
}

/** The alpha channel as rows of numbers */
function alphas(image: InstanceType<typeof Jimp>) {
  const rows: number[][] = [];

  for (let y = 0; y < image.bitmap.height; y++) {
    const row: number[] = [];

    for (let x = 0; x < image.bitmap.width; x++) {
      row.push(alpha(image, x, y)!);
    }

    rows.push(row);
  }

  return rows;
}

describe("roundCorners", () => {
  test("makes the corners transparent and antialiases the curve", () => {
    const image = makeImage(10, 10).roundCorners({ radius: 4 });

    expect(image.bitmap.width).toBe(10);
    expect(image.bitmap.height).toBe(10);
    // Each corner is the same, mirrored
    const corner = [
      [0, 51, 176, 246, 255],
      [51, 246, 255, 255, 255],
      [176, 255, 255, 255, 255],
      [246, 255, 255, 255, 255],
      [255, 255, 255, 255, 255],
    ];

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const expected = corner[y]![x];

        expect(alpha(image, x, y)).toBe(expected);
        expect(alpha(image, 9 - x, y)).toBe(expected);
        expect(alpha(image, x, 9 - y)).toBe(expected);
        expect(alpha(image, 9 - x, 9 - y)).toBe(expected);
      }
    }
  });

  test("keeps the edges between the corners and the colors", () => {
    const image = makeImage(10, 10).roundCorners({ radius: 4 });

    for (let i = 4; i < 6; i++) {
      expect(pixel(image, i, 0)).toEqual([255, 0, 0, 255]);
      expect(pixel(image, 0, i)).toEqual([255, 0, 0, 255]);
      expect(pixel(image, i, 9)).toEqual([255, 0, 0, 255]);
      expect(pixel(image, 9, i)).toEqual([255, 0, 0, 255]);
    }

    expect(pixel(image, 1, 0)).toEqual([255, 0, 0, 51]);
  });

  test("scales the alpha of semi-transparent pixels", () => {
    const image = makeImage(10, 10, 0xff000080).roundCorners({ radius: 4 });

    expect(alpha(image, 0, 0)).toBe(0);
    expect(alpha(image, 1, 1)).toBe(Math.round(0x80 * 0.9645));
    expect(alpha(image, 5, 5)).toBe(0x80);
  });

  test("rounds each corner by its own radius", () => {
    const image = makeImage(10, 10).roundCorners({
      radius: { topLeft: 4, bottomRight: 2 },
    });

    expect(alpha(image, 0, 0)).toBe(0);
    expect(alpha(image, 1, 0)).toBe(51);
    expect(alpha(image, 9, 0)).toBe(255);
    expect(alpha(image, 0, 9)).toBe(255);
    expect(alpha(image, 9, 9)).toBe(
      Math.round(255 * (2.5 - Math.hypot(1.5, 1.5))),
    );
    expect(alpha(image, 8, 9)).toBe(
      Math.round(255 * (2.5 - Math.hypot(0.5, 1.5))),
    );
    expect(alpha(image, 8, 8)).toBe(255);
  });

  test("scales down radii that don't fit, like CSS", () => {
    // Two radii of 10 on a side of 10 are scaled to 5, which is a circle
    expect(alphas(makeImage(10, 10).roundCorners({ radius: 10 }))).toEqual(
      alphas(makeImage(10, 10).roundCorners({ radius: 5 })),
    );
  });

  test("does nothing with a radius of 0", () => {
    expect(alphas(makeImage(4, 4).roundCorners({ radius: 0 }))).toEqual(
      alphas(makeImage(4, 4)),
    );
  });

  test("rejects a negative radius", () => {
    expect(() => makeImage(4, 4).roundCorners({ radius: -1 })).toThrow();
  });
});

describe("border", () => {
  test("grows the image and draws the border around it", () => {
    const image = makeImage(4, 4, 0xffffffff).border({
      width: 2,
      color: 0xff0000ff,
    });

    expect(image.bitmap.width).toBe(8);
    expect(image.bitmap.height).toBe(8);

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const inside = x >= 2 && x < 6 && y >= 2 && y < 6;

        expect(pixel(image, x, y)).toEqual(
          inside ? [255, 255, 255, 255] : [255, 0, 0, 255],
        );
      }
    }
  });

  test("accepts CSS colors and defaults to black", () => {
    expect(pixel(makeImage(2, 2).border({ width: 1 }), 0, 0)).toEqual([
      0, 0, 0, 255,
    ]);
    expect(
      pixel(makeImage(2, 2).border({ width: 1, color: "#00ff00" }), 0, 0),
    ).toEqual([0, 255, 0, 255]);
  });

  test("rounds the outer corners and the image's corners to match", () => {
    const image = makeImage(4, 4, 0xffffffff).border({
      width: 2,
      color: 0xff0000ff,
      radius: 4,
    });
    const outerCorner = makeImage(8, 8).roundCorners({ radius: 4 });

    // The outside is shaped like the image rounded with the same radius
    expect(alphas(image)).toEqual(alphas(outerCorner));
    // Corners are transparent
    expect(alpha(image, 0, 0)).toBe(0);
    expect(alpha(image, 7, 7)).toBe(0);
    // The image's corner is cut by an inner radius of 4 - 2 = 2, and the
    // border fills the rest of the pixel, without a seam
    const imageShare = 2.5 - Math.hypot(1.5, 1.5);
    const g = Math.round(255 * imageShare);

    expect(pixel(image, 2, 2)).toEqual([255, g, g, 255]);
    expect(pixel(image, 5, 2)).toEqual([255, g, g, 255]);
    expect(pixel(image, 2, 5)).toEqual([255, g, g, 255]);
    expect(pixel(image, 5, 5)).toEqual([255, g, g, 255]);
    // Next to where the curve meets the edge, the image covers most of the pixel
    const nearEdge = Math.round(255 * (2.5 - Math.hypot(0.5, 1.5)));

    expect(pixel(image, 3, 2)).toEqual([255, nearEdge, nearEdge, 255]);
    expect(pixel(image, 2, 4)).toEqual([255, nearEdge, nearEdge, 255]);
    // Inside the curves the image is untouched
    expect(pixel(image, 3, 3)).toEqual([255, 255, 255, 255]);
    expect(pixel(image, 4, 4)).toEqual([255, 255, 255, 255]);
  });

  test("doesn't draw the border behind transparent parts of the image", () => {
    const image = makeImage(4, 4, 0x00000000).border({
      width: 1,
      color: 0xff0000ff,
    });

    expect(pixel(image, 0, 0)).toEqual([255, 0, 0, 255]);
    expect(pixel(image, 1, 1)).toEqual([0, 0, 0, 0]);
    expect(pixel(image, 4, 4)).toEqual([0, 0, 0, 0]);
  });

  test("with a width of 0 it only rounds the corners", () => {
    const bordered = makeImage(10, 10).border({ width: 0, radius: 4 });

    expect(alphas(bordered)).toEqual(
      alphas(makeImage(10, 10).roundCorners({ radius: 4 })),
    );
    expect(pixel(bordered, 1, 0)).toEqual([255, 0, 0, 51]);
  });

  test("rejects widths that aren't whole numbers", () => {
    expect(() => makeImage(4, 4).border({ width: 1.5 })).toThrow();
    expect(() => makeImage(4, 4).border({ width: -1 })).toThrow();
  });
});

describe("boxShadow", () => {
  const black = 0x000000ff;

  test("grows the image to fit an offset shadow and draws it under the image", () => {
    const image = makeImage(4, 4, 0xffffffff).boxShadow({
      x: 2,
      y: 3,
      blur: 0,
      color: black,
    });

    expect(image.bitmap.width).toBe(6);
    expect(image.bitmap.height).toBe(7);

    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 6; x++) {
        const inImage = x < 4 && y < 4;
        const inShadow = x >= 2 && y >= 3;

        expect(pixel(image, x, y)).toEqual(
          inImage
            ? [255, 255, 255, 255]
            : inShadow
              ? [0, 0, 0, 255]
              : [0, 0, 0, 0],
        );
      }
    }
  });

  test("grows the image to the left and top for negative offsets", () => {
    const image = makeImage(4, 4, 0xffffffff).boxShadow({
      x: -1,
      y: -2,
      blur: 0,
      color: black,
    });

    expect(image.bitmap.width).toBe(5);
    expect(image.bitmap.height).toBe(6);
    expect(pixel(image, 0, 0)).toEqual([0, 0, 0, 255]);
    expect(pixel(image, 4, 0)).toEqual([0, 0, 0, 0]);
    expect(pixel(image, 1, 2)).toEqual([255, 255, 255, 255]);
    expect(pixel(image, 4, 5)).toEqual([255, 255, 255, 255]);
    expect(pixel(image, 0, 5)).toEqual([0, 0, 0, 0]);
  });

  test("spread grows the shadow on every side", () => {
    const image = makeImage(2, 2, 0xffffffff).boxShadow({
      x: 0,
      y: 0,
      blur: 0,
      spread: 2,
      color: black,
    });

    expect(image.bitmap.width).toBe(6);
    expect(image.bitmap.height).toBe(6);

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const inImage = x >= 2 && x < 4 && y >= 2 && y < 4;

        expect(pixel(image, x, y)).toEqual(
          inImage ? [255, 255, 255, 255] : [0, 0, 0, 255],
        );
      }
    }
  });

  test("negative spread shrinks the shadow", () => {
    const image = makeImage(4, 4, 0x00000000).boxShadow({
      x: 0,
      y: 0,
      blur: 0,
      spread: -1,
      color: black,
    });

    expect(image.bitmap.width).toBe(4);
    expect(image.bitmap.height).toBe(4);
    expect(alpha(image, 0, 0)).toBe(0);
    expect(alpha(image, 1, 1)).toBe(255);
    expect(alpha(image, 2, 2)).toBe(255);
    expect(alpha(image, 3, 3)).toBe(0);
  });

  test("uses the alpha of the color", () => {
    const image = makeImage(2, 2).boxShadow({
      x: 2,
      y: 0,
      blur: 0,
      color: 0x0000ff80,
    });

    expect(pixel(image, 3, 0)).toEqual([0, 0, 255, 0x80]);
    expect(
      pixel(
        makeImage(2, 2).boxShadow({ x: 2, y: 0, blur: 0, color: "blue" }),
        3,
        0,
      ),
    ).toEqual([0, 0, 255, 255]);
  });

  test("shows the shadow through semi-transparent parts of the image", () => {
    const image = makeImage(2, 2, 0xff000080).boxShadow({
      x: 0,
      y: 0,
      blur: 0,
      color: black,
    });

    // 50% red over opaque black
    expect(pixel(image, 0, 0)).toEqual([128, 0, 0, 255]);
  });

  test("rounds the shadow's corners with radius", () => {
    const image = makeImage(4, 4, 0xffffffff).boxShadow({
      x: 2,
      y: 2,
      blur: 0,
      radius: 2,
      color: black,
    });

    expect(image.bitmap.width).toBe(6);
    expect(image.bitmap.height).toBe(6);
    expect(pixel(image, 5, 5)).toEqual([
      0,
      0,
      0,
      Math.round(255 * (2.5 - Math.hypot(1.5, 1.5))),
    ]);
    expect(pixel(image, 4, 5)).toEqual([
      0,
      0,
      0,
      Math.round(255 * (2.5 - Math.hypot(0.5, 1.5))),
    ]);
    expect(pixel(image, 4, 4)).toEqual([0, 0, 0, 255]);
    // The top right corner of the shadow is rounded too
    expect(alpha(image, 5, 2)).toBe(alpha(image, 5, 5));
  });

  test("spread grows the corner radius with the shadow", () => {
    const image = makeImage(4, 4, 0x00000000).boxShadow({
      x: 0,
      y: 0,
      blur: 0,
      spread: 2,
      radius: 2,
      color: black,
    });

    // The shadow is 8x8 with a radius of 4
    expect(alphas(image)).toEqual(
      alphas(makeImage(8, 8, black).roundCorners({ radius: 4 })),
    );
  });

  test("blurs the shadow evenly and grows the image by the blur", () => {
    const image = makeImage(30, 30, 0x00000000).boxShadow({
      x: 0,
      y: 0,
      blur: 6,
      color: black,
    });

    expect(image.bitmap.width).toBe(42);
    expect(image.bitmap.height).toBe(42);

    const rows = alphas(image);

    // Symmetric on both axes
    for (let y = 0; y < 42; y++) {
      for (let x = 0; x < 42; x++) {
        expect(rows[y]![x]).toBe(rows[y]![41 - x]);
        expect(rows[y]![x]).toBe(rows[41 - y]![x]);
        expect(rows[y]![x]).toBe(rows[x]![y]);
      }
    }

    const middle = rows[21]!;

    // Fades in from the edge of the image to the middle of the box
    for (let x = 0; x < 20; x++) {
      expect(middle[x]).toBeLessThanOrEqual(middle[x + 1]!);
    }

    expect(middle[21]).toBe(255);
    // Half on the box's edge (between x 5 and 6), like a gaussian with a
    // standard deviation of 3 (half the blur)
    expect(middle[5]).toBe(111);
    expect(middle[6]).toBe(144);
    // Almost gone at the edge of the image, `blur` pixels past the box
    expect(middle[0]).toBeLessThan(8);
  });

  test("leaves an opaque image unchanged on top of a blurred shadow", () => {
    const image = makeImage(10, 10, 0x336699ff).boxShadow({ blur: 6 });

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        expect(pixel(image, x + 6, y + 2)).toEqual([0x33, 0x66, 0x99, 255]);
      }
    }
  });

  test("defaults to a soft shadow below the image", () => {
    const image = makeImage(10, 10).boxShadow();

    // blur 12, y 4
    expect(image.bitmap.width).toBe(34);
    expect(image.bitmap.height).toBe(34);
    expect(pixel(image, 12, 8)).toEqual([255, 0, 0, 255]);
    // The image is at y 8 to 17, so the shadow shows more below it than above
    expect(alpha(image, 17, 20)).toBeGreaterThan(alpha(image, 17, 5)!);
    expect(alpha(image, 17, 20)).toBeLessThanOrEqual(0x80);
  });
});

describe("combining", () => {
  test("a rounded border with a matching shadow", () => {
    const image = makeImage(8, 8, 0xffffffff)
      .border({ width: 2, color: 0x000000ff, radius: 4 })
      .boxShadow({
        x: 0,
        y: 0,
        blur: 0,
        spread: 1,
        radius: 4,
        color: 0xff0000ff,
      });

    expect(image.bitmap.width).toBe(14);
    expect(image.bitmap.height).toBe(14);
    // The shadow's corner (radius 5) shows past the border's corner (radius 4)
    expect(pixel(image, 0, 0)).toEqual([0, 0, 0, 0]);
    expect(pixel(image, 1, 1)).toEqual([
      255,
      0,
      0,
      Math.round(255 * (5.5 - Math.hypot(3.5, 3.5))),
    ]);
    // The border is drawn over the shadow, and the image over both
    expect(pixel(image, 0, 7)).toEqual([255, 0, 0, 255]);
    expect(pixel(image, 1, 7)).toEqual([0, 0, 0, 255]);
    expect(pixel(image, 7, 7)).toEqual([255, 255, 255, 255]);
  });
});
