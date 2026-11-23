/*
Copyright (c) 2011 Elliot Shepherd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { methods } from "@jimp/plugin-resize";
import { JimpClass } from "@jimp/types";
import { clone } from "@jimp/utils";

// https://code.google.com/p/ironchef-team21/source/browse/ironchef_team21/src/ImagePHash.java

/*
 * pHash-like image hash.
 * Author: Elliot Shepherd (elliot@jarofworms.com
 * Based On: http://www.hackerfactor.com/blog/index.php?/archives/432-Looks-Like-It.html
 */

/** Default width and height the image is scaled to before the DCT. */
export const DEFAULT_SIZE = 32;
/** Default width and height of the low-frequency DCT block the hash is made from. */
export const DEFAULT_SMALLER_SIZE = 8;

class ImagePHash {
  size: number;
  smallerSize: number;

  constructor(size?: number, smallerSize?: number) {
    this.size = size || DEFAULT_SIZE;
    this.smallerSize = smallerSize || DEFAULT_SMALLER_SIZE;
  }

  distance(s1: string, s2: string) {
    if (s1.length !== s2.length) {
      throw new Error(
        `Can't compare hashes of different lengths (${s1.length} and ${s2.length}). ` +
          "Both hashes must be made with the same size and smallerSize options " +
          "(and, for hash(), the same base).",
      );
    }

    let counter = 0;

    for (let k = 0; k < s1.length; k++) {
      if (s1[k] !== s2[k]) {
        counter++;
      }
    }

    return counter / s1.length;
  }

  /**
   * Returns a 'binary string' (like. 001010111011100010) which is easy to do a hamming distance on.
   */
  getHash(img: JimpClass) {
    /* 0. Flatten transparency.
     * Composite the image onto opaque mid-grey so alpha is handled the same
     * way for every image, rather than only incidentally by the resize below
     * (which turns fully transparent pixels black, ignores partial alpha, and
     * is skipped for images that are already the right size). Grey rather
     * than white or black keeps both light and dark shapes on a transparent
     * background visible. Opaque pixels are left untouched.
     */
    img = flatten(clone(img), FLATTEN_BACKGROUND);

    /* 1. Reduce size.
     * Like Average Hash, pHash starts with a small image.
     * However, the image is larger than 8x8; 32x32 is a good size.
     * This is really done to simplify the DCT computation and not
     * because it is needed to reduce the high frequencies.
     */
    img = methods.resize(img, { w: this.size, h: this.size });

    /* 2. Reduce color.
     * The image is reduced to a grayscale just to further simplify
     * the number of computations.
     */
    const vals = [];

    for (let x = 0; x < img.bitmap.width; x++) {
      const row = [];
      for (let y = 0; y < img.bitmap.height; y++) {
        row[y] = legacyGrey(img, x, y);
      }
      vals[x] = row;
    }

    /* 3. Compute the DCT.
     * The DCT separates the image into a collection of frequencies
     * and scalars. While JPEG uses an 8x8 DCT, this algorithm uses
     * a 32x32 DCT.
     */
    /* 4. Reduce the DCT.
     * This is the magic step. While the DCT is 32x32, just keep the
     * top-left 8x8. Those represent the lowest frequencies in the
     * picture. Only those coefficients are computed.
     */
    const dctVals = applyDCT(vals, this.size, this.smallerSize);

    /* 5. Compute the average value.
     * Like the Average Hash, compute the mean DCT value (using only
     * the 8x8 DCT low-frequency values and excluding the first term
     * since the DC coefficient can be significantly different from
     * the other values and will throw off the average).
     */
    let total = 0;

    for (let x = 0; x < this.smallerSize; x++) {
      for (let y = 0; y < this.smallerSize; y++) {
        if (x === 0 && y === 0) {
          continue;
        }

        total += dctVals[x]![y]!;
      }
    }

    const avg = total / (this.smallerSize * this.smallerSize - 1);

    /* 6. Further reduce the DCT.
     * This is the magic step. Set the 64 hash bits to 0 or 1
     * depending on whether each of the 64 DCT values is above or
     * below the average value. The result doesn't tell us the
     * actual low frequencies; it just tells us the very-rough
     * relative scale of the frequencies to the mean. The result
     * will not vary as long as the overall structure of the image
     * remains the same; this can survive gamma and color histogram
     * adjustments without a problem.
     */
    let hash = "";

    for (let x = 0; x < this.smallerSize; x++) {
      for (let y = 0; y < this.smallerSize; y++) {
        hash += dctVals[x]![y]! > avg ? "1" : "0";
      }
    }

    return hash;
  }
}

// DCT function stolen from http://stackoverflow.com/questions/4240490/problems-with-dct-and-idct-algorithm-in-java

/**
 The Rec. 709 luminance of a pixel, truncated like `greyscale()` did before
 it rounded. Kept so the hashes users have stored don't change.
 */
function legacyGrey(img: JimpClass, x: number, y: number) {
  const { data } = img.bitmap;
  const idx = img.getPixelIndex(x, y);

  return Math.floor(
    0.2126 * data[idx]! + 0.7152 * data[idx + 1]! + 0.0722 * data[idx + 2]!,
  );
}

/** Grey level transparent pixels are composited onto before hashing. */
const FLATTEN_BACKGROUND = 128;

/**
 Composite an image onto an opaque grey background in place.
 */
function flatten<I extends JimpClass>(img: I, background: number) {
  const data = img.bitmap.data;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]!;

    if (a === 255) {
      continue;
    }

    const alpha = a / 255;

    data[i] = Math.round(background + (data[i]! - background) * alpha);
    data[i + 1] = Math.round(background + (data[i + 1]! - background) * alpha);
    data[i + 2] = Math.round(background + (data[i + 2]! - background) * alpha);
    data[i + 3] = 255;
  }

  return img;
}

function c(u: number) {
  return u === 0 ? 1 / Math.sqrt(2.0) : 1;
}

/**
 * Computes the top-left `count` x `count` coefficients of the 2D DCT-II of
 * a `size` x `size` matrix.
 */
function applyDCT(f: number[][], size: number, count: number) {
  const N = size;
  const F: number[][] = [];

  // cosines[u][i] is the DCT basis function for frequency u at sample i.
  const cosines: number[][] = [];

  for (let u = 0; u < count; u++) {
    const row = [];
    for (let i = 0; i < N; i++) {
      row[i] = Math.cos(((2 * i + 1) / (2.0 * N)) * u * Math.PI);
    }
    cosines[u] = row;
  }

  for (let u = 0; u < count; u++) {
    const row = [];
    for (let v = 0; v < count; v++) {
      let sum = 0;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          sum += cosines[u]![i]! * cosines[v]![j]! * f[i]![j]!;
        }
      }

      // 2 / N is the orthonormal scale. Scaling every coefficient by the
      // same positive factor doesn't change the hash, which only compares
      // coefficients with their mean.
      sum *= (2 / N) * c(u) * c(v);
      row[v] = sum;
    }
    F[u] = row;
  }

  return F;
}

export default ImagePHash;
