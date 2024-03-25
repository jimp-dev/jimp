import { JimpClass } from "@jimp/types";
import anyBase from "any-base";

import ImagePHash from "./phash.js";

// an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths
// prettier-ignore
const alphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";

// an array storing the maximum string length of hashes at various bases
// 0 and 1 do not exist as possible hash lengths
const maxHashLength = [NaN, NaN];

for (let i = 2; i < 65; i++) {
  const maxHash = anyBase(
    anyBase.BIN,
    alphabet.slice(0, i)
  )(new Array(64 + 1).join("1"));
  maxHashLength.push(maxHash.length);
}

export default function hashPlugin() {
  return {
    /**
     * Calculates the perceptual hash
     * @returns the perceptual hash
     */
    pHash<I extends JimpClass>(image: I) {
      const pHash = new ImagePHash();
      return pHash.getHash(image);
    },

    /**
     * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>. And pads the string. Can configure base.
     * @param base  a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimal, 16 is hex, 64 is base 64). Defaults to 64.
     */
    hash<I extends JimpClass>(image: I, base = 64) {
      if (base < 2 || base > 64) {
        throw new Error("base must be a number between 2 and 64");
      }

      const subAlphabet = alphabet.slice(0, base);
      const pHash = this.pHash(image);
      const maxLength = maxHashLength[base]!;

      return anyBase(anyBase.BIN, subAlphabet)(pHash).padStart(maxLength, "0");
    },

    /**
     * Calculates the hamming distance of the current image and a hash based on their perceptual hash
     * @param compareHash hash to compare to
     * @returns  a number ranging from 0 to 1, 0 means they are believed to be identical
     */
    distanceFromHash<I extends JimpClass>(image: I, compareHash: string) {
      const pHash = new ImagePHash();
      const currentHash = pHash.getHash(image);

      return pHash.distance(currentHash, compareHash);
    },
  };
}
