import { ALLOWED_BIT_DEPTHS, ColorType } from "./constants.js";
import type { BitDepth } from "./constants.js";
import type { Pass } from "./interlace.js";
import { getLineBytes } from "./interlace.js";
import type { PngHeader } from "./types.js";

/** RGBA samples, 8 or 16 bits each */
export interface PixelSource {
  width: number;
  height: number;
  data: Uint8Array | Uint16Array;
  depth: 8 | 16;
}

/** What encode() needs to know about the pixels to pick a format */
export interface PixelStats {
  /** Every pixel has R = G = B */
  gray: boolean;
  /** Every pixel has full alpha */
  opaque: boolean;
  /** The 16-bit samples all survive a trip through 8 bits */
  fits8: boolean;
  /**
   * The smallest bit depth that stores the gray levels without loss, for
   * opaque gray images
   */
  grayDepth: BitDepth;
  /**
   * The distinct colours, as 0xRRGGBBAA at 8 bits, mapped to the order they
   * appear in. Undefined if there are more than 256.
   */
  colors?: Map<number, number>;
}

/** Scans the pixels, stopping once nothing more can be learned */
export function getPixelStats(source: PixelSource): PixelStats {
  const { data, depth } = source;
  const length = source.width * source.height * 4;
  let gray = true;
  let opaque = true;
  let fits8 = depth === 8;
  // Bit 1, 2 and 4 are set while those gray depths are lossless
  let grayDepths = 1 | 2 | 4;
  let colors: Map<number, number> | undefined = new Map();
  let lastKey = -1;
  const max = depth === 16 ? 65535 : 255;

  if (depth === 16) {
    fits8 = true;

    for (let i = 0; i < length; i++) {
      if (data[i]! % 257 !== 0) {
        fits8 = false;
        break;
      }
    }
  }

  // Colours are counted at 8 bits, which is only lossless if fits8
  const shift = depth === 16 ? 8 : 0;

  if (depth === 16 && !fits8) {
    colors = undefined;
  }

  for (let i = 0; i < length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const a = data[i + 3]!;

    if (a !== max) {
      opaque = false;
    }

    if (gray) {
      if (r !== g || r !== b) {
        gray = false;
      } else if (grayDepths && depth === 8) {
        if (r % 17 !== 0) {
          grayDepths = 0;
        } else if (r % 85 !== 0) {
          grayDepths &= 4;
        } else if (r !== 0 && r !== 255) {
          grayDepths &= 2 | 4;
        }
      }
    }

    if (colors) {
      const key =
        (((r >> shift) << 24) |
          ((g >> shift) << 16) |
          ((b >> shift) << 8) |
          (a >> shift)) >>>
        0;

      if (key !== lastKey) {
        lastKey = key;

        if (!colors.has(key)) {
          if (colors.size === 256) {
            colors = undefined;
          } else {
            colors.set(key, colors.size);
          }
        }
      }
    }

    if (!gray && !opaque && !colors) {
      break;
    }
  }

  let grayDepth: BitDepth = depth === 16 && !fits8 ? 16 : 8;

  if (depth === 8 || fits8) {
    if (grayDepths & 1) {
      grayDepth = 1;
    } else if (grayDepths & 2) {
      grayDepth = 2;
    } else if (grayDepths & 4) {
      grayDepth = 4;
    }
  }

  // The 16-bit gray check above only ran for 8-bit data
  if (depth === 16 && fits8 && gray) {
    grayDepth = getGrayDepth16(data, length);
  }

  return { gray, opaque, fits8, grayDepth, colors };
}

function getGrayDepth16(data: Uint8Array | Uint16Array, length: number) {
  let grayDepths = 1 | 2 | 4;

  for (let i = 0; i < length && grayDepths; i += 4) {
    const v = data[i]! / 257;

    if (v % 17 !== 0) {
      grayDepths = 0;
    } else if (v % 85 !== 0) {
      grayDepths &= 4;
    } else if (v !== 0 && v !== 255) {
      grayDepths &= 2 | 4;
    }
  }

  return grayDepths & 1 ? 1 : grayDepths & 2 ? 2 : grayDepths & 4 ? 4 : 8;
}

function getPaletteDepth(count: number): BitDepth {
  return count <= 2 ? 1 : count <= 4 ? 2 : count <= 16 ? 4 : 8;
}

/** Picks the colour type and bit depth to write */
export function chooseFormat(
  source: PixelSource,
  stats: PixelStats,
  colorType?: ColorType,
  bitDepth?: BitDepth,
): { colorType: ColorType; depth: BitDepth } {
  const { gray, opaque, colors } = stats;
  const wide = source.depth === 16 && !stats.fits8;

  if (colorType === undefined) {
    const direct = gray
      ? opaque
        ? ColorType.GRAYSCALE
        : ColorType.GRAYSCALE_ALPHA
      : opaque
        ? ColorType.COLOR
        : ColorType.COLOR_ALPHA;

    if (bitDepth === 16 || wide) {
      colorType = direct;
    } else if (gray && opaque && stats.grayDepth <= (bitDepth ?? 8)) {
      colorType = ColorType.GRAYSCALE;
    } else if (colors && colors.size <= 2 ** (bitDepth ?? 8)) {
      colorType = ColorType.PALETTE;
    } else if (bitDepth === undefined || bitDepth === 8) {
      colorType = direct;
    } else {
      throw new Error(
        `The image can't be stored with a bit depth of ${bitDepth} without loss. Set colorType to convert it.`,
      );
    }
  }

  if (bitDepth === undefined) {
    if (colorType === ColorType.PALETTE) {
      if (!colors) {
        throw new Error(
          "The image has more than 256 colors, so it can't be written as a palette image",
        );
      }

      bitDepth = getPaletteDepth(colors.size);
    } else if (wide) {
      bitDepth = 16;
    } else if (colorType === ColorType.GRAYSCALE && gray && opaque) {
      bitDepth = stats.grayDepth;
    } else {
      bitDepth = 8;
    }
  }

  if (!ALLOWED_BIT_DEPTHS[colorType]?.includes(bitDepth)) {
    throw new Error(
      `Bit depth ${bitDepth} isn't allowed for color type ${colorType}`,
    );
  }

  if (
    colorType === ColorType.PALETTE &&
    (!colors || colors.size > 2 ** bitDepth)
  ) {
    throw new Error(
      `The image has more than ${2 ** bitDepth} colors, so it can't be written as a palette image with a bit depth of ${bitDepth}`,
    );
  }

  return { colorType, depth: bitDepth };
}

/** The PLTE and tRNS data, and each colour's index */
export interface Palette {
  plte: Uint8Array;
  trns?: Uint8Array;
  indices: Map<number, number>;
}

/**
 * Orders the palette with transparent colours first, so the tRNS chunk can
 * stop at the last of them. Otherwise colours keep the order they appear in.
 */
export function buildPalette(colors: Map<number, number>): Palette {
  const keys = [...colors.keys()];
  const sorted = [
    ...keys.filter((key) => (key & 0xff) !== 0xff),
    ...keys.filter((key) => (key & 0xff) === 0xff),
  ];
  const plte = new Uint8Array(sorted.length * 3);
  const alpha: number[] = [];
  const indices = new Map<number, number>();

  sorted.forEach((key, i) => {
    plte[i * 3] = key >>> 24;
    plte[i * 3 + 1] = (key >>> 16) & 0xff;
    plte[i * 3 + 2] = (key >>> 8) & 0xff;

    if ((key & 0xff) !== 0xff) {
      alpha.push(key & 0xff);
    }

    indices.set(key, i);
  });

  return {
    plte,
    trns: alpha.length ? new Uint8Array(alpha) : undefined,
    indices,
  };
}

export interface PackOptions {
  /** Blends transparent pixels with this when there's no alpha channel */
  background: { red: number; green: number; blue: number };
  palette?: Palette;
  /**
   * Converts colour to gray, on the working scale (8 or 16 bits). Defaults
   * to the mean of R, G and B.
   */
  toGray?: (r: number, g: number, b: number) => number;
}

function defaultGray(r: number, g: number, b: number) {
  return Math.round((r + g + b) / 3);
}

/**
 * Converts RGBA pixels to the lines of a pass, packed in the PNG's format,
 * without filter bytes.
 */
export function packPass(
  source: PixelSource,
  header: PngHeader,
  pass: Pass,
  options: PackOptions,
) {
  const { data, width } = source;
  const { colorType, depth } = header;
  const lineBytes = getLineBytes(header, pass.width);
  const step = pass.xStep * 4;

  // RGBA at 8 bits, not interlaced: the source is already in the format
  if (
    colorType === ColorType.COLOR_ALPHA &&
    depth === 8 &&
    source.depth === 8 &&
    pass.xStep === 1 &&
    pass.yStep === 1
  ) {
    return (data as Uint8Array).subarray(0, lineBytes * pass.height);
  }

  const out = new Uint8Array(lineBytes * pass.height);

  // Samples are converted to the working depth, 8 or 16 bits, then to the
  // output depth if that's lower
  const working = depth === 16 ? 16 : 8;
  const max = working === 16 ? 65535 : 255;
  const fromSource =
    source.depth === working
      ? undefined
      : source.depth === 8
        ? (v: number) => v * 257
        : (v: number) => ((v + 128) / 257) | 0;
  const bg = options.background;
  const hasAlpha =
    colorType === ColorType.COLOR_ALPHA ||
    colorType === ColorType.GRAYSCALE_ALPHA;
  const toGray = options.toGray ?? defaultGray;
  const indices = options.palette?.indices;
  const lowMax = (1 << depth) - 1;
  let o = 0;

  for (let y = 0; y < pass.height; y++) {
    let i = ((pass.y + y * pass.yStep) * width + pass.x) * 4;
    // For bit depths under 8: the bits waiting to be written
    let byte = 0;
    let bits = 0;

    for (let x = 0; x < pass.width; x++, i += step) {
      if (indices) {
        const shift = source.depth === 16 ? 8 : 0;
        const key =
          (((data[i]! >> shift) << 24) |
            ((data[i + 1]! >> shift) << 16) |
            ((data[i + 2]! >> shift) << 8) |
            (data[i + 3]! >> shift)) >>>
          0;
        const index = indices.get(key);

        if (index === undefined) {
          throw new Error("The palette doesn't have every color of the image");
        }

        if (depth === 8) {
          out[o++] = index;
        } else {
          byte = (byte << depth) | index;
          bits += depth;

          if (bits === 8) {
            out[o++] = byte;
            byte = 0;
            bits = 0;
          }
        }

        continue;
      }

      let r = data[i]!;
      let g = data[i + 1]!;
      let b = data[i + 2]!;
      let a = data[i + 3]!;

      if (fromSource) {
        r = fromSource(r);
        g = fromSource(g);
        b = fromSource(b);
        a = fromSource(a);
      }

      if (!hasAlpha && a !== max) {
        const f = a / max;

        r = Math.round((1 - f) * bg.red + f * r);
        g = Math.round((1 - f) * bg.green + f * g);
        b = Math.round((1 - f) * bg.blue + f * b);
      }

      switch (colorType) {
        case ColorType.GRAYSCALE:
        case ColorType.GRAYSCALE_ALPHA: {
          let v = r === g && r === b ? r : toGray(r, g, b);

          if (v < 0) {
            v = 0;
          } else if (v > max) {
            v = max;
          }

          if (depth < 8) {
            byte = (byte << depth) | Math.round((v * lowMax) / 255);
            bits += depth;

            if (bits === 8) {
              out[o++] = byte;
              byte = 0;
              bits = 0;
            }
          } else if (depth === 8) {
            out[o++] = v;

            if (hasAlpha) {
              out[o++] = a;
            }
          } else {
            out[o++] = v >> 8;
            out[o++] = v & 0xff;

            if (hasAlpha) {
              out[o++] = a >> 8;
              out[o++] = a & 0xff;
            }
          }

          break;
        }
        default:
          if (depth === 8) {
            out[o++] = r;
            out[o++] = g;
            out[o++] = b;

            if (hasAlpha) {
              out[o++] = a;
            }
          } else {
            out[o++] = r >> 8;
            out[o++] = r & 0xff;
            out[o++] = g >> 8;
            out[o++] = g & 0xff;
            out[o++] = b >> 8;
            out[o++] = b & 0xff;

            if (hasAlpha) {
              out[o++] = a >> 8;
              out[o++] = a & 0xff;
            }
          }
      }
    }

    if (bits > 0) {
      out[o++] = byte << (8 - bits);
    }
  }

  return out;
}
