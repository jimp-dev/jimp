/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2015 Guyon Roche
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:</p>
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import { Buffer } from "buffer";
import { ResizeStrategy } from "../constants.js";

/**
 * Read channel `i` of an RGBA buffer with RGB premultiplied by alpha, so the
 * colour of transparent pixels doesn't bleed into their neighbours. Opaque
 * pixels read back unchanged.
 */
function premultiplied(buf: any, i: number) {
  const k = i & 3;
  return k === 3 ? buf[i] : (buf[i] * buf[i - k + 3]) / 255;
}

/**
 * Turn a buffer of premultiplied RGBA back into straight RGBA, in place.
 * Pixels with no alpha get black, since they have no colour left.
 */
function unpremultiply(buf: any) {
  for (let i = 0; i < buf.length; i += 4) {
    const a = buf[i + 3];

    if (a === 255) {
      continue;
    }

    for (let k = 0; k < 3; k++) {
      buf[i + k] = a ? Math.min(255, Math.round((buf[i + k] * 255) / a)) : 0;
    }
  }
}

/**
 * A resampling filter for `convolve`: the kernel, and how many source pixels
 * it reaches on each side when the image isn't shrunk.
 */
export interface Filter {
  support: number;
  kernel: (x: number) => number;
}

function sinc(x: number) {
  if (x === 0) {
    return 1;
  }

  x *= Math.PI;
  return Math.sin(x) / x;
}

/** Lanczos: sinc windowed by a wider sinc, `a` pixels on each side */
function lanczos(a: number): Filter {
  return {
    support: a,
    kernel: (x) => (x > -a && x < a ? sinc(x) * sinc(x / a) : 0),
  };
}

/** Mitchell–Netravali cubic with B = C = 1/3 */
const mitchell: Filter = {
  support: 2,
  kernel(x) {
    const B = 1 / 3;
    const C = 1 / 3;
    x = Math.abs(x);

    if (x < 1) {
      return (
        ((12 - 9 * B - 6 * C) * x * x * x +
          (-18 + 12 * B + 6 * C) * x * x +
          (6 - 2 * B)) /
        6
      );
    }

    if (x < 2) {
      return (
        ((-B - 6 * C) * x * x * x +
          (6 * B + 30 * C) * x * x +
          (-12 * B - 48 * C) * x +
          (8 * B + 24 * C)) /
        6
      );
    }

    return 0;
  },
};

/**
 * Work out which source pixels, and with which weights, make up each
 * destination pixel along one axis. Pixel centres are aligned, as in Pillow
 * and ImageMagick. When shrinking, the filter is stretched by the scale factor
 * so every source pixel contributes and the result doesn't alias.
 */
function filterWeights(srcSize: number, dstSize: number, filter: Filter) {
  const scale = srcSize / dstSize;
  const filterScale = Math.max(scale, 1);
  const support = filter.support * filterScale;
  const taps = Math.ceil(support * 2) + 1;
  const start = new Int32Array(dstSize);
  const count = new Int32Array(dstSize);
  const weights = new Float64Array(dstSize * taps);

  for (let i = 0; i < dstSize; i++) {
    const center = (i + 0.5) * scale;
    const first = Math.max(0, Math.floor(center - support + 0.5));
    const last = Math.min(srcSize, Math.floor(center + support + 0.5));
    let sum = 0;

    for (let j = first; j < last; j++) {
      const weight = filter.kernel((j + 0.5 - center) / filterScale);
      weights[i * taps + j - first] = weight;
      sum += weight;
    }

    // the filter is cut off at the edges of the image, so normalise the
    // weights to keep the brightness the same
    if (sum !== 0) {
      for (let j = 0; j < last - first; j++) {
        weights[i * taps + j]! /= sum;
      }
    }

    start[i] = first;
    count[i] = last - first;
  }

  return { start, count, taps, weights };
}

/**
 * Resample with a separable convolution filter: rows first, then columns.
 * RGB is premultiplied by alpha and kept as floats between the passes. An axis
 * whose size doesn't change is copied as is.
 */
function convolve(src: any, dst: any, filter: Filter) {
  const wSrc = src.width;
  const hSrc = src.height;

  const wDst = dst.width;
  const hDst = dst.height;

  const bufSrc = src.data;
  const bufDst = dst.data;

  // ===========================================================
  // Pass 1 - resample rows
  // buf1 has width of dst and height of src, and holds premultiplied RGBA
  const buf1 = new Float32Array(wDst * hSrc * 4);

  if (wDst === wSrc) {
    for (let i = 0; i < buf1.length; i++) {
      buf1[i] = premultiplied(bufSrc, i);
    }
  } else {
    const { start, count, taps, weights } = filterWeights(wSrc, wDst, filter);

    for (let i = 0; i < hSrc; i++) {
      for (let j = 0; j < wDst; j++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let srcPos = (i * wSrc + start[j]!) * 4;

        for (let n = 0; n < count[j]!; n++, srcPos += 4) {
          const weight = weights[j * taps + n]!;
          const wa = weight * bufSrc[srcPos + 3];

          r += wa * bufSrc[srcPos];
          g += wa * bufSrc[srcPos + 1];
          b += wa * bufSrc[srcPos + 2];
          a += wa;
        }

        const buf1Pos = (i * wDst + j) * 4;
        buf1[buf1Pos] = r / 255;
        buf1[buf1Pos + 1] = g / 255;
        buf1[buf1Pos + 2] = b / 255;
        buf1[buf1Pos + 3] = a;
      }
    }
  }

  // ===========================================================
  // Pass 2 - resample columns, then un-premultiply, clamp and round into dst
  const store = (pos: number, r: number, g: number, b: number, a: number) => {
    const alpha = Math.max(0, Math.min(255, Math.round(a)));

    bufDst[pos + 3] = alpha;

    // the colour is the alpha weighted average. Pixels with no alpha get
    // black, since they have no colour left
    const f = alpha ? 255 / a : 0;
    bufDst[pos] = Math.max(0, Math.min(255, Math.round(r * f)));
    bufDst[pos + 1] = Math.max(0, Math.min(255, Math.round(g * f)));
    bufDst[pos + 2] = Math.max(0, Math.min(255, Math.round(b * f)));
  };

  if (hDst === hSrc) {
    for (let pos = 0; pos < buf1.length; pos += 4) {
      store(pos, buf1[pos]!, buf1[pos + 1]!, buf1[pos + 2]!, buf1[pos + 3]!);
    }

    return;
  }

  const { start, count, taps, weights } = filterWeights(hSrc, hDst, filter);
  const stride = wDst * 4;

  for (let i = 0; i < hDst; i++) {
    for (let j = 0; j < wDst; j++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let buf1Pos = start[i]! * stride + j * 4;

      for (let n = 0; n < count[i]!; n++, buf1Pos += stride) {
        const weight = weights[i * taps + n]!;

        r += weight * buf1[buf1Pos]!;
        g += weight * buf1[buf1Pos + 1]!;
        b += weight * buf1[buf1Pos + 2]!;
        a += weight * buf1[buf1Pos + 3]!;
      }

      store((i * wDst + j) * 4, r, g, b, a);
    }
  }
}

/** Keys cubic convolution with parameter `a` */
function keys(a: number): Filter {
  return {
    support: 2,
    kernel(x) {
      x = Math.abs(x);

      if (x < 1) {
        return ((a + 2) * x - (a + 3)) * x * x + 1;
      }

      if (x < 2) {
        return ((a * x - 5 * a) * x + 8 * a) * x - 4 * a;
      }

      return 0;
    },
  };
}

const triangle: Filter = {
  support: 1,
  kernel: (x) => Math.max(0, 1 - Math.abs(x)),
};

/**
 * The cubic Bézier through each pair of pixels used by `bezierInterpolation`,
 * written as a kernel. The control points are a quarter of the way along the
 * slope from the pixels on either side.
 */
const bezier: Filter = {
  support: 2,
  kernel(x) {
    x = Math.abs(x);

    if (x < 1) {
      const nx = 1 - x;
      return nx * (nx * nx + 3 * nx * x + 0.75 * x * x);
    }

    if (x < 2) {
      return -0.75 * (2 - x) * (2 - x) * (x - 1);
    }

    return 0;
  },
};

const lanczos3 = lanczos(3);
const lanczos2 = lanczos(2);

/**
 * The kernel each interpolating `ResizeStrategy` samples with, for resampling
 * at arbitrary positions (as `rotate` does). `bicubicInterpolation` and
 * `hermiteInterpolation` are the cubics their resize uses: Keys with
 * a = -1 and a = -0.5 (Catmull–Rom).
 */
export const kernels: Record<
  Exclude<ResizeStrategy, ResizeStrategy.NEAREST_NEIGHBOR>,
  Filter
> = {
  [ResizeStrategy.BILINEAR]: triangle,
  [ResizeStrategy.BICUBIC]: keys(-1),
  [ResizeStrategy.HERMITE]: keys(-0.5),
  [ResizeStrategy.BEZIER]: bezier,
  [ResizeStrategy.LANCZOS]: lanczos3,
  [ResizeStrategy.LANCZOS2]: lanczos2,
  [ResizeStrategy.MITCHELL]: mitchell,
};

export const operations = {
  nearestNeighbor(src: any, dst: any) {
    const wSrc = src.width;
    const hSrc = src.height;

    const wDst = dst.width;
    const hDst = dst.height;

    const bufSrc = src.data;
    const bufDst = dst.data;

    for (let i = 0; i < hDst; i++) {
      for (let j = 0; j < wDst; j++) {
        let posDst = (i * wDst + j) * 4;

        const iSrc = Math.floor((i * hSrc) / hDst);
        const jSrc = Math.floor((j * wSrc) / wDst);
        let posSrc = (iSrc * wSrc + jSrc) * 4;

        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
        bufDst[posDst++] = bufSrc[posSrc++];
      }
    }
  },

  bilinearInterpolation(src: any, dst: any) {
    const wSrc = src.width;
    const hSrc = src.height;

    const wDst = dst.width;
    const hDst = dst.height;

    const bufSrc = src.data;
    const bufDst = dst.data;

    const interpolate = function (
      k: number,
      kMin: number,
      vMin: number,
      kMax: number,
      vMax: number,
    ) {
      // special case - k is integer
      if (kMin === kMax) {
        return Math.round(vMin);
      }

      return Math.round((k - kMin) * vMax + (kMax - k) * vMin);
    };

    const assign = function (
      pos: number,
      offset: number,
      x: number,
      xMin: number,
      xMax: number,
      y: number,
      yMin: number,
      yMax: number,
    ) {
      let posMin = (yMin * wSrc + xMin) * 4 + offset;
      let posMax = (yMin * wSrc + xMax) * 4 + offset;
      const vMin = interpolate(
        x,
        xMin,
        premultiplied(bufSrc, posMin),
        xMax,
        premultiplied(bufSrc, posMax),
      );

      // special case, y is integer
      if (yMax === yMin) {
        bufDst[pos + offset] = vMin;
      } else {
        posMin = (yMax * wSrc + xMin) * 4 + offset;
        posMax = (yMax * wSrc + xMax) * 4 + offset;
        const vMax = interpolate(
          x,
          xMin,
          premultiplied(bufSrc, posMin),
          xMax,
          premultiplied(bufSrc, posMax),
        );

        bufDst[pos + offset] = interpolate(y, yMin, vMin, yMax, vMax);
      }
    };

    for (let i = 0; i < hDst; i++) {
      for (let j = 0; j < wDst; j++) {
        const posDst = (i * wDst + j) * 4;
        // x & y in src coordinates
        const x = (j * wSrc) / wDst;
        const xMin = Math.floor(x);
        const xMax = Math.min(Math.ceil(x), wSrc - 1);

        const y = (i * hSrc) / hDst;
        const yMin = Math.floor(y);
        const yMax = Math.min(Math.ceil(y), hSrc - 1);

        assign(posDst, 0, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 1, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 2, x, xMin, xMax, y, yMin, yMax);
        assign(posDst, 3, x, xMin, xMax, y, yMin, yMax);
      }
    }

    unpremultiply(bufDst);
  },

  _interpolate2D(src: any, dst: any, options?: any, interpolate?: any) {
    const bufSrc = src.data;
    const bufDst = dst.data;

    const wSrc = src.width;
    const hSrc = src.height;

    const wDst = dst.width;
    const hDst = dst.height;

    // when dst smaller than src/2, interpolate first to a multiple between 0.5 and 1.0 src, then sum squares
    const wM = Math.max(1, Math.floor(wSrc / wDst));
    const wDst2 = wDst * wM;
    const hM = Math.max(1, Math.floor(hSrc / hDst));
    const hDst2 = hDst * hM;

    // buf1 and buf2 hold RGB premultiplied by alpha, so transparent pixels
    // don't darken the edges of what they surround

    // ===========================================================
    // Pass 1 - interpolate rows
    // buf1 has width of dst2 and height of src
    const buf1 = Buffer.alloc(wDst2 * hSrc * 4);
    for (let i = 0; i < hSrc; i++) {
      for (let j = 0; j < wDst2; j++) {
        // i in src coords, j in dst coords

        // calculate x in src coords, aligned like bilinearInterpolation
        // this interpolation requires 4 sample points and the two inner ones must be real
        // the outer points can be fudged for the edges.
        // x is clamped to the last pixel, where t = 0 and the result is that pixel
        const x = Math.min((j * wSrc) / wDst2, wSrc - 1);
        const xPos = Math.floor(x);
        const t = x - xPos;
        const srcPos = (i * wSrc + xPos) * 4;
        // offset to the next pixel, 0 on the last column
        const next = xPos < wSrc - 1 ? 4 : 0;
        const buf1Pos = (i * wDst2 + j) * 4;

        for (let k = 0; k < 4; k++) {
          const kPos = srcPos + k;
          const x1 = premultiplied(bufSrc, kPos);
          const x2 = premultiplied(bufSrc, kPos + next);
          const x0 = xPos > 0 ? premultiplied(bufSrc, kPos - 4) : 2 * x1 - x2;
          const x3 =
            xPos < wSrc - 2 ? premultiplied(bufSrc, kPos + 8) : 2 * x2 - x1;
          buf1[buf1Pos + k] = interpolate(x0, x1, x2, x3, t);
        }
      }
    }
    // this._writeFile(wDst2, hSrc, buf1, "out/buf1.jpg");

    // ===========================================================
    // Pass 2 - interpolate columns
    // buf2 has width and height of dst2
    const buf2 = Buffer.alloc(wDst2 * hDst2 * 4);
    for (let i = 0; i < hDst2; i++) {
      for (let j = 0; j < wDst2; j++) {
        // i&j in dst2 coords

        // calculate y in buf1 coords, aligned like bilinearInterpolation
        // this interpolation requires 4 sample points and the two inner ones must be real
        // the outer points can be fudged for the edges.
        // y is clamped to the last row, where t = 0 and the result is that row
        const y = Math.min((i * hSrc) / hDst2, hSrc - 1);
        const yPos = Math.floor(y);
        const t = y - yPos;
        const buf1Pos = (yPos * wDst2 + j) * 4;
        // offset to the next row, 0 on the last row
        const next = yPos < hSrc - 1 ? wDst2 * 4 : 0;
        const buf2Pos = (i * wDst2 + j) * 4;
        for (let k = 0; k < 4; k++) {
          const kPos = buf1Pos + k;
          const y1 = buf1[kPos]!;
          const y2 = buf1[kPos + next]!;
          const y0 = yPos > 0 ? buf1[kPos - wDst2 * 4] : 2 * y1 - y2;
          const y3 = yPos < hSrc - 2 ? buf1[kPos + wDst2 * 8] : 2 * y2 - y1;

          buf2[buf2Pos + k] = interpolate(y0, y1, y2, y3, t);
        }
      }
    }
    // this._writeFile(wDst2, hDst2, buf2, "out/buf2.jpg");

    // ===========================================================
    // Pass 3 - scale to dst
    const m = wM * hM;
    if (m > 1) {
      for (let i = 0; i < hDst; i++) {
        for (let j = 0; j < wDst; j++) {
          // i&j in dst bounded coords
          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;

          for (let y = 0; y < hM; y++) {
            const yPos = i * hM + y;

            for (let x = 0; x < wM; x++) {
              const xPos = j * wM + x;
              const xyPos = (yPos * wDst2 + xPos) * 4;

              r += buf2[xyPos]!;
              g += buf2[xyPos + 1]!;
              b += buf2[xyPos + 2]!;
              a += buf2[xyPos + 3]!;
            }
          }

          // un-premultiply: the colour is the alpha weighted average
          const pos = (i * wDst + j) * 4;
          bufDst[pos] = a ? Math.min(255, Math.round((r * 255) / a)) : 0;
          bufDst[pos + 1] = a ? Math.min(255, Math.round((g * 255) / a)) : 0;
          bufDst[pos + 2] = a ? Math.min(255, Math.round((b * 255) / a)) : 0;
          bufDst[pos + 3] = Math.round(a / m);
        }
      }
    } else {
      // replace dst buffer with buf2
      unpremultiply(buf2);
      dst.data = buf2;
    }
  },

  bicubicInterpolation(src: any, dst: any, options?: any) {
    const interpolateCubic = function (
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      const a0 = x3 - x2 - x0 + x1;
      const a1 = x0 - x1 - a0;
      const a2 = x2 - x0;
      const a3 = x1;
      return Math.max(
        0,
        Math.min(255, a0 * (t * t * t) + a1 * (t * t) + a2 * t + a3),
      );
    };

    return this._interpolate2D(src, dst, options, interpolateCubic);
  },

  hermiteInterpolation(src: any, dst: any, options?: any) {
    const interpolateHermite = function (
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      const c0 = x1;
      const c1 = 0.5 * (x2 - x0);
      const c2 = x0 - 2.5 * x1 + 2 * x2 - 0.5 * x3;
      const c3 = 0.5 * (x3 - x0) + 1.5 * (x1 - x2);
      return Math.max(
        0,
        Math.min(255, Math.round(((c3 * t + c2) * t + c1) * t + c0)),
      );
    };

    return this._interpolate2D(src, dst, options, interpolateHermite);
  },

  bezierInterpolation(src: any, dst: any, options?: any) {
    // between 2 points y(n), y(n+1), use next points out, y(n-1), y(n+2)
    // to predict control points (a & b) to be placed at n+0.5
    //  ya(n) = y(n) + (y(n+1)-y(n-1))/4
    //  yb(n) = y(n+1) - (y(n+2)-y(n))/4
    // then use std bezier to interpolate [n,n+1)
    //  y(n+t) = y(n)*(1-t)^3 + 3 * ya(n)*(1-t)^2*t + 3 * yb(n)*(1-t)*t^2 + y(n+1)*t^3
    //  note the 3* factor for the two control points
    // for edge cases, can choose:
    //  y(-1) = y(0) - 2*(y(1)-y(0))
    //  y(w) = y(w-1) + 2*(y(w-1)-y(w-2))
    // but can go with y(-1) = y(0) and y(w) = y(w-1)
    const interpolateBezier = function (
      x0: number,
      x1: number,
      x2: number,
      x3: number,
      t: number,
    ) {
      // x1, x2 are the knots, use x0 and x3 to calculate control points
      const cp1 = x1 + (x2 - x0) / 4;
      const cp2 = x2 - (x3 - x1) / 4;
      const nt = 1 - t;
      const c0 = x1 * nt * nt * nt;
      const c1 = 3 * cp1 * nt * nt * t;
      const c2 = 3 * cp2 * nt * t * t;
      const c3 = x2 * t * t * t;
      return Math.max(0, Math.min(255, Math.round(c0 + c1 + c2 + c3)));
    };

    return this._interpolate2D(src, dst, options, interpolateBezier);
  },

  lanczosInterpolation(src: any, dst: any) {
    convolve(src, dst, lanczos3);
  },

  lanczos2Interpolation(src: any, dst: any) {
    convolve(src, dst, lanczos2);
  },

  mitchellInterpolation(src: any, dst: any) {
    convolve(src, dst, mitchell);
  },
};
