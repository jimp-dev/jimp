/**
 * Writes a single frame GIF. The output is the same as omggif's GifWriter,
 * whose LZW encoder keys its code table with a plain object and is several
 * times slower than this one on large images.
 */

import type { IndexedImage } from "./quantize.js";

const MAX_CODES = 4096;
const TABLE_BITS = 13;
const TABLE_SIZE = 1 << TABLE_BITS;

/**
 * Upper bound on the encoded size. Each LZW code is at most 12 bits and
 * covers at least one pixel. The code table is reset every 4096 - 258 codes,
 * which adds a clear code each time. Data is written in 255 byte sub-blocks
 * with a length byte each. The rest is the header, a 256 color palette,
 * the loop and graphics control extensions and the image descriptor.
 */
function maxEncodedSize(pixels: number) {
  const codes = pixels + Math.ceil(pixels / (MAX_CODES - 258)) + 2;
  const data = Math.ceil((codes * 12) / 8);

  return data + Math.ceil(data / 255) + 1024;
}

export function writeGif(
  width: number,
  height: number,
  { palette, indexes, transparentIndex }: IndexedImage
) {
  const out = new Uint8Array(maxEncodedSize(width * height));
  let p = 0;

  const writeShort = (value: number) => {
    out[p++] = value & 0xff;
    out[p++] = (value >> 8) & 0xff;
  };

  let paletteBits = 0;

  while (1 << (paletteBits + 1) <= palette.length) {
    paletteBits++;
  }

  // Header and logical screen descriptor with a global palette
  out.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], p);
  p += 6;
  writeShort(width);
  writeShort(height);
  out[p++] = 0x80 | (paletteBits - 1);
  out[p++] = 0; // Background color index
  out[p++] = 0; // Pixel aspect ratio

  for (const rgb of palette) {
    out[p++] = (rgb >> 16) & 0xff;
    out[p++] = (rgb >> 8) & 0xff;
    out[p++] = rgb & 0xff;
  }

  // NETSCAPE2.0 extension, loop forever
  out.set(
    [
      0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32,
      0x2e, 0x30, 0x03, 0x01, 0x00, 0x00, 0x00,
    ],
    p
  );
  p += 19;

  // Graphics control extension: restore to background, 80 ms delay
  out[p++] = 0x21;
  out[p++] = 0xf9;
  out[p++] = 4;
  out[p++] = (2 << 2) | (transparentIndex === null ? 0 : 1);
  writeShort(8);
  out[p++] = transparentIndex ?? 0;
  out[p++] = 0;

  // Image descriptor, using the global palette
  out[p++] = 0x2c;
  writeShort(0);
  writeShort(0);
  writeShort(width);
  writeShort(height);
  out[p++] = 0;

  p = writeLzw(out, p, Math.max(2, paletteBits), indexes);
  out[p++] = 0x3b;

  // Copy so the oversized output buffer isn't kept alive
  return out.slice(0, p);
}

/** LZW compress `indexes` into sub-blocks, the same way as omggif */
function writeLzw(
  out: Uint8Array,
  p: number,
  minCodeSize: number,
  indexes: Uint8Array
) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  // (prefix code << 8 | index) -> code, open addressing
  const keys = new Int32Array(TABLE_SIZE).fill(-1);
  const codes = new Uint16Array(TABLE_SIZE);
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  let bits = 0;
  let bitCount = 0;

  out[p++] = minCodeSize;
  let subBlock = p++;

  const emit = (code: number) => {
    bits |= code << bitCount;
    bitCount += codeSize;

    while (bitCount >= 8) {
      out[p++] = bits & 0xff;
      bits >>= 8;
      bitCount -= 8;

      if (p === subBlock + 256) {
        out[subBlock] = 255;
        subBlock = p++;
      }
    }
  };

  emit(clearCode);

  let prefix = indexes[0]! & (clearCode - 1);

  for (let i = 1; i < indexes.length; i++) {
    const index = indexes[i]! & (clearCode - 1);
    const key = (prefix << 8) | index;
    let slot = Math.imul(key, 0x9e3779b1) >>> (32 - TABLE_BITS);

    while (keys[slot] !== -1 && keys[slot] !== key) {
      slot = (slot + 1) & (TABLE_SIZE - 1);
    }

    if (keys[slot] === key) {
      prefix = codes[slot]!;
      continue;
    }

    emit(prefix);

    if (nextCode === MAX_CODES) {
      emit(clearCode);
      keys.fill(-1);
      nextCode = endCode + 1;
      codeSize = minCodeSize + 1;
    } else {
      if (nextCode >= 1 << codeSize) {
        codeSize++;
      }

      keys[slot] = key;
      codes[slot] = nextCode++;
    }

    prefix = index;
  }

  emit(prefix);
  emit(endCode);

  if (bitCount > 0) {
    out[p++] = bits & 0xff;

    if (p === subBlock + 256) {
      out[subBlock] = 255;
      subBlock = p++;
    }
  }

  // Finish the last sub-block and add the terminator
  if (subBlock + 1 === p) {
    out[subBlock] = 0;
  } else {
    out[subBlock] = p - subBlock - 1;
    out[p++] = 0;
  }

  return p;
}
