/*
 * Arithmetic decoding of sequential and progressive scans (ITU T.81 Annex
 * D and section F.2.4).
 *
 * Based on jdarith.c and jaricom.c of the Independent JPEG Group's software,
 * as found in libjpeg-turbo (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Developed 1997-2015 by Guido Vollbeding.
 *   libjpeg-turbo Modifications:
 *   Portions of this code are based on the PBMPLUS library, which is:
 *   Copyright (C) 1988 by Jef Poskanzer.
 *   Copyright (C) 2015-2020, 2022, D. R. Commander.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript, as
 * a block decoder for the scan loop in scan.ts.
 */

import { JpegFormatError } from "../errors.js";
import { BitReader } from "./huffman.js";
import { NATURAL_ORDER } from "./scan-tables.js";

/**
 * Table D.2 of the standard, packed: Qe value << 16, next state after an
 * MPS << 8, whether to switch the MPS << 7, next state after an LPS. The
 * last entry is a fixed probability of 0.5 (ITU T.851).
 */
// prettier-ignore
const PROBABILITIES = (() => {
  const v = (qe: number, lps: number, mps: number, swap: number) =>
    qe * 65536 + (mps << 8) + (swap << 7) + lps;

  return Int32Array.from([
    v(0x5a1d, 1, 1, 1), v(0x2586, 14, 2, 0), v(0x1114, 16, 3, 0),
    v(0x080b, 18, 4, 0), v(0x03d8, 20, 5, 0), v(0x01da, 23, 6, 0),
    v(0x00e5, 25, 7, 0), v(0x006f, 28, 8, 0), v(0x0036, 30, 9, 0),
    v(0x001a, 33, 10, 0), v(0x000d, 35, 11, 0), v(0x0006, 9, 12, 0),
    v(0x0003, 10, 13, 0), v(0x0001, 12, 13, 0), v(0x5a7f, 15, 15, 1),
    v(0x3f25, 36, 16, 0), v(0x2cf2, 38, 17, 0), v(0x207c, 39, 18, 0),
    v(0x17b9, 40, 19, 0), v(0x1182, 42, 20, 0), v(0x0cef, 43, 21, 0),
    v(0x09a1, 45, 22, 0), v(0x072f, 46, 23, 0), v(0x055c, 48, 24, 0),
    v(0x0406, 49, 25, 0), v(0x0303, 51, 26, 0), v(0x0240, 52, 27, 0),
    v(0x01b1, 54, 28, 0), v(0x0144, 56, 29, 0), v(0x00f5, 57, 30, 0),
    v(0x00b7, 59, 31, 0), v(0x008a, 60, 32, 0), v(0x0068, 62, 33, 0),
    v(0x004e, 63, 34, 0), v(0x003b, 32, 35, 0), v(0x002c, 33, 9, 0),
    v(0x5ae1, 37, 37, 1), v(0x484c, 64, 38, 0), v(0x3a0d, 65, 39, 0),
    v(0x2ef1, 67, 40, 0), v(0x261f, 68, 41, 0), v(0x1f33, 69, 42, 0),
    v(0x19a8, 70, 43, 0), v(0x1518, 72, 44, 0), v(0x1177, 73, 45, 0),
    v(0x0e74, 74, 46, 0), v(0x0bfb, 75, 47, 0), v(0x09f8, 77, 48, 0),
    v(0x0861, 78, 49, 0), v(0x0706, 79, 50, 0), v(0x05cd, 48, 51, 0),
    v(0x04de, 50, 52, 0), v(0x040f, 50, 53, 0), v(0x0363, 51, 54, 0),
    v(0x02d4, 52, 55, 0), v(0x025c, 53, 56, 0), v(0x01f8, 54, 57, 0),
    v(0x01a4, 55, 58, 0), v(0x0160, 56, 59, 0), v(0x0125, 57, 60, 0),
    v(0x00f6, 58, 61, 0), v(0x00cb, 59, 62, 0), v(0x00ab, 61, 63, 0),
    v(0x008f, 61, 32, 0), v(0x5b12, 65, 65, 1), v(0x4d04, 80, 66, 0),
    v(0x412c, 81, 67, 0), v(0x37d8, 82, 68, 0), v(0x2fe8, 83, 69, 0),
    v(0x293c, 84, 70, 0), v(0x2379, 86, 71, 0), v(0x1edf, 87, 72, 0),
    v(0x1aa9, 87, 73, 0), v(0x174e, 72, 74, 0), v(0x1424, 72, 75, 0),
    v(0x119c, 74, 76, 0), v(0x0f6b, 74, 77, 0), v(0x0d51, 75, 78, 0),
    v(0x0bb6, 77, 79, 0), v(0x0a40, 77, 48, 0), v(0x5832, 80, 81, 1),
    v(0x4d1c, 88, 82, 0), v(0x438e, 89, 83, 0), v(0x3bdd, 90, 84, 0),
    v(0x34ee, 91, 85, 0), v(0x2eae, 92, 86, 0), v(0x299a, 93, 87, 0),
    v(0x2516, 86, 71, 0), v(0x5570, 88, 89, 1), v(0x4ca9, 95, 90, 0),
    v(0x44d9, 96, 91, 0), v(0x3e22, 97, 92, 0), v(0x3824, 99, 93, 0),
    v(0x32b4, 99, 94, 0), v(0x2e17, 93, 86, 0), v(0x56a8, 95, 96, 1),
    v(0x4f46, 101, 97, 0), v(0x47e5, 102, 98, 0), v(0x41cf, 103, 99, 0),
    v(0x3c3d, 104, 100, 0), v(0x375e, 99, 93, 0), v(0x5231, 105, 102, 0),
    v(0x4c0f, 106, 103, 0), v(0x4639, 107, 104, 0), v(0x415e, 103, 99, 0),
    v(0x5627, 105, 106, 1), v(0x50e7, 108, 107, 0), v(0x4b85, 109, 103, 0),
    v(0x5597, 110, 109, 0), v(0x504f, 111, 107, 0), v(0x5a10, 110, 111, 1),
    v(0x5522, 112, 109, 0), v(0x59eb, 112, 111, 1), v(0x5a1d, 113, 113, 0),
  ]);
})();

const DC_STAT_BINS = 64;
const AC_STAT_BINS = 256;

/** Conditioning of an arithmetic table, from a DAC marker. */
export interface ArithmeticConditioning {
  /** Lower and upper bounds of the DC difference categories (L and U). */
  dcLower: number[];
  dcUpper: number[];
  /** Coefficient index where AC magnitude contexts switch (Kx). */
  acK: number[];
}

export function defaultConditioning(): ArithmeticConditioning {
  return { dcLower: [0, 0, 0, 0], dcUpper: [1, 1, 1, 1], acK: [5, 5, 5, 5] };
}

export interface ArithmeticComponent {
  coefficients: Int16Array;
  /** Conditioning table numbers (DAC) of the component in this scan. */
  dcArithmetic: number;
  acArithmetic: number;
  pred: number;
  /** DC context of the last difference (F.1.4.4.1.2). */
  dcContext: number;
}

/**
 * The arithmetic decoder's registers and statistics, reading bytes from the
 * scan. Like libjpeg, data past a marker reads as zeros, which is how a
 * scan ends in arithmetic coding.
 */
export class ArithmeticReader extends BitReader {
  /** Code register, interval size and bit counter (ITU T.81 D.2). */
  c = 0;
  a = 0;
  ct = -16;
  /** Set on corrupt data, until the next restart: blocks are left as is. */
  failed = false;
  readonly dcStats = Array.from(
    { length: 4 },
    () => new Uint8Array(DC_STAT_BINS),
  );
  readonly acStats = Array.from(
    { length: 4 },
    () => new Uint8Array(AC_STAT_BINS),
  );
  /** Statistics bin with a fixed probability of 0.5. */
  readonly fixed = Uint8Array.of(113);

  private readByte() {
    const data = this.data;

    if (this.atMarker) {
      return 0;
    }

    if (this.offset >= data.length) {
      this.marker = 0x100;
      this.markerOffset = data.length;
      return 0;
    }

    const byte = data[this.offset++]!;

    if (byte !== 0xff) {
      return byte;
    }

    // Skip fill bytes; a zero byte after 0xFF is stuffed
    let next = this.offset;

    while (next < data.length && data[next] === 0xff) {
      next++;
    }

    if (next < data.length && data[next] === 0) {
      this.offset = next + 1;
      return 0xff;
    }

    this.marker = next < data.length ? data[next]! : 0x100;
    this.markerOffset = next < data.length ? next - 1 : data.length;
    this.offset = this.markerOffset;

    return 0;
  }

  /** Decodes one binary decision with the statistics bin `stats[bin]`. */
  decodeBit(stats: Uint8Array, bin: number) {
    // Renormalization and data input (D.2.6)
    while (this.a < 0x8000) {
      if (--this.ct < 0) {
        this.c = this.c * 256 + this.readByte();
        this.ct += 8;

        if (this.ct < 0 && ++this.ct === 0) {
          // Got the 2 initial bytes
          this.a = 0x8000;
        }
      }

      this.a *= 2;
    }

    const sv = stats[bin]!;
    let qe = PROBABILITIES[sv & 0x7f]!;
    const nextLps = qe & 0xff;
    const nextMps = (qe >> 8) & 0xff;

    qe = qe >>> 16;

    // Decoding and estimation (D.2.4, D.2.5)
    const temp = this.a - qe;

    this.a = temp;

    const shifted = temp * 2 ** this.ct;
    let symbol = sv >> 7;

    if (this.c >= shifted) {
      this.c -= shifted;

      // Conditional LPS exchange
      if (this.a < qe) {
        this.a = qe;
        stats[bin] = (sv & 0x80) ^ nextMps;
      } else {
        this.a = qe;
        stats[bin] = (sv & 0x80) ^ nextLps;
        symbol ^= 1;
      }
    } else if (this.a < 0x8000) {
      // Conditional MPS exchange
      if (this.a < qe) {
        stats[bin] = (sv & 0x80) ^ nextLps;
        symbol ^= 1;
      } else {
        stats[bin] = (sv & 0x80) ^ nextMps;
      }
    }

    return symbol;
  }

  /** Starts decoding afresh, at the start of a scan or restart interval. */
  reset() {
    this.c = 0;
    this.a = 0;
    this.ct = -16;
    this.failed = false;
  }
}

/** Arithmetic-coded block decoding, like jdarith.c's decode_mcu*(). */
export class ArithmeticBlockDecoder {
  constructor(
    readonly reader: ArithmeticReader,
    readonly conditioning: ArithmeticConditioning,
    readonly spectralStart: number,
    readonly spectralEnd: number,
    readonly approxLow: number,
    readonly tolerant: boolean,
  ) {}

  private fail() {
    if (!this.tolerant) {
      throw new JpegFormatError("Corrupt JPEG data: bad arithmetic code");
    }

    this.reader.failed = true;
  }

  /** Decodes a DC difference and updates the component's prediction. */
  private decodeDC(component: ArithmeticComponent) {
    const reader = this.reader;
    const table = component.dcArithmetic;
    const stats = reader.dcStats[table]!;
    let bin = component.dcContext;

    if (reader.decodeBit(stats, bin) === 0) {
      component.dcContext = 0;
      return true;
    }

    // The sign, magnitude category and magnitude bits (F.21-F.24)
    const sign = reader.decodeBit(stats, bin + 1);

    bin += 2 + sign;

    let m = reader.decodeBit(stats, bin);

    if (m !== 0) {
      bin = 20;

      while (reader.decodeBit(stats, bin)) {
        if ((m <<= 1) === 0x8000) {
          this.fail();
          return false;
        }

        bin++;
      }
    }

    const { dcLower, dcUpper } = this.conditioning;

    if (m < (1 << dcLower[table]!) >> 1) {
      component.dcContext = 0;
    } else if (m > (1 << dcUpper[table]!) >> 1) {
      component.dcContext = 12 + sign * 4;
    } else {
      component.dcContext = 4 + sign * 4;
    }

    let v = m;

    bin += 14;

    while ((m >>= 1)) {
      if (reader.decodeBit(stats, bin)) {
        v |= m;
      }
    }

    v += 1;
    component.pred = (component.pred + (sign ? -v : v)) & 0xffff;

    return true;
  }

  /**
   * Decodes AC coefficients `start`..`end`. Returns false on corrupt data.
   */
  private decodeAC(
    component: ArithmeticComponent,
    offset: number,
    start: number,
    end: number,
    shift: number,
  ) {
    const reader = this.reader;
    const table = component.acArithmetic;
    const stats = reader.acStats[table]!;
    const coefficients = component.coefficients;

    for (let k = start; k <= end; k++) {
      let bin = 3 * (k - 1);

      // End of block
      if (reader.decodeBit(stats, bin)) {
        break;
      }

      while (reader.decodeBit(stats, bin + 1) === 0) {
        bin += 3;

        if (++k > end) {
          this.fail();
          return;
        }
      }

      const sign = reader.decodeBit(reader.fixed, 0);

      bin += 2;

      let m = reader.decodeBit(stats, bin);

      if (m !== 0 && reader.decodeBit(stats, bin)) {
        m <<= 1;
        bin = k <= this.conditioning.acK[table]! ? 189 : 217;

        while (reader.decodeBit(stats, bin)) {
          if ((m <<= 1) === 0x8000) {
            this.fail();
            return;
          }

          bin++;
        }
      }

      let v = m;

      bin += 14;

      while ((m >>= 1)) {
        if (reader.decodeBit(stats, bin)) {
          v |= m;
        }
      }

      v += 1;
      coefficients[offset + NATURAL_ORDER[k]!] = (sign ? -v : v) * (1 << shift);
    }
  }

  decodeBaseline(component: ArithmeticComponent, offset: number) {
    if (this.reader.failed || !this.decodeDC(component)) {
      return;
    }

    // The difference is modulo 2^16, as a signed value
    component.coefficients[offset] = component.pred;
    this.decodeAC(component, offset, 1, 63, 0);
  }

  decodeDCFirst(component: ArithmeticComponent, offset: number) {
    if (this.reader.failed || !this.decodeDC(component)) {
      return;
    }

    component.coefficients[offset] = component.pred * (1 << this.approxLow);
  }

  decodeDCRefine(component: ArithmeticComponent, offset: number) {
    if (this.reader.decodeBit(this.reader.fixed, 0)) {
      component.coefficients[offset]! |= 1 << this.approxLow;
    }
  }

  decodeACFirst(component: ArithmeticComponent, offset: number) {
    if (!this.reader.failed) {
      this.decodeAC(
        component,
        offset,
        this.spectralStart,
        this.spectralEnd,
        this.approxLow,
      );
    }
  }

  decodeACRefine(component: ArithmeticComponent, offset: number) {
    const reader = this.reader;

    if (reader.failed) {
      return;
    }

    const stats = reader.acStats[component.acArithmetic]!;
    const coefficients = component.coefficients;
    const end = this.spectralEnd;
    const p1 = 1 << this.approxLow;
    const m1 = -1 << this.approxLow;
    // End of block of the previous stage
    let previousEnd = end;

    for (; previousEnd > 0; previousEnd--) {
      if (coefficients[offset + NATURAL_ORDER[previousEnd]!]) {
        break;
      }
    }

    for (let k = this.spectralStart; k <= end; k++) {
      let bin = 3 * (k - 1);

      if (k > previousEnd && reader.decodeBit(stats, bin)) {
        break;
      }

      for (;;) {
        const i = offset + NATURAL_ORDER[k]!;
        const coef = coefficients[i]!;

        if (coef) {
          // A coefficient that was already nonzero: a correction bit
          if (reader.decodeBit(stats, bin + 2)) {
            coefficients[i] = coef < 0 ? coef + m1 : coef + p1;
          }

          break;
        }

        if (reader.decodeBit(stats, bin + 1)) {
          // Newly nonzero
          coefficients[i] = reader.decodeBit(reader.fixed, 0) ? m1 : p1;
          break;
        }

        bin += 3;

        if (++k > end) {
          this.fail();
          return;
        }
      }
    }
  }

  /** Resets the statistics of the scan's components, as a restart does. */
  resetStatistics(
    components: ArithmeticComponent[],
    progressive: boolean,
    approxHigh: number,
  ) {
    const reader = this.reader;

    for (const component of components) {
      if (!progressive || (this.spectralStart === 0 && approxHigh === 0)) {
        reader.dcStats[component.dcArithmetic]!.fill(0);
        component.pred = 0;
        component.dcContext = 0;
      }

      if (!progressive || this.spectralStart > 0) {
        reader.acStats[component.acArithmetic]!.fill(0);
      }
    }

    reader.reset();
  }
}
