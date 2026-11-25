import { describe, expect, test } from "vitest";

import { Jimp, BlendMode } from "./index.js";

// The canvas operation that does the same as each blend mode
const operations: Record<BlendMode, GlobalCompositeOperation> = {
  [BlendMode.SRC_OVER]: "source-over",
  [BlendMode.DST_OVER]: "destination-over",
  [BlendMode.MULTIPLY]: "multiply",
  [BlendMode.ADD]: "lighter",
  [BlendMode.SCREEN]: "screen",
  [BlendMode.OVERLAY]: "overlay",
  [BlendMode.DARKEN]: "darken",
  [BlendMode.LIGHTEN]: "lighten",
  [BlendMode.HARD_LIGHT]: "hard-light",
  [BlendMode.DIFFERENCE]: "difference",
  [BlendMode.EXCLUSION]: "exclusion",
  [BlendMode.COLOR_DODGE]: "color-dodge",
  [BlendMode.COLOR_BURN]: "color-burn",
  [BlendMode.SOFT_LIGHT]: "soft-light",
  [BlendMode.HUE]: "hue",
  [BlendMode.SATURATION]: "saturation",
  [BlendMode.COLOR]: "color",
  [BlendMode.LUMINOSITY]: "luminosity",
};

const size = 32;

/** Pixels with colors spread over the range of each channel, all with one alpha */
function colors(seed: number, alpha: number) {
  const image = new Jimp({ width: size, height: size });
  let state = seed;

  image.scan((_, __, idx) => {
    for (let channel = 0; channel < 3; channel++) {
      // A small LCG, so the test is the same every run
      state = (state * 1103515245 + 12345) % 2147483648;
      image.bitmap.data[idx + channel] = state % 256;
    }

    image.bitmap.data[idx + 3] = alpha;
  });

  return image;
}

function onCanvas(dst: Jimp, src: Jimp, operation: GlobalCompositeOperation) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(toImageData(dst), 0, 0);

  const source = document.createElement("canvas");
  source.width = size;
  source.height = size;
  source.getContext("2d")!.putImageData(toImageData(src), 0, 0);

  ctx.globalCompositeOperation = operation;
  ctx.drawImage(source, 0, 0);

  return ctx.getImageData(0, 0, size, size).data;
}

function toImageData(image: Jimp) {
  return new ImageData(new Uint8ClampedArray(image.bitmap.data), size, size);
}

/** The biggest difference between any channel of the two images */
function maxDifference(a: ArrayLike<number>, b: ArrayLike<number>) {
  let max = 0;

  for (let i = 0; i < a.length; i++) {
    max = Math.max(max, Math.abs(a[i]! - b[i]!));
  }

  return max;
}

describe("composite matches canvas globalCompositeOperation", () => {
  for (const mode of Object.values(BlendMode)) {
    test(mode, () => {
      const dst = colors(1, 255);
      const src = colors(2, 255);
      const expected = onCanvas(dst, src, operations[mode]);

      dst.composite(src, 0, 0, { mode });

      // Canvas works in 8 bits, so it can be a level out
      expect(maxDifference(dst.bitmap.data, expected)).toBeLessThanOrEqual(1);
    });
  }
});

describe("composite matches canvas with semi-transparent pixels", () => {
  // Canvas's "lighter" adds the alphas too, where add gives srcOver's alpha
  const modes = Object.values(BlendMode).filter((m) => m !== BlendMode.ADD);

  for (const mode of modes) {
    test.each([
      [0xc0, 0xff],
      [0xff, 0xc0],
      [0xc0, 0x80],
    ])(
      `${mode}, source alpha %i, destination alpha %i`,
      (srcAlpha, dstAlpha) => {
        const dst = colors(1, dstAlpha);
        const src = colors(2, srcAlpha);
        const expected = onCanvas(dst, src, operations[mode]);

        dst.composite(src, 0, 0, { mode });

        // Canvas stores premultiplied 8 bit colors, so it loses a little more
        // precision when pixels aren't opaque
        expect(maxDifference(dst.bitmap.data, expected)).toBeLessThanOrEqual(2);
      },
    );
  }
});
