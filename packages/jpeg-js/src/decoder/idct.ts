/*
 * Dequantization and inverse DCT of 8x8 blocks.
 *
 * Based on jidctint.c (jpeg_idct_islow) and the range limit table of
 * jdmaster.c, of the Independent JPEG Group's software, as found in
 * libjpeg-turbo (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1991-1998, Thomas G. Lane.
 *   Modification developed 2002-2018 by Guido Vollbeding.
 *   libjpeg-turbo Modifications:
 *   Copyright (C) 2015, 2020, 2022, D. R. Commander.
 *   For conditions of distribution and use, see README.ijg.
 *
 * This implements the Loeffler, Ligtenberg and Moschytz (LL&M) algorithm with
 * the same fixed-point constants and rounding as libjpeg's default "islow"
 * method, so its output is bit-identical.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript, for
 * 8x8 blocks only, with the sample precision as a parameter.
 */

const CONST_BITS = 13;

const FIX_0_298631336 = 2446;
const FIX_0_390180644 = 3196;
const FIX_0_541196100 = 4433;
const FIX_0_765366865 = 6270;
const FIX_0_899976223 = 7373;
const FIX_1_175875602 = 9633;
const FIX_1_501321110 = 12299;
const FIX_1_847759065 = 15137;
const FIX_1_961570560 = 16069;
const FIX_2_053119869 = 16819;
const FIX_2_562915447 = 20995;
const FIX_3_072711026 = 25172;

export type SampleArray = Uint8Array | Uint16Array;

export interface IdctContext {
  /** Precision of the first pass: 2 for 8-bit samples, 1 for 12-bit. */
  pass1Bits: number;
  /**
   * Maps a descaled IDCT output (masked with `rangeMask`) to a sample, with
   * the +CENTER level shift and clamping (libjpeg's IDCT_range_limit).
   */
  rangeLimit: SampleArray;
  rangeMask: number;
  workspace: Int32Array;
}

export function createIdctContext(precision: number): IdctContext {
  const max = (1 << precision) - 1;
  const center = 1 << (precision - 1);
  const size = 4 * (max + 1);
  const rangeLimit =
    precision <= 8 ? new Uint8Array(size) : new Uint16Array(size);

  // Like jdmaster.c's prepare_range_limit_table(), starting from its
  // post-IDCT entry point: values wrap around at 4 * (max + 1), so the table
  // is 0 for negative results and max for results that are too large.
  for (let i = 0; i < size; i++) {
    if (i < max + 1 - center) {
      rangeLimit[i] = i + center;
    } else if (i < 2 * (max + 1)) {
      rangeLimit[i] = max;
    } else if (i < size - center) {
      rangeLimit[i] = 0;
    } else {
      rangeLimit[i] = i - (size - center);
    }
  }

  return {
    pass1Bits: precision <= 8 ? 2 : 1,
    rangeLimit,
    rangeMask: size - 1,
    workspace: new Int32Array(64),
  };
}

/**
 * Dequantizes and inverse transforms the block of coefficients at
 * `coefficients[offset]` (in natural order) into 8x8 samples at
 * `output[outOffset]`, `outStride` samples apart per row.
 */
export function idctBlock(
  ctx: IdctContext,
  coefficients: Int16Array,
  offset: number,
  quantTable: Uint16Array,
  output: SampleArray,
  outOffset: number,
  outStride: number,
) {
  const ws = ctx.workspace;
  const rangeLimit = ctx.rangeLimit;
  const rangeMask = ctx.rangeMask;
  const pass1Bits = ctx.pass1Bits;
  const shift1 = CONST_BITS - pass1Bits;
  const round1 = 1 << (shift1 - 1);
  const shift2 = CONST_BITS + pass1Bits + 3;
  const round2 = 1 << (shift2 - 1);
  const dcShift = pass1Bits + 3;
  const dcRound = 1 << (dcShift - 1);

  let tmp0, tmp1, tmp2, tmp3, tmp10, tmp11, tmp12, tmp13;
  let z1, z2, z3, z4, z5;

  // Pass 1: process columns from input, store into work array
  for (let col = 0; col < 8; col++) {
    const i = offset + col;

    if (
      coefficients[i + 8] === 0 &&
      coefficients[i + 16] === 0 &&
      coefficients[i + 24] === 0 &&
      coefficients[i + 32] === 0 &&
      coefficients[i + 40] === 0 &&
      coefficients[i + 48] === 0 &&
      coefficients[i + 56] === 0
    ) {
      // AC terms all zero
      const dcval = (coefficients[i]! * quantTable[col]!) << pass1Bits;

      ws[col] = dcval;
      ws[col + 8] = dcval;
      ws[col + 16] = dcval;
      ws[col + 24] = dcval;
      ws[col + 32] = dcval;
      ws[col + 40] = dcval;
      ws[col + 48] = dcval;
      ws[col + 56] = dcval;
      continue;
    }

    // Even part
    z2 = coefficients[i + 16]! * quantTable[col + 16]!;
    z3 = coefficients[i + 48]! * quantTable[col + 48]!;

    z1 = (z2 + z3) * FIX_0_541196100;
    tmp2 = z1 - z3 * FIX_1_847759065;
    tmp3 = z1 + z2 * FIX_0_765366865;

    z2 = coefficients[i]! * quantTable[col]!;
    z3 = coefficients[i + 32]! * quantTable[col + 32]!;

    tmp0 = (z2 + z3) << CONST_BITS;
    tmp1 = (z2 - z3) << CONST_BITS;

    tmp10 = tmp0 + tmp3;
    tmp13 = tmp0 - tmp3;
    tmp11 = tmp1 + tmp2;
    tmp12 = tmp1 - tmp2;

    // Odd part
    tmp0 = coefficients[i + 56]! * quantTable[col + 56]!;
    tmp1 = coefficients[i + 40]! * quantTable[col + 40]!;
    tmp2 = coefficients[i + 24]! * quantTable[col + 24]!;
    tmp3 = coefficients[i + 8]! * quantTable[col + 8]!;

    z1 = tmp0 + tmp3;
    z2 = tmp1 + tmp2;
    z3 = tmp0 + tmp2;
    z4 = tmp1 + tmp3;
    z5 = (z3 + z4) * FIX_1_175875602;

    tmp0 *= FIX_0_298631336;
    tmp1 *= FIX_2_053119869;
    tmp2 *= FIX_3_072711026;
    tmp3 *= FIX_1_501321110;
    z1 *= -FIX_0_899976223;
    z2 *= -FIX_2_562915447;
    z3 = z3 * -FIX_1_961570560 + z5;
    z4 = z4 * -FIX_0_390180644 + z5;

    tmp0 += z1 + z3;
    tmp1 += z2 + z4;
    tmp2 += z2 + z3;
    tmp3 += z1 + z4;

    ws[col] = (tmp10 + tmp3 + round1) >> shift1;
    ws[col + 56] = (tmp10 - tmp3 + round1) >> shift1;
    ws[col + 8] = (tmp11 + tmp2 + round1) >> shift1;
    ws[col + 48] = (tmp11 - tmp2 + round1) >> shift1;
    ws[col + 16] = (tmp12 + tmp1 + round1) >> shift1;
    ws[col + 40] = (tmp12 - tmp1 + round1) >> shift1;
    ws[col + 24] = (tmp13 + tmp0 + round1) >> shift1;
    ws[col + 32] = (tmp13 - tmp0 + round1) >> shift1;
  }

  // Pass 2: process rows from work array, store into output array
  for (let row = 0; row < 64; row += 8) {
    const o = outOffset;

    outOffset += outStride;

    if (
      ws[row + 1] === 0 &&
      ws[row + 2] === 0 &&
      ws[row + 3] === 0 &&
      ws[row + 4] === 0 &&
      ws[row + 5] === 0 &&
      ws[row + 6] === 0 &&
      ws[row + 7] === 0
    ) {
      // AC terms all zero
      const dcval = rangeLimit[((ws[row]! + dcRound) >> dcShift) & rangeMask]!;

      output[o] = dcval;
      output[o + 1] = dcval;
      output[o + 2] = dcval;
      output[o + 3] = dcval;
      output[o + 4] = dcval;
      output[o + 5] = dcval;
      output[o + 6] = dcval;
      output[o + 7] = dcval;
      continue;
    }

    // Even part
    z2 = ws[row + 2]!;
    z3 = ws[row + 6]!;

    z1 = (z2 + z3) * FIX_0_541196100;
    tmp2 = z1 - z3 * FIX_1_847759065;
    tmp3 = z1 + z2 * FIX_0_765366865;

    tmp0 = (ws[row]! + ws[row + 4]!) << CONST_BITS;
    tmp1 = (ws[row]! - ws[row + 4]!) << CONST_BITS;

    tmp10 = tmp0 + tmp3;
    tmp13 = tmp0 - tmp3;
    tmp11 = tmp1 + tmp2;
    tmp12 = tmp1 - tmp2;

    // Odd part
    tmp0 = ws[row + 7]!;
    tmp1 = ws[row + 5]!;
    tmp2 = ws[row + 3]!;
    tmp3 = ws[row + 1]!;

    z1 = tmp0 + tmp3;
    z2 = tmp1 + tmp2;
    z3 = tmp0 + tmp2;
    z4 = tmp1 + tmp3;
    z5 = (z3 + z4) * FIX_1_175875602;

    tmp0 *= FIX_0_298631336;
    tmp1 *= FIX_2_053119869;
    tmp2 *= FIX_3_072711026;
    tmp3 *= FIX_1_501321110;
    z1 *= -FIX_0_899976223;
    z2 *= -FIX_2_562915447;
    z3 = z3 * -FIX_1_961570560 + z5;
    z4 = z4 * -FIX_0_390180644 + z5;

    tmp0 += z1 + z3;
    tmp1 += z2 + z4;
    tmp2 += z2 + z3;
    tmp3 += z1 + z4;

    output[o] = rangeLimit[((tmp10 + tmp3 + round2) >> shift2) & rangeMask]!;
    output[o + 7] =
      rangeLimit[((tmp10 - tmp3 + round2) >> shift2) & rangeMask]!;
    output[o + 1] =
      rangeLimit[((tmp11 + tmp2 + round2) >> shift2) & rangeMask]!;
    output[o + 6] =
      rangeLimit[((tmp11 - tmp2 + round2) >> shift2) & rangeMask]!;
    output[o + 2] =
      rangeLimit[((tmp12 + tmp1 + round2) >> shift2) & rangeMask]!;
    output[o + 5] =
      rangeLimit[((tmp12 - tmp1 + round2) >> shift2) & rangeMask]!;
    output[o + 3] =
      rangeLimit[((tmp13 + tmp0 + round2) >> shift2) & rangeMask]!;
    output[o + 4] =
      rangeLimit[((tmp13 - tmp0 + round2) >> shift2) & rangeMask]!;
  }
}
