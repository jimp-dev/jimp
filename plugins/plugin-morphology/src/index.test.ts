import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage, testImgToStr } from "@jimp/test-utils";

import { methods } from "./index.js";

const jimp = createJimp({ plugins: [methods] });

function image(...rows: string[]) {
  return jimp.fromBitmap(makeTestImage(...rows));
}

function expectImage(actual: ReturnType<typeof image>, ...rows: string[]) {
  expect(testImgToStr(actual.bitmap)).toBe(rows.join("\n"));
}

/** Every channel of every pixel set to the min or max over its neighbourhood, looked at one by one */
function reference(
  source: ReturnType<typeof image>,
  radius: number,
  shape: "square" | "disk",
  erode: boolean,
) {
  const { data, width, height } = source.bitmap;
  const out = Buffer.alloc(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let value = erode ? 255 : 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const sx = x + dx;
            const sy = y + dy;

            if (
              sx < 0 ||
              sy < 0 ||
              sx >= width ||
              sy >= height ||
              (shape === "disk" && dx * dx + dy * dy > radius * radius)
            ) {
              continue;
            }

            const v = data[(sy * width + sx) * 4 + c]!;
            value = erode ? Math.min(value, v) : Math.max(value, v);
          }
        }

        out[(y * width + x) * 4 + c] = value;
      }
    }
  }

  return out;
}

/** Deterministic noise, so failures can be reproduced */
function noise(width: number, height: number, seed = 1) {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    data[i] = seed >> 23;
  }

  return jimp.fromBitmap({ data, width, height });
}

describe("dilate", () => {
  test("grows a single pixel into a square", () => {
    const src = image(
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■■□■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
    );

    expectImage(
      src.dilate({ radius: 2 }),
      "■■■■■■■",
      "■□□□□□■",
      "■□□□□□■",
      "■□□□□□■",
      "■□□□□□■",
      "■□□□□□■",
      "■■■■■■■",
    );
  });

  test("grows a single pixel into a disk", () => {
    const src = image(
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■■□■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
    );

    expectImage(
      src.dilate({ radius: 2, shape: "disk" }),
      "■■■■■■■",
      "■■■□■■■",
      "■■□□□■■",
      "■□□□□□■",
      "■■□□□■■",
      "■■■□■■■",
      "■■■■■■■",
    );
  });

  test("a disk of radius 1 is a plus", () => {
    const src = image("■■■■■", "■■■■■", "■■□■■", "■■■■■", "■■■■■");

    expectImage(
      src.dilate({ radius: 1, shape: "disk" }),
      "■■■■■",
      "■■□■■",
      "■□□□■",
      "■■□■■",
      "■■■■■",
    );
  });

  test("clips the neighbourhood at the edges instead of wrapping", () => {
    const src = image("■■■■□", "■■■■■", "■■■■■", "■■■■■");

    expectImage(src.dilate({ radius: 1 }), "■■■□□", "■■■□□", "■■■■■", "■■■■■");
  });

  test("works on each channel, alpha included", () => {
    const src = image("    ", " ▴▾ ", "    ");

    // Transparent black around red and blue: each channel takes its max, so
    // the opaque area grows and red and blue mix to magenta where they meet
    expectImage(src.dilate({ radius: 1 }), "▴▰▰▾", "▴▰▰▾", "▴▰▰▾");
  });
});

describe("erode", () => {
  test("removes a line thinner than the neighbourhood", () => {
    const src = image(
      "■■■■■■■",
      "■□□□□□■",
      "■■■■■■■",
      "■□□□□□■",
      "■□□□□□■",
      "■□□□□□■",
      "■■■■■■■",
    );

    expectImage(
      src.erode({ radius: 1 }),
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■■■■■■",
      "■■□□□■■",
      "■■■■■■■",
      "■■■■■■■",
    );
  });

  test("shrinks opaque shapes on a transparent background", () => {
    const src = image("     ", " ■■■ ", " ■■■ ", " ■■■ ", "     ");

    expectImage(
      src.erode({ radius: 1 }),
      "     ",
      "     ",
      "  ■  ",
      "     ",
      "     ",
    );
  });

  test("doesn't treat pixels outside the image as dark", () => {
    const src = image("□□□", "□□□", "□□□");

    expectImage(src.erode({ radius: 1 }), "□□□", "□□□", "□□□");
  });
});

describe("open and close", () => {
  test("open removes specks and keeps larger shapes", () => {
    const src = image(
      "□■■■■■■■",
      "■■■■■■□■",
      "■■□□□■■■",
      "■■□□□■■■",
      "■■□□□■■■",
      "■■■■■■■■",
      "■■■■■□■■",
    );

    expectImage(
      src.open({ radius: 1 }),
      "■■■■■■■■",
      "■■■■■■■■",
      "■■□□□■■■",
      "■■□□□■■■",
      "■■□□□■■■",
      "■■■■■■■■",
      "■■■■■■■■",
    );
  });

  test("close fills small holes and keeps the outline", () => {
    const src = image(
      "■■■■■■■■■",
      "■■■■■■■■■",
      "■■□□□□□■■",
      "■■□■□□□■■",
      "■■□□□□□■■",
      "■■□□□■□■■",
      "■■□□□□□■■",
      "■■■■■■■■■",
      "■■■■■■■■■",
    );

    expectImage(
      src.close({ radius: 1 }),
      "■■■■■■■■■",
      "■■■■■■■■■",
      "■■□□□□□■■",
      "■■□□□□□■■",
      "■■□□□□□■■",
      "■■□□□□□■■",
      "■■□□□□□■■",
      "■■■■■■■■■",
      "■■■■■■■■■",
    );
  });
});

describe("options", () => {
  test("a radius of 0 or less leaves the image unchanged", () => {
    const original = noise(9, 7);

    for (const radius of [0, -3, 0.4]) {
      const src = noise(9, 7);

      expect(src.dilate({ radius }).bitmap.data).toEqual(original.bitmap.data);
      expect(src.erode({ radius, shape: "disk" }).bitmap.data).toEqual(
        original.bitmap.data,
      );
    }
  });

  test("rounds the radius", () => {
    expect(noise(9, 7).dilate({ radius: 1.6 }).bitmap.data).toEqual(
      noise(9, 7).dilate({ radius: 2 }).bitmap.data,
    );
  });

  test("a huge radius covers the whole image", () => {
    const src = image("■■■", "■□■", "■■■");

    expectImage(
      src.dilate({ radius: 1e9, shape: "disk" }),
      "□□□",
      "□□□",
      "□□□",
    );
  });

  test("throws for an unknown shape", () => {
    expect(() =>
      // @ts-expect-error Testing an invalid shape
      noise(3, 3).dilate({ radius: 1, shape: "diamond" }),
    ).toThrow();
  });
});

describe("matches a pixel by pixel min and max", () => {
  const sizes = [
    [1, 1],
    [1, 9],
    [9, 1],
    [13, 8],
    [20, 17],
  ] as const;

  for (const shape of ["square", "disk"] as const) {
    for (const radius of [1, 2, 3, 6, 25]) {
      test(`${shape}, radius ${radius}`, () => {
        for (const [width, height] of sizes) {
          const src = noise(width, height, width * 31 + height + radius);

          expect(
            noise(width, height, width * 31 + height + radius).dilate({
              radius,
              shape,
            }).bitmap.data,
          ).toEqual(reference(src, radius, shape, false));
          expect(
            noise(width, height, width * 31 + height + radius).erode({
              radius,
              shape,
            }).bitmap.data,
          ).toEqual(reference(src, radius, shape, true));
        }
      });
    }
  }
});

describe("performance", () => {
  test("a large square doesn't cost more than a small one", () => {
    const time = (radius: number) => {
      const src = noise(400, 300);
      const start = performance.now();
      src.dilate({ radius });
      return performance.now() - start;
    };

    time(1);

    // A direct min over a 201 x 201 square would take minutes
    expect(time(100)).toBeLessThan(Math.max(10 * time(1), 1000));
  });

  test("a large disk is reasonable", () => {
    const src = noise(400, 300);
    const start = performance.now();

    src.erode({ radius: 50, shape: "disk" });

    expect(performance.now() - start).toBeLessThan(5000);
  });
});
