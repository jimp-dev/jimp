import { methods as resizeMethods } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import {
  createColorConverter,
  getColorSpace,
  intToRGBA,
  SRGB,
} from "@jimp/utils";
import anyBase from "any-base";
import { z } from "zod";

import { decodeBlurhashPixels, encodeBlurhash } from "./blurhash.js";
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

const BlurhashOptionsSchema = z.object({
  /** How many components across, from 1 to 9 (default 4). More keeps more horizontal detail and makes the hash longer. */
  componentsX: z.number().int().min(1).max(9).optional(),
  /** How many components down, from 1 to 9 (default 3). More keeps more vertical detail and makes the hash longer. */
  componentsY: z.number().int().min(1).max(9).optional(),
});

export type BlurhashOptions = z.infer<typeof BlurhashOptionsSchema>;

const DecodeBlurhashOptionsSchema = z.object({
  /** The width of the image to make, in pixels */
  w: z.number().int().min(1),
  /** The height of the image to make, in pixels */
  h: z.number().int().min(1),
  /** Scales the contrast: above 1 for more, below 1 for less (default 1) */
  punch: z.number().min(0).optional(),
});

export type DecodeBlurhashOptions = z.infer<typeof DecodeBlurhashOptionsSchema>;

/**
 * Images larger than this on their longest side are scaled down before
 * they're encoded as a BlurHash. Its few components only hold the coarsest
 * detail, so a larger image would only make encoding slower.
 */
const BLURHASH_MAX_SIZE = 64;

/**
 * The pixels a BlurHash is made from: the image scaled down, drawn over its
 * background, which BlurHash has no alpha for, and in sRGB. The image itself
 * isn't changed.
 */
function blurhashBitmap(image: JimpClass) {
  let { bitmap } = image;

  if (Math.max(bitmap.width, bitmap.height) > BLURHASH_MAX_SIZE) {
    // resize gives the image it's passed a new bitmap rather than writing
    // over the pixels, so a copy of the image object is enough to leave the
    // image as it was, without copying its pixels
    const small = { bitmap: { ...bitmap } } as JimpClass;

    resizeMethods.resize(
      small,
      bitmap.width >= bitmap.height
        ? { w: BLURHASH_MAX_SIZE }
        : { h: BLURHASH_MAX_SIZE },
    );
    bitmap = small.bitmap;
  }

  const data = Uint8Array.from(bitmap.data);
  const background = intToRGBA(image.background);
  const backgroundAlpha = background.a / 255;

  // Source over the background, as `getBuffer` does for formats without
  // alpha. With the default, transparent background, partly transparent
  // pixels keep their colour and fully transparent ones are black.
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]! / 255;

    if (alpha === 1) {
      continue;
    }

    const a = backgroundAlpha + alpha - backgroundAlpha * alpha;
    const over = (value: number, backgroundValue: number) =>
      a === 0
        ? 0
        : Math.round(
            (value * alpha + backgroundValue * backgroundAlpha * (1 - alpha)) /
              a,
          );

    data[i] = over(data[i]!, background.r);
    data[i + 1] = over(data[i + 1]!, background.g);
    data[i + 2] = over(data[i + 2]!, background.b);
    data[i + 3] = 255;
  }

  createColorConverter(getColorSpace(image), SRGB)?.(data);

  return { data, width: bitmap.width, height: bitmap.height };
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

  /**
   * Encodes the image as a BlurHash <https://blurha.sh>: a short string (28
   * characters with the default 4x3 components) that `decodeBlurhash` turns
   * back into a blurred placeholder to show while the real image loads.
   *
   * Large images are scaled down first, so this stays fast. BlurHash has no
   * alpha, so transparent pixels are drawn over the image's `background`, as
   * for JPEG output. Images in other colour spaces are converted to sRGB.
   * @param options Optional `componentsX` and `componentsY`, from 1 to 9 (default 4 and 3), for how much detail the hash keeps
   * @returns the BlurHash string
   * @example
   * ```ts
   * import { Jimp } from "jimp";
   *
   * const image = await Jimp.read("test/image.png");
   *
   * image.blurhash(); // "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
   * image.blurhash({ componentsX: 3, componentsY: 4 }); // for a portrait image
   * ```
   */
  blurhash<I extends JimpClass>(image: I, options: BlurhashOptions = {}) {
    const { componentsX = 4, componentsY = 3 } =
      BlurhashOptionsSchema.parse(options);
    const { data, width, height } = blurhashBitmap(image);

    return encodeBlurhash(data, width, height, componentsX, componentsY);
  },
};

/**
 * Decodes a BlurHash from `blurhash()` into pixels: a blurred placeholder
 * for the image it was made from.
 *
 * The hash doesn't store a size, so pass the size you want. Decoding is
 * quickest at a small size, such as 32x32, scaled up where it's shown.
 * @param hash A BlurHash string
 * @param options The width `w` and height `h` to decode to, and an optional `punch` to scale the contrast (default 1)
 * @returns `{ data, width, height }` in sRGB, with opaque pixels, for `Jimp.fromBitmap` or a canvas's `ImageData`. Throws if `hash` isn't a valid BlurHash.
 * @example
 * ```ts
 * import { Jimp, decodeBlurhash } from "jimp";
 *
 * const placeholder = Jimp.fromBitmap(
 *   decodeBlurhash("LEHV6nWB2yk8pyo0adR*.7kCMdnj", { w: 32, h: 32 }),
 * );
 *
 * placeholder.resize({ w: 320, h: 320 });
 * ```
 */
export function decodeBlurhash(hash: string, options: DecodeBlurhashOptions) {
  const { w, h, punch = 1 } = DecodeBlurhashOptionsSchema.parse(options);

  return { data: decodeBlurhashPixels(hash, w, h, punch), width: w, height: h };
}

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
 * Turn a hash from `hash()` back into the binary pHash it was made from, so
 * hashes in any base can be compared bit by bit.
 */
function hashToBinary(hash: string, base: number) {
  const subAlphabet = alphabet.slice(0, base);

  if (base === 2) {
    return hash;
  }

  if ([...hash].every((char) => subAlphabet.includes(char))) {
    // pHashes are smallerSize * smallerSize bits, with smallerSize from 2 to 64
    for (let smallerSize = 2; smallerSize <= 64; smallerSize++) {
      const bits = smallerSize * smallerSize;
      const length = getMaxHashLength(base, bits);

      if (length === hash.length) {
        return anyBase(subAlphabet, anyBase.BIN)(hash).padStart(bits, "0");
      }

      if (length > hash.length) {
        break;
      }
    }
  }

  throw new Error(
    `"${hash}" isn't a base ${base} hash. Pass the base the hashes were made ` +
      "with to compareHashes, e.g. compareHashes(hash1, hash2, 16).",
  );
}

/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param hash1 A hash from `pHash` or `hash`
 * @param hash2 A hash made the same way as `hash1`, with the same `size` and `smallerSize` (and, for `hash`, the same base). Throws if the hashes are different lengths.
 * @param base The base of `hash()` hashes, from 2 to 64. Defaults to 2 for binary hashes such as `pHash()`, and otherwise to 64, the default of `hash()`.
 * @returns A number ranging from 0 to 1, the fraction of bits that differ. 0 means they are believed to be identical
 * @example
 * ```ts
 * import { Jimp, compareHashes } from "jimp";
 *
 * const image1 = await Jimp.read("test/image.png");
 * const image2 = await Jimp.read("test/image.png");
 *
 * compareHashes(image1.pHash(), image2.pHash()); // 0.5
 * compareHashes(image1.hash(), image2.hash()); // the same distance
 * compareHashes(image1.hash(16), image2.hash(16), 16);
 * ```
 */
export function compareHashes(hash1: string, hash2: string, base?: number) {
  const phash = new ImagePHash();

  if (hash1.length !== hash2.length) {
    // throws a helpful error
    return phash.distance(hash1, hash2);
  }

  const isBinary = /^[01]*$/.test(hash1) && /^[01]*$/.test(hash2);
  const hashBase = base ?? (isBinary ? 2 : 64);

  if (hashBase < 2 || hashBase > 64) {
    throw new Error("base must be a number between 2 and 64");
  }

  return phash.distance(
    hashToBinary(hash1, hashBase),
    hashToBinary(hash2, hashBase),
  );
}
