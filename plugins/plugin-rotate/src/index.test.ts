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
  const filterModes = [
    "BILINEAR",
    "BICUBIC",
    "HERMITE",
    "BEZIER",
    "LANCZOS",
    "LANCZOS2",
    "MITCHELL",
  ] as const;
  const allModes = [
    true,
    false,
    ResizeStrategy.NEAREST_NEIGHBOR,
    ...filterModes.map((modeType) => ResizeStrategy[modeType]),
  ];

  /** w x h, every pixel a different colour and alpha */
  function noise(w: number, h: number) {
    const data = Buffer.alloc(w * h * 4);

    for (let i = 0; i < data.length; i++) {
      data[i] = (i * 151 + 17) % 256;
    }

    return jimp.fromBitmap({ width: w, height: h, data });
  }

  /** opaque, black on the left and white from column `edge` */
  function step(w: number, h: number, edge: number) {
    const data = Buffer.alloc(w * h * 4);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = x < edge ? 0 : 255;
        data.set([v, v, v, 255], (y * w + x) * 4);
      }
    }

    return jimp.fromBitmap({ width: w, height: h, data });
  }

  function pixels(image: { bitmap: { data: Buffer } }) {
    const result: number[][] = [];

    for (let i = 0; i < image.bitmap.data.length; i += 4) {
      result.push([...image.bitmap.data.subarray(i, i + 4)]);
    }

    return result;
  }

  test("NEAREST_NEIGHBOR gives the same result as the default", () => {
    [0x00000000, 0x336699ff].forEach((background) => {
      [1, 30, 45, -100].forEach((deg) => {
        const image = () => {
          const img = noise(7, 4);
          img.background = background;
          return img;
        };

        expect(
          image().rotate({ deg, mode: ResizeStrategy.NEAREST_NEIGHBOR }).bitmap,
        ).toEqual(image().rotate(deg).bitmap);
      });
    });
  });

  allModes.forEach((mode) => {
    describe(`mode ${mode}`, () => {
      test("multiples of 90 degrees are exact", () => {
        [90, 180, 270, -90, -180, -270, 450].forEach((deg) => {
          const rotated = noise(7, 4).rotate({ deg, mode });

          // the same as matrixRotate. With mode false a non-square image
          // keeps its size, as advancedRotate always did
          const expected =
            mode === false && deg % 180 !== 0
              ? noise(7, 4).rotate({ deg, mode: false })
              : noise(7, 4).rotate(deg);

          expect(rotated.bitmap).toEqual(expected.bitmap);
        });

        // a square image is rotated exactly for any mode
        expect(noise(5, 5).rotate({ deg: 90, mode }).bitmap).toEqual(
          noise(5, 5).rotate(90).bitmap,
        );
      });

      test("0 and 360 degrees leave the image as it is", () => {
        [0, 360, -360, 720].forEach((deg) => {
          expect(noise(7, 4).rotate({ deg, mode }).bitmap).toEqual(
            noise(7, 4).bitmap,
          );
        });
      });
    });
  });

  filterModes.forEach((modeType) => {
    const mode = ResizeStrategy[modeType];

    describe(modeType, () => {
      test("a constant image stays constant inside the rotated area", () => {
        const color = [40, 130, 220, 200];
        const image = jimp.fromBitmap({
          width: 40,
          height: 30,
          data: Buffer.from(new Array(40 * 30).fill(color).flat()),
        });
        const rotated = image.rotate({ deg: 30, mode });
        const { width, height, data } = rotated.bitmap;

        // within 10px of the centre is well inside the 40x30 source, whatever
        // the size of the kernel
        let inside = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (
              (x + 0.5 - width / 2) ** 2 + (y + 0.5 - height / 2) ** 2 <
              100
            ) {
              const i = (y * width + x) * 4;
              expect([...data.subarray(i, i + 4)]).toEqual(color);
              inside++;
            }
          }
        }

        expect(inside).toBeGreaterThan(300);
      });

      test("a constant image on the same background stays constant", () => {
        const image = jimp.fromBitmap({
          width: 9,
          height: 6,
          data: Buffer.from(new Array(9 * 6).fill([40, 130, 220, 200]).flat()),
        });
        image.background = 0x2882dcc8;
        const rotated = image.rotate({ deg: 33, mode });

        pixels(rotated).forEach((pixel) => {
          expect(pixel).toEqual([40, 130, 220, 200]);
        });
      });

      test("alpha edges don't darken", () => {
        // opaque red on transparent black
        const data = Buffer.alloc(12 * 12 * 4);

        for (let i = 0; i < 12 * 12; i++) {
          const x = i % 12;
          const y = Math.floor(i / 12);

          if (x >= 3 && x < 9 && y >= 3 && y < 9) {
            data.set([255, 0, 0, 255], i * 4);
          }
        }

        const rotated = jimp
          .fromBitmap({ width: 12, height: 12, data })
          .rotate({ deg: 30, mode });
        const visible = pixels(rotated).filter(([, , , a]) => a! > 0);

        // the edges are antialiased...
        expect(visible.some(([, , , a]) => a! > 0 && a! < 255)).toBe(true);
        // ...and stay red
        visible.forEach((pixel) => {
          expect(pixel.slice(0, 3)).toEqual([255, 0, 0]);
        });
      });

      test("edges blend with an opaque background", () => {
        const image = step(10, 10, 0);
        image.background = 0x336699ff;
        const rotated = pixels(image.rotate({ deg: 30, mode }));

        // no transparent seam where the kernel reaches past the image
        rotated.forEach(([, , , a]) => {
          expect(a).toBe(255);
        });
        expect(rotated.some(([r]) => r !== 0x33 && r !== 255)).toBe(true);
      });
    });
  });

  test("bilinear rotation of a step edge has values in between", () => {
    const opaqueGrays = (mode: ResizeStrategy) => {
      const values = new Set(
        pixels(step(16, 16, 8).rotate({ deg: 30, mode }))
          .filter(([, , , a]) => a === 255)
          .map(([r]) => r),
      );

      return [...values].sort((a, b) => a! - b!);
    };

    expect(opaqueGrays(ResizeStrategy.NEAREST_NEIGHBOR)).toEqual([0, 255]);

    const bilinear = opaqueGrays(ResizeStrategy.BILINEAR);
    expect(bilinear.length).toBeGreaterThan(10);
    expect(bilinear.every((v) => v! >= 0 && v! <= 255)).toBe(true);
  });

  test("a tiny angle doesn't move or blur the image", () => {
    [
      [8, 8],
      [7, 7],
      [8, 5],
    ].forEach(([w, h]) => {
      const image = noise(w!, h!);
      const rotated = noise(w!, h!).rotate({
        deg: 1e-9,
        mode: ResizeStrategy.BICUBIC,
      });
      const { width, height, data } = rotated.bitmap;
      // the image is in the middle of a canvas 1 or 2 pixels bigger
      const left = Math.floor((width - w!) / 2);
      const top = Math.floor((height - h!) / 2);

      for (let y = 0; y < h!; y++) {
        const start = ((y + top) * width + left) * 4;

        expect(data.subarray(start, start + w! * 4)).toEqual(
          image.bitmap.data.subarray(y * w! * 4, (y + 1) * w! * 4),
        );
      }
    });
  });

  test("rotates counter-clockwise like the default mode", () => {
    // a white 3x3 block right of the centre ends up above it
    const image = () => {
      const data = Buffer.alloc(11 * 11 * 4);

      for (let y = 4; y < 7; y++) {
        for (let x = 7; x < 10; x++) {
          data.set([255, 255, 255, 255], (y * 11 + x) * 4);
        }
      }

      return jimp.fromBitmap({ width: 11, height: 11, data });
    };
    const centroid = (rotated: ReturnType<typeof image>) => {
      let sum = 0;
      let sx = 0;
      let sy = 0;

      pixels(rotated).forEach(([, , , a], i) => {
        sum += a!;
        sx += a! * (i % rotated.bitmap.width);
        sy += a! * Math.floor(i / rotated.bitmap.width);
      });

      return [sx / sum, sy / sum];
    };

    const nearest = centroid(image().rotate(60));
    const rotated = image().rotate({ deg: 60, mode: ResizeStrategy.BILINEAR });
    const [x, y] = centroid(rotated);

    expect(Math.abs(x! - nearest[0]!)).toBeLessThanOrEqual(1);
    expect(Math.abs(y! - nearest[1]!)).toBeLessThanOrEqual(1);
    // 3px from the centre at 60 degrees is 2.6px higher
    expect(y).toBeCloseTo(
      rotated.bitmap.height / 2 - 0.5 - 3 * Math.sin(Math.PI / 3),
      0,
    );
  });
});
