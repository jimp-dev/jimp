/*
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
JPEG encoder ported to JavaScript and optimized by Andreas Ritter, www.bytestrom.eu, 11/2009

Basic GUI blocking jpeg encoder
*/
/*
Modified by Jimp contributors (2026):
- translated to TypeScript, writing into a growable Uint8Array instead of an
  array of numbers, with typed arrays for the tables and blocks;
- floating-point colour conversion, and 4:2:0 and 4:2:2 chroma subsampling
  (averaging, like libjpeg's jcsample.c);
- edge blocks repeat the last row and column of the image, and blocks that
  only pad an MCU are empty, like libjpeg's jccoefct.c;
- optimized Huffman tables (see huffman.ts) and progressive encoding (see
  progressive.ts);
- RGB and greyscale input as well as RGBA, and true greyscale JPEGs;
- input validation.
*/

import { writeProgressiveScans } from "./progressive.js";
import { ByteWriter } from "./writer.js";
import {
  type HuffmanCodes,
  huffmanCodes,
  type HuffmanSpec,
  optimalTable,
} from "./huffman.js";
import {
  CHROMINANCE_AC,
  CHROMINANCE_DC,
  LUMINANCE_AC,
  LUMINANCE_DC,
} from "../decoder/standard-tables.js";

export type ChromaSubsampling = "4:4:4" | "4:2:2" | "4:2:0";

export interface EncoderInput {
  width: number;
  height: number;
  data: Uint8Array;
  /** Bytes per pixel of `data`: 4 (RGBA), 3 (RGB) or 1 (greyscale). */
  channels: 1 | 3 | 4;
}

export interface EncoderOptions {
  quality: number;
  subsampling: ChromaSubsampling;
  optimizeHuffman: boolean;
  progressive: boolean;
  comments?: string[];
  exif?: Uint8Array;
}

/** Zig-zag position of each coefficient in natural order. */
// prettier-ignore
const ZIGZAG = new Uint8Array([
  0, 1, 5, 6, 14, 15, 27, 28,
  2, 4, 7, 13, 16, 26, 29, 42,
  3, 8, 12, 17, 25, 30, 41, 43,
  9, 11, 18, 24, 31, 40, 44, 53,
  10, 19, 23, 32, 39, 45, 52, 54,
  20, 22, 33, 38, 46, 51, 55, 60,
  21, 34, 37, 47, 50, 56, 59, 61,
  35, 36, 48, 49, 57, 58, 62, 63,
]);

// prettier-ignore
const LUMINANCE_QUANT = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];

// prettier-ignore
const CHROMINANCE_QUANT = [
  17, 18, 24, 47, 99, 99, 99, 99,
  18, 21, 26, 66, 99, 99, 99, 99,
  24, 26, 56, 99, 99, 99, 99, 99,
  47, 66, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99,
];

const AAN_SCALE = [
  1.0, 1.387039845, 1.306562965, 1.175875602, 1.0, 0.785694958, 0.5411961,
  0.275899379,
];

/**
 * Scales a base quantization table for a quality of 1..100, like libjpeg's
 * jpeg_quality_scaling(). Returns the table in zig-zag order and the divisors
 * of the scaled float DCT in natural order.
 */
function quantTable(base: number[], quality: number) {
  const scale = quality < 50 ? Math.floor(5000 / quality) : 200 - quality * 2;
  const table = new Uint8Array(64);
  const divisors = new Float64Array(64);

  for (let i = 0; i < 64; i++) {
    table[ZIGZAG[i]!] = Math.min(
      Math.max(Math.floor((base[i]! * scale + 50) / 100), 1),
      255,
    );
  }

  for (let row = 0, k = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++, k++) {
      divisors[k] =
        1 / (table[ZIGZAG[k]!]! * AAN_SCALE[row]! * AAN_SCALE[col]! * 8);
    }
  }

  return { table, divisors };
}

/** Number of bits needed for the magnitude of `value`. */
function bitLength(value: number) {
  return value === 0 ? 0 : 32 - Math.clz32(value < 0 ? -value : value);
}

/** Forward DCT (AAN, floating point) and quantization of one block. */
function forwardDct(
  data: Float64Array,
  divisors: Float64Array,
  out: Int16Array,
  outOffset: number,
) {
  // Pass 1: process rows
  for (let i = 0; i < 64; i += 8) {
    const d0 = data[i]!;
    const d1 = data[i + 1]!;
    const d2 = data[i + 2]!;
    const d3 = data[i + 3]!;
    const d4 = data[i + 4]!;
    const d5 = data[i + 5]!;
    const d6 = data[i + 6]!;
    const d7 = data[i + 7]!;

    const tmp0 = d0 + d7;
    const tmp7 = d0 - d7;
    const tmp1 = d1 + d6;
    const tmp6 = d1 - d6;
    const tmp2 = d2 + d5;
    const tmp5 = d2 - d5;
    const tmp3 = d3 + d4;
    const tmp4 = d3 - d4;

    // Even part
    let tmp10 = tmp0 + tmp3;
    const tmp13 = tmp0 - tmp3;
    let tmp11 = tmp1 + tmp2;
    let tmp12 = tmp1 - tmp2;

    data[i] = tmp10 + tmp11;
    data[i + 4] = tmp10 - tmp11;

    const z1 = (tmp12 + tmp13) * 0.707106781;

    data[i + 2] = tmp13 + z1;
    data[i + 6] = tmp13 - z1;

    // Odd part
    tmp10 = tmp4 + tmp5;
    tmp11 = tmp5 + tmp6;
    tmp12 = tmp6 + tmp7;

    // The rotator is modified from fig 4-8 to avoid extra negations
    const z5 = (tmp10 - tmp12) * 0.382683433;
    const z2 = 0.5411961 * tmp10 + z5;
    const z4 = 1.306562965 * tmp12 + z5;
    const z3 = tmp11 * 0.707106781;

    const z11 = tmp7 + z3;
    const z13 = tmp7 - z3;

    data[i + 5] = z13 + z2;
    data[i + 3] = z13 - z2;
    data[i + 1] = z11 + z4;
    data[i + 7] = z11 - z4;
  }

  // Pass 2: process columns
  for (let i = 0; i < 8; i++) {
    const d0 = data[i]!;
    const d1 = data[i + 8]!;
    const d2 = data[i + 16]!;
    const d3 = data[i + 24]!;
    const d4 = data[i + 32]!;
    const d5 = data[i + 40]!;
    const d6 = data[i + 48]!;
    const d7 = data[i + 56]!;

    const tmp0 = d0 + d7;
    const tmp7 = d0 - d7;
    const tmp1 = d1 + d6;
    const tmp6 = d1 - d6;
    const tmp2 = d2 + d5;
    const tmp5 = d2 - d5;
    const tmp3 = d3 + d4;
    const tmp4 = d3 - d4;

    // Even part
    let tmp10 = tmp0 + tmp3;
    const tmp13 = tmp0 - tmp3;
    let tmp11 = tmp1 + tmp2;
    let tmp12 = tmp1 - tmp2;

    data[i] = tmp10 + tmp11;
    data[i + 32] = tmp10 - tmp11;

    const z1 = (tmp12 + tmp13) * 0.707106781;

    data[i + 16] = tmp13 + z1;
    data[i + 48] = tmp13 - z1;

    // Odd part
    tmp10 = tmp4 + tmp5;
    tmp11 = tmp5 + tmp6;
    tmp12 = tmp6 + tmp7;

    const z5 = (tmp10 - tmp12) * 0.382683433;
    const z2 = 0.5411961 * tmp10 + z5;
    const z4 = 1.306562965 * tmp12 + z5;
    const z3 = tmp11 * 0.707106781;

    const z11 = tmp7 + z3;
    const z13 = tmp7 - z3;

    data[i + 40] = z13 + z2;
    data[i + 24] = z13 - z2;
    data[i + 8] = z11 + z4;
    data[i + 56] = z11 - z4;
  }

  // Quantize, round to nearest and store in zig-zag order
  for (let i = 0; i < 64; i++) {
    const value = data[i]! * divisors[i]!;

    out[outOffset + ZIGZAG[i]!] =
      value > 0 ? (value + 0.5) | 0 : (value - 0.5) | 0;
  }
}

export interface Component {
  id: number;
  h: number;
  v: number;
  /** 0 for luma, 1 for chroma: the quantization and Huffman tables. */
  table: 0 | 1;
  divisors: Float64Array;
  blocksPerLine: number;
  blocksPerColumn: number;
  blocksPerLineMcu: number;
  /**
   * Quantized blocks in zig-zag order, row by row of blocks, padded to whole
   * MCUs. Only kept when encoding in more than one pass.
   */
  coefficients: Int16Array | null;
  /** Samples of the current row of MCUs, minus 128. */
  samples: Float32Array;
  samplesWidth: number;
}

/** Encodes blocks with Huffman tables, writing the entropy-coded data. */
export class BlockEncoder {
  dc: HuffmanCodes[];
  ac: HuffmanCodes[];

  constructor(
    private readonly writer: ByteWriter,
    dc: HuffmanSpec[],
    ac: HuffmanSpec[],
  ) {
    this.dc = dc.map(huffmanCodes);
    this.ac = ac.map(huffmanCodes);
  }

  /**
   * Huffman-codes a quantized block (in zig-zag order) at `offset`, given the
   * DC of the previous block of its component.
   */
  encode(
    block: Int16Array,
    offset: number,
    previousDC: number,
    table: number,
  ) {
    const writer = this.writer;
    const dcTable = this.dc[table]!;
    const acTable = this.ac[table]!;
    const diff = block[offset]! - previousDC;
    let size = bitLength(diff);

    writer.writeBits(dcTable.codes[size]!, dcTable.lengths[size]!);

    if (size) {
      writer.writeBits(diff < 0 ? diff + (1 << size) - 1 : diff, size);
    }

    let last = 63;

    while (last > 0 && block[offset + last] === 0) {
      last--;
    }

    let run = 0;

    for (let k = 1; k <= last; k++) {
      const value = block[offset + k]!;

      if (value === 0) {
        run++;
        continue;
      }

      while (run > 15) {
        writer.writeBits(acTable.codes[0xf0]!, acTable.lengths[0xf0]!);
        run -= 16;
      }

      size = bitLength(value);

      const symbol = (run << 4) | size;

      writer.writeBits(acTable.codes[symbol]!, acTable.lengths[symbol]!);
      writer.writeBits(value < 0 ? value + (1 << size) - 1 : value, size);
      run = 0;
    }

    if (last !== 63) {
      writer.writeBits(acTable.codes[0]!, acTable.lengths[0]!);
    }
  }
}

/**
 * Huffman-codes quantized blocks (in zig-zag order) in two steps, so the
 * tables can be optimized for the image in between: `record` turns each
 * block into its symbols and extra bits, counting the symbols, and
 * `replay` writes them with the final tables. The symbols take far less
 * memory than the blocks, except at the highest qualities where they're
 * about the same.
 *
 * The record holds, per block, the DC size and its extra bits, then each AC
 * symbol and its extra bits, up to an EOB symbol or the end of the block.
 * Extra bits take 1 byte for up to 8 bits, else 2.
 */
class SymbolRecorder {
  bytes: Uint8Array;
  length = 0;
  readonly dcFrequencies = [new Float64Array(257), new Float64Array(257)];
  readonly acFrequencies = [new Float64Array(257), new Float64Array(257)];

  constructor(initialSize: number) {
    this.bytes = new Uint8Array(Math.max(initialSize, 1024));
  }

  record(block: Int16Array, offset: number, previousDC: number, table: number) {
    // A block needs at most 1 + 2 + 63 * 3 bytes
    if (this.length + 192 > this.bytes.length) {
      const grown = new Uint8Array(this.bytes.length * 2);

      grown.set(this.bytes.subarray(0, this.length));
      this.bytes = grown;
    }

    const bytes = this.bytes;
    let p = this.length;
    const dcFrequencies = this.dcFrequencies[table]!;
    const acFrequencies = this.acFrequencies[table]!;
    const diff = block[offset]! - previousDC;
    let size = bitLength(diff);

    dcFrequencies[size]!++;
    bytes[p++] = size;

    if (size) {
      const bits = diff < 0 ? diff + (1 << size) - 1 : diff;

      bytes[p++] = bits;

      if (size > 8) {
        bytes[p++] = bits >> 8;
      }
    }

    let last = offset + 63;

    while (last > offset && block[last] === 0) {
      last--;
    }

    let run = 0;

    for (let k = offset + 1; k <= last; k++) {
      const value = block[k]!;

      if (value === 0) {
        run++;
        continue;
      }

      while (run > 15) {
        acFrequencies[0xf0]!++;
        bytes[p++] = 0xf0;
        run -= 16;
      }

      size = bitLength(value);

      const symbol = (run << 4) | size;
      const bits = value < 0 ? value + (1 << size) - 1 : value;

      acFrequencies[symbol]!++;
      bytes[p++] = symbol;
      bytes[p++] = bits;

      if (size > 8) {
        bytes[p++] = bits >> 8;
      }

      run = 0;
    }

    if (last !== offset + 63) {
      acFrequencies[0]!++;
      bytes[p++] = 0;
    }

    this.length = p;
  }

  /** Writes the recorded blocks, with the table of each block. */
  replay(
    writer: ByteWriter,
    dc: HuffmanCodes[],
    ac: HuffmanCodes[],
    tables: Uint8Array,
  ) {
    const bytes = this.bytes;
    const end = this.length;
    let p = 0;
    let block = 0;

    while (p < end) {
      const table = tables[block++ % tables.length]!;
      const dcCodes = dc[table]!;
      const acCodes = ac[table]!;
      let size = bytes[p++]!;

      writer.writeBits(dcCodes.codes[size]!, dcCodes.lengths[size]!);

      if (size) {
        let bits = bytes[p++]!;

        if (size > 8) {
          bits |= bytes[p++]! << 8;
        }

        writer.writeBits(bits, size);
      }

      for (let k = 1; k < 64; ) {
        const symbol = bytes[p++]!;

        writer.writeBits(acCodes.codes[symbol]!, acCodes.lengths[symbol]!);

        if (symbol === 0) {
          break;
        }

        if (symbol === 0xf0) {
          k += 16;
          continue;
        }

        size = symbol & 15;

        let bits = bytes[p++]!;

        if (size > 8) {
          bits |= bytes[p++]! << 8;
        }

        writer.writeBits(bits, size);
        k += (symbol >> 4) + 1;
      }
    }
  }
}

function writeHuffmanTables(
  writer: ByteWriter,
  tables: { id: number; spec: HuffmanSpec }[],
) {
  let length = 2;

  for (const { spec } of tables) {
    length += 17 + spec.symbols.length;
  }

  writer.writeUint16(0xffc4);
  writer.writeUint16(length);

  for (const { id, spec } of tables) {
    writer.writeByte(id);
    writer.writeBytes(spec.counts);
    writer.writeBytes(spec.symbols);
  }
}

const SAMPLING: Record<ChromaSubsampling, [number, number]> = {
  "4:4:4": [1, 1],
  "4:2:2": [2, 1],
  "4:2:0": [2, 2],
};

/** The frame's components and MCU layout. */
export function createComponents(
  input: EncoderInput,
  options: EncoderOptions,
) {
  const { width, height } = input;
  const grey = input.channels === 1;
  const [maxH, maxV] = grey ? [1, 1] : SAMPLING[options.subsampling];
  const luma = quantTable(LUMINANCE_QUANT, options.quality);
  const chroma = quantTable(CHROMINANCE_QUANT, options.quality);
  const mcuWidth = 8 * maxH;
  const mcuHeight = 8 * maxV;
  const mcusPerLine = Math.ceil(width / mcuWidth);
  const mcusPerColumn = Math.ceil(height / mcuHeight);
  const layout: [number, number, number, 0 | 1][] = grey
    ? [[1, 1, 1, 0]]
    : [
        [1, maxH, maxV, 0],
        [2, 1, 1, 1],
        [3, 1, 1, 1],
      ];

  const components: Component[] = layout.map(([id, h, v, table]) => {
    const samplesWidth = mcusPerLine * 8 * h;

    return {
      id,
      h,
      v,
      table,
      divisors: table === 0 ? luma.divisors : chroma.divisors,
      blocksPerLine: Math.ceil((width * h) / mcuWidth),
      blocksPerColumn: Math.ceil((height * v) / mcuHeight),
      blocksPerLineMcu: mcusPerLine * h,
      coefficients: null,
      samples: new Float32Array(samplesWidth * 8 * v),
      samplesWidth,
    };
  });

  return {
    components,
    quantTables: grey ? [luma.table] : [luma.table, chroma.table],
    maxH,
    maxV,
    mcusPerLine,
    mcusPerColumn,
  };
}

type Frame = ReturnType<typeof createComponents>;

const Y_R = 0.299;
const Y_G = 0.587;
const Y_B = 0.114;
const CB_R = -0.168735892;
const CB_G = -0.331264108;
const CR_G = -0.418687589;
const CR_B = -0.081312411;

/**
 * Converts a row of MCUs of the input to YCbCr samples, downsampling the
 * chroma, with the last row and column repeated past the edges.
 */
function loadSamples(input: EncoderInput, frame: Frame, mcuRow: number) {
  const { width, height, data, channels } = input;
  const { components, maxH, maxV } = frame;
  const [y, cb, cr] = components as [Component, Component?, Component?];
  const rows = 8 * maxV;
  const top = mcuRow * rows;
  const fullWidth = y.samplesWidth;
  const rowBytes = width * channels;
  const ySamples = y.samples;

  if (!cb || !cr) {
    for (let row = 0; row < rows; row++) {
      const p = Math.min(top + row, height - 1) * rowBytes;
      const o = row * fullWidth;

      for (let x = 0; x < width; x++) {
        ySamples[o + x] = data[p + x]! - 128;
      }

      const edge = ySamples[o + width - 1]!;

      ySamples.fill(edge, o + width, o + fullWidth);
    }

    return;
  }

  const chromaWidth = cb.samplesWidth;
  const cbSamples = cb.samples;
  const crSamples = cr.samples;
  const subsampled = maxH > 1 || maxV > 1;

  if (subsampled) {
    cbSamples.fill(0);
    crSamples.fill(0);
  }

  const scale = 1 / (maxH * maxV);
  const hShift = maxH - 1;

  for (let row = 0; row < rows; row++) {
    const p = Math.min(top + row, height - 1) * rowBytes;
    const o = row * fullWidth;
    const co = ((row / maxV) | 0) * chromaWidth;
    let r = 0;
    let g = 0;
    let b = 0;

    for (let x = 0, i = p; x < fullWidth; x++) {
      // Past the right edge, repeat the last pixel
      if (x < width) {
        r = data[i]!;
        g = data[i + 1]!;
        b = data[i + 2]!;
        i += channels;
      }

      ySamples[o + x] = Y_R * r + Y_G * g + Y_B * b - 128;

      const cbValue = CB_R * r + CB_G * g + 0.5 * b;
      const crValue = 0.5 * r + CR_G * g + CR_B * b;

      if (subsampled) {
        // Average the chroma of each maxH x maxV block of pixels
        const c = co + (x >> hShift);

        cbSamples[c]! += cbValue * scale;
        crSamples[c]! += crValue * scale;
      } else {
        cbSamples[o + x] = cbValue;
        crSamples[o + x] = crValue;
      }
    }
  }
}

/**
 * Transforms and quantizes every block of the current row of MCUs, writing
 * them into `out` (at `outOffset` in natural order of blocks when there is
 * one per component, see `blockOffset`) and calling `emit` in MCU order.
 * Blocks that only pad an MCU past the edge of the image get no AC
 * coefficients and the DC of the block before, which costs the fewest bits.
 */
function transformRow(
  frame: Frame,
  mcuRow: number,
  blockOffset: (component: Component, row: number, col: number) => number,
  out: (component: Component) => Int16Array,
  emit: ((component: Component, offset: number, index: number) => void) | null,
) {
  const { components, mcusPerLine } = frame;
  const block = new Float64Array(64);
  const previous = new Int16Array(components.length);

  for (let mcuCol = 0; mcuCol < mcusPerLine; mcuCol++) {
    for (let c = 0; c < components.length; c++) {
      const component = components[c]!;
      const { h, v, samples, samplesWidth } = component;
      const target = out(component);

      for (let j = 0; j < v; j++) {
        const row = mcuRow * v + j;

        for (let i = 0; i < h; i++) {
          const col = mcuCol * h + i;
          const offset = blockOffset(component, row, col);

          if (
            row >= component.blocksPerColumn ||
            col >= component.blocksPerLine
          ) {
            target.fill(0, offset, offset + 64);
            target[offset] = previous[c]!;
          } else {
            let s = j * 8 * samplesWidth + col * 8;

            for (let k = 0; k < 64; k += 8, s += samplesWidth) {
              block[k] = samples[s]!;
              block[k + 1] = samples[s + 1]!;
              block[k + 2] = samples[s + 2]!;
              block[k + 3] = samples[s + 3]!;
              block[k + 4] = samples[s + 4]!;
              block[k + 5] = samples[s + 5]!;
              block[k + 6] = samples[s + 6]!;
              block[k + 7] = samples[s + 7]!;
            }

            forwardDct(block, component.divisors, target, offset);
          }

          previous[c] = target[offset]!;
          emit?.(component, offset, c);
        }
      }
    }
  }
}

function writeHeaders(
  writer: ByteWriter,
  input: EncoderInput,
  options: EncoderOptions,
  frame: Frame,
  sofMarker: number,
) {
  const { width, height } = input;

  // SOI
  writer.writeUint16(0xffd8);

  // APP0: JFIF 1.1, 1:1 pixel aspect ratio, no thumbnail
  writer.writeUint16(0xffe0);
  writer.writeUint16(16);
  writer.writeBytes([0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0]);
  writer.writeUint16(1);
  writer.writeUint16(1);
  writer.writeBytes([0, 0]);

  for (const comment of options.comments ?? []) {
    if (typeof comment !== "string") {
      continue;
    }

    // A segment holds at most 65533 bytes
    const text = comment.slice(0, 0xfffd);

    writer.writeUint16(0xfffe);
    writer.writeUint16(text.length + 2);

    for (let i = 0; i < text.length; i++) {
      writer.writeByte(text.charCodeAt(i) & 0xff);
    }
  }

  const exif = options.exif;

  if (exif) {
    // Keep the data as is if it already starts with "Exif"
    const hasHeader =
      exif[0] === 0x45 &&
      exif[1] === 0x78 &&
      exif[2] === 0x69 &&
      exif[3] === 0x66;
    const length = exif.length + (hasHeader ? 2 : 7);

    if (length > 0xffff) {
      throw new RangeError(
        `EXIF data is ${exif.length} bytes, more than a JPEG APP1 segment can hold`,
      );
    }

    writer.writeUint16(0xffe1);
    writer.writeUint16(length);

    if (!hasHeader) {
      writer.writeBytes([0x45, 0x78, 0x69, 0x66, 0]);
    }

    writer.writeBytes(exif);
  }

  // DQT
  writer.writeUint16(0xffdb);
  writer.writeUint16(2 + 65 * frame.quantTables.length);

  frame.quantTables.forEach((table, id) => {
    writer.writeByte(id);
    writer.writeBytes(table);
  });

  // SOF
  const { components } = frame;

  writer.writeUint16(sofMarker);
  writer.writeUint16(8 + 3 * components.length);
  writer.writeByte(8);
  writer.writeUint16(height);
  writer.writeUint16(width);
  writer.writeByte(components.length);

  for (const { id, h, v, table } of components) {
    writer.writeBytes([id, (h << 4) | v, table]);
  }
}

function writeScanHeader(
  writer: ByteWriter,
  components: Component[],
  spectralStart = 0,
  spectralEnd = 63,
  approx = 0,
) {
  writer.writeUint16(0xffda);
  writer.writeUint16(6 + 2 * components.length);
  writer.writeByte(components.length);

  for (const { id, table } of components) {
    writer.writeBytes([id, (table << 4) | table]);
  }

  writer.writeBytes([spectralStart, spectralEnd, approx]);
}

/** Encodes RGBA, RGB or greyscale pixels as a JPEG. */
export function encodeImage(input: EncoderInput, options: EncoderOptions) {
  const { width, height } = input;
  const frame = createComponents(input, options);
  const { components, mcusPerColumn } = frame;
  const tableCount = components.length > 1 ? 2 : 1;
  const writer = new ByteWriter(Math.max(1024, (width * height) >> 3));

  if (options.progressive) {
    // Always with optimal tables, which are built for each scan
    transformImage(input, frame);
    writeHeaders(writer, input, options, frame, 0xffc2);
    writeProgressiveScans(writer, {
      components: components.map((c) => ({
        ...c,
        coefficients: c.coefficients!,
      })),
      mcusPerLine: frame.mcusPerLine,
      mcusPerColumn,
    });
  } else {
    // One block at a time, in MCU order
    const block = new Int16Array(64);
    const previous = new Int16Array(components.length);
    const encoder = options.optimizeHuffman
      ? null
      : new BlockEncoder(
          writer,
          [LUMINANCE_DC, CHROMINANCE_DC].slice(0, tableCount),
          [LUMINANCE_AC, CHROMINANCE_AC].slice(0, tableCount),
        );
    const recorder = options.optimizeHuffman
      ? new SymbolRecorder((width * height) >> 3)
      : null;

    if (encoder) {
      writeHeaders(writer, input, options, frame, 0xffc0);
      writeHuffmanTables(writer, [
        { id: 0x00, spec: LUMINANCE_DC },
        { id: 0x10, spec: LUMINANCE_AC },
        ...(tableCount > 1
          ? [
              { id: 0x01, spec: CHROMINANCE_DC },
              { id: 0x11, spec: CHROMINANCE_AC },
            ]
          : []),
      ]);
      writeScanHeader(writer, components);
    }

    for (let mcuRow = 0; mcuRow < mcusPerColumn; mcuRow++) {
      loadSamples(input, frame, mcuRow);
      transformRow(
        frame,
        mcuRow,
        () => 0,
        () => block,
        (component, _, c) => {
          if (encoder) {
            encoder.encode(block, 0, previous[c]!, component.table);
          } else {
            recorder!.record(block, 0, previous[c]!, component.table);
          }

          previous[c] = block[0]!;
        },
      );
    }

    if (recorder) {
      const dc = recorder.dcFrequencies.slice(0, tableCount).map(optimalTable);
      const ac = recorder.acFrequencies.slice(0, tableCount).map(optimalTable);
      // The table of each block of an MCU
      const tables = Uint8Array.from(
        components.flatMap((c) => Array<number>(c.h * c.v).fill(c.table)),
      );

      writeHeaders(writer, input, options, frame, 0xffc0);
      writeHuffmanTables(writer, [
        ...dc.map((spec, id) => ({ id, spec })),
        ...ac.map((spec, id) => ({ id: 0x10 | id, spec })),
      ]);
      writeScanHeader(writer, components);
      recorder.replay(
        writer,
        dc.map(huffmanCodes),
        ac.map(huffmanCodes),
        tables,
      );
    }
  }

  // Pad the last byte with 1 bits
  writer.flushBits();

  // EOI
  writer.writeUint16(0xffd9);

  return writer.result();
}

/** Transforms the whole image, keeping the quantized blocks. */
export function transformImage(input: EncoderInput, frame: Frame) {
  for (const component of frame.components) {
    component.coefficients = new Int16Array(
      component.blocksPerLineMcu * frame.mcusPerColumn * component.v * 64,
    );
  }

  for (let mcuRow = 0; mcuRow < frame.mcusPerColumn; mcuRow++) {
    loadSamples(input, frame, mcuRow);
    transformRow(
      frame,
      mcuRow,
      (component, row, col) => (row * component.blocksPerLineMcu + col) * 64,
      (component) => component.coefficients!,
      null,
    );
  }
}
