import { Buffer } from "buffer";
import { ResizeStrategy } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";
import { composite } from "@jimp/core";
import { z } from "zod";

const RotateOptionsSchema = z.union([
  z.number(),
  z.object({
    /** the number of degrees to rotate the image by */
    deg: z.number(),
    /**
     * resize mode or a boolean, if false then the width and height of the image will not be changed.
     * Any resize mode grows the canvas like true does: the rotation itself always takes the nearest pixel.
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

    // the image is drawn over the background, as if onto a larger canvas
    const c = clone(image);

    image.scan((_, __, idx) => {
      image.bitmap.data.writeUInt32BE(image.background, idx);
    });

    composite(image, c);
  }

  const src = image.bitmap.data;
  const dstBuffer = Buffer.alloc(w * h * 4);

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

      if (sourceX >= 0 && sourceX < srcW && sourceY >= 0 && sourceY < srcH) {
        const srcIdx = (srcW * (sourceY | 0) + (sourceX | 0)) << 2;
        dstBuffer.writeUInt32BE(src.readUInt32BE(srcIdx), dstIdx);
      } else {
        // reset off-image pixels
        dstBuffer.writeUInt32BE(image.background, dstIdx);
      }
    }
  }

  image.bitmap.data = dstBuffer;
  image.bitmap.width = w;
  image.bitmap.height = h;
}

export const methods = {
  /**
   * Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.rotate(90);
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
};
