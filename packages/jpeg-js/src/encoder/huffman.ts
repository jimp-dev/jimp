/*
 * Huffman tables for the encoder: the codes of a table, and optimal tables
 * built from symbol frequencies.
 *
 * jpeg_gen_optimal_table() is based on jchuff.c of the Independent JPEG
 * Group's software, as found in libjpeg-turbo
 * (https://github.com/libjpeg-turbo/libjpeg-turbo):
 *
 *   Copyright (C) 1991-1997, Thomas G. Lane.
 *   libjpeg-turbo Modifications:
 *   Copyright (C) 2009-2011, 2014-2016, 2018-2024, D. R. Commander.
 *   For conditions of distribution and use, see README.ijg.
 *
 * Modified by Jimp contributors (2026): translated from C to TypeScript.
 */

export interface HuffmanSpec {
  /** Number of codes of each length 1..16. */
  counts: Uint8Array;
  /** Symbols in order of code length. */
  symbols: Uint8Array;
}

/** Code and length of each symbol of a Huffman table. */
export interface HuffmanCodes {
  codes: Uint16Array;
  lengths: Uint8Array;
}

export function huffmanCodes({ counts, symbols }: HuffmanSpec): HuffmanCodes {
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

const MAX_CODE_LENGTH = 32;

/**
 * Builds the optimal table for symbol frequencies, with codes of at most 16
 * bits and no code of all ones (ITU T.81 section K.2). `frequencies` has 257
 * entries and is modified.
 */
export function optimalTable(frequencies: Float64Array): HuffmanSpec {
  const bits = new Uint8Array(MAX_CODE_LENGTH + 2);
  const codesize = new Int32Array(257);
  const others = new Int32Array(257).fill(-1);
  const index = new Int32Array(257);
  const freq = new Float64Array(257);
  let count = 0;

  // A pseudo-symbol, so no real symbol gets the code of all ones
  frequencies[256] = 1;

  // Group the nonzero frequencies together
  for (let i = 0; i < 257; i++) {
    if (frequencies[i]) {
      index[count] = i;
      freq[count] = frequencies[i]!;
      count++;
    }
  }

  // Huffman's algorithm: merge the two smallest frequencies until one is left
  for (;;) {
    // On ties, the larger symbol
    let c1 = -1;
    let c2 = -1;
    let v1 = Number.MAX_VALUE;
    let v2 = Number.MAX_VALUE;

    for (let i = 0; i < count; i++) {
      if (freq[i]! <= v2) {
        if (freq[i]! <= v1) {
          c2 = c1;
          v2 = v1;
          v1 = freq[i]!;
          c1 = i;
        } else {
          v2 = freq[i]!;
          c2 = i;
        }
      }
    }

    if (c2 < 0) {
      break;
    }

    freq[c1]! += freq[c2]!;
    // Merged away: larger than any frequency, so it's never picked again
    freq[c2] = Infinity;

    // Lengthen every code in both branches
    codesize[c1]!++;

    while (others[c1]! >= 0) {
      c1 = others[c1]!;
      codesize[c1]!++;
    }

    others[c1] = c2;
    codesize[c2]!++;

    while (others[c2]! >= 0) {
      c2 = others[c2]!;
      codesize[c2]!++;
    }
  }

  for (let i = 0; i < count; i++) {
    // Only with frequencies that grow like the Fibonacci numbers, in huge
    // images. libjpeg gives up; halving the frequencies keeps their order.
    if (codesize[i]! > MAX_CODE_LENGTH) {
      return optimalTable(
        frequencies.map((f) => (f ? Math.max(1, Math.floor(f / 2)) : 0)),
      );
    }

    bits[codesize[i]!]!++;
  }

  // Codes can be at most 16 bits: move pairs of symbols up the tree
  for (let i = MAX_CODE_LENGTH; i > 16; i--) {
    while (bits[i]! > 0) {
      let j = i - 2;

      while (bits[j] === 0) {
        j--;
      }

      bits[i]! -= 2;
      bits[i - 1]!++;
      bits[j + 1]! += 2;
      bits[j]!--;
    }
  }

  // Remove the pseudo-symbol from the longest codes
  let longest = 16;

  while (bits[longest] === 0) {
    longest--;
  }

  bits[longest]!--;

  // Symbols sorted by code length, then by symbol
  const symbols: number[] = [];

  for (let length = 1; length <= MAX_CODE_LENGTH; length++) {
    for (let i = 0; i < count; i++) {
      if (codesize[i] === length && index[i] !== 256) {
        symbols.push(index[i]!);
      }
    }
  }

  return {
    counts: bits.slice(1, 17),
    symbols: Uint8Array.from(symbols),
  };
}
