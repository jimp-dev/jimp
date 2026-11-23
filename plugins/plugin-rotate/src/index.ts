import { Buffer } from "buffer";
import { ResizeStrategy } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { z } from "zod";

import {
  affine as affineTransform,
  AffineOptions,
  skew as skewTransform,
  SkewOptions,
} from "./affine.js";
import { createSampler, drawOverBackground, snapToInteger } from "./sample.js";

export type { AffineOptions, SkewOptions };

const RotateOptionsSchema = z.union([
  z.number(),
  z.object({
    /** the number of degrees to rotate the image by */
    deg: z.number(),
    /**
     * Whether to grow the canvas to fit the rotated image, and how to sample
     * the pixels:
     * - `true` (the default) grows the canvas and takes the nearest pixel.
     * - `false` keeps the width and height of the image, and takes the nearest pixel.
     * - A `ResizeStrategy` grows the canvas like `true`, and interpolates the
     *   pixels with that strategy, for smooth edges and lines.
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
 * The size of one side of the canvas that holds the rotated image: the side of
 * its bounding box, rounded up to whole pixels and to the same parity as the
 * side of the image that lies along it, so the image is centred on whole
 * pixels when it is rotated by a small angle (or by nearly 90 degrees).
 */
function rotatedSide(extent: number, alongSide: number, tolerance: number) {
  const size = Math.ceil(extent - tolerance);
  return (size - alongSide) % 2 === 0 ? size : size + 1;
}

/**
 * Rotates an image counter-clockwise by an arbitrary number of degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 */
function advancedRotate<I extends JimpClass>(
  image: I,
  deg: number,
  mode: boolean | ResizeStrategy,
) {
  const rad = (deg * Math.PI) / 180;
  const cosine = Math.cos(rad);
  const sine = Math.sin(rad);
  const srcW = image.bitmap.width;
  const srcH = image.bitmap.height;
  // the rounding error of the coordinates grows with the image size
  const tolerance = (srcW + srcH) * Number.EPSILON * 4;

  // the final width and height will change if resize == true
  let w = srcW;
  let h = srcH;

  if (mode === true || typeof mode === "string") {
    // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
    const upright = Math.abs(cosine) >= Math.abs(sine);

    w = rotatedSide(
      Math.abs(srcW * cosine) + Math.abs(srcH * sine),
      upright ? srcW : srcH,
      tolerance,
    );
    h = rotatedSide(
      Math.abs(srcW * sine) + Math.abs(srcH * cosine),
      upright ? srcH : srcW,
      tolerance,
    );

    drawOverBackground(image);
  }

  const dstBuffer = Buffer.alloc(w * h * 4);
  const sample = createSampler(
    image,
    typeof mode === "string" ? mode : undefined,
  );

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // rotate the centre of the destination pixel back onto the source,
      // about the centres of the two images
      const cx = x + 0.5 - w / 2;
      const cy = y + 0.5 - h / 2;
      const sourceX = snapToInteger(
        cosine * cx - sine * cy + srcW / 2,
        tolerance,
      );
      const sourceY = snapToInteger(
        cosine * cy + sine * cx + srcH / 2,
        tolerance,
      );
      const dstIdx = (w * y + x) << 2;

      sample(sourceX, sourceY, dstBuffer, dstIdx);
    }
  }

  image.bitmap.data = dstBuffer;
  image.bitmap.width = w;
  image.bitmap.height = h;
}

export const methods = {
  /**
   * Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
   * The rotation takes the nearest pixel unless `mode` is a `ResizeStrategy`, which interpolates the pixels for smooth edges.
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
    } else {
      advancedRotate(image, deg, mode);
    }

    return image;
  },

  /**
   * Transforms the image with a 2D affine matrix: any mix of scaling, rotating,
   * skewing, flipping and translating. The matrix is `[a, b, c, d, e, f]`, in
   * the same order as CSS's `matrix(a, b, c, d, e, f)`, so each point moves to
   * `x' = a * x + c * y + e` and `y' = b * x + d * y + f`. Like CSS, the origin
   * is the centre of the image and y points down.
   *
   * By default the canvas is resized to fit the transformed image, and new
   * space is filled with the image's `background` colour, like `rotate`.
   * Pass `fit: false` to keep the width and height of the image instead;
   * `e` and `f` then move the transformed image within it.
   *
   * The transform takes the nearest pixel unless `mode` is a `ResizeStrategy`,
   * which interpolates the pixels for smooth edges.
   * @example
   * ```ts
   * import { Jimp, ResizeStrategy } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * // skew along the x axis, like CSS's matrix(1, 0, 0.5, 1, 0, 0)
   * image.affine({ matrix: [1, 0, 0.5, 1, 0, 0] });
   * // squash vertically and flip horizontally, with smooth edges
   * image.affine({
   *   matrix: [-1, 0, 0, 0.5, 0, 0],
   *   mode: ResizeStrategy.BILINEAR,
   * });
   * // move the image 10px right, keeping its size
   * image.affine({ matrix: [1, 0, 0, 1, 10, 0], fit: false });
   * ```
   */
  affine<I extends JimpClass>(image: I, options: AffineOptions) {
    return affineTransform(image, options);
  },

  /**
   * Skews the image by a number of degrees along the x and/or y axis, like
   * CSS's `skew(x, y)`. A positive `x` slants vertical lines like `\`, and a
   * positive `y` moves the right side of the image down.
   *
   * By default the canvas grows to fit the skewed image, and new space is
   * filled with the image's `background` colour; pass `fit: false` to keep
   * the width and height. The skew takes the nearest pixel unless `mode` is a
   * `ResizeStrategy`, which interpolates the pixels for smooth edges.
   * @example
   * ```ts
   * import { Jimp, ResizeStrategy } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.skew({ x: 20 });
   * image.skew({ x: 10, y: -15, mode: ResizeStrategy.BILINEAR });
   * ```
   */
  skew<I extends JimpClass>(image: I, options: SkewOptions) {
    return skewTransform(image, options);
  },
};
