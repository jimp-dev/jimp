import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";
import { ResizeStrategy } from "@jimp/plugin-resize";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

describe("Rotate a image with even size", () => {
  const imgSrc = jimp.fromBitmap(
    makeTestImage(
      "▰▴▴▴▪▪▪▰",
      "▴▴▴▴▪▪▪▪",
      "▴▴▴▴▪▪▪▪",
      "▴▴▴▴▪▪▪▪",
      "▪▪▪▪▴▴▴▴",
      "▪▪▪▪▴▴▴▴",
      "▪▪▪▪▴▴▴▴",
      "▦▪▪▪▴▴▴▦",
    ),
  );

  const angles = [
    1, 91, 30, 45, 60, 90, -90, 120, 135, 180, 225, 270, 315, 360,
  ];

  angles.forEach((angle) => {
    test(`${angle} degrees`, () => {
      expect(imgSrc.clone().rotate(angle)).toMatchSnapshot();
    });
  });
});

describe("Rotate a image with odd size", () => {
  const imgSrc = jimp.fromBitmap(
    makeTestImage(
      "▴▴▴▦▪▪▪",
      "▴▴▴▦▪▪▪",
      "▴▴▴▦▪▪▪",
      "▦▦▦▦▦▦▦",
      "▴▴▴▦▴▴▴",
      "▴▴▴▦▴▴▴",
      "▴▴▴▦▴▴▴",
    ),
  );

  const angles = [45, 135, 225, 315];

  angles.forEach((angle) => {
    test(`${angle} degrees`, () => {
      expect(imgSrc.clone().rotate(angle)).toMatchSnapshot();
    });
  });
});

describe("Rotate a non-square image", () => {
  const imgSrc = jimp.fromBitmap(
    makeTestImage("▴▴▴▴▪▪▪▪", "▴▴▴▴▪▪▪▪", "▦▦▦▦▴▴▴▴", "▦▦▦▦▴▴▴▴"),
  );

  const angles = [1, 10, 30, 45, 90, -90, 135, 180, 225, 315, -180, -270];

  angles.forEach((angle) => {
    test(`${angle} degrees`, () => {
      expect(imgSrc.clone().rotate(angle)).toMatchSnapshot();
    });
  });
});

describe("Rotate a non-square image without resizing", () => {
  const imgSrc = jimp.fromBitmap(
    makeTestImage("□□□□□□□□", "▹▹▹▹▹▹▹▹", "▿▿▿▿▿▿▿▿", "□□□□□□□□"),
  );

  const angles = [90, 180, 270, 45];

  angles.forEach((angle) => {
    test(`${angle} degrees`, () => {
      expect(
        imgSrc.clone().rotate({ deg: angle, mode: false }),
      ).toMatchSnapshot();
    });
  });
});

describe("Rotate without resizing does not sample the wrong pixel", () => {
  // Exact reference for the same mapping advancedRotate uses, with exact
  // cos and sin for right angles.
  function referenceRotate(w: number, h: number, data: Buffer, deg: number) {
    const cos = Math.round(Math.cos((deg * Math.PI) / 180));
    const sin = Math.round(Math.sin((deg * Math.PI) / 180));
    const out = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cx = x + 0.5 - w / 2;
        const cy = y + 0.5 - h / 2;
        const sx = cos * cx - sin * cy + w / 2;
        const sy = cos * cy + sin * cx + h / 2;
        const dst = (w * y + x) << 2;

        if (sx >= 0 && sx < w && sy >= 0 && sy < h) {
          const src = (w * Math.floor(sy) + Math.floor(sx)) << 2;
          data.copy(out, dst, src, src + 4);
        }
      }
    }

    return out;
  }

  test.each([
    [2, 5, -270],
    [1, 4, -270],
    [4, 7, -270],
    [8, 11, -270],
    [1, 2, 270],
    [1, 2, 630],
    [6, 5, 90],
    [5, 2, 270],
    [7, 4, -90],
  ])("%ix%i: %i degrees", (w, h, deg) => {
    const data = Buffer.alloc(w * h * 4);

    for (let i = 0; i < w * h; i++) {
      data.writeUInt32BE(((i + 1) * 0x01010100 + 0xff) >>> 0, i * 4);
    }

    const rotated = jimp
      .fromBitmap({
        width: w,
        height: h,
        data: Buffer.alloc(data.length, data),
      })
      .rotate({ deg, mode: false });

    expect(rotated.bitmap.width).toBe(w);
    expect(rotated.bitmap.height).toBe(h);
    expect(rotated.bitmap.data).toEqual(referenceRotate(w, h, data, deg));
  });

  test("1x3: -315 degrees does not read past the end of the image", () => {
    const image = jimp.fromBitmap({
      width: 1,
      height: 3,
      data: Buffer.alloc(12, 0xff),
    });

    expect(() => image.rotate({ deg: -315, mode: false })).not.toThrow();
  });
});

describe("Rotate with a resize mode", () => {
  // the mode only resizes the canvas, which is filled with the background
  // colour, so every mode gives the same result as the default
  const modes = Object.keys(ResizeStrategy) as (keyof typeof ResizeStrategy)[];

  modes.forEach((modeType) => {
    [0x00000000, 0x336699ff].forEach((background) => {
      test(`${modeType} with background ${background.toString(16)}`, () => {
        const image = () => {
          const img = jimp.fromBitmap(
            makeTestImage("▴▴▴▪▪", "▴▴▴▪▪", "▪▪▪▴▴", "▪▪▪▴▴"),
          );
          img.background = background;
          return img;
        };

        expect(
          image().rotate({ deg: 30, mode: ResizeStrategy[modeType] }).bitmap,
        ).toEqual(image().rotate({ deg: 30 }).bitmap);
      });
    });
  });
});

describe("Rotate about the centre of the image", () => {
  function numbered(w: number, h: number) {
    const data = Buffer.alloc(w * h * 4);

    for (let i = 0; i < w * h; i++) {
      data.writeUInt32BE(((i + 1) * 0x01010100 + 0xff) >>> 0, i * 4);
    }

    return jimp.fromBitmap({ width: w, height: h, data });
  }

  // the image pasted onto a background canvas of the given size at (x, y)
  function placed(
    image: ReturnType<typeof numbered>,
    w: number,
    h: number,
    x: number,
    y: number,
  ) {
    const data = Buffer.alloc(w * h * 4);
    const { width, data: src } = image.bitmap;

    for (let row = 0; row < image.bitmap.height; row++) {
      src.copy(
        data,
        ((y + row) * w + x) * 4,
        row * width * 4,
        (row + 1) * width * 4,
      );
    }

    return data;
  }

  // the centre of the opaque pixels, relative to the centre of the image
  function centroid(image: ReturnType<typeof numbered>) {
    const { width, height, data } = image.bitmap;
    let x = 0;
    let y = 0;
    let n = 0;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (data[(row * width + col) * 4 + 3]) {
          x += col + 0.5;
          y += row + 0.5;
          n++;
        }
      }
    }

    return { x: x / n - width / 2, y: y / n - height / 2, n };
  }

  const sizes = [
    [1, 1],
    [2, 2],
    [7, 7],
    [8, 8],
    [8, 5],
    [7, 4],
    [5, 8],
    [16, 9],
  ];

  describe.each([0.0001, -0.0001, 359.9999])("%f degrees", (deg) => {
    test.each(sizes)("%ix%i without resizing is the identity", (w, h) => {
      const image = numbered(w, h);
      const rotated = image.clone().rotate({ deg, mode: false });

      expect(rotated.bitmap.width).toBe(w);
      expect(rotated.bitmap.height).toBe(h);
      expect(rotated.bitmap.data).toEqual(image.bitmap.data);
    });

    test.each(sizes)("%ix%i is centred in the larger canvas", (w, h) => {
      const image = numbered(w, h);
      const rotated = image.clone().rotate(deg);
      // the bounding box is a hair bigger than the image, so it rounds up
      // to one more pixel on each side
      expect(rotated.bitmap.width).toBe(w + 2);
      expect(rotated.bitmap.height).toBe(h + 2);
      expect(rotated.bitmap.data).toEqual(placed(image, w + 2, h + 2, 1, 1));
    });
  });

  test.each(sizes)(
    "%ix%i: nearly 90 degrees matches the exact rotation",
    (w, h) => {
      // the exact rotation goes through matrixRotate, this doesn't
      const exact = numbered(w, h).rotate(90);
      const near = numbered(w, h).rotate(90.0001);
      const nearW = exact.bitmap.width + 2;
      const nearH = exact.bitmap.height + 2;

      expect(near.bitmap.width).toBe(nearW);
      expect(near.bitmap.height).toBe(nearH);
      expect(near.bitmap.data).toEqual(placed(exact, nearW, nearH, 1, 1));
    },
  );

  test.each([90, 180, 270, -90])(
    "%i degrees on a non-square image is unchanged",
    (deg) => {
      const image = numbered(7, 4);
      const rotated = image.clone().rotate(deg);
      const turns = (((deg / 90) % 4) + 4) % 4;
      const { width, height, data } = image.bitmap;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // counter-clockwise
          const [dx, dy] = [
            [x, y],
            [y, width - 1 - x],
            [width - 1 - x, height - 1 - y],
            [height - 1 - y, x],
          ][turns]!;

          expect(
            rotated.bitmap.data.readUInt32BE(
              (dy * rotated.bitmap.width + dx) * 4,
            ),
          ).toBe(data.readUInt32BE((y * width + x) * 4));
        }
      }
    },
  );

  describe.each([20, 21])("%ipx image", (size) => {
    // an opaque 4x4 block in the top right
    const block = () => {
      const image = jimp.fromBitmap({
        width: size,
        height: size,
        data: Buffer.alloc(size * size * 4),
      });

      for (let y = 2; y < 6; y++) {
        for (let x = 12; x < 16; x++) {
          image.bitmap.data.writeUInt32BE(0xffffffff, (y * size + x) * 4);
        }
      }

      return image;
    };

    test.each([
      [30, false],
      [30, true],
      [-75, false],
      [-75, true],
      [200, true],
    ])("%i degrees, resize %s, keeps the centroid", (deg, mode) => {
      const before = centroid(block());
      const after = centroid(block().rotate({ deg, mode }));
      const rad = (deg * Math.PI) / 180;
      // counter-clockwise on screen, where y points down
      const expected = {
        x: Math.cos(rad) * before.x + Math.sin(rad) * before.y,
        y: -Math.sin(rad) * before.x + Math.cos(rad) * before.y,
      };

      expect(after.n).toBeGreaterThan(0);
      // nearest neighbour can only place the block to within a pixel
      expect(Math.abs(after.x - expected.x)).toBeLessThan(0.5);
      expect(Math.abs(after.y - expected.y)).toBeLessThan(0.5);
      expect(
        Math.abs(Math.hypot(after.x, after.y) - Math.hypot(before.x, before.y)),
      ).toBeLessThan(0.5);
    });
  });

  test.each([
    [8, 8, 30],
    [7, 7, 45],
    [8, 5, 10],
    [7, 4, 60],
    [16, 9, -120],
    [100, 1, 45],
    [8, 5, 80],
    [7, 4, 100],
  ])("%ix%i at %i degrees: the canvas is the bounding box", (w, h, deg) => {
    const rotated = numbered(w, h).rotate(deg);
    const rad = (deg * Math.PI) / 180;
    const boxW = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
    const boxH = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));

    // the side along the image's width when it's closer to upright than to
    // lying on its side
    const [alongW, alongH] =
      Math.abs(Math.cos(rad)) >= Math.abs(Math.sin(rad)) ? [w, h] : [h, w];

    // the smallest size that holds the bounding box and has the same parity
    // as that side of the image, so the image is centred on whole pixels
    expect(rotated.bitmap.width).toBeGreaterThanOrEqual(boxW);
    expect(rotated.bitmap.width).toBeLessThan(boxW + 2);
    expect(Math.abs(rotated.bitmap.width - alongW) % 2).toBe(0);
    expect(rotated.bitmap.height).toBeGreaterThanOrEqual(boxH);
    expect(rotated.bitmap.height).toBeLessThan(boxH + 2);
    expect(Math.abs(rotated.bitmap.height - alongH) % 2).toBe(0);
  });

  test.each([30, 45, -10, 200])(
    "%i degrees without resizing keeps the width and height",
    (deg) => {
      const rotated = numbered(16, 9).rotate({ deg, mode: false });

      expect(rotated.bitmap.width).toBe(16);
      expect(rotated.bitmap.height).toBe(9);
    },
  );
});
