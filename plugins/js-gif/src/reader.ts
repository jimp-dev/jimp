/**
 * Reads a GIF the way browsers draw it. Written from the GIF89a
 * specification, following what Chromium and Firefox do where the
 * specification is silent or files break it (see test/corpus). It replaces
 * omggif's GifReader (https://github.com/deanm/omggif, MIT, © 2013 Dean
 * McNamee).
 *
 * - A graphic control extension only applies to the image right after it.
 * - The image is the logical screen, grown to fit the first frame if that's
 *   larger. Parts of later frames outside it are clipped.
 * - Frames start from a transparent image, and disposing to the background
 *   clears to transparent. Disposal method 4 restores the previous image,
 *   like 3.
 * - A file that ends part-way through a frame keeps the pixels decoded so
 *   far, and so does LZW data with an invalid code. Pixels that weren't
 *   decoded show the frame before, unless the frame covers the whole image
 *   without a transparent color: then they're transparent.
 * - Palette indexes without a color are opaque black.
 * - Unknown extensions are skipped. Parsing stops at the trailer, or at a
 *   block that isn't an extension or an image.
 */

const EXTENSION = 0x21;
const IMAGE = 0x2c;
const GRAPHIC_CONTROL = 0xf9;
const APPLICATION = 0xff;

/** What happens to a frame's area before the next frame is drawn */
const DISPOSE_TO_BACKGROUND = 2;
const DISPOSE_TO_PREVIOUS = 3;

/** Browsers treat 4 like 3, which some encoders write by mistake */
function toDisposal(value: number) {
  return value === 4 ? DISPOSE_TO_PREVIOUS : value;
}

/** LZW codes are at most 12 bits */
const MAX_CODES = 4096;

export interface GifFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  interlaced: boolean;
  /** RGB triples of the local palette, or else the global one */
  palette: Uint8Array | undefined;
  transparentIndex: number | null;
  /** In hundredths of a second */
  delay: number;
  disposal: number;
  minCodeSize: number;
  /** Offset of the first data sub-block */
  dataStart: number;
  /** Bytes of LZW data in the sub-blocks */
  dataLength: number;
}

export interface GifInfo {
  /** The logical screen, grown to fit the first frame */
  width: number;
  height: number;
  /** NETSCAPE2.0 loop count: 0 is forever, null when there isn't one */
  loop: number | null;
  frames: GifFrame[];
}

/**
 * Parse a GIF's blocks without decoding any pixels. Only the first
 * `maxFrames` frames are kept. Throws if the file doesn't start with a GIF
 * header and logical screen descriptor.
 */
export function readGif(data: Uint8Array, maxFrames = Infinity): GifInfo {
  const length = data.length;

  if (
    length < 13 ||
    data[0] !== 0x47 ||
    data[1] !== 0x49 ||
    data[2] !== 0x46 ||
    data[3] !== 0x38 ||
    (data[4] !== 0x37 && data[4] !== 0x39) ||
    data[5] !== 0x61
  ) {
    throw new Error("Invalid GIF file: missing GIF87a or GIF89a header");
  }

  const short = (p: number) => data[p]! | (data[p + 1]! << 8);
  const screenWidth = short(6);
  const screenHeight = short(8);
  const screenFlags = data[10]!;
  let p = 13;
  let globalPalette: Uint8Array | undefined;

  if (screenFlags & 0x80) {
    const size = 3 << ((screenFlags & 7) + 1);

    if (p + size > length) {
      return gifInfo(screenWidth, screenHeight, null, []);
    }

    globalPalette = data.subarray(p, p + size);
    p += size;
  }

  const frames: GifFrame[] = [];
  let loop: number | null = null;
  let control: Pick<GifFrame, "delay" | "disposal" | "transparentIndex"> = {
    delay: 0,
    disposal: 0,
    transparentIndex: null,
  };
  let hasControl = false;

  /** Skip sub-blocks, returning the bytes in them or -1 at the end of data */
  const skipSubBlocks = () => {
    let total = 0;

    while (p < length) {
      const size = data[p++]!;

      if (size === 0) {
        return total;
      }

      p += size;
      total += size;
    }

    return -1;
  };

  while (p < length) {
    const block = data[p++];

    if (block === EXTENSION) {
      const label = data[p++];
      const start = p;

      if (skipSubBlocks() < 0) {
        break;
      }

      const firstSize = data[start]!;

      if (label === GRAPHIC_CONTROL && firstSize >= 4) {
        const flags = data[start + 1]!;

        control = {
          disposal: toDisposal((flags >> 2) & 7),
          delay: short(start + 2),
          transparentIndex: flags & 1 ? data[start + 4]! : null,
        };
        hasControl = true;
      } else if (
        label === APPLICATION &&
        firstSize === 11 &&
        isLoopExtension(data, start + 1)
      ) {
        // Browsers use the last loop count
        loop = readLoopCount(data, start + 12) ?? loop;
      }
    } else if (block === IMAGE) {
      if (p + 9 > length) {
        break;
      }

      const flags = data[p + 8]!;
      let palette = globalPalette;
      let q = p + 9;

      if (flags & 0x80) {
        const size = 3 << ((flags & 7) + 1);

        palette = data.subarray(q, q + size);
        q += size;
      }

      // Browsers show a frame whose data was cut off by the end of the file
      // as the frame before it, but a file needs some data to be an image
      const isCutOff = q >= length;

      if (isCutOff && frames.length === 0) {
        break;
      }

      const frame: GifFrame = {
        x: short(p),
        y: short(p + 2),
        width: short(p + 4),
        height: short(p + 6),
        interlaced: (flags & 0x40) !== 0,
        palette,
        ...(hasControl
          ? control
          : { delay: 0, disposal: 0, transparentIndex: null }),
        minCodeSize: isCutOff ? 0 : data[q]!,
        dataStart: q + 1,
        dataLength: 0,
      };

      p = q + 1;
      hasControl = false;

      const dataLength = skipSubBlocks();

      if (frames.length < maxFrames) {
        // A frame cut off by the end of the file keeps what was decoded
        frame.dataLength =
          dataLength < 0 ? countSubBlocks(data, frame.dataStart) : dataLength;
        frames.push(frame);
      }

      if (dataLength < 0) {
        break;
      }
    } else {
      // The trailer, or something that isn't a GIF block
      break;
    }
  }

  return gifInfo(screenWidth, screenHeight, loop, frames);
}

/** Browsers grow the image to fit the first frame, but not later ones */
function gifInfo(
  screenWidth: number,
  screenHeight: number,
  loop: number | null,
  frames: GifFrame[]
): GifInfo {
  const first = frames[0];

  return {
    width: first ? Math.max(screenWidth, first.x + first.width) : screenWidth,
    height: first
      ? Math.max(screenHeight, first.y + first.height)
      : screenHeight,
    loop,
    frames,
  };
}

const NETSCAPE = "NETSCAPE2.0";
const ANIMEXTS = "ANIMEXTS1.0";

function isLoopExtension(data: Uint8Array, p: number) {
  const matches = (id: string) => {
    for (let i = 0; i < id.length; i++) {
      if (data[p + i] !== id.charCodeAt(i)) {
        return false;
      }
    }

    return true;
  };

  return matches(NETSCAPE) || matches(ANIMEXTS);
}

/** The loop count from the sub-blocks after the application identifier */
function readLoopCount(data: Uint8Array, p: number) {
  while (p < data.length) {
    const size = data[p]!;

    if (size === 0) {
      break;
    }

    if (size >= 3 && data[p + 1] === 1 && p + 3 < data.length) {
      return data[p + 2]! | (data[p + 3]! << 8);
    }

    p += size + 1;
  }

  return null;
}

/** Bytes of data in the sub-blocks from `p`, up to the end of the file */
function countSubBlocks(data: Uint8Array, p: number) {
  let total = 0;

  while (p < data.length) {
    const size = data[p]!;

    if (size === 0) {
      break;
    }

    total += Math.min(size, data.length - p - 1);
    p += size + 1;
  }

  return total;
}

/**
 * The LZW code table. Codes after the end of information code are a string
 * of indexes: the string of their prefix code plus a suffix index. Codes
 * below the clear code are a single index, so they aren't stored.
 */
const prefixes = new Uint16Array(MAX_CODES);
const suffixes = new Uint8Array(MAX_CODES);
const firstIndexes = new Uint8Array(MAX_CODES);
const lengths = new Uint16Array(MAX_CODES);

/**
 * Decode a frame's LZW data into palette indexes, in the order they're
 * stored. Stops at the end of information code, an invalid code, the end of
 * the data, or when `indexes` is full. Returns how many were decoded.
 */
function decodeIndexes(data: Uint8Array, frame: GifFrame, indexes: Uint8Array) {
  const { minCodeSize } = frame;
  const total = indexes.length;

  if (minCodeSize < 1 || minCodeSize > 11 || total === 0) {
    return 0;
  }

  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  const firstIndexOf = (code: number) =>
    code < clearCode ? code : firstIndexes[code]!;
  const lengthOf = (code: number) => (code < clearCode ? 1 : lengths[code]!);

  let codeSize = minCodeSize + 1;
  let codeMask = (1 << codeSize) - 1;
  let nextCode = eoiCode + 1;
  let previous = -1;
  let count = 0;

  // Read codes across the sub-blocks
  const end = data.length;
  let p = frame.dataStart;
  let blockEnd = p;
  let bits = 0;
  let bitCount = 0;

  while (count < total) {
    while (bitCount < codeSize) {
      if (p >= blockEnd) {
        const size = p < end ? data[p]! : 0;

        if (size === 0) {
          return count;
        }

        p++;
        blockEnd = Math.min(p + size, end);

        if (p >= blockEnd) {
          return count;
        }
      }

      bits |= data[p++]! << bitCount;
      bitCount += 8;
    }

    const code = bits & codeMask;

    bits >>>= codeSize;
    bitCount -= codeSize;

    if (code === clearCode) {
      codeSize = minCodeSize + 1;
      codeMask = (1 << codeSize) - 1;
      nextCode = eoiCode + 1;
      previous = -1;
      continue;
    }

    if (code === eoiCode) {
      break;
    }

    // The first code after a clear code must be an index, and later codes
    // can be at most the next entry
    if (previous === -1 ? code > clearCode : code > nextCode) {
      break;
    }

    // Once the table is full, codes are read without adding entries until
    // the next clear code
    if (previous !== -1 && nextCode < MAX_CODES) {
      // The new entry is the previous string and the first index of this
      // one, which is also the first index of the previous one if this code
      // is the entry being added
      prefixes[nextCode] = previous;
      suffixes[nextCode] = firstIndexOf(code === nextCode ? previous : code);
      firstIndexes[nextCode] = firstIndexOf(previous);
      lengths[nextCode] = lengthOf(previous) + 1;
      nextCode++;

      if (nextCode > codeMask && codeSize < 12) {
        codeSize++;
        codeMask = (1 << codeSize) - 1;
      }
    }

    // Write the string from its end, dropping what doesn't fit
    let entry = code;
    let last = count + lengthOf(code) - 1;
    const next = Math.min(last + 1, total);

    while (last >= total) {
      entry = prefixes[entry]!;
      last--;
    }

    while (entry >= clearCode) {
      indexes[last--] = suffixes[entry]!;
      entry = prefixes[entry]!;
    }

    indexes[last] = entry;
    count = next;
    previous = code;
  }

  return count;
}

/**
 * GIF LZW codes are at most 12 bits, and an n-bit code can only refer to a
 * table entry shorter than 2^n pixels. So one byte of frame data decodes to
 * at most 8 * 4096 / 12 pixels.
 */
const MAX_PIXELS_PER_BYTE = (8 * 4096) / 12;

/** The rows of an interlaced image are stored in four passes */
const INTERLACE_PASSES = [
  [0, 8],
  [4, 8],
  [2, 4],
  [1, 2],
] as const;

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The part of a frame inside the image */
function clip(frame: Rect, width: number, height: number): Rect {
  const clipped = {
    x: frame.x,
    y: frame.y,
    width: Math.max(0, Math.min(frame.width, width - frame.x)),
    height: Math.max(0, Math.min(frame.height, height - frame.y)),
  };

  return clipped.width > 0 && clipped.height > 0
    ? clipped
    : { x: 0, y: 0, width: 0, height: 0 };
}

function readRect(pixels: Uint32Array, width: number, rect: Rect) {
  const saved = new Uint32Array(rect.width * rect.height);

  for (let row = 0; row < rect.height; row++) {
    const start = (rect.y + row) * width + rect.x;
    saved.set(pixels.subarray(start, start + rect.width), row * rect.width);
  }

  return saved;
}

/** Copy pixels into a rectangle, or clear it to transparent */
function writeRect(
  pixels: Uint32Array,
  width: number,
  rect: Rect,
  saved?: Uint32Array
) {
  for (let row = 0; row < rect.height; row++) {
    const start = (rect.y + row) * width + rect.x;

    if (saved) {
      pixels.set(
        saved.subarray(row * rect.width, (row + 1) * rect.width),
        start
      );
    } else {
      pixels.fill(0, start, start + rect.width);
    }
  }
}

/**
 * Decode each frame and draw it over the previous ones, following their
 * disposal methods. Yields the RGBA image shown at each frame. It's the same
 * buffer every time, so copy it to keep it.
 *
 * Check the sizes in `gif` before calling this: it allocates the image, and
 * a buffer for each frame's palette indexes that is no larger than the
 * frame or what its data can hold.
 */
export function* drawFrames(data: Uint8Array, gif: GifInfo) {
  const { width, height } = gif;
  const image = new Uint8Array(width * height * 4);
  // Pixels are written as 32 bit words, so the byte order is RGBA on any
  // platform
  const pixels = new Uint32Array(image.buffer);
  const colors = new Uint32Array(256);
  const colorBytes = new Uint8Array(colors.buffer);
  let indexes = new Uint8Array(0);
  let disposal = 0;
  let disposed: Rect = { x: 0, y: 0, width: 0, height: 0 };
  let saved: Uint32Array | undefined;

  for (const frame of gif.frames) {
    if (disposal === DISPOSE_TO_BACKGROUND) {
      writeRect(pixels, width, disposed);
    } else if (disposal === DISPOSE_TO_PREVIOUS && saved) {
      writeRect(pixels, width, disposed, saved);
    }

    const rect = clip(frame, width, height);

    disposal = frame.disposal;
    disposed = rect;
    saved =
      disposal === DISPOSE_TO_PREVIOUS
        ? readRect(pixels, width, rect)
        : undefined;

    // Only decode up to the last row that's drawn, and no more than the
    // data can hold
    const shown = frame.width * rowsShown(frame, rect.height);
    const size = Math.min(
      shown,
      Math.ceil(frame.dataLength * MAX_PIXELS_PER_BYTE)
    );

    if (indexes.length < size) {
      indexes = new Uint8Array(size);
    }

    const count = decodeIndexes(data, frame, indexes.subarray(0, size));

    // A frame that covers the image without transparency replaces it, so
    // browsers draw it on a clear image. That only shows when its data is cut
    // short: the missing pixels are transparent.
    if (
      count < shown &&
      frame.transparentIndex === null &&
      rect.x === 0 &&
      rect.y === 0 &&
      rect.width === width &&
      rect.height === height
    ) {
      pixels.fill(0);
    }

    setColors(colorBytes, frame.palette);
    drawIndexes(pixels, width, frame, rect, indexes, count, colors);

    yield image;
  }
}

/**
 * How many of a frame's rows, in the order they're stored, it takes to
 * reach every row above `height`
 */
function rowsShown(frame: GifFrame, height: number) {
  if (height <= 0) {
    return 0;
  }

  if (!frame.interlaced) {
    return height;
  }

  // The rows of the passes before the last one that has a row above
  // `height`, and that pass's rows above it
  let rows = 0;
  let shown = 0;

  for (const [first, step] of INTERLACE_PASSES) {
    if (first < height) {
      shown = rows + Math.ceil((height - first) / step);
    }

    rows += Math.max(0, Math.ceil((frame.height - first) / step));
  }

  return shown;
}

/** Fill the color table from RGB triples, leaving the rest opaque black */
function setColors(colorBytes: Uint8Array, palette: Uint8Array | undefined) {
  // A local palette can be cut short by the end of the file
  const size = palette ? Math.floor(palette.length / 3) : 0;

  for (let i = 0; i < 256; i++) {
    const p = i * 4;

    if (i < size) {
      colorBytes[p] = palette![i * 3]!;
      colorBytes[p + 1] = palette![i * 3 + 1]!;
      colorBytes[p + 2] = palette![i * 3 + 2]!;
    } else {
      colorBytes[p] = 0;
      colorBytes[p + 1] = 0;
      colorBytes[p + 2] = 0;
    }

    colorBytes[p + 3] = 255;
  }
}

/** Draw the first `count` decoded indexes of a frame inside `rect` */
function drawIndexes(
  pixels: Uint32Array,
  width: number,
  frame: GifFrame,
  rect: Rect,
  indexes: Uint8Array,
  count: number,
  colors: Uint32Array
) {
  if (rect.width === 0 || rect.height === 0 || count === 0) {
    return;
  }

  const transparent = frame.transparentIndex ?? -1;
  // Rows that have decoded pixels, the last one maybe only partly
  const rows = Math.ceil(count / frame.width);

  /** Draw the `row`th stored row at `y` in the frame */
  const drawRow = (row: number, y: number) => {
    const start = row * frame.width;
    const length = Math.min(rect.width, count - start);

    if (y >= rect.height) {
      return;
    }

    const offset = (rect.y + y) * width + rect.x;

    for (let x = 0; x < length; x++) {
      const index = indexes[start + x]!;

      if (index !== transparent) {
        pixels[offset + x] = colors[index]!;
      }
    }
  };

  if (frame.interlaced) {
    let row = 0;

    for (const [first, step] of INTERLACE_PASSES) {
      for (let y = first; y < frame.height && row < rows; y += step) {
        drawRow(row++, y);
      }
    }
  } else {
    for (let y = 0; y < Math.min(rows, rect.height); y++) {
      drawRow(y, y);
    }
  }
}
