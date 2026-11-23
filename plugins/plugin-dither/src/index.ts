import { JimpClass } from "@jimp/types";
import { z } from "zod";

const DitherPaletteSchema = z.union([
  z.literal("bw"),
  z.literal("rgb565"),
  z.number().int().min(2).max(256),
]);

export type DitherPalette = z.infer<typeof DitherPaletteSchema>;

const DitherOptionsSchema = z.discriminatedUnion("type", [
  z.strictObject({
    /** The original subtle RGB565 dither (default) */
    type: z.literal("rgb565").default("rgb565"),
  }),
  z.strictObject({
    /** How to spread the rounding error */
    type: z.enum(["floyd-steinberg", "atkinson", "bayer4", "bayer8"]),
    /**
     * The colours to reduce the image to (default "bw"):
     * - "bw": black and white, from the Rec. 709 luminance
     * - "rgb565": 32 levels of red and blue and 64 of green
     * - a number from 2 to 256: that many evenly spaced levels per channel
     */
    palette: DitherPaletteSchema.optional(),
  }),
]);

export type DitherOptions = z.input<typeof DitherOptionsSchema>;

/** Where Floyd–Steinberg sends the error, as [dx, dy, weight] */
const floydSteinberg = [
  [1, 0, 7 / 16],
  [-1, 1, 3 / 16],
  [0, 1, 5 / 16],
  [1, 1, 1 / 16],
] as const;

/** Atkinson only passes on 6/8 of the error, which keeps more contrast */
const atkinson = [
  [1, 0, 1 / 8],
  [2, 0, 1 / 8],
  [-1, 1, 1 / 8],
  [0, 1, 1 / 8],
  [1, 1, 1 / 8],
  [0, 2, 1 / 8],
] as const;

/** Builds the size × size Bayer matrix, with values 0 to size² - 1 */
function bayerMatrix(size: number): number[][] {
  if (size === 1) {
    return [[0]];
  }

  const half = bayerMatrix(size / 2);
  const offsets = [
    [0, 2],
    [3, 1],
  ];

  return Array.from({ length: size }, (_, y) =>
    Array.from(
      { length: size },
      (_, x) =>
        4 * half[y % (size / 2)]![x % (size / 2)]! +
        offsets[Math.floor(y / (size / 2))]![Math.floor(x / (size / 2))]!,
    ),
  );
}

/** `count` evenly spaced levels from 0 to 255 */
function evenLevels(count: number) {
  return Array.from({ length: count }, (_, i) =>
    Math.round((i * 255) / (count - 1)),
  );
}

/**
 * The levels an n-bit channel decodes to, by repeating its high bits in the
 * low ones (5 bits: 0, 8, 16, 24, 33, ...), so output survives a round trip
 * through RGB565 unchanged
 */
function bitLevels(bits: number) {
  return Array.from(
    { length: 2 ** bits },
    (_, i) => (i << (8 - bits)) | (i >> (2 * bits - 8)),
  );
}

/**
 * The level closest to `value`, rounding up halfway. Levels are in order and
 * spaced about evenly.
 */
function nearestLevel(value: number, levels: number[]) {
  const last = levels.length - 1;
  let i = Math.round((Math.min(Math.max(value, 0), 255) * last) / 255);

  // Correct for levels that sit a little off even spacing
  while (i > 0 && value < (levels[i - 1]! + levels[i]!) / 2) {
    i--;
  }

  while (i < last && value >= (levels[i]! + levels[i + 1]!) / 2) {
    i++;
  }

  return levels[i]!;
}

function luminance(data: Uint8Array, idx: number) {
  return (
    0.2126 * data[idx]! + 0.7152 * data[idx + 1]! + 0.0722 * data[idx + 2]!
  );
}

/** The ordered dither `dither()` has always applied */
function rgb565<I extends JimpClass>(image: I) {
  const rgb565Matrix = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];

  image.scan((x, y, idx) => {
    const thresholdId = ((y & 3) << 2) + (x % 4);
    const dither = rgb565Matrix[thresholdId]!;

    image.bitmap.data[idx] = Math.min(image.bitmap.data[idx]! + dither, 0xff);
    image.bitmap.data[idx + 1] = Math.min(
      image.bitmap.data[idx + 1]! + dither,
      0xff,
    );
    image.bitmap.data[idx + 2] = Math.min(
      image.bitmap.data[idx + 2]! + dither,
      0xff,
    );
  });

  return image;
}

export const methods = {
  /**
   * Applies a dither effect.
   *
   * With no options this is the original `dither`: it adds a 4×4 ordered
   * pattern of 1–16 to each colour channel, so there's less banding if the
   * image is later stored as 16-bit RGB565. It doesn't reduce the number of
   * colours and the change is barely visible.
   *
   * Pass a `type` to reduce the image to a `palette` and dither it, which is
   * the visible dot or noise pattern most people mean by dithering:
   *
   * - `type`: "floyd-steinberg" or "atkinson" spread each pixel's rounding
   *   error to its neighbours. "bayer4" or "bayer8" use a 4×4 or 8×8 ordered
   *   threshold pattern instead.
   * - `palette`: "bw" (default) for black and white, "rgb565" for 16-bit
   *   colour, or a number from 2 to 256 for that many levels per channel.
   *
   * Only red, green and blue change. Alpha is left alone and fully
   * transparent pixels aren't touched.
   *
   * To dither to a palette picked from the image instead, use
   * `quantize({ colors, imageQuantization: "floyd-steinberg" })`.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.dither(); // subtle RGB565 dither
   * image.dither({ type: "floyd-steinberg" }); // black and white
   * image.dither({ type: "bayer8", palette: 4 }); // 4 levels per channel
   * ```
   */
  dither<I extends JimpClass>(image: I, options: DitherOptions = {}) {
    const parsed = DitherOptionsSchema.parse(options);

    if (parsed.type === "rgb565") {
      return rgb565(image);
    }

    const { type, palette = "bw" } = parsed;
    const { data, width, height } = image.bitmap;
    const bw = palette === "bw";
    const levels =
      palette === "bw"
        ? [evenLevels(2)]
        : palette === "rgb565"
          ? [bitLevels(5), bitLevels(6), bitLevels(5)]
          : [evenLevels(palette), evenLevels(palette), evenLevels(palette)];
    const channels = levels.length;
    const visible = (x: number, y: number) =>
      data[(y * width + x) * 4 + 3]! !== 0;

    // The value each pixel is aiming for: its luminance in black and white,
    // otherwise red, green and blue
    const target = new Float32Array(width * height * channels);

    for (let i = 0; i < width * height; i++) {
      if (bw) {
        target[i] = luminance(data, i * 4);
      } else {
        target[i * 3] = data[i * 4]!;
        target[i * 3 + 1] = data[i * 4 + 1]!;
        target[i * 3 + 2] = data[i * 4 + 2]!;
      }
    }

    const write = (x: number, y: number, values: number[]) => {
      const idx = (y * width + x) * 4;

      data[idx] = values[0]!;
      data[idx + 1] = values[bw ? 0 : 1]!;
      data[idx + 2] = values[bw ? 0 : 2]!;
    };

    if (type === "bayer4" || type === "bayer8") {
      const size = type === "bayer4" ? 4 : 8;
      const matrix = bayerMatrix(size);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (!visible(x, y)) {
            continue;
          }

          // Shift by up to half a level either way, so a flat area at a
          // fraction f of the way between two levels gets about f of its
          // pixels rounded up
          const offset = (matrix[y % size]![x % size]! + 0.5) / size ** 2 - 0.5;
          const i = (y * width + x) * channels;

          write(
            x,
            y,
            levels.map((l, c) =>
              nearestLevel(target[i + c]! + (offset * 255) / (l.length - 1), l),
            ),
          );
        }
      }

      return image;
    }

    const kernel = type === "atkinson" ? atkinson : floydSteinberg;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!visible(x, y)) {
          continue;
        }

        const i = (y * width + x) * channels;
        const values = levels.map((l, c) => nearestLevel(target[i + c]!, l));

        write(x, y, values);

        for (const [dx, dy, weight] of kernel) {
          const nx = x + dx;
          const ny = y + dy;

          // Error that would land outside the image or on a transparent
          // pixel is dropped
          if (nx < 0 || nx >= width || ny >= height || !visible(nx, ny)) {
            continue;
          }

          const j = (ny * width + nx) * channels;

          for (let c = 0; c < channels; c++) {
            target[j + c]! += (target[i + c]! - values[c]!) * weight;
          }
        }
      }
    }

    return image;
  },
};
