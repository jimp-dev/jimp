/*
 * Huffman decoding tables and the entropy-coded data bit reader.
 *
 * Based on jdhuff.c of the Independent JPEG Group's software, as found in
 * libjpeg-turbo (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1991-1997, Thomas G. Lane.
 *   libjpeg-turbo Modifications:
 *   Copyright (C) 2009-2011, 2016, 2018-2019, 2022, D. R. Commander.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript, with
 * a 32-bit bit buffer that pads with zeros past a marker and counts the
 * padding instead of suspending.
 */

import { JpegFormatError } from "../errors.js";

/** Codes up to this many bits are decoded with a single table lookup. */
export const LOOKAHEAD_BITS = 9;

export interface HuffmanTable {
  /**
   * Indexed by the next LOOKAHEAD_BITS bits: `(length << 8) | symbol`, or 0
   * when the code is longer than LOOKAHEAD_BITS.
   */
  lookup: Uint16Array;
  /** Largest code of each length, -1 if there is none. Index 17 is a sentinel. */
  maxcode: Int32Array;
  /** Index into `values` of the first code of each length, minus that code. */
  valoffset: Int32Array;
  values: Uint8Array;
}

/**
 * Builds the decoding tables of a DHT table.
 * @param counts the number of codes of each length 1..16
 * @param symbols the symbols, in order of increasing code length
 */
export function buildHuffmanTable(
  counts: Uint8Array,
  symbols: Uint8Array,
  isDC: boolean,
): HuffmanTable {
  const sizes = new Uint8Array(257);
  const codes = new Int32Array(257);
  let p = 0;

  for (let l = 1; l <= 16; l++) {
    const count = counts[l - 1]!;

    if (p + count > 256) {
      throw new JpegFormatError("Bogus Huffman table definition");
    }

    for (let i = 0; i < count; i++) {
      sizes[p++] = l;
    }
  }

  const symbolCount = p;
  let code = 0;
  let size = sizes[0]!;

  p = 0;

  while (sizes[p]) {
    while (sizes[p] === size) {
      codes[p++] = code++;
    }

    // Codes of this length must fit in this many bits
    if (code >= 1 << size) {
      throw new JpegFormatError("Bogus Huffman table definition");
    }

    code <<= 1;
    size++;
  }

  const maxcode = new Int32Array(18);
  const valoffset = new Int32Array(18);

  p = 0;

  for (let l = 1; l <= 16; l++) {
    const count = counts[l - 1]!;

    if (count) {
      valoffset[l] = p - codes[p]!;
      p += count;
      maxcode[l] = codes[p - 1]!;
    } else {
      maxcode[l] = -1;
    }
  }

  maxcode[17] = 0xfffff;

  const lookup = new Uint16Array(1 << LOOKAHEAD_BITS);

  p = 0;

  for (let l = 1; l <= LOOKAHEAD_BITS; l++) {
    for (let i = 0; i < counts[l - 1]!; i++, p++) {
      // Every LOOKAHEAD_BITS-bit sequence that starts with this code
      let index = codes[p]! << (LOOKAHEAD_BITS - l);

      for (let n = 1 << (LOOKAHEAD_BITS - l); n > 0; n--) {
        lookup[index++] = (l << 8) | symbols[p]!;
      }
    }
  }

  const values = new Uint8Array(256);

  values.set(symbols.subarray(0, symbolCount));

  // DC differences of more than 15 bits can't occur with 8- or 12-bit samples
  if (isDC) {
    for (let i = 0; i < symbolCount; i++) {
      if (values[i]! > 15) {
        throw new JpegFormatError("Bogus Huffman table definition");
      }
    }
  }

  return { lookup, maxcode, valoffset, values };
}

/** No marker has been reached. */
const NO_MARKER = -1;
/** The end of the data was reached, as if an EOI marker was there. */
export const END_OF_DATA = 0x100;

/**
 * Reads the bits of entropy-coded data. Stuffed zero bytes after 0xFF are
 * removed. On reaching a marker or the end of the data it stops there and
 * supplies zero bits, counting them in `padBits`, so decoding never reads out
 * of bounds and the caller can tell afterwards that the data ran out.
 */
export class BitReader {
  /** Bit buffer; only the low `bits` bits are valid. */
  buf = 0;
  bits = 0;
  /** How many of the most recent bits in the buffer are zero padding. */
  padBits = 0;
  /** The marker code the reader stopped at, END_OF_DATA, or NO_MARKER. */
  marker = NO_MARKER;
  /** Offset of the 0xFF of `marker`. */
  markerOffset = 0;

  constructor(
    readonly data: Uint8Array,
    public offset: number,
  ) {}

  /** Fills the buffer to at least 25 bits. */
  fill() {
    const data = this.data;
    const end = data.length;

    while (this.bits <= 24) {
      let byte = 0;

      if (this.marker !== NO_MARKER) {
        this.padBits += 8;
      } else if (this.offset >= end) {
        this.marker = END_OF_DATA;
        this.markerOffset = end;
        this.padBits += 8;
      } else {
        byte = data[this.offset]!;

        if (byte === 0xff) {
          // Any number of fill bytes may precede a marker
          let next = this.offset + 1;

          while (next < end && data[next] === 0xff) {
            next++;
          }

          if (next >= end) {
            this.marker = END_OF_DATA;
            this.markerOffset = end;
            this.padBits += 8;
            byte = 0;
          } else if (data[next] === 0) {
            // Stuffed zero byte: the data byte is 0xFF
            this.offset = next + 1;
          } else {
            this.marker = data[next]!;
            this.markerOffset = next - 1;
            this.padBits += 8;
            byte = 0;
          }
        } else {
          this.offset++;
        }
      }

      this.buf = (this.buf << 8) | byte;
      this.bits += 8;
    }
  }

  /** True once more bits were consumed than the data had. */
  get overrun() {
    return this.bits < this.padBits;
  }

  getBits(n: number) {
    if (this.bits < n) {
      this.fill();
    }

    this.bits -= n;

    return (this.buf >>> this.bits) & ((1 << n) - 1);
  }

  getBit() {
    if (this.bits < 1) {
      this.fill();
    }

    this.bits--;

    return (this.buf >>> this.bits) & 1;
  }

  /**
   * Decodes one Huffman-coded symbol. Returns -1 for a code that isn't in the
   * table, which only happens with corrupt data.
   */
  decode(table: HuffmanTable) {
    // Enough for the longest code plus the 17th bit that flags a bad one
    if (this.bits < 17) {
      this.fill();
    }

    const entry =
      table.lookup[
        (this.buf >>> (this.bits - LOOKAHEAD_BITS)) &
          ((1 << LOOKAHEAD_BITS) - 1)
      ]!;

    if (entry !== 0) {
      this.bits -= entry >> 8;

      return entry & 0xff;
    }

    // Longer code: compare it with the largest code of each length
    const maxcode = table.maxcode;
    let length = LOOKAHEAD_BITS + 1;
    let code = (this.buf >>> (this.bits - length)) & ((1 << length) - 1);

    while (code > maxcode[length]!) {
      length++;
      code = (this.buf >>> (this.bits - length)) & ((1 << length) - 1);
    }

    if (length > 16) {
      this.bits -= 16;

      return -1;
    }

    this.bits -= length;

    return table.values[(table.valoffset[length]! + code) & 0xff]!;
  }

  /** Drops the bits left in the buffer, e.g. before a restart marker. */
  discardBits() {
    this.bits = 0;
    this.padBits = 0;
  }

  /**
   * Finds the next marker if the reader hasn't stopped at one, skipping any
   * other bytes, as libjpeg's next_marker() does.
   */
  findMarker() {
    if (this.marker !== NO_MARKER) {
      return;
    }

    const data = this.data;
    const end = data.length;
    let offset = this.offset;

    while (offset < end) {
      if (data[offset] !== 0xff) {
        offset++;
        continue;
      }

      let next = offset + 1;

      while (next < end && data[next] === 0xff) {
        next++;
      }

      if (next >= end) {
        break;
      }

      if (data[next] !== 0) {
        this.marker = data[next]!;
        this.markerOffset = next - 1;

        return;
      }

      offset = next + 1;
    }

    this.marker = END_OF_DATA;
    this.markerOffset = end;
  }

  /** Steps past the marker the reader stopped at, so reading resumes after it. */
  skipMarker() {
    if (this.marker !== END_OF_DATA) {
      this.offset = this.markerOffset + 2;
      this.marker = NO_MARKER;
    }
  }

  get atMarker() {
    return this.marker !== NO_MARKER;
  }
}
