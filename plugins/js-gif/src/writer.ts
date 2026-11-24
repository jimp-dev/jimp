/**
 * Writes a GIF. The output is the same as omggif's GifWriter, whose LZW
 * encoder keys its code table with a plain object and is several times
 * slower than this one on large images.
 */

import type { IndexedImage } from "./quantize.js";

const MAX_CODES = 4096;
const TABLE_BITS = 13;
const TABLE_SIZE = 1 << TABLE_BITS;

/** A full size frame, already mapped to palette indexes */
export interface GifFrame {
  image: IndexedImage;
  /** In hundredths of a second */
  delay: number;
}

/** The header, a 256 color global palette and the loop extension */
const HEADER_SIZE = 13 + 256 * 3 + 19;

/**
 * Upper bound on the encoded size of a frame. Each LZW code is at most 12
 * bits and covers at least one pixel. The code table is reset every
 * 4096 - 258 codes, which adds a clear code each time. Data is written in
 * 255 byte sub-blocks with a length byte each. The rest is the graphics
 * control extension, the image descriptor, a 256 color local palette and
 * the trailer.
 */
function maxEncodedSize(pixels: number) {
  const codes = pixels + Math.ceil(pixels / (MAX_CODES - 258)) + 2;
  const data = Math.ceil((codes * 12) / 8);

  return data + Math.ceil(data / 255) + 1024;
}

function paletteBitsFor(palette: number[]) {
  let paletteBits = 0;

  while (1 << (paletteBits + 1) <= palette.length) {
    paletteBits++;
  }

  return paletteBits;
}

function samePalette(a: number[], b: number[]) {
  return a.length === b.length && a.every((color, i) => color === b[i]);
}

/**
 * Write full size frames. The first frame's palette is the global palette,
 * later frames with a different one get a local palette. Every frame is
 * restored to the background (transparent) when the next one is shown, so
 * transparent pixels never show the previous frame.
 *
 * @param loop how many times the animation repeats, 0 for forever, or null
 * to leave out the loop extension so it plays once
 */
export function writeGif(
  width: number,
  height: number,
  frames: GifFrame[],
  loop: number | null
) {
  // Each frame is written to its own buffer, so only one worst case sized
  // buffer is allocated at a time
  const chunks: Uint8Array[] = [];
  let out = new Uint8Array(HEADER_SIZE);
  let p = 0;

  const writeShort = (value: number) => {
    out[p++] = value & 0xff;
    out[p++] = (value >> 8) & 0xff;
  };

  const writePalette = (palette: number[]) => {
    for (const rgb of palette) {
      out[p++] = (rgb >> 16) & 0xff;
      out[p++] = (rgb >> 8) & 0xff;
      out[p++] = rgb & 0xff;
    }
  };

  const globalPalette = frames[0]!.image.palette;
  const globalPaletteBits = paletteBitsFor(globalPalette);

  // Header and logical screen descriptor with a global palette
  out.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61], p);
  p += 6;
  writeShort(width);
  writeShort(height);
  out[p++] = 0x80 | (globalPaletteBits - 1);
  out[p++] = 0; // Background color index
  out[p++] = 0; // Pixel aspect ratio
  writePalette(globalPalette);

  if (loop !== null) {
    // NETSCAPE2.0 extension
    out.set(
      [
        0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32,
        0x2e, 0x30, 0x03, 0x01,
      ],
      p
    );
    p += 16;
    writeShort(loop);
    out[p++] = 0;
  }

  for (const { image, delay } of frames) {
    chunks.push(out.subarray(0, p));
    out = new Uint8Array(maxEncodedSize(width * height));
    p = 0;

    const { palette, indexes, transparentIndex } = image;
    const isLocal = !samePalette(palette, globalPalette);
    const paletteBits = isLocal ? paletteBitsFor(palette) : globalPaletteBits;

    // Graphics control extension: restore to background
    out[p++] = 0x21;
    out[p++] = 0xf9;
    out[p++] = 4;
    out[p++] = (2 << 2) | (transparentIndex === null ? 0 : 1);
    writeShort(delay);
    out[p++] = transparentIndex ?? 0;
    out[p++] = 0;

    // Image descriptor
    out[p++] = 0x2c;
    writeShort(0);
    writeShort(0);
    writeShort(width);
    writeShort(height);

    if (isLocal) {
      out[p++] = 0x80 | (paletteBits - 1);
      writePalette(palette);
    } else {
      out[p++] = 0;
    }

    p = writeLzw(out, p, Math.max(2, paletteBits), indexes);
  }

  out[p++] = 0x3b;
  chunks.push(out.subarray(0, p));

  // Copy so the oversized frame buffers aren't kept alive
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const gif = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    gif.set(chunk, offset);
    offset += chunk.length;
  }

  return gif;
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
