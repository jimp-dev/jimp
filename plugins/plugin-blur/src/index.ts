import { mulTable, shgTable } from "./blur-tables.js";
import { JimpClass } from "@jimp/types";
import { limit255 } from "@jimp/utils";
import { z } from "zod";

const SharpenOptionsSchema = z.object({
  /** how much to boost the difference from the blurred image, 0 does nothing */
  amount: z.number().min(0),
  /** the standard deviation of the gaussian blur, in pixels (default 1) */
  radius: z.number().gt(0).optional(),
  /**
   * leave a channel unchanged when it differs from the blurred image by
   * less than this, 0-255 (default 0)
   */
  threshold: z.number().min(0).max(255).optional(),
});

export type SharpenOptions = z.infer<typeof SharpenOptionsSchema>;

/** The largest radius `blur` supports, the size of its lookup tables */
const MAX_BLUR_RADIUS = mulTable.length - 1;

/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Scale each pixel's color by its alpha, so that a blur averages colors
 * weighted by how opaque they are. Without this, transparent pixels (which
 * are usually transparent black) pull the colors at an edge toward black.
 * Opaque pixels are left unchanged.
 */
function premultiplyAlpha(data: Uint8Array) {
  for (let idx = 0; idx < data.length; idx += 4) {
    const a = data[idx + 3]!;

    if (a === 255) {
      continue;
    }

    data[idx] = Math.round((data[idx]! * a) / 255);
    data[idx + 1] = Math.round((data[idx + 1]! * a) / 255);
    data[idx + 2] = Math.round((data[idx + 2]! * a) / 255);
  }
}

/** Undo `premultiplyAlpha`. Fully transparent pixels become transparent black. */
function unpremultiplyAlpha(data: Uint8Array) {
  for (let idx = 0; idx < data.length; idx += 4) {
    const a = data[idx + 3]!;

    if (a === 255) {
      continue;
    }

    if (a === 0) {
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      continue;
    }

    data[idx] = limit255(Math.round((data[idx]! * 255) / a));
    data[idx + 1] = limit255(Math.round((data[idx + 1]! * 255) / a));
    data[idx + 2] = limit255(Math.round((data[idx + 2]! * 255) / a));
  }
}

/**
 * Gaussian blur the image with a standard deviation of `r`, weighting colors
 * by alpha (see `premultiplyAlpha`). The image isn't changed. Instead `write`
 * is called once per pixel, row by row, with the blurred colors still
 * multiplied by the blurred alpha, so callers can decide how to divide them
 * out. It may change the pixel at `idx`, which isn't read again.
 */
function gaussianBlur(
  image: JimpClass,
  r: number,
  write: (
    idx: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ) => void,
) {
  const { width, height, data } = image.bitmap;
  const rs = Math.ceil(r * 2.57); // significant radius
  const range = rs * 2 + 1;
  const rr2 = r * r * 2;

  // A 2D Gaussian is the product of two 1D Gaussians, so blur the rows and
  // then the columns. Clamping at the edges is per axis, so this gives the
  // same result as the full 2D kernel.
  const weights = new Float64Array(range);
  let wsum = 0;

  for (let i = 0; i < range; i++) {
    weights[i] = Math.exp(-((i - rs) ** 2) / rr2);
    wsum += weights[i]!;
  }

  for (let i = 0; i < range; i++) {
    weights[i] = weights[i]! / wsum;
  }

  // Each pass reads from one buffer and writes to another, so no pixel is
  // sampled after it has been blurred. The intermediate buffer is floating
  // point so the rows aren't rounded before the columns are blurred, and it
  // holds colors premultiplied by alpha (see `premultiplyAlpha`) without
  // losing precision to 8-bit rounding.
  const rows = new Float32Array(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      for (let i = 0; i < range; i++) {
        const x1 = Math.min(width - 1, Math.max(0, x + i - rs));
        const idx = (y * width + x1) << 2;
        const a = data[idx + 3]! * weights[i]!;

        red += data[idx]! * a;
        green += data[idx + 1]! * a;
        blue += data[idx + 2]! * a;
        alpha += a;
      }

      const idx = (y * width + x) << 2;

      rows[idx] = red;
      rows[idx + 1] = green;
      rows[idx + 2] = blue;
      rows[idx + 3] = alpha;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;

      for (let i = 0; i < range; i++) {
        const y1 = Math.min(height - 1, Math.max(0, y + i - rs));
        const idx = (y1 * width + x) << 2;
        const weight = weights[i]!;

        red += rows[idx]! * weight;
        green += rows[idx + 1]! * weight;
        blue += rows[idx + 2]! * weight;
        alpha += rows[idx + 3]! * weight;
      }

      write((y * width + x) << 2, red, green, blue, alpha);
    }
  }
}

export const methods = {
  /**
   * A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker
   * @param r the pixel radius of the blur, greater than 0. It's rounded to a
   * whole number of pixels, at least 1 and at most 256.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.blur(5);
   * ```
   */
  blur<I extends JimpClass>(image: I, r: number) {
    if (typeof r !== "number") {
      throw new Error("r must be a number");
    }

    if (!(r > 0)) {
      throw new Error("r must be greater than 0");
    }

    // The lookup tables only have whole radii up to 256
    r = Math.min(MAX_BLUR_RADIUS, Math.max(1, Math.round(r)));

    let rsum: number;
    let gsum: number;
    let bsum: number;
    let asum: number;
    let x: number;
    let y: number;
    let i: number;
    let p: number;
    let p1: number;
    let p2: number;
    let yp: number;
    let yi: number;
    let yw: number;

    const wm = image.bitmap.width - 1;
    const hm = image.bitmap.height - 1;
    // const wh = image.bitmap.width * image.bitmap.height;
    const rad1 = r + 1;

    const mulSum = mulTable[r]!;
    // Divide instead of shifting by shgTable[r], which only works on 32 bit
    // numbers, and large radii can overflow them
    const divSum = 2 ** shgTable[r]!;

    const red = [];
    const green = [];
    const blue = [];
    const alpha = [];

    const vmin = [];
    const vmax = [];

    premultiplyAlpha(image.bitmap.data);

    let iterations = 2;

    while (iterations-- > 0) {
      yi = 0;
      yw = 0;

      for (y = 0; y < image.bitmap.height; y++) {
        rsum = image.bitmap.data[yw]! * rad1;
        gsum = image.bitmap.data[yw + 1]! * rad1;
        bsum = image.bitmap.data[yw + 2]! * rad1;
        asum = image.bitmap.data[yw + 3]! * rad1;

        for (i = 1; i <= r; i++) {
          p = yw + ((i > wm ? wm : i) << 2);
          rsum += image.bitmap.data[p++]!;
          gsum += image.bitmap.data[p++]!;
          bsum += image.bitmap.data[p++]!;
          asum += image.bitmap.data[p]!;
        }

        for (x = 0; x < image.bitmap.width; x++) {
          red[yi] = rsum;
          green[yi] = gsum;
          blue[yi] = bsum;
          alpha[yi] = asum;

          if (y === 0) {
            vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
            vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
          }

          p1 = yw + vmin[x]!;
          p2 = yw + vmax[x]!;

          rsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
          gsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
          bsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
          asum += image.bitmap.data[p1]! - image.bitmap.data[p2++]!;

          yi++;
        }

        yw += image.bitmap.width << 2;
      }

      for (x = 0; x < image.bitmap.width; x++) {
        yp = x;
        rsum = red[yp]! * rad1;
        gsum = green[yp]! * rad1;
        bsum = blue[yp]! * rad1;
        asum = alpha[yp]! * rad1;

        for (i = 1; i <= r; i++) {
          yp += i > hm ? 0 : image.bitmap.width;
          rsum += red[yp]!;
          gsum += green[yp]!;
          bsum += blue[yp]!;
          asum += alpha[yp]!;
        }

        yi = x << 2;

        for (y = 0; y < image.bitmap.height; y++) {
          image.bitmap.data[yi] = limit255(
            Math.floor((rsum * mulSum) / divSum),
          );
          image.bitmap.data[yi + 1] = limit255(
            Math.floor((gsum * mulSum) / divSum),
          );
          image.bitmap.data[yi + 2] = limit255(
            Math.floor((bsum * mulSum) / divSum),
          );
          image.bitmap.data[yi + 3] = limit255(
            Math.floor((asum * mulSum) / divSum),
          );

          if (x === 0) {
            vmin[y] = ((p = y + rad1) < hm ? p : hm) * image.bitmap.width;
            vmax[y] = (p = y - r) > 0 ? p * image.bitmap.width : 0;
          }

          p1 = x + vmin[y]!;
          p2 = x + vmax[y]!;

          rsum += red[p1]! - red[p2]!;
          gsum += green[p1]! - green[p2]!;
          bsum += blue[p1]! - blue[p2]!;
          asum += alpha[p1]! - alpha[p2]!;

          yi += image.bitmap.width << 2;
        }
      }
    }

    unpremultiplyAlpha(image.bitmap.data);

    return image;
  },
  // http://blog.ivank.net/fastest-gaussian-blur.html
  /**
   * Applies a true Gaussian blur to the image. Slower than `blur`, especially
   * for large radii.
   * @param r the standard deviation of the blur in pixels, greater than 0.
   * It doesn't have to be a whole number.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.gaussian(15);
   * ```
   */
  gaussian<I extends JimpClass>(image: I, r: number) {
    if (typeof r !== "number") {
      throw new Error("r must be a number");
    }

    if (!(r > 0)) {
      throw new Error("r must be greater than 0");
    }

    const { data } = image.bitmap;

    gaussianBlur(image, r, (idx, red, green, blue, alpha) => {
      const a = limit255(Math.round(alpha));

      data[idx + 3] = a;

      // Fully transparent pixels become transparent black
      if (a === 0) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        return;
      }

      data[idx] = limit255(Math.round(red / alpha));
      data[idx + 1] = limit255(Math.round(green / alpha));
      data[idx + 2] = limit255(Math.round(blue / alpha));
    });

    return image;
  },

  /**
   * Sharpens the image with an unsharp mask. Each color channel becomes
   * `original + amount * (original - blurred)`, where `blurred` is a Gaussian
   * blur of the image, so edges get more contrast and flat areas are left
   * alone.
   *
   * - `amount` is the strength. `0.5` to `1.5` suits most photos.
   * - `radius` is the standard deviation of the blur, like `gaussian`. Small
   *   values sharpen fine detail, large ones add local contrast.
   * - `threshold` skips channels that differ from the blurred image by less
   *   than this (0-255), so noise and smooth gradients aren't sharpened.
   *
   * Colors are weighted by alpha, so the transparent pixels around a shape
   * don't darken its edges, and alpha itself is left unchanged.
   *
   * This matches ImageMagick's `-unsharp 0x{radius}+{amount}+{threshold}`
   * with its threshold given as `2 * threshold / 255`.
   *
   * To smooth an image instead, use `gaussian` or `blur`.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.sharpen({ amount: 1 });
   * image.sharpen({ amount: 0.8, radius: 2, threshold: 4 });
   * ```
   */
  sharpen<I extends JimpClass>(image: I, options: SharpenOptions) {
    const {
      amount,
      radius = 1,
      threshold = 0,
    } = SharpenOptionsSchema.parse(options);
    const { data } = image.bitmap;

    gaussianBlur(image, radius, (idx, red, green, blue, alpha) => {
      // A transparent pixel's color can't be seen, and without any opaque
      // neighbors there's no blurred color to compare it with
      if (data[idx + 3] === 0 || alpha === 0) {
        return;
      }

      const blurred = [red / alpha, green / alpha, blue / alpha];

      for (let c = 0; c < 3; c++) {
        const original = data[idx + c]!;
        const difference = original - blurred[c]!;

        if (Math.abs(difference) < threshold) {
          continue;
        }

        data[idx + c] = limit255(Math.round(original + amount * difference));
      }
    });

    return image;
  },
};
