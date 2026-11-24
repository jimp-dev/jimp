/*
 * Progressive Huffman encoding (spectral selection and successive
 * approximation), with optimal Huffman tables for each scan.
 *
 * Based on jcphuff.c and the scan script of jcparam.c
 * (jpeg_simple_progression) of the Independent JPEG Group's software, as
 * found in libjpeg-turbo (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1995-1998, Thomas G. Lane.
 *   Modified 2003-2008 by Guido Vollbeding.
 *   libjpeg-turbo Modifications:
 *   Copyright (C) 2009, 2011, 2015, 2018, 2021-2022, D. R. Commander.
 *   Copyright (C) 2016, 2018, 2022, Matthieu Darbois.
 *   Copyright (C) 2020, Arm Limited.
 *   Copyright (C) 2021, Alex Richardson.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript,
 * based on the plainer encoding loops of libjpeg 6b rather than
 * libjpeg-turbo's SIMD-friendly ones, which produce the same data.
 */

import { type HuffmanCodes, huffmanCodes, optimalTable } from "./huffman.js";
import type { ByteWriter } from "./writer.js";

export interface ProgressiveComponent {
  id: number;
  h: number;
  v: number;
  table: 0 | 1;
  blocksPerLine: number;
  blocksPerColumn: number;
  blocksPerLineMcu: number;
  /** Quantized blocks in zig-zag order, padded to whole MCUs. */
  coefficients: Int16Array;
}

export interface ProgressiveFrame {
  components: ProgressiveComponent[];
  mcusPerLine: number;
  mcusPerColumn: number;
}

interface Scan {
  /** Indexes into the frame's components. */
  components: number[];
  ss: number;
  se: number;
  ah: number;
  al: number;
}

const scan = (
  components: number[],
  ss: number,
  se: number,
  ah: number,
  al: number,
): Scan => ({ components, ss, se, ah, al });

/** libjpeg's default progression (jpeg_simple_progression). */
function scanScript(componentCount: number): Scan[] {
  if (componentCount === 3) {
    return [
      // Initial DC scan
      scan([0, 1, 2], 0, 0, 0, 1),
      // Get some luma data out in a hurry
      scan([0], 1, 5, 0, 2),
      // Chroma data is too small to be worth expending many scans on
      scan([2], 1, 63, 0, 1),
      scan([1], 1, 63, 0, 1),
      // Complete spectral selection for luma AC
      scan([0], 6, 63, 0, 2),
      // Refine next bit of luma AC
      scan([0], 1, 63, 2, 1),
      // Finish DC successive approximation
      scan([0, 1, 2], 0, 0, 1, 0),
      // Finish AC successive approximation
      scan([2], 1, 63, 1, 0),
      scan([1], 1, 63, 1, 0),
      // Luma bottom bit comes last since it's usually the largest scan
      scan([0], 1, 63, 1, 0),
    ];
  }

  return [
    scan([0], 0, 0, 0, 1),
    scan([0], 1, 5, 0, 2),
    scan([0], 6, 63, 0, 2),
    scan([0], 1, 63, 2, 1),
    scan([0], 0, 0, 1, 0),
    scan([0], 1, 63, 1, 0),
  ];
}

/** Correction bits buffered for an EOB run, as in libjpeg. */
const MAX_CORRECTION_BITS = 1000;

function bitLength(value: number) {
  return value === 0 ? 0 : 32 - Math.clz32(value);
}

/**
 * Encodes the blocks of a scan, or only counts the Huffman symbols it would
 * use (when `writer` is null), like libjpeg's gather_statistics mode.
 */
class ScanEncoder {
  eobrun = 0;
  /** Correction bits of the blocks in the EOB run. */
  readonly correctionBits = new Uint8Array(MAX_CORRECTION_BITS);
  correctionCount = 0;
  readonly lastDC: Int32Array;

  constructor(
    readonly writer: ByteWriter | null,
    readonly scan: Scan,
    readonly frequencies: Float64Array[],
    readonly codes: HuffmanCodes[],
    componentCount: number,
  ) {
    this.lastDC = new Int32Array(componentCount);
  }

  symbol(table: number, symbol: number) {
    if (this.writer) {
      const codes = this.codes[table]!;

      this.writer.writeBits(codes.codes[symbol]!, codes.lengths[symbol]!);
    } else {
      this.frequencies[table]![symbol]!++;
    }
  }

  bits(value: number, count: number) {
    if (this.writer && count) {
      this.writer.writeBits(value, count);
    }
  }

  bufferedBits(buffer: Uint8Array, start: number, count: number) {
    if (this.writer) {
      for (let i = 0; i < count; i++) {
        this.writer.writeBits(buffer[start + i]!, 1);
      }
    }
  }

  /** Emits the pending EOB run and its correction bits. */
  emitEobrun(table: number) {
    if (this.eobrun > 0) {
      const size = bitLength(this.eobrun) - 1;

      this.symbol(table, size << 4);
      this.bits(this.eobrun, size);
      this.eobrun = 0;

      this.bufferedBits(this.correctionBits, 0, this.correctionCount);
      this.correctionCount = 0;
    }
  }

  dcFirst(block: Int16Array, offset: number, component: number, table: number) {
    // Point transform: arithmetic shift
    const value = block[offset]! >> this.scan.al;
    const diff = value - this.lastDC[component]!;

    this.lastDC[component] = value;

    const magnitude = diff < 0 ? -diff : diff;
    const size = bitLength(magnitude);

    this.symbol(table, size);
    this.bits(diff < 0 ? diff - 1 : diff, size);
  }

  dcRefine(block: Int16Array, offset: number) {
    this.bits((block[offset]! >> this.scan.al) & 1, 1);
  }

  acFirst(block: Int16Array, offset: number, table: number) {
    const { ss, se, al } = this.scan;
    let run = 0;

    for (let k = ss; k <= se; k++) {
      let value = block[offset + k]!;

      if (value === 0) {
        run++;
        continue;
      }

      // Point transform of the absolute value; negative values are coded
      // as the ones' complement
      let bits: number;

      if (value < 0) {
        value = -value >> al;
        bits = ~value;
      } else {
        value >>= al;
        bits = value;
      }

      if (value === 0) {
        run++;
        continue;
      }

      this.emitEobrun(table);

      while (run > 15) {
        this.symbol(table, 0xf0);
        run -= 16;
      }

      const size = bitLength(value);

      this.symbol(table, (run << 4) + size);
      this.bits(bits, size);
      run = 0;
    }

    if (run > 0) {
      this.eobrun++;

      if (this.eobrun === 0x7fff) {
        this.emitEobrun(table);
      }
    }
  }

  acRefine(block: Int16Array, offset: number, table: number) {
    const { ss, se, al } = this.scan;
    const absolute = new Int32Array(64);
    let eob = 0;

    // The point-transformed absolute values, and where the last newly
    // nonzero coefficient is
    for (let k = ss; k <= se; k++) {
      let value = block[offset + k]!;

      if (value < 0) {
        value = -value;
      }

      value >>= al;
      absolute[k] = value;

      if (value === 1) {
        eob = k;
      }
    }

    let run = 0;
    // Correction bits of this block, appended after the buffered ones
    let start = this.correctionCount;
    let count = 0;
    const buffer = this.correctionBits;

    for (let k = ss; k <= se; k++) {
      const value = absolute[k]!;

      if (value === 0) {
        run++;
        continue;
      }

      // Emit any required ZRLs, but not if they can be folded into EOB
      while (run > 15 && k <= eob) {
        this.emitEobrun(table);
        this.symbol(table, 0xf0);
        run -= 16;
        this.bufferedBits(buffer, start, count);
        start = 0;
        count = 0;
      }

      // A coefficient that was already nonzero only needs a correction bit
      if (value > 1) {
        buffer[start + count++] = value & 1;
        continue;
      }

      this.emitEobrun(table);
      this.symbol(table, (run << 4) + 1);
      this.bits(block[offset + k]! < 0 ? 0 : 1, 1);
      this.bufferedBits(buffer, start, count);
      start = 0;
      count = 0;
      run = 0;
    }

    if (run > 0 || count > 0) {
      this.eobrun++;
      this.correctionCount = start + count;

      // Force out the EOB run before the counter or the buffer overflows
      if (
        this.eobrun === 0x7fff ||
        this.correctionCount > MAX_CORRECTION_BITS - 64 + 1
      ) {
        this.emitEobrun(table);
      }
    }
  }

  /** Encodes every block of the scan, in the order of the scan. */
  run(frame: ProgressiveFrame) {
    const { scan } = this;
    const components = scan.components.map((i) => frame.components[i]!);
    const dc = scan.ss === 0;

    const encodeBlock = (
      component: ProgressiveComponent,
      index: number,
      offset: number,
    ) => {
      const table = component.table;

      if (dc) {
        if (scan.ah === 0) {
          this.dcFirst(component.coefficients, offset, index, table);
        } else {
          this.dcRefine(component.coefficients, offset);
        }
      } else if (scan.ah === 0) {
        this.acFirst(component.coefficients, offset, table);
      } else {
        this.acRefine(component.coefficients, offset, table);
      }
    };

    if (components.length === 1) {
      // Non-interleaved: only the component's real blocks
      const component = components[0]!;

      for (let row = 0; row < component.blocksPerColumn; row++) {
        for (let col = 0; col < component.blocksPerLine; col++) {
          encodeBlock(
            component,
            0,
            (row * component.blocksPerLineMcu + col) * 64,
          );
        }
      }
    } else {
      for (let mcuRow = 0; mcuRow < frame.mcusPerColumn; mcuRow++) {
        for (let mcuCol = 0; mcuCol < frame.mcusPerLine; mcuCol++) {
          components.forEach((component, index) => {
            const { h, v, blocksPerLineMcu } = component;

            for (let j = 0; j < v; j++) {
              for (let i = 0; i < h; i++) {
                encodeBlock(
                  component,
                  index,
                  ((mcuRow * v + j) * blocksPerLineMcu + mcuCol * h + i) * 64,
                );
              }
            }
          });
        }
      }
    }

    // Flush the last EOB run, with the table of the scan's component
    if (!dc) {
      this.emitEobrun(components[0]!.table);
    }
  }
}

/** Writes the scans of a progressive JPEG, after the SOF2 marker. */
export function writeProgressiveScans(
  writer: ByteWriter,
  frame: ProgressiveFrame,
) {
  for (const scan of scanScript(frame.components.length)) {
    const components = scan.components.map((i) => frame.components[i]!);
    const dc = scan.ss === 0;
    const tables = [...new Set(components.map((c) => c.table))];
    let codes: HuffmanCodes[] = [];

    // DC refinement scans need no Huffman tables
    if (!(dc && scan.ah > 0)) {
      const frequencies = [new Float64Array(257), new Float64Array(257)];

      new ScanEncoder(null, scan, frequencies, [], components.length).run(
        frame,
      );

      const specs = tables.map((table) => optimalTable(frequencies[table]!));

      codes = [];
      writer.writeUint16(0xffc4);
      writer.writeUint16(
        2 + specs.reduce((sum, spec) => sum + 17 + spec.symbols.length, 0),
      );

      tables.forEach((table, i) => {
        const spec = specs[i]!;

        codes[table] = huffmanCodes(spec);
        writer.writeByte((dc ? 0 : 0x10) | table);
        writer.writeBytes(spec.counts);
        writer.writeBytes(spec.symbols);
      });
    }

    // SOS
    writer.writeUint16(0xffda);
    writer.writeUint16(6 + 2 * components.length);
    writer.writeByte(components.length);

    for (const { id, table } of components) {
      writer.writeBytes([id, (table << 4) | table]);
    }

    writer.writeBytes([scan.ss, scan.se, (scan.ah << 4) | scan.al]);

    new ScanEncoder(writer, scan, [], codes, components.length).run(frame);
    writer.flushBits();
  }
}
