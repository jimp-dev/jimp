import { JimpClass } from "@jimp/types";
import anyBase from "any-base";
import { z } from "zod";

import ImagePHash, { DEFAULT_SIZE, DEFAULT_SMALLER_SIZE } from "./phash.js";

// an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths
// prettier-ignore
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";

// This loop lives in a function instead of at module scope so it doesn't end up
// at the top level of the browser bundle, where Babel 7's block-scoping
// transform can produce a duplicate declaration (#1405).
function getMaxHashLengths() {
  // an array storing the maximum string length of hashes at various bases
  // 0 and 1 do not exist as possible hash lengths
  const maxHashLength = [NaN, NaN];

  for (let i = 2; i < 65; i++) {
    const maxHash = anyBase(
      anyBase.BIN,
      alphabet.slice(0, i),
    )(new Array(64 + 1).join("1"));
    maxHashLength.push(maxHash.length);
  }

  return maxHashLength;
}

const maxHashLength = getMaxHashLengths();

/** The length of the longest `bits`-bit hash in the given base. */
function getMaxHashLength(base: number, bits: number) {
  if (bits === 64) {
    return maxHashLength[base]!;
  }

  return anyBase(anyBase.BIN, alphabet.slice(0, base))("1".repeat(bits)).length;
}

const PHashOptionsSchema = z
  .object({
    /**
     * The width and height the image is scaled to before the DCT, from 2 to
     * 256 (default 32). Must be at least `smallerSize`.
     */
    size: z.number().int().min(2).max(256).optional(),
    /**
     * The width and height of the block of lowest DCT frequencies the hash is
     * made from, from 2 to 64 (default 8). The hash is `smallerSize * smallerSize`
     * bits long.
     */
    smallerSize: z.number().int().min(2).max(64).optional(),
  })
  .refine(
    ({ size = DEFAULT_SIZE, smallerSize = DEFAULT_SMALLER_SIZE }) =>
      smallerSize <= size,
    { message: "smallerSize must not be larger than size" },
  );

export type PHashOptions = z.infer<typeof PHashOptionsSchema>;

function createPHash(options: PHashOptions = {}) {
  const { size, smallerSize } = PHashOptionsSchema.parse(options);
  return new ImagePHash(size, smallerSize);
}

export const methods = {
  /**
   * Calculates the perceptual hash
   * @param options Optional `size` and `smallerSize` to tune the hash. Hashes made with different options can't be compared.
   * @returns the perceptual hash, as a binary string of `smallerSize * smallerSize` bits (64 by default)
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.pHash();
   * image.pHash({ size: 64, smallerSize: 16 }); // a 256 bit hash
   * ```
   */
  pHash<I extends JimpClass>(image: I, options?: PHashOptions) {
    const pHash = createPHash(options);
    return pHash.getHash(image);
  },

  /**
   * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>. And pads the string. Can configure base.
   * @param base A number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimal, 16 is hex, 64 is base 64). Defaults to 64.
   * @param options Optional `size` and `smallerSize` to tune the hash, as for `pHash`.
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.hash(2); // binary
   * image.hash(64); // base 64
   * image.hash(16, { smallerSize: 16 }); // 256 bits in hex
   * ```
   */
  hash<I extends JimpClass>(image: I, base = 64, options?: PHashOptions) {
    if (base < 2 || base > 64) {
      throw new Error("base must be a number between 2 and 64");
    }

    const subAlphabet = alphabet.slice(0, base);
    const pHash = this.pHash(image, options);
    const maxLength = getMaxHashLength(base, pHash.length);

    return anyBase(anyBase.BIN, subAlphabet)(pHash).padStart(maxLength, "0");
  },

  /**
   * Calculates the hamming distance of the current image and a hash based on their perceptual hash
   * @param compareHash hash from `pHash` to compare to
   * @param options The `size` and `smallerSize` `compareHash` was made with. Throws if `compareHash` is a different length.
   * @returns  a number ranging from 0 to 1, 0 means they are believed to be identical
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.distanceFromHash(image.pHash());
   * image.distanceFromHash(image.pHash({ smallerSize: 16 }), { smallerSize: 16 });
   * ```
   */
  distanceFromHash<I extends JimpClass>(
    image: I,
    compareHash: string,
    options?: PHashOptions,
  ) {
    const pHash = createPHash(options);
    const currentHash = pHash.getHash(image);

    return pHash.distance(currentHash, compareHash);
  },
};

/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param img1 A Jimp image to compare
 * @param img2 A Jimp image to compare
 * @param options Optional `size` and `smallerSize` to tune the hash, as for `pHash`.
 * @returns A number ranging from 0 to 1, 0 means they are believed to be identical
 * @example
 * ```ts
 * import { Jimp, distance } from "jimp";
 *
 * const image1 = await Jimp.read("test/image.png");
 * const image2 = await Jimp.read("test/image.png");
 *
 * distance(image1, image2); // 0.5
 * distance(image1, image2, { size: 64, smallerSize: 16 });
 * ```
 */
export function distance<I extends JimpClass>(
  img1: I,
  img2: I,
  options?: PHashOptions,
) {
  const phash = createPHash(options);
  const hash1 = phash.getHash(img1);
  const hash2 = phash.getHash(img2);

  return phash.distance(hash1, hash2);
}

/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param hash1 A pHash
 * @param hash2 A pHash made with the same `size` and `smallerSize` (and, for `hash`, the same base). Throws if the hashes are different lengths.
 * @returns A number ranging from 0 to 1, 0 means they are believed to be identical
 * @example
 * ```ts
 * import { Jimp, compareHashes } from "jimp";
 *
 * const image1 = await Jimp.read("test/image.png");
 * const image2 = await Jimp.read("test/image.png");
 *
 * compareHashes(image1.pHash(), image2.pHash()); // 0.5
 * ```
 */
export function compareHashes(hash1: string, hash2: string) {
  const phash = new ImagePHash();
  return phash.distance(hash1, hash2);
}
