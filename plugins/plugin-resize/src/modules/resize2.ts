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

/**
 * Read channel `i` of an RGBA buffer with RGB premultiplied by alpha, so the
 * colour of transparent pixels doesn't bleed into their neighbours. Opaque
 * pixels read back unchanged.
 */
function premultiplied(buf: any, i: number) {
  const k = i & 3;
  return k === 3 ? buf[i] : (buf[i] * buf[i - k + 3]) / 255;
}

/** Read channel `i` of an RGBA buffer as it is */
function straight(buf: any, i: number) {
  return buf[i];
}

/**
 * Read the `length` channels of `buf` from `start` into `row`, with RGB
 * premultiplied by alpha like `premultiplied`, or as they are
 */
function readRow(
  buf: any,
  start: number,
  length: number,
  premultiply: boolean,
  row: Float64Array,
) {
  if (!premultiply) {
    for (let i = 0; i < length; i++) {
      row[i] = buf[start + i];
    }

    return;
  }

  for (let i = 0; i < length; i += 4) {
    const a = buf[start + i + 3];

    row[i] = (buf[start + i] * a) / 255;
    row[i + 1] = (buf[start + i + 1] * a) / 255;
    row[i + 2] = (buf[start + i + 2] * a) / 255;
    row[i + 3] = a;
  }
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
interface Filter {
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
 * RGB is premultiplied by alpha, unless `premultiply` is false, and kept as
 * floats between the passes. An axis whose size doesn't change is copied as is.
 */
function convolve(src: any, dst: any, filter: Filter, premultiply: boolean) {
  const wSrc = src.width;
  const hSrc = src.height;

  const wDst = dst.width;
  const hDst = dst.height;

  const bufSrc = src.data;
  const bufDst = dst.data;

  // When alpha isn't premultiplied, RGB is weighted as if the image were
  // opaque. opaque1 holds the alpha each column of buf1 would have then, which
  // is the same for every row, to divide the colour by in the end
  const opaque1 = new Float32Array(wDst).fill(255);

  // ===========================================================
  // Pass 1 - resample rows
  // buf1 has width of dst and height of src, and holds premultiplied RGBA
  const buf1 = new Float32Array(wDst * hSrc * 4);

  if (wDst === wSrc) {
    const read = premultiply ? premultiplied : straight;

    for (let i = 0; i < buf1.length; i++) {
      buf1[i] = read(bufSrc, i);
    }
  } else {
    const { start, count, taps, weights } = filterWeights(wSrc, wDst, filter);

    for (let j = 0; j < wDst; j++) {
      let a = 0;

      for (let n = 0; n < count[j]!; n++) {
        a += weights[j * taps + n]! * 255;
      }

      opaque1[j] = a;
    }

    for (let i = 0; i < hSrc; i++) {
      for (let j = 0; j < wDst; j++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let srcPos = (i * wSrc + start[j]!) * 4;

        for (let n = 0; n < count[j]!; n++, srcPos += 4) {
          const weight = weights[j * taps + n]!;
          const alpha = bufSrc[srcPos + 3];
          const wa = weight * (premultiply ? alpha : 255);

          r += wa * bufSrc[srcPos];
          g += wa * bufSrc[srcPos + 1];
          b += wa * bufSrc[srcPos + 2];
          a += weight * alpha;
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
  const store = (
    pos: number,
    r: number,
    g: number,
    b: number,
    a: number,
    opaque: number,
  ) => {
    const alpha = Math.max(0, Math.min(255, Math.round(a)));

    bufDst[pos + 3] = alpha;

    // the colour is the alpha weighted average. Pixels with no alpha get
    // black, since they have no colour left. Straight colour is weighted as if
    // the image were opaque
    const f = premultiply ? (alpha ? 255 / a : 0) : 255 / opaque;
    bufDst[pos] = Math.max(0, Math.min(255, Math.round(r * f)));
    bufDst[pos + 1] = Math.max(0, Math.min(255, Math.round(g * f)));
    bufDst[pos + 2] = Math.max(0, Math.min(255, Math.round(b * f)));
  };

  if (hDst === hSrc) {
    for (let pos = 0; pos < buf1.length; pos += 4) {
      const opaque = opaque1[(pos / 4) % wDst]!;
      store(
        pos,
        buf1[pos]!,
        buf1[pos + 1]!,
        buf1[pos + 2]!,
        buf1[pos + 3]!,
        opaque,
      );
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
      let opaque = 0;
      let buf1Pos = start[i]! * stride + j * 4;

      for (let n = 0; n < count[i]!; n++, buf1Pos += stride) {
        const weight = weights[i * taps + n]!;

        r += weight * buf1[buf1Pos]!;
        g += weight * buf1[buf1Pos + 1]!;
        b += weight * buf1[buf1Pos + 2]!;
        a += weight * buf1[buf1Pos + 3]!;
        opaque += weight * opaque1[j]!;
      }

      store((i * wDst + j) * 4, r, g, b, a, opaque);
    }
  }
}

const lanczos3 = lanczos(3);
const lanczos2 = lanczos(2);

/**
 * Where each destination pixel lands between two source pixels along one axis,
 * as in `bilinearInterpolation`: the source pixels on either side, and the
 * distance to each. `min` and `max` are the same when it lands on a pixel.
 */
function bilinearAxis(srcSize: number, dstSize: number) {
  const min = new Int32Array(dstSize);
  const max = new Int32Array(dstSize);
  const toMin = new Float64Array(dstSize);
  const toMax = new Float64Array(dstSize);

  for (let i = 0; i < dstSize; i++) {
    const k = (i * srcSize) / dstSize;
    const kMin = Math.floor(k);
    const kMax = Math.min(Math.ceil(k), srcSize - 1);

    min[i] = kMin;
    max[i] = kMax;
    toMin[i] = k - kMin;
    toMax[i] = kMax - k;
  }

  return { min, max, toMin, toMax };
}

function cubic(x0: number, x1: number, x2: number, x3: number, t: number) {
  const a0 = x3 - x2 - x0 + x1;
  const a1 = x0 - x1 - a0;
  const a2 = x2 - x0;
  const a3 = x1;
  return Math.max(
    0,
    Math.min(255, a0 * (t * t * t) + a1 * (t * t) + a2 * t + a3),
  );
}

function hermite(x0: number, x1: number, x2: number, x3: number, t: number) {
  const c0 = x1;
  const c1 = 0.5 * (x2 - x0);
  const c2 = x0 - 2.5 * x1 + 2 * x2 - 0.5 * x3;
  const c3 = 0.5 * (x3 - x0) + 1.5 * (x1 - x2);
  return Math.max(
    0,
    Math.min(255, Math.round(((c3 * t + c2) * t + c1) * t + c0)),
  );
}

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
function bezier(x0: number, x1: number, x2: number, x3: number, t: number) {
  // x1, x2 are the knots, use x0 and x3 to calculate control points
  const cp1 = x1 + (x2 - x0) / 4;
  const cp2 = x2 - (x3 - x1) / 4;
  const nt = 1 - t;
  const c0 = x1 * nt * nt * nt;
  const c1 = 3 * cp1 * nt * nt * t;
  const c2 = 3 * cp2 * nt * t * t;
  const c3 = x2 * t * t * t;
  return Math.max(0, Math.min(255, Math.round(c0 + c1 + c2 + c3)));
}

type Kernel = "cubic" | "hermite" | "bezier";

/**
 * Interpolate between x1 and x2 at t with a kernel. Each kernel is called from
 * its own call site, so it can be inlined
 */
function interpolate(
  kernel: Kernel,
  x0: number,
  x1: number,
  x2: number,
  x3: number,
  t: number,
) {
  if (kernel === "cubic") {
    return cubic(x0, x1, x2, x3, t);
  }

  if (kernel === "hermite") {
    return hermite(x0, x1, x2, x3, t);
  }

  return bezier(x0, x1, x2, x3, t);
}

/**
 * Interpolate a row of RGBA, read by `readRow`, at each of `xPos` + `xT` into
 * `out` from `outPos`
 */
function interpolateRow(
  kernel: Kernel,
  row: Float64Array,
  wSrc: number,
  xPos: Int32Array,
  xT: Float64Array,
  out: Uint8Array,
  outPos: number,
) {
  // the cubic kernel doesn't round, and is truncated when stored
  const round = kernel !== "cubic";

  for (let j = 0; j < xPos.length; j++, outPos += 4) {
    const t = xT[j]!;
    const p = xPos[j]! * 4;

    // at t = 0 every kernel gives x1, so the pixel is copied
    if (t === 0) {
      for (let k = 0; k < 4; k++) {
        out[outPos + k] = round ? Math.round(row[p + k]!) : row[p + k]!;
      }

      continue;
    }

    // this interpolation requires 4 sample points and the two inner ones
    // must be real, the outer points can be fudged for the edges. t isn't 0,
    // so there is a next pixel
    for (let k = 0; k < 4; k++) {
      const x1 = row[p + k]!;
      const x2 = row[p + k + 4]!;
      const x0 = p > 0 ? row[p + k - 4]! : 2 * x1 - x2;
      const x3 = p < (wSrc - 2) * 4 ? row[p + k + 8]! : 2 * x2 - x1;
      out[outPos + k] = interpolate(kernel, x0, x1, x2, x3, t);
    }
  }
}

/**
 * Interpolate between the rows of `buf` at `pos1` and the next one at t, into
 * `out` from `outPos`. The rows before and after are fudged when their
 * position is -1, at the edges
 */
function interpolateColumns(
  kernel: Kernel,
  buf: Uint8Array,
  pos0: number,
  pos1: number,
  pos3: number,
  stride: number,
  t: number,
  out: Uint8Array,
  outPos: number,
) {
  const pos2 = pos1 + stride;

  for (let n = 0; n < stride; n++) {
    const y1 = buf[pos1 + n]!;
    const y2 = buf[pos2 + n]!;
    const y0 = pos0 >= 0 ? buf[pos0 + n]! : 2 * y1 - y2;
    const y3 = pos3 >= 0 ? buf[pos3 + n]! : 2 * y2 - y1;

    out[outPos + n] = interpolate(kernel, y0, y1, y2, y3, t);
  }
}

/**
 * Average a row of blocks of wM x hM pixels of `buf`, starting at `pos`, into
 * `out` from `outPos`. `sums` has room for the sums of a row of blocks
 */
function averageBlocks(
  buf: Uint8Array,
  pos: number,
  stride: number,
  wM: number,
  hM: number,
  premultiply: boolean,
  sums: Float64Array,
  out: any,
  outPos: number,
) {
  const m = wM * hM;

  sums.fill(0);

  for (let y = 0; y < hM; y++, pos += stride) {
    let xyPos = pos;

    for (let n = 0; n < sums.length; n += 4) {
      for (let x = 0; x < wM; x++, xyPos += 4) {
        sums[n]! += buf[xyPos]!;
        sums[n + 1]! += buf[xyPos + 1]!;
        sums[n + 2]! += buf[xyPos + 2]!;
        sums[n + 3]! += buf[xyPos + 3]!;
      }
    }
  }

  for (let n = 0; n < sums.length; n += 4, outPos += 4) {
    const r = sums[n]!;
    const g = sums[n + 1]!;
    const b = sums[n + 2]!;
    const a = sums[n + 3]!;

    if (premultiply) {
      // un-premultiply: the colour is the alpha weighted average
      out[outPos] = a ? Math.min(255, Math.round((r * 255) / a)) : 0;
      out[outPos + 1] = a ? Math.min(255, Math.round((g * 255) / a)) : 0;
      out[outPos + 2] = a ? Math.min(255, Math.round((b * 255) / a)) : 0;
    } else {
      out[outPos] = Math.round(r / m);
      out[outPos + 1] = Math.round(g / m);
      out[outPos + 2] = Math.round(b / m);
    }

    out[outPos + 3] = Math.round(a / m);
  }
}

/**
 * Resample with a 4 point kernel, rows first, then columns. When dst is
 * smaller than half of src, interpolate first to a multiple of dst between 0.5
 * and 1.0 src, then average blocks of that.
 */
function interpolate2D(
  src: any,
  dst: any,
  premultiply: boolean,
  kernel: Kernel,
) {
  const bufSrc = src.data;
  const bufDst = dst.data;

  const wSrc = src.width;
  const hSrc = src.height;

  const wDst = dst.width;
  const hDst = dst.height;

  const wM = Math.max(1, Math.floor(wSrc / wDst));
  const wDst2 = wDst * wM;
  const hM = Math.max(1, Math.floor(hSrc / hDst));
  const hDst2 = hDst * hM;

  // buf1 and buf2 hold RGB premultiplied by alpha, unless premultiply is
  // false, so transparent pixels don't darken the edges of what they surround

  // ===========================================================
  // Pass 1 - interpolate rows
  // buf1 has width of dst2 and height of src
  const buf1 = new Uint8Array(wDst2 * hSrc * 4);
  const row = new Float64Array(wSrc * 4);

  // x in src coords for each column, aligned like bilinearInterpolation, and
  // clamped to the last pixel, where t = 0 and the result is that pixel
  const xPos = new Int32Array(wDst2);
  const xT = new Float64Array(wDst2);

  for (let j = 0; j < wDst2; j++) {
    const x = Math.min((j * wSrc) / wDst2, wSrc - 1);
    xPos[j] = Math.floor(x);
    xT[j] = x - xPos[j]!;
  }

  for (let i = 0; i < hSrc; i++) {
    readRow(bufSrc, i * wSrc * 4, wSrc * 4, premultiply, row);
    interpolateRow(kernel, row, wSrc, xPos, xT, buf1, i * wDst2 * 4);
  }

  // ===========================================================
  // Pass 2 - interpolate columns
  // buf2 has width and height of dst2
  const stride = wDst2 * 4;
  const buf2 = Buffer.alloc(stride * hDst2);

  for (let i = 0; i < hDst2; i++) {
    // y in buf1 coords, aligned and clamped like x
    const y = Math.min((i * hSrc) / hDst2, hSrc - 1);
    const yPos = Math.floor(y);
    const t = y - yPos;
    const pos1 = yPos * stride;
    const buf2Pos = i * stride;

    // the rows of buf1 are whole numbers, so they come out as they are
    if (t === 0) {
      buf2.set(buf1.subarray(pos1, pos1 + stride), buf2Pos);
      continue;
    }

    interpolateColumns(
      kernel,
      buf1,
      yPos > 0 ? pos1 - stride : -1,
      pos1,
      yPos < hSrc - 2 ? pos1 + 2 * stride : -1,
      stride,
      t,
      buf2,
      buf2Pos,
    );
  }

  // ===========================================================
  // Pass 3 - scale to dst
  if (wM * hM === 1) {
    // replace dst buffer with buf2
    if (premultiply) {
      unpremultiply(buf2);
    }

    dst.data = buf2;
    return;
  }

  const sums = new Float64Array(wDst * 4);

  for (let i = 0; i < hDst; i++) {
    averageBlocks(
      buf2,
      i * hM * stride,
      stride,
      wM,
      hM,
      premultiply,
      sums,
      bufDst,
      i * wDst * 4,
    );
  }
}

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
        bufDst[posDst] = bufSrc[posSrc];
      }
    }
  },

  bilinearInterpolation(src: any, dst: any, premultiply = true) {
    const wSrc = src.width;

    const wDst = dst.width;
    const hDst = dst.height;

    const bufSrc = src.data;
    const bufDst = dst.data;

    const xs = bilinearAxis(wSrc, wDst);
    const ys = bilinearAxis(src.height, hDst);

    // interpolate row y of src to the width of dst, rounded, into out
    const row = new Float64Array(wSrc * 4);
    const interpolateRow = (y: number, out: Float64Array) => {
      readRow(bufSrc, y * wSrc * 4, wSrc * 4, premultiply, row);

      for (let j = 0; j < wDst; j++) {
        const posMin = xs.min[j]! * 4;
        const posMax = xs.max[j]! * 4;
        const toMin = xs.toMin[j]!;
        const toMax = xs.toMax[j]!;

        for (let k = 0; k < 4; k++) {
          out[j * 4 + k] =
            posMin === posMax
              ? Math.round(row[posMin + k]!)
              : Math.round(toMin * row[posMax + k]! + toMax * row[posMin + k]!);
        }
      }
    };

    // the interpolated rows above and below the current row of dst. Rows of
    // dst only move down, so each row of src is interpolated once
    let rowMin = new Float64Array(wDst * 4);
    let rowMax = new Float64Array(wDst * 4);
    let yRowMin = -1;
    let yRowMax = -1;

    for (let i = 0; i < hDst; i++) {
      const yMin = ys.min[i]!;
      const yMax = ys.max[i]!;

      if (yMin !== yRowMin) {
        if (yMin === yRowMax) {
          [rowMin, rowMax] = [rowMax, rowMin];
          [yRowMin, yRowMax] = [yRowMax, yRowMin];
        } else {
          interpolateRow(yMin, rowMin);
          yRowMin = yMin;
        }
      }

      const posDst = i * wDst * 4;

      // special case, y is integer
      if (yMin === yMax) {
        bufDst.set(rowMin, posDst);
        continue;
      }

      if (yMax !== yRowMax) {
        interpolateRow(yMax, rowMax);
        yRowMax = yMax;
      }

      const toMin = ys.toMin[i]!;
      const toMax = ys.toMax[i]!;

      for (let n = 0; n < wDst * 4; n++) {
        bufDst[posDst + n] = Math.round(
          toMin * rowMax[n]! + toMax * rowMin[n]!,
        );
      }
    }

    if (premultiply) {
      unpremultiply(bufDst);
    }
  },

  bicubicInterpolation(src: any, dst: any, premultiply = true) {
    interpolate2D(src, dst, premultiply, "cubic");
  },

  hermiteInterpolation(src: any, dst: any, premultiply = true) {
    interpolate2D(src, dst, premultiply, "hermite");
  },

  bezierInterpolation(src: any, dst: any, premultiply = true) {
    interpolate2D(src, dst, premultiply, "bezier");
  },

  lanczosInterpolation(src: any, dst: any, premultiply = true) {
    convolve(src, dst, lanczos3, premultiply);
  },

  lanczos2Interpolation(src: any, dst: any, premultiply = true) {
    convolve(src, dst, lanczos2, premultiply);
  },

  mitchellInterpolation(src: any, dst: any, premultiply = true) {
    convolve(src, dst, mitchell, premultiply);
  },
};
