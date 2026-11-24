/**
 * Writes the GIFs in test/corpus/synthetic: small files for edge cases the
 * other corpora don't cover. Their expected output comes from browsers, like
 * the rest of the corpus (see generate-corpus-reference.mjs).
 *
 * Run from plugins/js-gif: node scripts/generate-synthetic-corpus.mjs
 */

import { Buffer } from "node:buffer";
import console from "node:console";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const out = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../test/corpus/synthetic",
);

const RED = 0xff0000;
const GREEN = 0x00ff00;
const BLUE = 0x0000ff;
const WHITE = 0xffffff;
const BLACK = 0x000000;
const RGBW = [RED, GREEN, BLUE, WHITE];

/** Bytes of a GIF, built block by block */
class Gif {
  bytes = [];

  constructor(
    width,
    height,
    palette,
    { version = "89a", background = 0 } = {},
  ) {
    this.ascii(`GIF${version}`);
    this.short(width);
    this.short(height);
    this.bytes.push(palette ? 0xf0 | paletteBits(palette) : 0, background, 0);

    if (palette) {
      this.palette(palette);
    }
  }

  ascii(text) {
    this.bytes.push(...Buffer.from(text, "latin1"));
  }

  short(value) {
    this.bytes.push(value & 0xff, (value >> 8) & 0xff);
  }

  palette(palette) {
    const size = 1 << (paletteBits(palette) + 1);

    for (let i = 0; i < size; i++) {
      const rgb = palette[i] ?? 0;
      this.bytes.push((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
    }
  }

  subBlocks(data, size = 255) {
    for (let i = 0; i < data.length; i += size) {
      const chunk = data.slice(i, i + size);
      this.bytes.push(chunk.length, ...chunk);
    }

    this.bytes.push(0);
  }

  extension(label, blocks) {
    this.bytes.push(0x21, label);

    for (const block of blocks) {
      this.bytes.push(block.length, ...block);
    }

    this.bytes.push(0);
    return this;
  }

  gce({ delay = 10, disposal = 0, transparent = null } = {}) {
    return this.extension(0xf9, [
      [
        (disposal << 2) | (transparent === null ? 0 : 1),
        delay & 0xff,
        delay >> 8,
        transparent ?? 0,
      ],
    ]);
  }

  loop(count, id = "NETSCAPE2.0", subBlockId = 1) {
    return this.extension(0xff, [
      [...Buffer.from(id, "latin1")],
      [subBlockId, count & 0xff, count >> 8],
    ]);
  }

  /**
   * An image. `pixels` are indexes in row order, written as literal LZW
   * codes, or `lzw` is the raw code stream as [code, ...] with `null` for
   * the clear code and `"eoi"` for the end of information code.
   */
  image({
    x = 0,
    y = 0,
    width,
    height,
    pixels,
    codes,
    palette,
    interlaced = false,
    minCodeSize,
    eoi = true,
    after = [],
    subBlockSize = 255,
    truncateAt,
  }) {
    this.bytes.push(0x2c);
    this.short(x);
    this.short(y);
    this.short(width);
    this.short(height);
    this.bytes.push(
      (palette ? 0x80 | paletteBits(palette) : 0) | (interlaced ? 0x40 : 0),
    );

    if (palette) {
      this.palette(palette);
    }

    const ordered = interlaced ? interlace(pixels, width, height) : pixels;
    const size = minCodeSize ?? Math.max(2, bitsFor(Math.max(...ordered)));
    const data = [...lzw(size, codes ?? ordered, eoi), ...after];

    this.bytes.push(size);

    if (truncateAt !== undefined) {
      const sub = [];
      for (let i = 0; i < data.length; i += subBlockSize) {
        const chunk = data.slice(i, i + subBlockSize);
        sub.push(chunk.length, ...chunk);
      }
      this.bytes.push(...sub.slice(0, truncateAt));
      return this;
    }

    this.subBlocks(data, subBlockSize);
    return this;
  }

  end(extra = []) {
    this.bytes.push(0x3b, ...extra);
    return Uint8Array.from(this.bytes);
  }

  cut(length) {
    return Uint8Array.from(this.bytes.slice(0, length));
  }
}

function paletteBits(palette) {
  return Math.max(0, bitsFor(palette.length - 1) - 1);
}

function bitsFor(value) {
  let bits = 1;

  while (1 << bits <= value) {
    bits++;
  }

  return bits;
}

function interlace(pixels, width, height) {
  const rows = [];

  for (const [start, step] of [
    [0, 8],
    [4, 8],
    [2, 4],
    [1, 2],
  ]) {
    for (let y = start; y < height; y += step) {
      rows.push(...pixels.slice(y * width, (y + 1) * width));
    }
  }

  return rows;
}

/**
 * LZW codes for `items`: numbers are literal codes, `null` is a clear code,
 * "eoi" is an end of information code. Only literal codes are written, so
 * the table grows by one entry per code, the same way the decoder's does.
 */
function lzw(minCodeSize, items, eoi) {
  const clear = 1 << minCodeSize;
  const bytes = [];
  let size = minCodeSize + 1;
  let next = clear + 2;
  let first = true;
  let bits = 0;
  let bitCount = 0;

  const emit = (code) => {
    bits |= code << bitCount;
    bitCount += size;

    while (bitCount >= 8) {
      bytes.push(bits & 0xff);
      bits >>>= 8;
      bitCount -= 8;
    }
  };

  const resetTable = () => {
    size = minCodeSize + 1;
    next = clear + 2;
    first = true;
  };

  emit(clear);

  for (const item of [...items, ...(eoi ? ["eoi"] : [])]) {
    if (item === null) {
      emit(clear);
      resetTable();
    } else if (item === "eoi") {
      emit(clear + 1);
    } else {
      emit(item);

      if (!first && next < 4096) {
        next++;

        if (next >= 1 << size && size < 12) {
          size++;
        }
      }

      first = false;
    }
  }

  if (bitCount > 0) {
    bytes.push(bits & 0xff);
  }

  return bytes;
}

const files = {};

// LZW minimum code sizes from 1 to 11. Size 1 is outside the spec (which
// asks for at least 2) but encoders write it for 2 color images.
for (let minCodeSize = 1; minCodeSize <= 11; minCodeSize++) {
  const pixels = [0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
  files[`lzw-min-code-size-${minCodeSize}`] = new Gif(4, 3, [BLACK, WHITE])
    .image({ width: 4, height: 3, pixels, minCodeSize })
    .end();
}

// The code table fills up and the encoder keeps going with 12 bit codes
// before it sends a clear code ("deferred clear")
{
  const width = 80;
  const height = 60;
  const pixels = Array.from(
    { length: width * height },
    (_, i) => ((i * 7) ^ (i >> 5)) & 3,
  );
  const codes = [...pixels.slice(0, 4500), null, ...pixels.slice(4500)];
  files["lzw-deferred-clear"] = new Gif(width, height, RGBW)
    .image({ width, height, pixels, codes })
    .end();
}

// Codes and whole sub-blocks after the end of information code
files["lzw-data-after-eoi"] = new Gif(3, 1, RGBW)
  .image({
    width: 3,
    height: 1,
    pixels: [0, 1, 2],
    after: [0xff, 0x13, 0x37, 0x42],
  })
  .end();

// More pixels than the frame holds, then an end of information code
files["lzw-too-many-pixels"] = new Gif(2, 2, RGBW)
  .image({ width: 2, height: 2, pixels: [0, 1, 2, 3, 3, 2, 1, 0] })
  .end();

// Pixel data that ends before the frame is full, without an end of
// information code
files["lzw-short-no-eoi"] = new Gif(3, 2, RGBW)
  .image({ width: 3, height: 2, pixels: [1, 2, 3], eoi: false })
  .end();

// One byte sub-blocks
files["lzw-one-byte-sub-blocks"] = new Gif(4, 4, RGBW)
  .image({
    width: 4,
    height: 4,
    pixels: Array.from({ length: 16 }, (_, i) => (i * 3) & 3),
    subBlockSize: 1,
  })
  .end();

// Unknown extensions, comments, plain text and application extensions are
// skipped
files["extensions-skipped"] = new Gif(2, 1, RGBW)
  .extension(0xfe, [[...Buffer.from("a comment")]])
  .extension(0x99, [
    [1, 2, 3],
    [4, 5, 6, 7],
  ])
  .extension(0xff, [[...Buffer.from("XMP DataXMP")], [1, 2, 3]])
  .extension(0x01, [
    [12, 0, 0, 0, 0, 2, 0, 1, 0, 8, 8, 1, 0],
    [...Buffer.from("hi")],
  ])
  .gce({ delay: 7 })
  .image({ width: 2, height: 1, pixels: [1, 2] })
  .end();

// Bytes after the trailer are ignored
files["junk-after-trailer"] = new Gif(2, 1, RGBW)
  .image({ width: 2, height: 1, pixels: [1, 2] })
  .end([0x2c, 0, 0, 0, 0, 2, 0, 1, 0, 0, 2, 2, 0x4c, 0x01, 0, 0xde, 0xad]);

// The file ends after the last frame without a trailer
files["no-trailer"] = new Gif(2, 1, RGBW)
  .gce({ delay: 20 })
  .image({ width: 2, height: 1, pixels: [1, 2] })
  .gce({ delay: 30 })
  .image({ width: 2, height: 1, pixels: [3, 0] })
  .cut(Infinity);

// A graphic control extension only applies to the image after it
files["gce-not-inherited"] = new Gif(2, 1, RGBW)
  .gce({ delay: 50, disposal: 1, transparent: 0 })
  .image({ width: 2, height: 1, pixels: [1, 2] })
  .image({ width: 2, height: 1, pixels: [0, 3] })
  .end();

// Two graphic control extensions before one image: the last one counts
files["gce-twice"] = new Gif(2, 1, RGBW)
  .gce({ delay: 50, transparent: 1 })
  .gce({ delay: 20, transparent: 0 })
  .image({ width: 2, height: 1, pixels: [0, 1] })
  .end();

// The transparent index is outside the palette
files["transparent-index-outside-palette"] = new Gif(2, 1, RGBW)
  .gce({ transparent: 200 })
  .image({ width: 2, height: 1, pixels: [1, 2] })
  .end();

// Indexes past the end of a local palette
files["index-outside-local-palette"] = new Gif(4, 1, RGBW)
  .image({
    width: 4,
    height: 1,
    pixels: [0, 1, 2, 3],
    palette: [RED, GREEN],
    minCodeSize: 2,
  })
  .end();

// Every disposal method, frames at offsets, with transparency
{
  const gif = new Gif(4, 4, [
    BLACK,
    RED,
    GREEN,
    BLUE,
    WHITE,
    0xffff00,
    0x00ffff,
    0xff00ff,
  ]);
  gif
    .gce({ disposal: 1 })
    .image({ width: 4, height: 4, pixels: new Array(16).fill(1) });
  gif
    .gce({ disposal: 2, transparent: 0 })
    .image({ x: 1, y: 1, width: 2, height: 2, pixels: [2, 0, 0, 2] });
  gif
    .gce({ disposal: 3, transparent: 0 })
    .image({ x: 2, y: 0, width: 2, height: 3, pixels: [3, 0, 3, 3, 0, 3] });
  gif
    .gce({ disposal: 0 })
    .image({ x: 0, y: 3, width: 4, height: 1, pixels: [4, 5, 6, 7] });
  gif
    .gce({ disposal: 3 })
    .image({ x: 0, y: 0, width: 1, height: 1, pixels: [5] });
  gif
    .gce({ disposal: 2 })
    .image({ x: 3, y: 3, width: 1, height: 1, pixels: [6] });
  gif
    .gce({ disposal: 5 })
    .image({ x: 1, y: 0, width: 1, height: 1, pixels: [7] });
  gif
    .gce({ disposal: 7 })
    .image({ x: 0, y: 1, width: 1, height: 1, pixels: [4] });
  gif.image({ x: 3, y: 0, width: 1, height: 1, pixels: [2] });
  files["disposal-every-method"] = gif.end();
}

// Interlaced frames that are partly outside the logical screen, with heights
// that leave some passes empty
{
  const gif = new Gif(5, 6, [
    BLACK,
    RED,
    GREEN,
    BLUE,
    WHITE,
    0xffff00,
    0x00ffff,
    0xff00ff,
    0x808080,
    0x800000,
  ]);
  gif.image({ width: 5, height: 6, pixels: new Array(30).fill(0) });

  for (const [y, height] of [
    [0, 9],
    [2, 3],
    [4, 5],
  ]) {
    gif.image({
      x: 1,
      y,
      width: 5,
      height,
      interlaced: true,
      pixels: Array.from(
        { length: 5 * height },
        (_, i) => 1 + (Math.floor(i / 5) % 9),
      ),
    });
  }

  files["interlaced-clipped"] = gif.end();
}

// Frames that are partly or wholly outside the logical screen, after the
// first, are clipped
files["clip-later-frames"] = new Gif(3, 3, RGBW)
  .image({ width: 3, height: 3, pixels: new Array(9).fill(3) })
  .image({
    x: 2,
    y: 1,
    width: 3,
    height: 3,
    pixels: [0, 1, 2, 0, 1, 2, 0, 1, 2],
  })
  .image({ x: 3, y: 0, width: 1, height: 1, pixels: [1] })
  .image({ x: 0, y: 2, width: 1, height: 4, pixels: [1, 2, 0, 0] })
  .end();

// The first frame is larger than the logical screen, and at an offset
files["first-frame-larger"] = new Gif(2, 2, RGBW)
  .image({ x: 1, y: 1, width: 2, height: 2, pixels: [0, 1, 2, 3] })
  .image({ x: 0, y: 0, width: 4, height: 4, pixels: new Array(16).fill(1) })
  .end();

// The first frame is entirely outside the logical screen
files["first-frame-outside"] = new Gif(2, 2, RGBW)
  .image({ x: 4, y: 4, width: 1, height: 1, pixels: [1] })
  .image({ x: 0, y: 0, width: 1, height: 1, pixels: [2] })
  .end();

// A GIF87a file with a graphic control extension, which browsers still use
files["gif87a-with-gce"] = new Gif(2, 1, RGBW, { version: "87a" })
  .gce({ delay: 40, transparent: 1 })
  .image({ width: 2, height: 1, pixels: [0, 1] })
  .end();

// Loop counts
files["loop-forever"] = new Gif(1, 1, RGBW)
  .loop(0)
  .image({ width: 1, height: 1, pixels: [0] })
  .image({ width: 1, height: 1, pixels: [1] })
  .end();
files["loop-65535"] = new Gif(1, 1, RGBW)
  .loop(65535)
  .image({ width: 1, height: 1, pixels: [0] })
  .image({ width: 1, height: 1, pixels: [1] })
  .end();
files["loop-after-frames"] = new Gif(1, 1, RGBW)
  .image({ width: 1, height: 1, pixels: [0] })
  .loop(4)
  .image({ width: 1, height: 1, pixels: [1] })
  .end();
files["loop-twice"] = new Gif(1, 1, RGBW)
  .loop(2)
  .loop(7)
  .image({ width: 1, height: 1, pixels: [0] })
  .image({ width: 1, height: 1, pixels: [1] })
  .end();
files["loop-wrong-sub-block-id"] = new Gif(1, 1, RGBW)
  .loop(3, "NETSCAPE2.0", 2)
  .image({ width: 1, height: 1, pixels: [0] })
  .image({ width: 1, height: 1, pixels: [1] })
  .end();

// Truncated files
{
  const pixels = Array.from({ length: 64 }, (_, i) => (i >> 3) & 3);
  const gif = new Gif(8, 8, RGBW)
    .loop(0)
    .gce({ delay: 10 })
    .image({ width: 8, height: 8, pixels: new Array(64).fill(3) });
  const gceStart = gif.bytes.length;
  gif.gce({ delay: 20 });
  const descriptorStart = gif.bytes.length;
  gif.image({ width: 8, height: 8, pixels, subBlockSize: 4 });

  // Cut in the middle of the second frame's pixel data
  files["truncated-mid-frame"] = gif.cut(descriptorStart + 10 + 1 + 5 * 2 + 2);
  // Cut right after the second frame's image descriptor
  files["truncated-after-descriptor"] = gif.cut(descriptorStart + 10);
  // Cut in the middle of the second frame's graphic control extension
  files["truncated-in-gce"] = gif.cut(gceStart + 4);
  // The whole file, for comparison
  files["truncated-none"] = gif.end();

  const interlaced = new Gif(4, 8, RGBW).image({
    width: 4,
    height: 8,
    interlaced: true,
    pixels: Array.from({ length: 32 }, (_, i) => (i >> 2) & 3),
    subBlockSize: 2,
  });
  // Cut in the middle of an interlaced frame: rows from the first passes
  files["truncated-interlaced"] = interlaced.cut(interlaced.bytes.length - 6);
  // Cut in the middle of the first frame
  files["truncated-first-frame"] = new Gif(8, 2, RGBW)
    .image({
      width: 8,
      height: 2,
      pixels: Array.from({ length: 16 }, (_, i) => i & 3),
      subBlockSize: 2,
    })
    .cut(13 + 12 + 10 + 4);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const [name, data] of Object.entries(files)) {
  writeFileSync(path.join(out, `${name}.gif`), data);
}

console.log(`Wrote ${Object.keys(files).length} GIFs to ${out}`);
