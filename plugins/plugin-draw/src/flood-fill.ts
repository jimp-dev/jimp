import type { Bitmap } from "@jimp/types";

/**
 * Find the pixels connected to (x, y), up, down, left or right, whose color
 * is within `tolerance` (0 to 1) of its color. Returns a mask with 1 for
 * those pixels, or undefined if (x, y) is outside the image.
 *
 * Colors are compared premultiplied by alpha, so every fully transparent
 * pixel matches every other whatever its hidden RGB. The difference is the
 * largest difference of any channel, as a fraction of 255.
 *
 * A scanline fill: it fills runs of pixels across a row and keeps a stack of
 * runs to visit rather than recursing.
 */
export function floodFillMask(
  bitmap: Bitmap,
  x: number,
  y: number,
  tolerance: number,
) {
  const { width, height, data } = bitmap;

  if (!(x >= 0 && x < width && y >= 0 && y < height)) {
    return;
  }

  const seed = (y * width + x) * 4;
  const seedAlpha = data[seed + 3]! / 255;
  const sr = data[seed]! * seedAlpha;
  const sg = data[seed + 1]! * seedAlpha;
  const sb = data[seed + 2]! * seedAlpha;
  const sa = data[seed + 3]!;
  const limit = tolerance * 255;
  const mask = new Uint8Array(width * height);

  const matches = (p: number) => {
    if (mask[p]) {
      return false;
    }

    const i = p * 4;
    const a = data[i + 3]!;
    const alpha = a / 255;

    return (
      Math.abs(a - sa) <= limit &&
      Math.abs(data[i]! * alpha - sr) <= limit &&
      Math.abs(data[i + 1]! * alpha - sg) <= limit &&
      Math.abs(data[i + 2]! * alpha - sb) <= limit
    );
  };

  const stack = [x, y];

  while (stack.length > 0) {
    const sy = stack.pop()!;
    const sx = stack.pop()!;
    const row = sy * width;

    if (!matches(row + sx)) {
      continue;
    }

    let left = sx;
    let right = sx;

    while (left > 0 && matches(row + left - 1)) {
      left--;
    }

    while (right < width - 1 && matches(row + right + 1)) {
      right++;
    }

    mask.fill(1, row + left, row + right + 1);

    // Queue one seed for each run of matching pixels above and below
    for (const ny of [sy - 1, sy + 1]) {
      if (ny < 0 || ny >= height) {
        continue;
      }

      let inRun = false;

      for (let nx = left; nx <= right; nx++) {
        if (matches(ny * width + nx)) {
          if (!inRun) {
            stack.push(nx, ny);
            inRun = true;
          }
        } else {
          inRun = false;
        }
      }
    }
  }

  return mask;
}
