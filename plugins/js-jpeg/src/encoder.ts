/**
 * Baseline JPEG encoder.
 *
 * jpeg-js only writes 4:4:4 (full resolution chroma) with the example Huffman
 * tables from the JPEG spec, which is why its files are much larger than
 * libjpeg's at the same quality. This encoder adds the two things libjpeg
 * based tools do by default:
 *
 * - 4:2:0 chroma subsampling: the color channels are stored at half the width
 *   and height, as the eye is much less sensitive to color detail than to
 *   brightness.
 * - Huffman tables built for each image (libjpeg's `optimize_coding`), which
 *   is lossless.
 *
 * The quantization tables and their quality scaling are the ones from the
 * JPEG spec (Annex K) used by libjpeg, so a given quality means the same
 * thing as in libjpeg, sharp or Pillow.
 */

export type ChromaSubsampling = "4:2:0" | "4:4:4";

export interface EncodeOptions {
  /** 1 to 100 */
  quality: number;
  chromaSubsampling: ChromaSubsampling;
}

interface Bitmap {
  width: number;
  height: number;
  data: Buffer | Uint8Array;
}

/** The natural (row-major) index of each coefficient in zigzag order. */
const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40,
  48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29,
  22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54,
  47, 55, 62, 63,
];

const LUMINANCE_QUANT_TABLE = [
  16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16,
  24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109,
  103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99,
];

const CHROMINANCE_QUANT_TABLE = [
  17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56,
  99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
  99, 99, 99, 99, 99, 99, 99,
];

/** Scale factors of the AAN DCT, see `fdctQuantize`. */
const AAN_SCALE = [
  1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958, 0.5411961,
  0.275899379,
];

/** libjpeg's `jpeg_quality_scaling` and `jpeg_add_quant_table`. */
function scaleQuantTable(table: number[], quality: number) {
  const scale = quality < 50 ? Math.floor(5000 / quality) : 200 - quality * 2;

  return table.map((value) =>
    Math.min(255, Math.max(1, Math.floor((value * scale + 50) / 100))),
  );
}

/** Multipliers that undo the AAN DCT's scaling and quantize in one step. */
function quantMultipliers(table: number[]) {
  const multipliers = new Float64Array(64);

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const i = row * 8 + col;
      multipliers[i] = 1 / (table[i]! * AAN_SCALE[row]! * AAN_SCALE[col]! * 8);
    }
  }

  return multipliers;
}

/**
 * Forward DCT of an 8x8 block of samples centered on 0 (in place), using the
 * AAN algorithm as in libjpeg's jfdctflt.c, then quantize the coefficients
 * into `out` in zigzag order.
 */
function fdctQuantize(
  data: Float64Array,
  multipliers: Float64Array,
  out: Int16Array,
  offset: number,
) {
  for (let pass = 0; pass < 2; pass++) {
    // Rows, then columns.
    const step = pass === 0 ? 1 : 8;
    const next = pass === 0 ? 8 : 1;

    for (let i = 0, p = 0; i < 8; i++, p += next) {
      const d0 = data[p]!;
      const d1 = data[p + step]!;
      const d2 = data[p + 2 * step]!;
      const d3 = data[p + 3 * step]!;
      const d4 = data[p + 4 * step]!;
      const d5 = data[p + 5 * step]!;
      const d6 = data[p + 6 * step]!;
      const d7 = data[p + 7 * step]!;

      const tmp0 = d0 + d7;
      const tmp7 = d0 - d7;
      const tmp1 = d1 + d6;
      const tmp6 = d1 - d6;
      const tmp2 = d2 + d5;
      const tmp5 = d2 - d5;
      const tmp3 = d3 + d4;
      const tmp4 = d3 - d4;

      // Even part
      const tmp10 = tmp0 + tmp3;
      const tmp13 = tmp0 - tmp3;
      const tmp11 = tmp1 + tmp2;
      const tmp12 = tmp1 - tmp2;

      data[p] = tmp10 + tmp11;
      data[p + 4 * step] = tmp10 - tmp11;

      const z1 = (tmp12 + tmp13) * 0.707106781;
      data[p + 2 * step] = tmp13 + z1;
      data[p + 6 * step] = tmp13 - z1;

      // Odd part
      const odd10 = tmp4 + tmp5;
      const odd11 = tmp5 + tmp6;
      const odd12 = tmp6 + tmp7;

      const z5 = (odd10 - odd12) * 0.382683433;
      const z2 = 0.5411961 * odd10 + z5;
      const z4 = 1.306562965 * odd12 + z5;
      const z3 = odd11 * 0.707106781;

      const z11 = tmp7 + z3;
      const z13 = tmp7 - z3;

      data[p + 5 * step] = z13 + z2;
      data[p + 3 * step] = z13 - z2;
      data[p + step] = z11 + z4;
      data[p + 7 * step] = z11 - z4;
    }
  }

  for (let k = 0; k < 64; k++) {
    const i = ZIGZAG[k]!;
    const value = data[i]! * multipliers[i]!;
    out[offset + k] = value > 0 ? (value + 0.5) | 0 : (value - 0.5) | 0;
  }
}

/** Number of bits needed for the magnitude of a coefficient. */
function category(value: number) {
  return 32 - Math.clz32(value < 0 ? -value : value);
}

/**
 * Call `emit` with the Huffman symbol and extra bits of each value in a block,
 * as described in the JPEG spec (F.1.2). Returns the DC value, which the next
 * block of the component is coded relative to.
 */
function codeBlock(
  coefficients: Int16Array,
  offset: number,
  previousDc: number,
  emitDc: (symbol: number, value: number) => void,
  emitAc: (symbol: number, value: number) => void,
) {
  const dc = coefficients[offset]!;
  const diff = dc - previousDc;
  emitDc(category(diff), diff);

  let run = 0;

  for (let k = 1; k < 64; k++) {
    const value = coefficients[offset + k]!;

    if (value === 0) {
      run++;
      continue;
    }

    while (run > 15) {
      // ZRL: a run of 16 zeros
      emitAc(0xf0, 0);
      run -= 16;
    }

    emitAc((run << 4) | category(value), value);
    run = 0;
  }

  if (run > 0) {
    // EOB: the rest of the block is zero
    emitAc(0x00, 0);
  }

  return dc;
}

interface HuffmanTable {
  /** Number of codes of each length, 1 to 16 */
  counts: number[];
  /** Symbols in order of increasing code length */
  symbols: number[];
  codes: Uint16Array;
  lengths: Uint8Array;
}

/**
 * Build an optimal Huffman table, limited to 16 bit codes, for the symbol
 * frequencies. This is the algorithm from the JPEG spec (K.2), as implemented
 * by libjpeg's `jpeg_gen_optimal_table`.
 */
export function buildHuffmanTable(frequencies: Uint32Array): HuffmanTable {
  const MAX_LENGTH = 32;
  const freq = new Float64Array(257);
  const codeSize = new Int32Array(257);
  const others = new Int32Array(257).fill(-1);

  freq.set(frequencies);
  // Reserve one code point so that no code is all ones.
  freq[256] = 1;

  for (;;) {
    // The two least frequent symbols; ties go to the larger symbol.
    let c1 = -1;
    let c2 = -1;
    let v1 = Infinity;
    let v2 = Infinity;

    for (let i = 0; i <= 256; i++) {
      const f = freq[i]!;

      if (f === 0) {
        continue;
      }

      if (f <= v1) {
        c2 = c1;
        v2 = v1;
        c1 = i;
        v1 = f;
      } else if (f <= v2) {
        c2 = i;
        v2 = f;
      }
    }

    if (c2 < 0) {
      break;
    }

    // Merge c2 into c1, making every code in both trees one bit longer.
    freq[c1] = freq[c1]! + freq[c2]!;
    freq[c2] = 0;

    codeSize[c1]!++;
    while (others[c1]! >= 0) {
      c1 = others[c1]!;
      codeSize[c1]!++;
    }
    others[c1] = c2;

    codeSize[c2]!++;
    while (others[c2]! >= 0) {
      c2 = others[c2]!;
      codeSize[c2]!++;
    }
  }

  const bits = new Array<number>(MAX_LENGTH + 1).fill(0);

  for (let i = 0; i <= 256; i++) {
    if (codeSize[i]! > 0) {
      bits[codeSize[i]!]!++;
    }
  }

  // Shorten codes longer than 16 bits: move a pair of them up the tree,
  // replacing a shorter code with two codes one bit longer.
  for (let i = MAX_LENGTH; i > 16; i--) {
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

  // Drop the reserved code point, which has the longest code.
  let longest = 16;

  while (bits[longest] === 0) {
    longest--;
  }

  bits[longest]!--;

  const symbols: number[] = [];

  for (let length = 1; length <= MAX_LENGTH; length++) {
    for (let symbol = 0; symbol < 256; symbol++) {
      if (codeSize[symbol] === length) {
        symbols.push(symbol);
      }
    }
  }

  const counts = bits.slice(1, 17);
  const codes = new Uint16Array(256);
  const lengths = new Uint8Array(256);
  let code = 0;
  let k = 0;

  for (let length = 1; length <= 16; length++) {
    for (let i = 0; i < counts[length - 1]!; i++) {
      codes[symbols[k]!] = code;
      lengths[symbols[k]!] = length;
      code++;
      k++;
    }

    code <<= 1;
  }

  return { counts, symbols, codes, lengths };
}

class ByteWriter {
  buffer: Uint8Array;
  length = 0;
  private bitBuffer = 0;
  private bitCount = 0;

  constructor(capacity: number) {
    this.buffer = new Uint8Array(Math.max(capacity, 1024));
  }

  private reserve(bytes: number) {
    if (this.length + bytes <= this.buffer.length) {
      return;
    }

    const grown = new Uint8Array(
      Math.max(this.buffer.length * 2, this.length + bytes),
    );
    grown.set(this.buffer.subarray(0, this.length));
    this.buffer = grown;
  }

  byte(value: number) {
    this.reserve(1);
    this.buffer[this.length++] = value;
  }

  word(value: number) {
    this.byte((value >> 8) & 0xff);
    this.byte(value & 0xff);
  }

  bytes(values: ArrayLike<number>) {
    this.reserve(values.length);
    this.buffer.set(values, this.length);
    this.length += values.length;
  }

  /** Write up to 16 bits of entropy coded data, stuffing 0 after any 0xFF. */
  bits(value: number, count: number) {
    this.bitBuffer = (this.bitBuffer << count) | (value & ((1 << count) - 1));
    this.bitCount += count;

    while (this.bitCount >= 8) {
      const byte = (this.bitBuffer >> (this.bitCount - 8)) & 0xff;

      this.byte(byte);

      if (byte === 0xff) {
        this.byte(0);
      }

      this.bitCount -= 8;
    }

    this.bitBuffer &= (1 << this.bitCount) - 1;
  }

  /** Pad the last byte of entropy coded data with 1 bits. */
  flushBits() {
    if (this.bitCount > 0) {
      this.bits(0xff, 8 - this.bitCount);
    }
  }

  result() {
    return this.buffer.subarray(0, this.length);
  }
}

export function encode(
  { width, height, data }: Bitmap,
  { quality, chromaSubsampling }: EncodeOptions,
) {
  if (width < 1 || height < 1 || width > 65535 || height > 65535) {
    throw new Error(
      `JPEG images must be 1 to 65535 pixels wide and high, got ${width}x${height}`,
    );
  }

  quality = Math.min(100, Math.max(1, Math.round(quality)));

  const lumaTable = scaleQuantTable(LUMINANCE_QUANT_TABLE, quality);
  const chromaTable = scaleQuantTable(CHROMINANCE_QUANT_TABLE, quality);
  const lumaMultipliers = quantMultipliers(lumaTable);
  const chromaMultipliers = quantMultipliers(chromaTable);

  // Luma blocks per MCU (minimum coded unit) in each direction.
  const factor = chromaSubsampling === "4:2:0" ? 2 : 1;
  const mcuSize = 8 * factor;
  const mcusX = Math.ceil(width / mcuSize);
  const mcusY = Math.ceil(height / mcuSize);
  const blocksPerMcu = factor * factor + 2;
  const coefficients = new Int16Array(mcusX * mcusY * blocksPerMcu * 64);

  const mcuY = new Float64Array(mcuSize * mcuSize);
  const mcuCb = new Float64Array(mcuSize * mcuSize);
  const mcuCr = new Float64Array(mcuSize * mcuSize);
  const block = new Float64Array(64);
  let offset = 0;

  // Color convert, downsample, DCT and quantize each MCU.
  for (let my = 0; my < mcusY; my++) {
    for (let mx = 0; mx < mcusX; mx++) {
      for (let y = 0; y < mcuSize; y++) {
        // Repeat the last row and column into the padding.
        const sy = Math.min(my * mcuSize + y, height - 1);

        for (let x = 0; x < mcuSize; x++) {
          const sx = Math.min(mx * mcuSize + x, width - 1);
          const p = (sy * width + sx) * 4;
          const r = data[p]!;
          const g = data[p + 1]!;
          const b = data[p + 2]!;
          const i = y * mcuSize + x;

          mcuY[i] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
          mcuCb[i] = -0.168735892 * r - 0.331264108 * g + 0.5 * b;
          mcuCr[i] = 0.5 * r - 0.418687589 * g - 0.081312411 * b;
        }
      }

      for (let by = 0; by < factor; by++) {
        for (let bx = 0; bx < factor; bx++) {
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              block[y * 8 + x] = mcuY[(by * 8 + y) * mcuSize + bx * 8 + x]!;
            }
          }

          fdctQuantize(block, lumaMultipliers, coefficients, offset);
          offset += 64;
        }
      }

      for (const plane of [mcuCb, mcuCr]) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (factor === 1) {
              block[y * 8 + x] = plane[y * 8 + x]!;
            } else {
              // Average each 2x2 square.
              const i = y * 2 * mcuSize + x * 2;
              block[y * 8 + x] =
                (plane[i]! +
                  plane[i + 1]! +
                  plane[i + mcuSize]! +
                  plane[i + mcuSize + 1]!) /
                4;
            }
          }
        }

        fdctQuantize(block, chromaMultipliers, coefficients, offset);
        offset += 64;
      }
    }
  }

  const blockCount = offset / 64;
  const lumaBlocks = factor * factor;

  // Go over the blocks in the order they are written, calling the callbacks
  // of the block's component.
  const codeBlocks = (
    emitDc: (table: number, symbol: number, value: number) => void,
    emitAc: (table: number, symbol: number, value: number) => void,
  ) => {
    const previousDc = [0, 0, 0];

    for (let i = 0; i < blockCount; i++) {
      const inMcu = i % blocksPerMcu;
      const component = inMcu < lumaBlocks ? 0 : inMcu - lumaBlocks + 1;
      const table = component === 0 ? 0 : 1;

      previousDc[component] = codeBlock(
        coefficients,
        i * 64,
        previousDc[component]!,
        (symbol, value) => emitDc(table, symbol, value),
        (symbol, value) => emitAc(table, symbol, value),
      );
    }
  };

  // First pass: count the symbols, to build Huffman tables for this image.
  const dcFrequencies = [new Uint32Array(256), new Uint32Array(256)];
  const acFrequencies = [new Uint32Array(256), new Uint32Array(256)];

  codeBlocks(
    (table, symbol) => dcFrequencies[table]![symbol]!++,
    (table, symbol) => acFrequencies[table]![symbol]!++,
  );

  const dcTables = dcFrequencies.map(buildHuffmanTable);
  const acTables = acFrequencies.map(buildHuffmanTable);

  const writer = new ByteWriter(blockCount * 16);

  // SOI
  writer.word(0xffd8);

  // APP0: JFIF 1.1, no units, 1:1 pixel aspect ratio, no thumbnail
  writer.word(0xffe0);
  writer.word(16);
  writer.bytes([0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);

  // DQT
  writer.word(0xffdb);
  writer.word(2 + 2 * 65);
  [lumaTable, chromaTable].forEach((table, id) => {
    writer.byte(id);
    writer.bytes(ZIGZAG.map((i) => table[i]!));
  });

  // SOF0: baseline, 8 bit samples, 3 components (id, sampling, quant table)
  writer.word(0xffc0);
  writer.word(17);
  writer.byte(8);
  writer.word(height);
  writer.word(width);
  writer.byte(3);
  writer.bytes([1, (factor << 4) | factor, 0]);
  writer.bytes([2, 0x11, 1]);
  writer.bytes([3, 0x11, 1]);

  // DHT
  const huffmanTables = [
    { id: 0x00, table: dcTables[0]! },
    { id: 0x10, table: acTables[0]! },
    { id: 0x01, table: dcTables[1]! },
    { id: 0x11, table: acTables[1]! },
  ];

  writer.word(0xffc4);
  writer.word(
    2 +
      huffmanTables.reduce(
        (sum, { table }) => sum + 17 + table.symbols.length,
        0,
      ),
  );

  for (const { id, table } of huffmanTables) {
    writer.byte(id);
    writer.bytes(table.counts);
    writer.bytes(table.symbols);
  }

  // SOS: 3 components (id, DC and AC tables), the whole spectrum
  writer.word(0xffda);
  writer.word(12);
  writer.byte(3);
  writer.bytes([1, 0x00, 2, 0x11, 3, 0x11]);
  writer.bytes([0, 63, 0]);

  // Second pass: write the entropy coded data.
  const writeSymbol = (table: HuffmanTable, symbol: number, value: number) => {
    writer.bits(table.codes[symbol]!, table.lengths[symbol]!);

    const size = symbol & 0x0f;

    if (size > 0) {
      // Negative values are written as value - 1, in `size` bits.
      writer.bits(value < 0 ? value - 1 : value, size);
    }
  };

  codeBlocks(
    (table, symbol, value) => writeSymbol(dcTables[table]!, symbol, value),
    (table, symbol, value) => writeSymbol(acTables[table]!, symbol, value),
  );

  writer.flushBits();

  // EOI
  writer.word(0xffd9);

  return writer.result();
}
