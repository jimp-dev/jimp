/*
 * Decoding of the entropy-coded data of baseline, extended and progressive
 * Huffman scans.
 *
 * The scan structure, the restart marker handling and the recovery from
 * corrupt data follow jdhuff.c, jdphuff.c and jdmarker.c
 * (jpeg_resync_to_restart) of the Independent JPEG Group's software, as found
 * in libjpeg-turbo (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1991-1998, Thomas G. Lane.
 *   libjpeg-turbo Modifications:
 *   Copyright (C) 2009-2011, 2015-2016, 2018-2022, D. R. Commander.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript and
 * restructured around a whole-scan loop instead of libjpeg's suspendable
 * per-MCU calls. The decoding of each block is unchanged.
 */

import { JpegFormatError } from "../errors.js";
import {
  ArithmeticBlockDecoder,
  type ArithmeticConditioning,
  ArithmeticReader,
} from "./arithmetic.js";
import { BitReader, END_OF_DATA, type HuffmanTable } from "./huffman.js";
import { NATURAL_ORDER } from "./scan-tables.js";

export { NATURAL_ORDER };

export interface ScanComponent {
  h: number;
  v: number;
  blocksPerLine: number;
  blocksPerColumn: number;
  /** Blocks per line of `coefficients`, which is padded to whole MCUs. */
  blocksPerLineMcu: number;
  coefficients: Int16Array;
  dcTable: HuffmanTable | null;
  acTable: HuffmanTable | null;
  pred: number;
  /** Arithmetic coding conditioning table numbers, and DC context. */
  dcArithmetic: number;
  acArithmetic: number;
  dcContext: number;
}

export interface Scan {
  components: ScanComponent[];
  progressive: boolean;
  spectralStart: number;
  spectralEnd: number;
  approxHigh: number;
  approxLow: number;
  /** MCUs per line and MCU rows of an interleaved scan. */
  mcusPerLine: number;
  mcusPerColumn: number;
  restartInterval: number;
  /** The scan is arithmetic-coded, with this conditioning. */
  arithmetic?: ArithmeticConditioning;
  /**
   * Coefficients only hold one row of MCUs, passed to `onRow` once decoded
   * and then cleared. Otherwise they hold the whole component.
   */
  onRow?: (mcuRow: number) => void;
}

export interface ScanOptions {
  tolerant: boolean;
  allowTruncated: boolean;
}

function extend(value: number, size: number) {
  return value < 1 << (size - 1) ? value - (1 << size) + 1 : value;
}

class ScanDecoder {
  eobrun = 0;
  /** Out of data until the next restart marker: blocks are left as is. */
  insufficient = false;

  constructor(
    readonly reader: BitReader,
    readonly scan: Scan,
    readonly options: ScanOptions,
  ) {}

  badCode() {
    if (!this.options.tolerant) {
      throw new JpegFormatError("Corrupt JPEG data: bad Huffman code");
    }

    return 0;
  }

  decodeBaseline(component: ScanComponent, offset: number) {
    const reader = this.reader;
    const coefficients = component.coefficients;
    let s = reader.decode(component.dcTable!);

    if (s < 0) {
      s = this.badCode();
    }

    if (s) {
      component.pred += extend(reader.getBits(s), s);
    }

    coefficients[offset] = component.pred;

    const table = component.acTable!;

    for (let k = 1; k < 64; k++) {
      let rs = reader.decode(table);

      if (rs < 0) {
        rs = this.badCode();
      }

      const r = rs >> 4;

      s = rs & 15;

      if (s) {
        k += r;
        coefficients[offset + NATURAL_ORDER[k]!] = extend(reader.getBits(s), s);
      } else {
        if (r !== 15) {
          break;
        }

        k += 15;
      }
    }
  }

  decodeDCFirst(component: ScanComponent, offset: number) {
    const reader = this.reader;
    let s = reader.decode(component.dcTable!);

    if (s < 0) {
      s = this.badCode();
    }

    if (s) {
      component.pred += extend(reader.getBits(s), s);
    }

    component.coefficients[offset] =
      component.pred * (1 << this.scan.approxLow);
  }

  decodeDCRefine(component: ScanComponent, offset: number) {
    if (this.reader.getBit()) {
      component.coefficients[offset]! |= 1 << this.scan.approxLow;
    }
  }

  decodeACFirst(component: ScanComponent, offset: number) {
    if (this.eobrun > 0) {
      this.eobrun--;
      return;
    }

    const reader = this.reader;
    const coefficients = component.coefficients;
    const table = component.acTable!;
    const end = this.scan.spectralEnd;
    const low = this.scan.approxLow;

    for (let k = this.scan.spectralStart; k <= end; k++) {
      let rs = reader.decode(table);

      if (rs < 0) {
        rs = this.badCode();
      }

      const r = rs >> 4;
      const s = rs & 15;

      if (s) {
        k += r;
        coefficients[offset + NATURAL_ORDER[k]!] =
          extend(reader.getBits(s), s) * (1 << low);
      } else if (r === 15) {
        k += 15;
      } else {
        // EOBr: this block and the next 2^r + appended bits - 1 are done
        let eobrun = 1 << r;

        if (r) {
          eobrun += reader.getBits(r);
        }

        this.eobrun = eobrun - 1;
        break;
      }
    }
  }

  decodeACRefine(component: ScanComponent, offset: number) {
    const reader = this.reader;
    const coefficients = component.coefficients;
    const table = component.acTable!;
    const end = this.scan.spectralEnd;
    const p1 = 1 << this.scan.approxLow;
    const m1 = -1 << this.scan.approxLow;
    let k = this.scan.spectralStart;

    if (this.eobrun === 0) {
      for (; k <= end; k++) {
        let rs = reader.decode(table);

        if (rs < 0) {
          rs = this.badCode();
        }

        let r = rs >> 4;
        let s = rs & 15;

        if (s) {
          // The size of a newly nonzero coefficient is always 1; libjpeg
          // only warns about other sizes
          s = reader.getBit() ? p1 : m1;
        } else if (r !== 15) {
          this.eobrun = 1 << r;

          if (r) {
            this.eobrun += reader.getBits(r);
          }

          // The rest of the block is handled by the EOB run below
          break;
        }

        // Advance over already-nonzero coefficients and r still-zero ones,
        // appending correction bits to the nonzero ones
        do {
          const i = offset + NATURAL_ORDER[k]!;
          const coef = coefficients[i]!;

          if (coef !== 0) {
            if (reader.getBit() && (coef & p1) === 0) {
              coefficients[i] = coef >= 0 ? coef + p1 : coef + m1;
            }
          } else if (--r < 0) {
            // Reached the target zero coefficient
            break;
          }

          k++;
        } while (k <= end);

        if (s) {
          coefficients[offset + NATURAL_ORDER[k]!] = s;
        }
      }
    }

    if (this.eobrun > 0) {
      // Append a correction bit to each already-nonzero coefficient left in
      // the band
      for (; k <= end; k++) {
        const i = offset + NATURAL_ORDER[k]!;
        const coef = coefficients[i]!;

        if (coef !== 0 && reader.getBit() && (coef & p1) === 0) {
          coefficients[i] = coef >= 0 ? coef + p1 : coef + m1;
        }
      }

      this.eobrun--;
    }
  }

  /**
   * Handles the restart marker that should follow a restart interval,
   * resynchronizing like libjpeg's jpeg_resync_to_restart() when the data is
   * corrupt.
   */
  processRestart(expected: number) {
    const reader = this.reader;

    reader.discardBits();
    reader.findMarker();

    // Each step skips a marker, so this ends
    for (;;) {
      const marker = reader.marker;

      if (marker === 0xd0 + expected) {
        reader.skipMarker();
        this.insufficient = false;
        return;
      }

      if (!this.options.tolerant) {
        throw new JpegFormatError(
          `Corrupt JPEG data: found ${describeMarker(marker)} instead of restart marker ${expected}`,
        );
      }

      let action: 1 | 2 | 3;

      if (marker === END_OF_DATA) {
        action = 3;
      } else if (marker < 0xc0) {
        // Not a valid marker: skip it
        action = 2;
      } else if (marker < 0xd0 || marker > 0xd7) {
        // A valid non-restart marker: leave it for after the scan
        action = 3;
      } else if (
        marker === 0xd0 + ((expected + 1) & 7) ||
        marker === 0xd0 + ((expected + 2) & 7)
      ) {
        // One of the next two expected restarts: data is missing, leave it
        action = 3;
      } else if (
        marker === 0xd0 + ((expected - 1) & 7) ||
        marker === 0xd0 + ((expected - 2) & 7)
      ) {
        // A prior restart: skip ahead to the next one
        action = 2;
      } else {
        // Too far away to tell: take it as the expected one
        action = 1;
      }

      if (action === 1) {
        reader.skipMarker();
        this.insufficient = false;
        return;
      }

      if (action === 3) {
        // The next restart interval decodes from no data
        this.insufficient = true;
        return;
      }

      reader.skipMarker();
      reader.findMarker();
    }
  }
}

function describeMarker(marker: number) {
  return marker === END_OF_DATA
    ? "the end of the data"
    : `marker 0xFF${marker.toString(16).toUpperCase().padStart(2, "0")}`;
}

export interface ScanResult {
  /** Offset of the marker after the scan's data, or the data's length. */
  offset: number;
  /**
   * The last row of MCUs (of the frame) that was decoded from data, like
   * libjpeg's last_good_iMCU_row. Block smoothing uses it.
   */
  lastGoodRow: number;
}

/**
 * Decodes a scan starting at `offset`, the first byte after its SOS segment.
 */
export function decodeScan(
  data: Uint8Array,
  offset: number,
  scan: Scan,
  options: ScanOptions,
): ScanResult {
  const { components, progressive, restartInterval, onRow } = scan;
  const arithmetic = scan.arithmetic
    ? new ArithmeticBlockDecoder(
        new ArithmeticReader(data, offset),
        scan.arithmetic,
        scan.spectralStart,
        scan.spectralEnd,
        scan.approxLow,
        options.tolerant,
      )
    : null;
  const decoder = new ScanDecoder(
    arithmetic ? arithmetic.reader : new BitReader(data, offset),
    scan,
    options,
  );
  const reader = decoder.reader;
  const single = components.length === 1;
  const first = components[0]!;
  const mcusPerLine = single ? first.blocksPerLine : scan.mcusPerLine;
  const mcuRows = single ? first.blocksPerColumn : scan.mcusPerColumn;
  const total = mcusPerLine * mcuRows;
  const blockDecoder = arithmetic ?? decoder;
  let decodeBlock: (component: ScanComponent, offset: number) => void;

  if (!progressive) {
    decodeBlock = blockDecoder.decodeBaseline;
  } else if (scan.spectralStart === 0) {
    decodeBlock =
      scan.approxHigh === 0
        ? blockDecoder.decodeDCFirst
        : blockDecoder.decodeDCRefine;
  } else {
    decodeBlock =
      scan.approxHigh === 0
        ? blockDecoder.decodeACFirst
        : blockDecoder.decodeACRefine;
  }

  decodeBlock = decodeBlock.bind(blockDecoder);
  arithmetic?.resetStatistics(components, progressive, scan.approxHigh);

  for (const component of components) {
    component.pred = 0;
  }

  let restartsToGo = restartInterval;
  let nextRestart = 0;
  let mcuRow = 0;
  let mcuCol = 0;
  let lastGoodRow = 0;
  // Rows of blocks per row of the frame's MCUs, in a non-interleaved scan
  const rowsPerFrameRow = single ? first.v : 1;

  for (let mcu = 0; mcu < total; mcu++) {
    if (restartInterval) {
      if (restartsToGo === 0) {
        decoder.processRestart(nextRestart);
        nextRestart = (nextRestart + 1) & 7;
        restartsToGo = restartInterval;

        for (const component of components) {
          component.pred = 0;
        }

        decoder.eobrun = 0;
        arithmetic?.resetStatistics(components, progressive, scan.approxHigh);

        if (decoder.insufficient) {
          checkTruncated(reader, options, total - mcu, mcusPerLine);
        }
      }

      restartsToGo--;
    }

    // Arithmetic decoding goes on past a marker, with zeros
    if (!decoder.insufficient || arithmetic) {
      lastGoodRow = Math.floor(mcuRow / rowsPerFrameRow);

      // Rows of the coefficient buffer: relative to the current MCU row when
      // it only holds one
      const rowBase = onRow ? 0 : mcuRow;

      if (single) {
        decodeBlock(
          first,
          ((rowBase * first.blocksPerLineMcu + mcuCol) << 6) >>> 0,
        );
      } else {
        for (let c = 0; c < components.length; c++) {
          const component = components[c]!;
          const { h, v, blocksPerLineMcu } = component;

          for (let j = 0; j < v; j++) {
            const row = rowBase * v + j;

            for (let i = 0; i < h; i++) {
              decodeBlock(
                component,
                (row * blocksPerLineMcu + mcuCol * h + i) * 64,
              );
            }
          }
        }
      }

      if (arithmetic) {
        // Running into the end of the data with rows left is truncation
        if (reader.atMarker) {
          checkTruncated(reader, options, total - mcu - 1, mcusPerLine);
        }
      } else if (reader.overrun) {
        decoder.insufficient = true;

        if (!options.tolerant) {
          throw new JpegFormatError(
            `Corrupt JPEG data: scan data ends early at ${describeMarker(reader.marker)}`,
          );
        }

        checkTruncated(reader, options, total - mcu - 1, mcusPerLine);
      }
    }

    if (++mcuCol === mcusPerLine) {
      onRow?.(mcuRow);
      mcuCol = 0;
      mcuRow++;
    }
  }

  // Skip what's left of the data and any extra restart markers
  reader.discardBits();
  reader.findMarker();

  while (reader.marker >= 0xd0 && reader.marker <= 0xd7) {
    reader.skipMarker();
    reader.findMarker();
  }

  return { offset: reader.markerOffset, lastGoodRow };
}

/**
 * Throws if the data ended (rather than being corrupt) with more than a row
 * of MCUs left to decode. Encoders that drop the last few bits of the image
 * are common, so a missing partial row is accepted, like libjpeg does.
 */
function checkTruncated(
  reader: BitReader,
  options: ScanOptions,
  mcusLeft: number,
  mcusPerLine: number,
) {
  if (
    !options.allowTruncated &&
    (reader.marker === END_OF_DATA || reader.marker === 0xd9) &&
    mcusLeft > mcusPerLine
  ) {
    throw new JpegFormatError(
      "JPEG data is truncated: the image data ends before the image is complete",
    );
  }
}
