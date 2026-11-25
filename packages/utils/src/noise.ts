/**
 * A random number from 0 up to (not including) 1 for a pixel, the same every
 * time for the same `x`, `y` and `seed`. It's a hash of its inputs rather
 * than a sequence, so a pixel's value doesn't depend on the image's size or
 * the order pixels are visited in. Use it for noise and dithering instead of
 * `Math.random`, so the same input always makes the same image.
 * @param x the pixel's x
 * @param y the pixel's y
 * @param seed picks a different pattern
 * @example
 * ```ts
 * import { pixelNoise } from "@jimp/utils";
 *
 * pixelNoise(10, 20); // 0.4702..., every time
 * pixelNoise(10, 20, 1); // 0.1538..., another pattern
 * ```
 */
export function pixelNoise(x: number, y: number, seed = 0) {
  // Mix the coordinates with large odd constants, then avalanche the bits
  // with MurmurHash3's finalizer
  let h =
    (Math.imul(x | 0, 0x8da6b343) +
      Math.imul(y | 0, 0xd8163841) +
      Math.imul(seed | 0, 0xcb1ab31f)) |
    0;

  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;

  return (h >>> 0) / 4294967296;
}
