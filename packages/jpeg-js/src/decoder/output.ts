/*
 * Upsampling and colour conversion of decoded component planes to RGB(A).
 *
 * Based on jdsample.c, jdcolor.c and jdmainct.c of the Independent JPEG
 * Group's software, as found in libjpeg-turbo
 * (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1991-1996, Thomas G. Lane.
 *   Modified 2002-2011 by Guido Vollbeding.
 *   libjpeg-turbo Modifications:
 *   Copyright 2009 Pierre Ossman <ossman@cendio.se> for Cendio AB
 *   Copyright (C) 2009, 2011-2012, 2014-2016, 2020, 2022, D. R. Commander.
 *   Copyright (C) 2013, Linaro Limited.
 *   For conditions of distribution and use, see README.ijg.
 *
 * The "fancy" (triangle filter) upsampling, the edge handling and the
 * fixed-point YCbCr to RGB conversion are libjpeg's defaults, so the output is
 * bit-identical to libjpeg-turbo's. CMYK is converted to RGB like
 * libjpeg-turbo's djpeg does (cmyk.h, Copyright (C) 2017-2018, D. R.
 * Commander).
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript. Rows
 * are upsampled one output row at a time from whole component planes, which
 * replaces jdmainct.c's context row buffering. Sampling ratios libjpeg
 * rejects (non-integral ones) fall back to nearest-neighbour upsampling.
 */

import type { SampleArray } from "./idct.js";

export type ColorSpace = "grayscale" | "ycbcr" | "rgb" | "cmyk" | "ycck";

export interface OutputComponent {
  plane: SampleArray;
  stride: number;
  /** Width and height of the component's real samples (downsampled size). */
  width: number;
  height: number;
  h: number;
  v: number;
}

const enum Method {
  Full,
  H2V1Fancy,
  H1V2Fancy,
  H2V2Fancy,
  Integral,
  Nearest,
}

interface RowSource {
  component: OutputComponent;
  method: Method;
  hExpand: number;
  vExpand: number;
  maxH: number;
  maxV: number;
  buffer: SampleArray;
  /** Where the current row starts: `buffer` or the plane itself. */
  array: SampleArray;
  offset: number;
}

function createRowSource(
  component: OutputComponent,
  maxH: number,
  maxV: number,
  outputWidth: number,
): RowSource {
  const { h, v, width } = component;
  let method: Method;

  if (h === maxH && v === maxV) {
    method = Method.Full;
  } else if (h * 2 === maxH && v === maxV && width > 2) {
    method = Method.H2V1Fancy;
  } else if (h === maxH && v * 2 === maxV) {
    method = Method.H1V2Fancy;
  } else if (h * 2 === maxH && v * 2 === maxV && width > 2) {
    method = Method.H2V2Fancy;
  } else if (maxH % h === 0 && maxV % v === 0) {
    method = Method.Integral;
  } else {
    method = Method.Nearest;
  }

  // Fancy upsampling writes 2 samples per input sample
  const size = Math.max(outputWidth, width * 2) + 8;

  return {
    component,
    method,
    hExpand: maxH / h,
    vExpand: maxV / v,
    maxH,
    maxV,
    buffer:
      component.plane instanceof Uint8Array
        ? new Uint8Array(size)
        : new Uint16Array(size),
    array: component.plane,
    offset: 0,
  };
}

/** Points the source at output row `y`, upsampling it if needed. */
function prepareRow(source: RowSource, y: number, outputWidth: number) {
  const { component, buffer: out } = source;
  const { plane, stride, width, height } = component;

  switch (source.method) {
    case Method.Full: {
      source.array = plane;
      source.offset = y * stride;
      return;
    }

    case Method.H2V1Fancy: {
      // 3/4 * nearer sample + 1/4 * further sample
      let i = y * stride;
      let o = 0;
      let value = plane[i++]!;

      out[o++] = value;
      out[o++] = (value * 3 + plane[i]! + 2) >> 2;

      for (let n = width - 2; n > 0; n--) {
        value = plane[i++]! * 3;
        out[o++] = (value + plane[i - 2]! + 1) >> 2;
        out[o++] = (value + plane[i]! + 2) >> 2;
      }

      value = plane[i]!;
      out[o++] = (value * 3 + plane[i - 1]! + 1) >> 2;
      out[o] = value;
      break;
    }

    case Method.H1V2Fancy: {
      const row = y >> 1;
      const below = y & 1;
      const far = Math.min(Math.max(below ? row + 1 : row - 1, 0), height - 1);
      const bias = below ? 2 : 1;
      const i0 = row * stride;
      const i1 = far * stride;

      for (let x = 0; x < width; x++) {
        out[x] = (plane[i0 + x]! * 3 + plane[i1 + x]! + bias) >> 2;
      }

      break;
    }

    case Method.H2V2Fancy: {
      // 9/16, 3/16, 3/16, 1/16 of the 4 nearest samples
      const row = y >> 1;
      const below = y & 1;
      const far = Math.min(Math.max(below ? row + 1 : row - 1, 0), height - 1);
      let i0 = row * stride;
      let i1 = far * stride;
      let o = 0;
      let thisSum = plane[i0++]! * 3 + plane[i1++]!;
      let nextSum = plane[i0++]! * 3 + plane[i1++]!;
      let lastSum;

      out[o++] = (thisSum * 4 + 8) >> 4;
      out[o++] = (thisSum * 3 + nextSum + 7) >> 4;
      lastSum = thisSum;
      thisSum = nextSum;

      for (let n = width - 2; n > 0; n--) {
        nextSum = plane[i0++]! * 3 + plane[i1++]!;
        out[o++] = (thisSum * 3 + lastSum + 8) >> 4;
        out[o++] = (thisSum * 3 + nextSum + 7) >> 4;
        lastSum = thisSum;
        thisSum = nextSum;
      }

      out[o++] = (thisSum * 3 + lastSum + 8) >> 4;
      out[o] = (thisSum * 4 + 7) >> 4;
      break;
    }

    case Method.Integral: {
      // Replicate each sample hExpand times; rows were picked by y / vExpand
      const hExpand = source.hExpand;
      const i = Math.floor(y / source.vExpand) * stride;

      for (let x = 0, o = 0; o < outputWidth; x++) {
        const value = plane[i + x]!;

        for (let n = 0; n < hExpand; n++) {
          out[o++] = value;
        }
      }

      break;
    }

    case Method.Nearest: {
      const { h, v } = component;
      const row = Math.min(Math.floor((y * v) / source.maxV), height - 1);
      const i = row * stride;

      for (let x = 0; x < outputWidth; x++) {
        out[x] =
          plane[i + Math.min(Math.floor((x * h) / source.maxH), width - 1)]!;
      }

      break;
    }
  }

  source.array = out;
  source.offset = 0;
}

/** Fixed-point YCbCr to RGB tables, like jdcolor.c's build_ycc_rgb_table(). */
function buildYccTables(precision: number) {
  const max = (1 << precision) - 1;
  const center = 1 << (precision - 1);
  const crR = new Int32Array(max + 1);
  const cbB = new Int32Array(max + 1);
  const crG = new Int32Array(max + 1);
  const cbG = new Int32Array(max + 1);
  const fix = (value: number) => Math.floor(value * 65536 + 0.5);
  const half = 1 << 15;

  for (let i = 0, x = -center; i <= max; i++, x++) {
    crR[i] = (fix(1.402) * x + half) >> 16;
    cbB[i] = (fix(1.772) * x + half) >> 16;
    crG[i] = -fix(0.71414) * x;
    cbG[i] = -fix(0.34414) * x + half;
  }

  return { crR, cbB, crG, cbG };
}

/**
 * Clamps a sample value at `index - offset` to the sample range, then scales
 * it to 8 bits.
 */
function buildClampTable(precision: number, to8: Uint8Array | null) {
  const max = (1 << precision) - 1;
  const offset = max + 1;
  const table =
    precision <= 8 || to8
      ? new Uint8Array(3 * offset)
      : new Uint16Array(3 * offset);

  for (let i = 0; i < table.length; i++) {
    const value = Math.min(Math.max(i - offset, 0), max);

    table[i] = to8 ? to8[value]! : value;
  }

  return { table, offset };
}

/** Rounds a sample of `precision` bits to 8 bits. */
function buildTo8Table(precision: number) {
  const max = (1 << precision) - 1;
  const table = new Uint8Array(max + 1);

  for (let i = 0; i <= max; i++) {
    table[i] = Math.floor((i * 255 * 2 + max) / (max * 2));
  }

  return table;
}

/**
 * Upsamples the component planes and converts them to 8-bit RGBA (`channels`
 * 4) or RGB (`channels` 3), writing into `output`.
 */
export function convertToRgb(
  components: OutputComponent[],
  colorSpace: ColorSpace,
  width: number,
  height: number,
  precision: number,
  channels: 3 | 4,
  output: Uint8Array,
) {
  let maxH = 1;
  let maxV = 1;

  for (const component of components) {
    maxH = Math.max(maxH, component.h);
    maxV = Math.max(maxV, component.v);
  }

  const sources = components.map((component) =>
    createRowSource(component, maxH, maxV, width),
  );
  const to8 = precision > 8 ? buildTo8Table(precision) : null;
  const max = (1 << precision) - 1;
  const alpha = channels === 4;
  let o = 0;

  if (colorSpace === "grayscale") {
    const source = sources[0]!;

    for (let y = 0; y < height; y++) {
      prepareRow(source, y, width);

      const array = source.array;
      const offset = source.offset;

      for (let x = 0; x < width; x++) {
        let value = array[offset + x]!;

        if (to8) {
          value = to8[value]!;
        }

        output[o++] = value;
        output[o++] = value;
        output[o++] = value;

        if (alpha) {
          output[o++] = 255;
        }
      }
    }

    return;
  }

  const [s0, s1, s2] = sources as [RowSource, RowSource, RowSource];
  const s3 = sources[3];

  if (colorSpace === "ycbcr") {
    const { crR, cbB, crG, cbG } = buildYccTables(precision);
    const { table: clamp, offset: base } = buildClampTable(precision, to8);

    for (let y = 0; y < height; y++) {
      prepareRow(s0, y, width);
      prepareRow(s1, y, width);
      prepareRow(s2, y, width);

      const a0 = s0.array;
      const a1 = s1.array;
      const a2 = s2.array;
      let i0 = s0.offset;
      let i1 = s1.offset;
      let i2 = s2.offset;

      for (let x = 0; x < width; x++) {
        const luma = a0[i0++]! + base;
        const cb = a1[i1++]!;
        const cr = a2[i2++]!;

        output[o++] = clamp[luma + crR[cr]!]!;
        output[o++] = clamp[luma + ((cbG[cb]! + crG[cr]!) >> 16)]!;
        output[o++] = clamp[luma + cbB[cb]!]!;

        if (alpha) {
          output[o++] = 255;
        }
      }
    }

    return;
  }

  if (colorSpace === "rgb") {
    for (let y = 0; y < height; y++) {
      prepareRow(s0, y, width);
      prepareRow(s1, y, width);
      prepareRow(s2, y, width);

      const a0 = s0.array;
      const a1 = s1.array;
      const a2 = s2.array;
      let i0 = s0.offset;
      let i1 = s1.offset;
      let i2 = s2.offset;

      for (let x = 0; x < width; x++) {
        if (to8) {
          output[o++] = to8[a0[i0++]!]!;
          output[o++] = to8[a1[i1++]!]!;
          output[o++] = to8[a2[i2++]!]!;
        } else {
          output[o++] = a0[i0++]!;
          output[o++] = a1[i1++]!;
          output[o++] = a2[i2++]!;
        }

        if (alpha) {
          output[o++] = 255;
        }
      }
    }

    return;
  }

  // CMYK or YCCK. Adobe applications write CMYK JPEGs inverted, so like
  // djpeg, R = C * K / max with the stored (inverted) values.
  const ycck = colorSpace === "ycck";
  const { crR, cbB, crG, cbG } = buildYccTables(precision);
  const { table: clamp, offset: base } = buildClampTable(precision, null);
  const twiceMax = 2 * max;

  for (let y = 0; y < height; y++) {
    prepareRow(s0, y, width);
    prepareRow(s1, y, width);
    prepareRow(s2, y, width);
    prepareRow(s3!, y, width);

    const a0 = s0.array;
    const a1 = s1.array;
    const a2 = s2.array;
    const a3 = s3!.array;
    let i0 = s0.offset;
    let i1 = s1.offset;
    let i2 = s2.offset;
    let i3 = s3!.offset;

    for (let x = 0; x < width; x++) {
      let c = a0[i0++]!;
      let m = a1[i1++]!;
      let ye = a2[i2++]!;
      const k = a3[i3++]!;

      if (ycck) {
        const luma = c;
        const cb = m;
        const cr = ye;

        c = clamp[base + max - (luma + crR[cr]!)]!;
        m = clamp[base + max - (luma + ((cbG[cb]! + crG[cr]!) >> 16))]!;
        ye = clamp[base + max - (luma + cbB[cb]!)]!;
      }

      let r = Math.floor((c * k * 2 + max) / twiceMax);
      let g = Math.floor((m * k * 2 + max) / twiceMax);
      let b = Math.floor((ye * k * 2 + max) / twiceMax);

      if (to8) {
        r = to8[r]!;
        g = to8[g]!;
        b = to8[b]!;
      }

      output[o++] = r;
      output[o++] = g;
      output[o++] = b;

      if (alpha) {
        output[o++] = 255;
      }
    }
  }
}
