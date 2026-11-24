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
- edge blocks repeat the last row and column of the image;
- RGB and greyscale input as well as RGBA, and true greyscale JPEGs;
- input validation.
*/

import { ByteWriter } from "./writer.js";
import {
  CHROMINANCE_AC,
  CHROMINANCE_DC,
  LUMINANCE_AC,
  LUMINANCE_DC,
} from "../decoder/standard-tables.js";

export interface EncoderInput {
  width: number;
  height: number;
  data: Uint8Array;
  /** Bytes per pixel of `data`: 4 (RGBA), 3 (RGB) or 1 (greyscale). */
  channels: 1 | 3 | 4;
}

export interface EncoderOptions {
  quality: number;
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
  const divisors = new Float32Array(64);

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

/** Code and length of each symbol of a Huffman table. */
interface HuffmanCodes {
  codes: Uint16Array;
  lengths: Uint8Array;
}

function huffmanCodes(counts: Uint8Array, symbols: Uint8Array): HuffmanCodes {
  const codes = new Uint16Array(256);
  const lengths = new Uint8Array(256);
  let code = 0;
  let p = 0;

  for (let length = 1; length <= 16; length++) {
    for (let i = 0; i < counts[length - 1]!; i++) {
      codes[symbols[p]!] = code++;
      lengths[symbols[p]!] = length;
      p++;
    }

    code <<= 1;
  }

  return { codes, lengths };
}

/** Number of bits needed for the magnitude of `value`. */
function bitLength(value: number) {
  return value === 0 ? 0 : 32 - Math.clz32(value < 0 ? -value : value);
}

/** Forward DCT (AAN, floating point) and quantization of one block. */
function forwardDct(
  data: Float32Array,
  divisors: Float32Array,
  out: Int16Array,
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

    out[ZIGZAG[i]!] = value > 0 ? (value + 0.5) | 0 : (value - 0.5) | 0;
  }
}

/** RGB to YCbCr in 16.16 fixed point, like libjpeg's jccolor.c. */
const YCC_TABLE = (() => {
  const table = new Int32Array(2048);

  for (let i = 0; i < 256; i++) {
    table[i] = 19595 * i;
    table[i + 256] = 38470 * i;
    table[i + 512] = 7471 * i + 0x8000;
    table[i + 768] = -11059 * i;
    table[i + 1024] = -21709 * i;
    table[i + 1280] = 32768 * i + 0x807fff;
    table[i + 1536] = -27439 * i;
    table[i + 1792] = -5329 * i;
  }

  return table;
})();

class BlockEncoder {
  dcY = 0;
  dcU = 0;
  dcV = 0;

  constructor(
    private readonly writer: ByteWriter,
    private readonly lumaDC: HuffmanCodes,
    private readonly lumaAC: HuffmanCodes,
    private readonly chromaDC: HuffmanCodes,
    private readonly chromaAC: HuffmanCodes,
  ) {}

  /** Huffman-codes a quantized block (in zig-zag order); returns its DC. */
  encode(block: Int16Array, previousDC: number, chroma: boolean) {
    const writer = this.writer;
    const dcTable = chroma ? this.chromaDC : this.lumaDC;
    const acTable = chroma ? this.chromaAC : this.lumaAC;
    const dc = block[0]!;
    const diff = dc - previousDC;
    let size = bitLength(diff);

    writer.writeBits(dcTable.codes[size]!, dcTable.lengths[size]!);

    if (size) {
      writer.writeBits(diff < 0 ? diff + (1 << size) - 1 : diff, size);
    }

    let last = 63;

    while (last > 0 && block[last] === 0) {
      last--;
    }

    let run = 0;

    for (let k = 1; k <= last; k++) {
      const value = block[k]!;

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

    return dc;
  }
}

function writeHuffmanTable(
  writer: ByteWriter,
  id: number,
  table: { counts: Uint8Array; symbols: Uint8Array },
) {
  writer.writeByte(id);
  writer.writeBytes(table.counts);
  writer.writeBytes(table.symbols);
}

/** Encodes RGBA, RGB or greyscale pixels as a baseline JPEG. */
export function encodeBaseline(input: EncoderInput, options: EncoderOptions) {
  const { width, height, data, channels } = input;
  const grey = channels === 1;
  const luma = quantTable(LUMINANCE_QUANT, options.quality);
  const chroma = quantTable(CHROMINANCE_QUANT, options.quality);
  const writer = new ByteWriter(Math.max(1024, (width * height) >> 2));

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

    writer.writeUint16(0xfffe);
    writer.writeUint16(comment.length + 2);

    for (let i = 0; i < comment.length; i++) {
      writer.writeByte(comment.charCodeAt(i) & 0xff);
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

    writer.writeUint16(0xffe1);
    writer.writeUint16(exif.length + (hasHeader ? 2 : 7));

    if (!hasHeader) {
      writer.writeBytes([0x45, 0x78, 0x69, 0x66, 0]);
    }

    writer.writeBytes(exif);
  }

  // DQT
  writer.writeUint16(0xffdb);
  writer.writeUint16(grey ? 67 : 132);
  writer.writeByte(0);
  writer.writeBytes(luma.table);

  if (!grey) {
    writer.writeByte(1);
    writer.writeBytes(chroma.table);
  }

  // SOF0
  writer.writeUint16(0xffc0);
  writer.writeUint16(grey ? 11 : 17);
  writer.writeByte(8);
  writer.writeUint16(height);
  writer.writeUint16(width);

  if (grey) {
    writer.writeBytes([1, 1, 0x11, 0]);
  } else {
    writer.writeBytes([3, 1, 0x11, 0, 2, 0x11, 1, 3, 0x11, 1]);
  }

  // DHT
  writer.writeUint16(0xffc4);
  writer.writeUint16(grey ? 2 + 2 * 17 + 12 + 162 : 0x01a2);
  writeHuffmanTable(writer, 0x00, LUMINANCE_DC);
  writeHuffmanTable(writer, 0x10, LUMINANCE_AC);

  if (!grey) {
    writeHuffmanTable(writer, 0x01, CHROMINANCE_DC);
    writeHuffmanTable(writer, 0x11, CHROMINANCE_AC);
  }

  // SOS
  writer.writeUint16(0xffda);

  if (grey) {
    writer.writeBytes([0, 8, 1, 1, 0, 0, 0x3f, 0]);
  } else {
    writer.writeBytes([0, 12, 3, 1, 0, 2, 0x11, 3, 0x11, 0, 0x3f, 0]);
  }

  const encoder = new BlockEncoder(
    writer,
    huffmanCodes(LUMINANCE_DC.counts, LUMINANCE_DC.symbols),
    huffmanCodes(LUMINANCE_AC.counts, LUMINANCE_AC.symbols),
    huffmanCodes(CHROMINANCE_DC.counts, CHROMINANCE_DC.symbols),
    huffmanCodes(CHROMINANCE_AC.counts, CHROMINANCE_AC.symbols),
  );
  const yBlock = new Float32Array(64);
  const uBlock = new Float32Array(64);
  const vBlock = new Float32Array(64);
  const quantized = new Int16Array(64);
  const rowBytes = width * channels;

  for (let y = 0; y < height; y += 8) {
    for (let x = 0; x < width; x += 8) {
      for (let pos = 0; pos < 64; pos++) {
        // Repeat the last row and column past the edges
        const row = Math.min(y + (pos >> 3), height - 1);
        const col = Math.min(x + (pos & 7), width - 1);
        const p = row * rowBytes + col * channels;

        if (grey) {
          yBlock[pos] = data[p]! - 128;
          continue;
        }

        const r = data[p]!;
        const g = data[p + 1]!;
        const b = data[p + 2]!;

        yBlock[pos] =
          ((YCC_TABLE[r]! + YCC_TABLE[g + 256]! + YCC_TABLE[b + 512]!) >> 16) -
          128;
        uBlock[pos] =
          ((YCC_TABLE[r + 768]! +
            YCC_TABLE[g + 1024]! +
            YCC_TABLE[b + 1280]!) >>
            16) -
          128;
        vBlock[pos] =
          ((YCC_TABLE[r + 1280]! +
            YCC_TABLE[g + 1536]! +
            YCC_TABLE[b + 1792]!) >>
            16) -
          128;
      }

      forwardDct(yBlock, luma.divisors, quantized);
      encoder.dcY = encoder.encode(quantized, encoder.dcY, false);

      if (!grey) {
        forwardDct(uBlock, chroma.divisors, quantized);
        encoder.dcU = encoder.encode(quantized, encoder.dcU, true);
        forwardDct(vBlock, chroma.divisors, quantized);
        encoder.dcV = encoder.encode(quantized, encoder.dcV, true);
      }
    }
  }

  // Pad the last byte with 1 bits
  writer.flushBits();

  // EOI
  writer.writeUint16(0xffd9);

  return writer.result();
}
