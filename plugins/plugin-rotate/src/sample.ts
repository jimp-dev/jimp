import { Buffer } from "buffer";
import { ResizeStrategy } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";
import { composite } from "@jimp/core";

import { Kernel, kernels } from "./kernels.js";

/**
 * Math.cos and Math.sin are not exact (Math.cos(Math.PI / 2) is 6e-17), so a
 * source coordinate that should be a whole number can land just below or above
 * it. Snap such values to the whole number before choosing the source pixel.
 */
export function snapToInteger(value: number, tolerance: number) {
  const rounded = Math.round(value);
  return Math.abs(value - rounded) < tolerance ? rounded : value;
}

/**
 * Draw the image over its background colour, as if onto a larger canvas, so
 * the pixels of the image match the new space around it.
 */
export function drawOverBackground<I extends JimpClass>(image: I) {
  const c = clone(image);

  image.scan((_, __, idx) => {
    image.bitmap.data.writeUInt32BE(image.background, idx);
  });

  composite(image, c);
}

/**
 * Write the pixel at a point of the source image, interpolated with a kernel,
 * to `dst`. The point is in pixels, with pixel centres at half pixels. Pixels
 * outside the image are the background colour, premultiplied by its alpha.
 * Colours are weighted by their alpha, so transparent pixels don't darken
 * their neighbours. Returns false, without writing, if the point is too far
 * from the image to reach any of its pixels.
 */
function writeInterpolated(
  src: Buffer,
  srcW: number,
  srcH: number,
  sourceX: number,
  sourceY: number,
  kernel: Kernel,
  background: number[],
  dst: Buffer,
  dstIdx: number,
) {
  const u = sourceX - 0.5;
  const v = sourceY - 0.5;
  const x0 = Math.ceil(u - kernel.support);
  const x1 = Math.floor(u + kernel.support);
  const y0 = Math.ceil(v - kernel.support);
  const y1 = Math.floor(v + kernel.support);

  if (x1 < 0 || y1 < 0 || x0 >= srcW || y0 >= srcH) {
    return false;
  }

  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let total = 0;

  for (let y = y0; y <= y1; y++) {
    const wy = kernel.weight(v - y);

    if (wy === 0) {
      continue;
    }

    for (let x = x0; x <= x1; x++) {
      const weight = wy * kernel.weight(u - x);

      if (weight === 0) {
        continue;
      }

      total += weight;

      if (x < 0 || y < 0 || x >= srcW || y >= srcH) {
        r += weight * background[0]!;
        g += weight * background[1]!;
        b += weight * background[2]!;
        a += weight * background[3]!;
        continue;
      }

      const idx = (srcW * y + x) << 2;
      const alpha = src[idx + 3]!;
      const w = (weight * alpha) / 255;

      r += w * src[idx]!;
      g += w * src[idx + 1]!;
      b += w * src[idx + 2]!;
      a += weight * alpha;
    }
  }

  const alpha = Math.min(255, Math.max(0, Math.round(a / total)));
  // un-premultiply: the colour is the alpha weighted average
  const f = alpha ? 1 / a : 0;

  dst[dstIdx] = Math.min(255, Math.max(0, Math.round(r * f * 255)));
  dst[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(g * f * 255)));
  dst[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(b * f * 255)));
  dst[dstIdx + 3] = alpha;
  return true;
}

/**
 * Create a function that writes the pixel of the image at a point to `dst`.
 * The point is in pixels, with pixel centres at half pixels. The nearest pixel
 * is taken unless `mode` is an interpolating `ResizeStrategy`. Points outside
 * the image are the image's background colour.
 */
export function createSampler<I extends JimpClass>(
  image: I,
  mode?: ResizeStrategy,
) {
  const src = image.bitmap.data;
  const srcW = image.bitmap.width;
  const srcH = image.bitmap.height;
  const kernel =
    mode && mode !== ResizeStrategy.NEAREST_NEIGHBOR
      ? kernels[mode]
      : undefined;
  const bgAlpha = image.background & 0xff;
  const background = [
    (((image.background >>> 24) & 0xff) * bgAlpha) / 255,
    (((image.background >>> 16) & 0xff) * bgAlpha) / 255,
    (((image.background >>> 8) & 0xff) * bgAlpha) / 255,
    bgAlpha,
  ];

  return (sourceX: number, sourceY: number, dst: Buffer, dstIdx: number) => {
    if (kernel) {
      const written = writeInterpolated(
        src,
        srcW,
        srcH,
        sourceX,
        sourceY,
        kernel,
        background,
        dst,
        dstIdx,
      );

      if (!written) {
        dst.writeUInt32BE(image.background, dstIdx);
      }
    } else if (
      sourceX >= 0 &&
      sourceX < srcW &&
      sourceY >= 0 &&
      sourceY < srcH
    ) {
      const srcIdx = (srcW * (sourceY | 0) + (sourceX | 0)) << 2;
      dst.writeUInt32BE(src.readUInt32BE(srcIdx), dstIdx);
    } else {
      // reset off-image pixels
      dst.writeUInt32BE(image.background, dstIdx);
    }
  };
}
