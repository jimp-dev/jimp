import { Buffer } from "buffer";
import {
  ResizeStrategy,
  ResampleFilter,
  methods as resizeMethods,
  resampleKernels,
} from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";
import { composite } from "@jimp/core";
import { methods as cropMethods } from "@jimp/plugin-crop";
import { z } from "zod";

const RotateOptionsSchema = z.union([
  z.number(),
  z.object({
    /** the number of degrees to rotate the image by */
    deg: z.number(),
    /**
     * How to rotate, and whether to resize the image to fit the rotated result.
     *
     * - `true` (the default): resize the image to fit, and take the nearest pixel.
     * - `false`: keep the width and height of the image, and take the nearest pixel.
     * - a `ResizeStrategy`: resize the image to fit, and sample with that filter, e.g.
     *   `ResizeStrategy.BILINEAR` or `ResizeStrategy.LANCZOS`. Edges are antialiased
     *   against the background colour. `ResizeStrategy.NEAREST_NEIGHBOR` is the same as `true`.
     *
     * Rotations by a multiple of 90 degrees are exact, whatever the mode.
     */
    mode: z.union([z.boolean(), z.nativeEnum(ResizeStrategy)]).optional(),
  }),
]);

export type RotateOptions = z.infer<typeof RotateOptionsSchema>;

/** function to translate the x, y coordinate to the index of the pixel in the buffer */
function createIdxTranslationFunction(w: number) {
  return function (x: number, y: number) {
    return (y * w + x) << 2;
  };
}

/**
 * Rotates an image counter-clockwise by multiple of 90 degrees. NB: 'this' must be a Jimp object.
 *
 * This function is based on matrix rotation. Check this to get an initial idea how it works: https://stackoverflow.com/a/8664879/10561909
 *
 * @param deg the number of degrees to rotate the image by, it should be a multiple of 90
 */
function matrixRotate<I extends JimpClass>(image: I, deg: number) {
  if (Math.abs(deg) % 90 !== 0) {
    throw new Error("Unsupported matrix rotation degree");
  }

  const w = image.bitmap.width;
  const h = image.bitmap.height;

  // decide which rotation angle to use
  let angle;

  switch (deg) {
    // 90 degree & -270 degree are same
    case 90:
    case -270:
      angle = 90;
      break;

    case 180:
    case -180:
      angle = 180;
      break;

    case 270:
    case -90:
      angle = -90;
      break;

    default:
      throw new Error("Unsupported matrix rotation degree");
  }
  // After this switch block, angle will be 90, 180 or -90

  // calculate the new width and height
  const nW = angle === 180 ? w : h;
  const nH = angle === 180 ? h : w;

  const dstBuffer = Buffer.alloc(image.bitmap.data.length);

  const srcIdxFunction = createIdxTranslationFunction(w);
  const dstIdxFunction = createIdxTranslationFunction(nW);

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const srcIdx = srcIdxFunction(x, y);
      const pixelRGBA = image.bitmap.data.readUInt32BE(srcIdx);

      let dstIdx;
      switch (angle) {
        case 90:
          dstIdx = dstIdxFunction(y, w - x - 1);
          break;
        case -90:
          dstIdx = dstIdxFunction(h - y - 1, x);
          break;
        case 180:
          dstIdx = dstIdxFunction(w - x - 1, h - y - 1);
          break;
        default:
          throw new Error("Unsupported matrix rotation angle");
      }

      dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
    }
  }

  image.bitmap.data = dstBuffer;
  image.bitmap.width = nW;
  image.bitmap.height = nH;
}

/**
 * Math.cos and Math.sin are not exact (Math.cos(Math.PI / 2) is 6e-17), so a
 * source coordinate that should be a whole number can land just below or above
 * it. Snap such values to the whole number before choosing the source pixel.
 */
function snapToInteger(value: number, tolerance: number) {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < tolerance ? rounded : value;
}

function createTranslationFunction(deltaX: number, deltaY: number) {
  return function (x: number, y: number) {
    return {
      x: x + deltaX,
      y: y + deltaY,
    };
  };
}

/**
 * The size of the canvas that fits an image of `width` x `height` rotated by
 * the angle with the given cosine and sine.
 */
function rotatedSize(
  width: number,
  height: number,
  cosine: number,
  sine: number
) {
  // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
  // Plus 1 border pixel to ensure to show all rotated result for some cases.
  let w = Math.ceil(Math.abs(width * cosine) + Math.abs(height * sine)) + 1;
  let h = Math.ceil(Math.abs(width * sine) + Math.abs(height * cosine)) + 1;

  // Ensure destination to have even size to a better result.
  if (w % 2 !== 0) {
    w++;
  }

  if (h % 2 !== 0) {
    h++;
  }

  return { w, h };
}

/**
 * Rotates an image counter-clockwise by an arbitrary number of degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 */
function advancedRotate<I extends JimpClass>(
  image: I,
  deg: number,
  mode: boolean | ResizeStrategy
) {
  const rad = (deg * Math.PI) / 180;
  const cosine = Math.cos(rad);
  const sine = Math.sin(rad);

  // the final width and height will change if resize == true
  let w = image.bitmap.width;
  let h = image.bitmap.height;

  if (mode === true || typeof mode === "string") {
    // resize the image to it maximum dimension and blit the existing image
    // onto the center so that when it is rotated the image is kept in bounds

    ({ w, h } = rotatedSize(w, h, cosine, sine));

    const c = clone(image);

    image.scan((_, __, idx) => {
      image.bitmap.data.writeUInt32BE(image.background, idx);
    });

    const max = Math.max(w, h, image.bitmap.width, image.bitmap.height);
    image = resizeMethods.resize(image, {
      h: max,
      w: max,
      mode: mode === true ? undefined : mode,
    });

    image = composite(
      image,
      c,
      image.bitmap.width / 2 - c.bitmap.width / 2,
      image.bitmap.height / 2 - c.bitmap.height / 2
    );
  }

  const bW = image.bitmap.width;
  const bH = image.bitmap.height;
  const dstBuffer = Buffer.alloc(image.bitmap.data.length);
  // the rounding error of the coordinates grows with the image size
  const tolerance = (bW + bH) * Number.EPSILON * 4;

  const translate2Cartesian = createTranslationFunction(-(bW / 2), -(bH / 2));
  const translate2Screen = createTranslationFunction(
    bW / 2 + 0.5,
    bH / 2 + 0.5
  );

  for (let y = 1; y <= bH; y++) {
    for (let x = 1; x <= bW; x++) {
      const cartesian = translate2Cartesian(x, y);
      const source = translate2Screen(
        cosine * cartesian.x - sine * cartesian.y,
        cosine * cartesian.y + sine * cartesian.x
      );
      const sourceX = snapToInteger(source.x, tolerance);
      const sourceY = snapToInteger(source.y, tolerance);
      const dstIdx = (bW * (y - 1) + x - 1) << 2;

      if (sourceX >= 0 && sourceX < bW && sourceY >= 0 && sourceY < bH) {
        const srcIdx = (bW * (sourceY | 0) + (sourceX | 0)) << 2;
        const pixelRGBA = image.bitmap.data.readUInt32BE(srcIdx);
        dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
      } else {
        // reset off-image pixels
        dstBuffer.writeUInt32BE(image.background, dstIdx);
      }
    }
  }

  image.bitmap.data = dstBuffer;

  if (mode === true || typeof mode === "string") {
    // now crop the image to the final size
    const x = Math.max(bW / 2 - w / 2, 0);
    const y = Math.max(bH / 2 - h / 2, 0);
    image = cropMethods.crop(image, { x, y, w, h });
  }
}

/** how many steps between two pixels the kernel weights are precomputed for */
const SUBPIXELS = 1024;

const weightTables = new Map<ResampleFilter, Float64Array>();

/**
 * Precompute the weights of a kernel's taps for each of `SUBPIXELS` fractional
 * offsets. Row `f` holds the weights of the `taps` pixels around a source
 * position `f / SUBPIXELS` past a pixel centre, starting `taps / 2 - 1` pixels
 * before it. Each row adds up to 1, so a constant image stays constant.
 */
function weightTable(filter: ResampleFilter) {
  let table = weightTables.get(filter);

  if (table) {
    return table;
  }

  const taps = Math.ceil(filter.support) * 2;
  table = new Float64Array(SUBPIXELS * taps);

  for (let f = 0; f < SUBPIXELS; f++) {
    let sum = 0;

    for (let n = 0; n < taps; n++) {
      const weight = filter.kernel(n - taps / 2 + 1 - f / SUBPIXELS);
      table[f * taps + n] = weight;
      sum += weight;
    }

    for (let n = 0; n < taps; n++) {
      table[f * taps + n]! /= sum;
    }
  }

  weightTables.set(filter, table);
  return table;
}

/**
 * Rotates an image counter-clockwise by an arbitrary number of degrees and
 * resizes it to fit, sampling the source with `filter`. Each destination pixel
 * is mapped back to the source and the pixels around it are weighted by the
 * kernel. RGB is premultiplied by alpha, and everything outside the source is
 * the background colour, so the edges are antialiased against it.
 */
function resampleRotate<I extends JimpClass>(
  image: I,
  deg: number,
  filter: ResampleFilter
) {
  const rad = (deg * Math.PI) / 180;
  const cosine = Math.cos(rad);
  const sine = Math.sin(rad);

  const src = image.bitmap.data;
  const sW = image.bitmap.width;
  const sH = image.bitmap.height;
  const { w, h } = rotatedSize(sW, sH, cosine, sine);
  const dst = Buffer.alloc(w * h * 4);

  const table = weightTable(filter);
  const taps = Math.ceil(filter.support) * 2;
  const before = taps / 2 - 1;

  // the centre of the image lands in the middle of the destination, moved by
  // a whole number of pixels so a tiny angle doesn't blur the image by half
  // a pixel
  const centerX = Math.floor((w - sW) / 2) + sW / 2;
  const centerY = Math.floor((h - sH) / 2) + sH / 2;

  const bg = image.background;
  const bgR = (bg >>> 24) & 0xff;
  const bgG = (bg >>> 16) & 0xff;
  const bgB = (bg >>> 8) & 0xff;
  const bgA = bg & 0xff;

  for (let y = 0; y < h; y++) {
    const cy = y + 0.5 - centerY;

    for (let x = 0; x < w; x++) {
      const cx = x + 0.5 - centerX;
      const dstIdx = (y * w + x) * 4;

      // the source position, in pixels where 0 is the centre of the first
      // pixel, rounded to the nearest step of the weight table. This also
      // snaps away the float error of Math.cos and Math.sin
      const qx = Math.round(
        (cosine * cx - sine * cy + sW / 2 - 0.5) * SUBPIXELS
      );
      const qy = Math.round(
        (cosine * cy + sine * cx + sH / 2 - 0.5) * SUBPIXELS
      );
      const pixelX = Math.floor(qx / SUBPIXELS);
      const pixelY = Math.floor(qy / SUBPIXELS);
      const x0 = pixelX - before;
      const y0 = pixelY - before;

      if (x0 >= sW || y0 >= sH || x0 + taps <= 0 || y0 + taps <= 0) {
        // no source pixel is in reach
        dst.writeUInt32BE(bg, dstIdx);
        continue;
      }

      const xWeights = (qx - pixelX * SUBPIXELS) * taps;
      const yWeights = (qy - pixelY * SUBPIXELS) * taps;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      if (x0 >= 0 && y0 >= 0 && x0 + taps <= sW && y0 + taps <= sH) {
        for (let ty = 0; ty < taps; ty++) {
          const wy = table[yWeights + ty]!;
          let srcIdx = ((y0 + ty) * sW + x0) * 4;

          for (let tx = 0; tx < taps; tx++, srcIdx += 4) {
            const wa = wy * table[xWeights + tx]! * src[srcIdx + 3]!;

            r += wa * src[srcIdx]!;
            g += wa * src[srcIdx + 1]!;
            b += wa * src[srcIdx + 2]!;
            a += wa;
          }
        }
      } else {
        // part of the kernel is off the image, where it reads the background
        for (let ty = 0; ty < taps; ty++) {
          const wy = table[yWeights + ty]!;
          const sy = y0 + ty;

          for (let tx = 0; tx < taps; tx++) {
            const sx = x0 + tx;
            const weight = wy * table[xWeights + tx]!;

            if (sx >= 0 && sx < sW && sy >= 0 && sy < sH) {
              const srcIdx = (sy * sW + sx) * 4;
              const wa = weight * src[srcIdx + 3]!;

              r += wa * src[srcIdx]!;
              g += wa * src[srcIdx + 1]!;
              b += wa * src[srcIdx + 2]!;
              a += wa;
            } else {
              const wa = weight * bgA;

              r += wa * bgR;
              g += wa * bgG;
              b += wa * bgB;
              a += wa;
            }
          }
        }
      }

      // the colour is the alpha weighted average. Pixels with no alpha get
      // black, since they have no colour left
      const alpha = Math.max(0, Math.min(255, Math.round(a)));
      const f = alpha ? 1 / a : 0;

      dst[dstIdx] = Math.max(0, Math.min(255, Math.round(r * f)));
      dst[dstIdx + 1] = Math.max(0, Math.min(255, Math.round(g * f)));
      dst[dstIdx + 2] = Math.max(0, Math.min(255, Math.round(b * f)));
      dst[dstIdx + 3] = alpha;
    }
  }

  image.bitmap.data = dst;
  image.bitmap.width = w;
  image.bitmap.height = h;
}

export const methods = {
  /**
   * Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
   *
   * By default the rotation takes the nearest pixel, which leaves jagged edges at angles that aren't a multiple of 90 degrees.
   * Pass a `ResizeStrategy` as `mode` to sample with that filter instead.
   * @example
   * ```ts
   * import { Jimp, ResizeStrategy } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.rotate(90);
   * image.rotate({ deg: 30, mode: ResizeStrategy.BILINEAR });
   * ```
   */
  rotate<I extends JimpClass>(image: I, options: RotateOptions) {
    const parsed = RotateOptionsSchema.parse(options);
    const actualOptions = typeof parsed === "number" ? { deg: parsed } : parsed;
    const { mode = true } = actualOptions;
    let { deg } = actualOptions;

    // No need to do extra rotation
    deg %= 360;

    // no rotation for 0, 360, -360, 720, -720, ...
    if (deg % 360 === 0) {
      return image;
    }

    // use matrixRotate if the angle is a multiple of 90 degrees (eg: 180 or -90) and resize is allowed or not needed.
    const matrixRotateAllowed =
      deg % 90 === 0 &&
      (mode || image.bitmap.width === image.bitmap.height || deg % 180 === 0);

    if (matrixRotateAllowed) {
      matrixRotate(image, deg);
    } else if (
      typeof mode === "string" &&
      mode !== ResizeStrategy.NEAREST_NEIGHBOR
    ) {
      resampleRotate(image, deg, resampleKernels[mode]);
    } else {
      advancedRotate(image, deg, mode);
    }

    return image;
  },
};
