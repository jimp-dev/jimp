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

    for (let y = 1; y <= h; y++) {
      for (let x = 1; x <= w; x++) {
        const cx = x - w / 2;
        const cy = y - h / 2;
        const sx = cos * cx - sin * cy + w / 2 + 0.5;
        const sy = cos * cy + sin * cx + h / 2 + 0.5;
        const dst = (w * (y - 1) + x - 1) << 2;

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
  const modes = ["BICUBIC", "LANCZOS", "LANCZOS2", "MITCHELL"] as const;

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
