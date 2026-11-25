import { JimpClass } from "@jimp/types";

/**
 * Replace each pixel with the median of the `(2 * radius + 1)²` square
 * around it, per channel. Pixels past the edges are copies of the nearest
 * edge pixel.
 *
 * This is Huang's algorithm: each channel has a histogram of the values in
 * the window, and a pointer to its median. The window slides along each
 * row, so each step removes one column and adds another, and the pointer
 * only moves as far as the median changed. The cost per pixel grows with
 * `radius` instead of `radius²`, and nothing is sorted.
 *
 * Colors are weighted by alpha, so transparent pixels don't pull a shape's
 * edge toward their (usually black) color. Alpha is the plain median of the
 * alpha values.
 */
export function medianFilter(image: JimpClass, radius: number) {
  const { width, height, data } = image.bitmap;
  const source = new Uint8Array(data);

  let opaque = true;

  for (let idx = 3; idx < source.length; idx += 4) {
    if (source[idx] !== 255) {
      opaque = false;
      break;
    }
  }

  // The histograms of red, green, blue and alpha, one after another. Colors
  // count with their alpha as weight, and alpha counts 1.
  const counts = new Int32Array(256 * 4);
  // Each channel's median, and the sum of the weights below it
  const median = new Int32Array(4);
  const below = new Int32Array(4);
  // The sum of the color weights, which is the same for each color
  let total = 0;

  const size = radius * 2 + 1;
  // The offset of each row in the window, with rows past the edges clamped
  const rows = new Int32Array(size);

  /**
   * Add each pixel of column `x` of the window to the histograms with
   * weight `sign` (1 to add, -1 to remove).
   */
  function updateColumn(x: number, sign: number) {
    x = x < 0 ? 0 : x >= width ? width - 1 : x;

    const m0 = median[0]!;
    const m1 = median[1]!;
    const m2 = median[2]!;
    const m3 = median[3]!;
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;

    for (let i = 0; i < size; i++) {
      const idx = (rows[i]! + x) << 2;
      const r = source[idx]!;
      const g = source[idx + 1]!;
      const b = source[idx + 2]!;
      const a = source[idx + 3]!;
      const weight = a * sign;

      counts[r]! += weight;
      counts[256 + g]! += weight;
      counts[512 + b]! += weight;
      total += weight;

      // `(value - m) >> 31` is all ones when the value is below the median
      // and 0 otherwise. Noise makes a branch here mispredict often.
      b0 += weight & ((r - m0) >> 31);
      b1 += weight & ((g - m1) >> 31);
      b2 += weight & ((b - m2) >> 31);

      if (!opaque) {
        counts[768 + a]! += sign;
        b3 += sign & ((a - m3) >> 31);
      }
    }

    below[0]! += b0;
    below[1]! += b1;
    below[2]! += b2;
    below[3]! += b3;
  }

  /**
   * Move channel `c`'s median to the smallest value whose cumulative weight
   * is more than half of `sum`, and return it
   */
  function findMedian(c: number, sum: number) {
    const base = c << 8;
    let m = median[c]!;
    let b = below[c]!;

    while (b * 2 > sum) {
      m--;
      b -= counts[base + m]!;
    }

    while ((b + counts[base + m]!) * 2 <= sum) {
      b += counts[base + m]!;
      m++;
    }

    median[c] = m;
    below[c] = b;

    return m;
  }

  for (let y = 0; y < height; y++) {
    for (let i = 0; i < size; i++) {
      const y1 = y + i - radius;
      rows[i] = (y1 < 0 ? 0 : y1 >= height ? height - 1 : y1) * width;
    }

    counts.fill(0);
    median.fill(0);
    below.fill(0);
    total = 0;

    for (let i = -radius; i <= radius; i++) {
      updateColumn(i, 1);
    }

    for (let x = 0; x < width; x++) {
      if (x > 0) {
        updateColumn(x - radius - 1, -1);
        updateColumn(x + radius, 1);
      }

      const idx = (y * width + x) << 2;
      const a = opaque ? 255 : findMedian(3, size * size);

      // Fully transparent pixels become transparent black
      if (a === 0 || total === 0) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
        continue;
      }

      data[idx] = findMedian(0, total);
      data[idx + 1] = findMedian(1, total);
      data[idx + 2] = findMedian(2, total);
      data[idx + 3] = a;
    }
  }
}
