import { ColorType } from "./constants.js";
import { unfilter } from "./filter.js";
import {
  getFilterStride,
  getImageDataSize,
  getLineBytes,
  getPasses,
} from "./interlace.js";
import type { PaletteColor, PngHeader } from "./types.js";
import { inflateZlib } from "./zlib-stream.js";

/**
 * The samples to decode to: 8 or 16 bits, or "raw" for the image's own bit
 * depth (pngjs's skipRescale)
 */
export type OutputMode = 8 | 16 | "raw" | "indexed";

export interface ImageInfo extends PngHeader {
  palette?: PaletteColor[];
  transparentColor?: number[];
}

function concat(parts: Uint8Array[]) {
  if (parts.length === 1) {
    return parts[0]!;
  }

  let length = 0;

  for (const part of parts) {
    length += part.length;
  }

  const result = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

/** Allocates the RGBA output, with a clear error if it's too big */
export function allocatePixels(
  width: number,
  height: number,
  sixteenBit: boolean,
): Uint8Array | Uint16Array {
  const length = width * height * 4;

  try {
    if (length > 2 ** 32) {
      throw new RangeError();
    }

    return sixteenBit ? new Uint16Array(length) : new Uint8Array(length);
  } catch {
    throw new Error(`Image is too large to decode: ${width}x${height} pixels`);
  }
}

/**
 * Converts one line of unfiltered samples to RGBA. Writes `count` pixels to
 * `out`, starting at sample `pos` and `step` samples apart.
 */
type LineConverter = (
  line: Uint8Array,
  start: number,
  out: Uint8Array | Uint16Array,
  pos: number,
  step: number,
  count: number,
) => void;

/** Maps samples of the given bit depth (up to 8) to output samples */
function getSampleTable(depth: number, mode: OutputMode) {
  const max = (1 << depth) - 1;
  const table = new Uint16Array(max + 1);

  for (let v = 0; v <= max; v++) {
    table[v] =
      mode === "raw"
        ? v
        : mode === 16
          ? (v * 65535) / max
          : Math.round((v * 255) / max);
  }

  return table;
}

/** Maps a 16-bit sample to an output sample */
function scale16(value: number, mode: OutputMode) {
  return mode === 16 || mode === "raw" ? value : ((value + 128) / 257) | 0;
}

function getLineConverter(info: ImageInfo, mode: OutputMode): LineConverter {
  const { colorType, depth } = info;
  const trns = info.transparentColor;

  if (colorType === ColorType.PALETTE && mode === "indexed") {
    const perByte = 8 / depth;
    const mask = (1 << depth) - 1;
    // `pos` and `step` count RGBA samples, but there's one index per pixel
    return (line, start, out, pos, step, count) => {
      pos >>= 2;
      step >>= 2;

      for (let x = 0; x < count; x++, pos += step) {
        out[pos] =
          depth === 8
            ? line[start + x]!
            : (line[start + Math.floor(x / perByte)]! >>
                (8 - depth - (x % perByte) * depth)) &
              mask;
      }
    };
  }

  if (colorType === ColorType.PALETTE) {
    // Indices outside the palette are opaque black, like libpng
    const colors = new Uint16Array(256 * 4);

    for (let i = 0; i < 256; i++) {
      const color = info.palette?.[i] ?? [0, 0, 0, 255];
      const factor = mode === 16 ? 257 : 1;

      colors[i * 4] = color[0] * factor;
      colors[i * 4 + 1] = color[1] * factor;
      colors[i * 4 + 2] = color[2] * factor;
      colors[i * 4 + 3] = color[3] * factor;
    }

    const perByte = 8 / depth;
    const mask = (1 << depth) - 1;

    return (line, start, out, pos, step, count) => {
      for (let x = 0; x < count; x++, pos += step) {
        const index =
          depth === 8
            ? line[start + x]!
            : (line[start + Math.floor(x / perByte)]! >>
                (8 - depth - (x % perByte) * depth)) &
              mask;
        const c = index * 4;

        out[pos] = colors[c]!;
        out[pos + 1] = colors[c + 1]!;
        out[pos + 2] = colors[c + 2]!;
        out[pos + 3] = colors[c + 3]!;
      }
    };
  }

  if (depth === 16) {
    const opaque = mode === 16 || mode === "raw" ? 65535 : 255;

    switch (colorType) {
      case ColorType.GRAYSCALE: {
        const transparent = trns ? trns[0]! : -1;

        return (line, start, out, pos, step, count) => {
          for (let x = 0, i = start; x < count; x++, i += 2, pos += step) {
            const value = (line[i]! << 8) | line[i + 1]!;
            const gray = scale16(value, mode);

            out[pos] = gray;
            out[pos + 1] = gray;
            out[pos + 2] = gray;
            out[pos + 3] = value === transparent ? 0 : opaque;
          }
        };
      }
      case ColorType.COLOR: {
        const [tr = -1, tg = -1, tb = -1] = trns ?? [];

        return (line, start, out, pos, step, count) => {
          for (let x = 0, i = start; x < count; x++, i += 6, pos += step) {
            const r = (line[i]! << 8) | line[i + 1]!;
            const g = (line[i + 2]! << 8) | line[i + 3]!;
            const b = (line[i + 4]! << 8) | line[i + 5]!;

            out[pos] = scale16(r, mode);
            out[pos + 1] = scale16(g, mode);
            out[pos + 2] = scale16(b, mode);
            out[pos + 3] = r === tr && g === tg && b === tb ? 0 : opaque;
          }
        };
      }
      case ColorType.GRAYSCALE_ALPHA:
        return (line, start, out, pos, step, count) => {
          for (let x = 0, i = start; x < count; x++, i += 4, pos += step) {
            const gray = scale16((line[i]! << 8) | line[i + 1]!, mode);

            out[pos] = gray;
            out[pos + 1] = gray;
            out[pos + 2] = gray;
            out[pos + 3] = scale16((line[i + 2]! << 8) | line[i + 3]!, mode);
          }
        };
      default:
        return (line, start, out, pos, step, count) => {
          for (let x = 0, i = start; x < count; x++, i += 8, pos += step) {
            out[pos] = scale16((line[i]! << 8) | line[i + 1]!, mode);
            out[pos + 1] = scale16((line[i + 2]! << 8) | line[i + 3]!, mode);
            out[pos + 2] = scale16((line[i + 4]! << 8) | line[i + 5]!, mode);
            out[pos + 3] = scale16((line[i + 6]! << 8) | line[i + 7]!, mode);
          }
        };
    }
  }

  const table = getSampleTable(depth, mode);
  const opaque = table[(1 << depth) - 1]!;
  const scaled = mode === 16;

  switch (colorType) {
    case ColorType.GRAYSCALE: {
      const transparent = trns ? trns[0]! : -1;

      if (depth === 8) {
        return (line, start, out, pos, step, count) => {
          for (let x = 0; x < count; x++, pos += step) {
            const value = line[start + x]!;
            const gray = table[value]!;

            out[pos] = gray;
            out[pos + 1] = gray;
            out[pos + 2] = gray;
            out[pos + 3] = value === transparent ? 0 : opaque;
          }
        };
      }

      const perByte = 8 / depth;
      const mask = (1 << depth) - 1;

      return (line, start, out, pos, step, count) => {
        for (let x = 0; x < count; x++, pos += step) {
          const value =
            (line[start + Math.floor(x / perByte)]! >>
              (8 - depth - (x % perByte) * depth)) &
            mask;
          const gray = table[value]!;

          out[pos] = gray;
          out[pos + 1] = gray;
          out[pos + 2] = gray;
          out[pos + 3] = value === transparent ? 0 : opaque;
        }
      };
    }
    case ColorType.COLOR: {
      const [tr = -1, tg = -1, tb = -1] = trns ?? [];

      return (line, start, out, pos, step, count) => {
        for (let x = 0, i = start; x < count; x++, i += 3, pos += step) {
          const r = line[i]!;
          const g = line[i + 1]!;
          const b = line[i + 2]!;

          out[pos] = table[r]!;
          out[pos + 1] = table[g]!;
          out[pos + 2] = table[b]!;
          out[pos + 3] = r === tr && g === tg && b === tb ? 0 : opaque;
        }
      };
    }
    case ColorType.GRAYSCALE_ALPHA:
      return (line, start, out, pos, step, count) => {
        for (let x = 0, i = start; x < count; x++, i += 2, pos += step) {
          const gray = table[line[i]!]!;

          out[pos] = gray;
          out[pos + 1] = gray;
          out[pos + 2] = gray;
          out[pos + 3] = table[line[i + 1]!]!;
        }
      };
    default:
      return (line, start, out, pos, step, count) => {
        if (step === 4 && !scaled) {
          out.set(line.subarray(start, start + count * 4), pos);
          return;
        }

        for (let x = 0, i = start; x < count; x++, i += 4, pos += step) {
          out[pos] = table[line[i]!]!;
          out[pos + 1] = table[line[i + 1]!]!;
          out[pos + 2] = table[line[i + 2]!]!;
          out[pos + 3] = table[line[i + 3]!]!;
        }
      };
  }
}

/**
 * Inflates, unfilters and de-interlaces compressed image data to RGBA
 * samples.
 */
export function decodePixels(
  info: ImageInfo,
  compressed: Uint8Array[],
  mode: OutputMode,
) {
  const { width, height } = info;
  const expected = getImageDataSize(info);
  const data = inflateZlib(concat(compressed), expected);

  if (data.length < expected) {
    throw new Error(
      `Not enough image data: expected ${expected} bytes, got ${data.length}`,
    );
  }

  const indexed = mode === "indexed" && info.colorType === ColorType.PALETTE;
  const out = indexed
    ? new Uint8Array(width * height)
    : allocatePixels(
        width,
        height,
        mode === 16 || (mode === "raw" && info.depth === 16),
      );
  const convert = getLineConverter(info, mode);
  const stride = getFilterStride(info);
  let offset = 0;

  for (const pass of getPasses(width, height, info.interlace)) {
    const lineBytes = getLineBytes(info, pass.width);

    unfilter(data, offset, lineBytes, pass.height, stride);

    for (let y = 0; y < pass.height; y++) {
      convert(
        data,
        offset + 1,
        out,
        ((pass.y + y * pass.yStep) * width + pass.x) * 4,
        pass.xStep * 4,
        pass.width,
      );
      offset += lineBytes + 1;
    }
  }

  return out;
}
