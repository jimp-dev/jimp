/*
 * Block smoothing of progressive JPEGs whose low-frequency AC coefficients
 * aren't fully known, e.g. because the file was cut off after a few scans.
 * Estimates the missing coefficients from the DC values of the neighbouring
 * blocks, so the image looks smooth instead of blocky.
 *
 * Based on jdcoefct.c (smoothing_ok and decompress_smooth_data) of the
 * Independent JPEG Group's software, as found in libjpeg-turbo
 * (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1994-1997, Thomas G. Lane.
 *   libjpeg-turbo Modifications:
 *   Copyright 2009 Pierre Ossman <ossman@cendio.se> for Cendio AB
 *   Copyright (C) 2010, 2015-2016, 2019-2020, 2022-2024, D. R. Commander.
 *   Copyright (C) 2015, 2020, Google, Inc.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript for
 * a whole image at once, instead of one iMCU row at a time.
 */

import { idctBlock, type IdctContext, type SampleArray } from "./idct.js";

/** Coefficients 0..9 (in zig-zag order) take part in smoothing. */
const SAVED_COEFS = 10;

/** Natural-order positions of the coefficients that are estimated. */
const Q01 = 1;
const Q10 = 8;
const Q20 = 16;
const Q11 = 9;
const Q02 = 2;
const Q03 = 3;
const Q12 = 10;
const Q21 = 17;
const Q30 = 24;

export interface SmoothingComponent {
  v: number;
  blocksPerLine: number;
  blocksPerColumn: number;
  blocksPerLineMcu: number;
  coefficients: Int16Array;
  quantTable: Uint16Array;
  /**
   * For each coefficient (zig-zag order), the successive approximation bit
   * position of the last scan that covered it, or -1 if none did. 0 means
   * fully known.
   */
  coefBits: Int8Array;
  /** `coefBits` before the component's last scan. */
  previousCoefBits: Int8Array;
}

/** Like libjpeg's smoothing_ok(): whether smoothing would change anything. */
export function smoothingUseful(components: SmoothingComponent[]) {
  let useful = false;

  for (const { quantTable: q, coefBits } of components) {
    if (
      !q[0] ||
      !q[Q01] ||
      !q[Q10] ||
      !q[Q20] ||
      !q[Q11] ||
      !q[Q02] ||
      !q[Q03] ||
      !q[Q12] ||
      !q[Q21] ||
      !q[Q30]
    ) {
      return false;
    }

    if (coefBits[0]! < 0) {
      return false;
    }

    for (let i = 1; i < SAVED_COEFS; i++) {
      if (coefBits[i] !== 0) {
        useful = true;
      }
    }
  }

  return useful;
}

/** Rounded estimate of a coefficient, limited to what later scans could add. */
function estimate(num: number, quant: number, al: number) {
  let pred = Math.trunc(((quant << 7) + Math.abs(num)) / (quant << 8));

  if (al > 0 && pred >= 1 << al) {
    pred = (1 << al) - 1;
  }

  return num >= 0 ? pred : -pred;
}

/**
 * Smooths and inverse transforms a component, writing its samples into
 * `plane`.
 * @param scans the number of scans read
 * @param lastGoodRow the last row of MCUs that had data in the last scan
 * @param mcuRows the number of MCU rows of the frame
 */
export function smoothAndTransform(
  idct: IdctContext,
  component: SmoothingComponent,
  plane: SampleArray,
  scans: number,
  lastGoodRow: number,
  mcuRows: number,
) {
  const {
    v,
    blocksPerLine,
    blocksPerColumn,
    blocksPerLineMcu,
    coefficients,
    quantTable: q,
  } = component;
  const stride = blocksPerLine * 8;
  const workspace = new Int16Array(64);
  const lastColumn = blocksPerLine - 1;

  const latch = Int8Array.from(component.coefBits.subarray(0, SAVED_COEFS));
  const previousLatch = new Int8Array(SAVED_COEFS);

  for (let i = 1; i < SAVED_COEFS; i++) {
    previousLatch[i] = scans > 1 ? component.previousCoefBits[i]! : -1;
  }

  const q00 = q[0]!;
  const q01 = q[Q01]!;
  const q10 = q[Q10]!;
  const q20 = q[Q20]!;
  const q11 = q[Q11]!;
  const q02 = q[Q02]!;
  const q03 = q[Q03]!;
  const q12 = q[Q12]!;
  const q21 = q[Q21]!;
  const q30 = q[Q30]!;

  /** DC coefficient of the block at a row and column. */
  const dc = (row: number, col: number) =>
    coefficients[(row * blocksPerLineMcu + col) * 64]!;

  for (let mcuRow = 0; mcuRow < mcuRows; mcuRow++) {
    // Block rows in this row of MCUs: all of them except in the last one
    let blockRows = v;

    if (mcuRow === mcuRows - 1) {
      blockRows = blocksPerColumn % v || v;
    }

    // Rows past the last good one use what was known before the last scan
    const coefBits = mcuRow > lastGoodRow ? previousLatch : latch;
    // Only interpolate DC values when no AC data is available
    let changeDC = true;

    for (let i = 1; i < SAVED_COEFS; i++) {
      if (coefBits[i] !== -1) {
        changeDC = false;
      }
    }

    // libjpeg's row bookkeeping, which decides where the edges are
    const imageBlockRows = blockRows * mcuRows;

    for (let blockRow = 0; blockRow < blockRows; blockRow++) {
      const imageBlockRow = mcuRow * blockRows + blockRow;
      const row = mcuRow * v + blockRow;
      const prev = imageBlockRow > 0 ? row - 1 : row;
      const prevPrev = imageBlockRow > 1 ? row - 2 : prev;
      const next = imageBlockRow < imageBlockRows - 1 ? row + 1 : row;
      const nextNext = imageBlockRow < imageBlockRows - 2 ? row + 2 : next;

      // The 5x5 neighbourhood of DC values, as sliding registers
      let dc01, dc02, dc03, dc04, dc05;
      let dc06, dc07, dc08, dc09, dc10;
      let dc11, dc12, dc13, dc14, dc15;
      let dc16, dc17, dc18, dc19, dc20;
      let dc21, dc22, dc23, dc24, dc25;

      dc01 = dc02 = dc03 = dc04 = dc05 = dc(prevPrev, 0);
      dc06 = dc07 = dc08 = dc09 = dc10 = dc(prev, 0);
      dc11 = dc12 = dc13 = dc14 = dc15 = dc(row, 0);
      dc16 = dc17 = dc18 = dc19 = dc20 = dc(next, 0);
      dc21 = dc22 = dc23 = dc24 = dc25 = dc(nextNext, 0);

      for (let col = 0; col <= lastColumn; col++) {
        const offset = (row * blocksPerLineMcu + col) * 64;

        workspace.set(coefficients.subarray(offset, offset + 64));

        if (col === 0 && col < lastColumn) {
          dc04 = dc05 = dc(prevPrev, 1);
          dc09 = dc10 = dc(prev, 1);
          dc14 = dc15 = dc(row, 1);
          dc19 = dc20 = dc(next, 1);
          dc24 = dc25 = dc(nextNext, 1);
        }

        if (col + 1 < lastColumn) {
          dc05 = dc(prevPrev, col + 2);
          dc10 = dc(prev, col + 2);
          dc15 = dc(row, col + 2);
          dc20 = dc(next, col + 2);
          dc25 = dc(nextNext, col + 2);
        }

        let al: number;

        // AC01
        if ((al = coefBits[1]!) !== 0 && workspace[1] === 0) {
          const num =
            q00 *
            (changeDC
              ? -dc01 -
                dc02 +
                dc04 +
                dc05 -
                3 * dc06 +
                13 * dc07 -
                13 * dc09 +
                3 * dc10 -
                3 * dc11 +
                38 * dc12 -
                38 * dc14 +
                3 * dc15 -
                3 * dc16 +
                13 * dc17 -
                13 * dc19 +
                3 * dc20 -
                dc21 -
                dc22 +
                dc24 +
                dc25
              : -7 * dc11 + 50 * dc12 - 50 * dc14 + 7 * dc15);

          workspace[1] = estimate(num, q01, al);
        }

        // AC10
        if ((al = coefBits[2]!) !== 0 && workspace[8] === 0) {
          const num =
            q00 *
            (changeDC
              ? -dc01 -
                3 * dc02 -
                3 * dc03 -
                3 * dc04 -
                dc05 -
                dc06 +
                13 * dc07 +
                38 * dc08 +
                13 * dc09 -
                dc10 +
                dc16 -
                13 * dc17 -
                38 * dc18 -
                13 * dc19 +
                dc20 +
                dc21 +
                3 * dc22 +
                3 * dc23 +
                3 * dc24 +
                dc25
              : -7 * dc03 + 50 * dc08 - 50 * dc18 + 7 * dc23);

          workspace[8] = estimate(num, q10, al);
        }

        // AC20
        if ((al = coefBits[3]!) !== 0 && workspace[16] === 0) {
          const num =
            q00 *
            (changeDC
              ? dc03 +
                2 * dc07 +
                7 * dc08 +
                2 * dc09 -
                5 * dc12 -
                14 * dc13 -
                5 * dc14 +
                2 * dc17 +
                7 * dc18 +
                2 * dc19 +
                dc23
              : -dc03 + 13 * dc08 - 24 * dc13 + 13 * dc18 - dc23);

          workspace[16] = estimate(num, q20, al);
        }

        // AC11
        if ((al = coefBits[4]!) !== 0 && workspace[9] === 0) {
          const num =
            q00 *
            (changeDC
              ? -dc01 +
                dc05 +
                9 * dc07 -
                9 * dc09 -
                9 * dc17 +
                9 * dc19 +
                dc21 -
                dc25
              : dc10 +
                dc16 -
                10 * dc17 +
                10 * dc19 -
                dc02 -
                dc20 +
                dc22 -
                dc24 +
                dc04 -
                dc06 +
                10 * dc07 -
                10 * dc09);

          workspace[9] = estimate(num, q11, al);
        }

        // AC02
        if ((al = coefBits[5]!) !== 0 && workspace[2] === 0) {
          const num =
            q00 *
            (changeDC
              ? 2 * dc07 -
                5 * dc08 +
                2 * dc09 +
                dc11 +
                7 * dc12 -
                14 * dc13 +
                7 * dc14 +
                dc15 +
                2 * dc17 -
                5 * dc18 +
                2 * dc19
              : -dc11 + 13 * dc12 - 24 * dc13 + 13 * dc14 - dc15);

          workspace[2] = estimate(num, q02, al);
        }

        if (changeDC) {
          // AC03
          if ((al = coefBits[6]!) !== 0 && workspace[3] === 0) {
            const num = q00 * (dc07 - dc09 + 2 * dc12 - 2 * dc14 + dc17 - dc19);

            workspace[3] = estimate(num, q03, al);
          }

          // AC12
          if ((al = coefBits[7]!) !== 0 && workspace[10] === 0) {
            const num = q00 * (dc07 - 3 * dc08 + dc09 - dc17 + 3 * dc18 - dc19);

            workspace[10] = estimate(num, q12, al);
          }

          // AC21
          if ((al = coefBits[8]!) !== 0 && workspace[17] === 0) {
            const num = q00 * (dc07 - dc09 - 3 * dc12 + 3 * dc14 + dc17 - dc19);

            workspace[17] = estimate(num, q21, al);
          }

          // AC30
          if ((al = coefBits[9]!) !== 0 && workspace[24] === 0) {
            const num = q00 * (dc07 + 2 * dc08 + dc09 - dc17 - 2 * dc18 - dc19);

            workspace[24] = estimate(num, q30, al);
          }

          // DC
          const num =
            q00 *
            (-2 * dc01 -
              6 * dc02 -
              8 * dc03 -
              6 * dc04 -
              2 * dc05 -
              6 * dc06 +
              6 * dc07 +
              42 * dc08 +
              6 * dc09 -
              6 * dc10 -
              8 * dc11 +
              42 * dc12 +
              152 * dc13 +
              42 * dc14 -
              8 * dc15 -
              6 * dc16 +
              6 * dc17 +
              42 * dc18 +
              6 * dc19 -
              6 * dc20 -
              2 * dc21 -
              6 * dc22 -
              8 * dc23 -
              6 * dc24 -
              2 * dc25);

          workspace[0] = estimate(num, q00, 0);
        }

        if (row < blocksPerColumn) {
          idctBlock(
            idct,
            workspace,
            0,
            q,
            plane,
            row * 8 * stride + col * 8,
            stride,
          );
        }

        // Advance for the next column
        dc01 = dc02;
        dc02 = dc03;
        dc03 = dc04;
        dc04 = dc05;
        dc06 = dc07;
        dc07 = dc08;
        dc08 = dc09;
        dc09 = dc10;
        dc11 = dc12;
        dc12 = dc13;
        dc13 = dc14;
        dc14 = dc15;
        dc16 = dc17;
        dc17 = dc18;
        dc18 = dc19;
        dc19 = dc20;
        dc21 = dc22;
        dc22 = dc23;
        dc23 = dc24;
        dc24 = dc25;
      }
    }
  }
}
