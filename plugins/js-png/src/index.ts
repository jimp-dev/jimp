import type { PNGOptions as PNGJSOptions } from "pngjs";
import { Format } from "@jimp/types";
import { PNGFilterType, PNGColorType } from "./constants.js";
import { PNG } from "./pngjs.js";

export type { PNGOptions as PNGJSOptions } from "pngjs";
export type PNGOptions = Omit<
  PNGJSOptions,
  "filterType" | "colorType" | "inputColorType" | "inputHasAlpha"
> & {
  filterType?: PNGFilterType;
  colorType?: PNGColorType;
  inputColorType?: PNGColorType;
  /**
   * Jimp bitmaps always have an alpha channel, so this no longer describes the
   * input. Passing `false` only makes `colorType` default to
   * `PNGColorType.COLOR`, so the PNG is written without an alpha channel.
   * Passing `true` does nothing.
   *
   * @deprecated Use `colorType: PNGColorType.COLOR` instead.
   */
  inputHasAlpha?: boolean;
};

export interface DecodePngOptions {
  checkCRC?: boolean | undefined;
  skipRescale?: boolean | undefined;
}

export * from "./constants.js";

/**
 * pngjs throws on any bytes after the IEND chunk, but browsers and other
 * decoders ignore them, and tools like ffmpeg write such files. Walk the
 * chunks and return the data up to the end of IEND. If there is nothing after
 * IEND, or the chunks can't be walked, return the data as is so pngjs reports
 * its own error.
 */
function trimTrailingData(data: Buffer) {
  // The 8-byte signature, then chunks of: 4-byte length, 4-byte type, data,
  // 4-byte CRC.
  let offset = 8;

  while (offset + 8 <= data.length) {
    const length =
      data[offset]! * 0x1000000 +
      ((data[offset + 1]! << 16) |
        (data[offset + 2]! << 8) |
        data[offset + 3]!);
    const end = offset + 12 + length;

    if (end > data.length) {
      return data;
    }

    if (
      data[offset + 4] === 0x49 && // I
      data[offset + 5] === 0x45 && // E
      data[offset + 6] === 0x4e && // N
      data[offset + 7] === 0x44 // D
    ) {
      return end < data.length ? data.subarray(0, end) : data;
    }

    offset = end;
  }

  return data;
}

/**
 * Pick the smallest colour type that stores the RGBA bitmap without loss:
 * drop the alpha channel if every pixel is opaque, and the colour channels if
 * every pixel has R = G = B.
 */
function getLosslessColorType(data: Buffer) {
  let hasAlpha = false;
  let hasColor = false;

  for (let i = 0; i < data.length; i += 4) {
    if (!hasAlpha && data[i + 3] !== 255) {
      hasAlpha = true;

      if (hasColor) {
        break;
      }
    }

    if (!hasColor && (data[i] !== data[i + 1] || data[i] !== data[i + 2])) {
      hasColor = true;

      if (hasAlpha) {
        break;
      }
    }
  }

  if (hasColor) {
    return hasAlpha ? PNGColorType.COLOR_ALPHA : PNGColorType.COLOR;
  }

  return hasAlpha ? PNGColorType.GRAYSCALE_ALPHA : PNGColorType.GRAYSCALE;
}

export default function png() {
  return {
    mime: "image/png",
    hasAlpha: true,
    encode: (
      bitmap,
      {
        deflateLevel = 9,
        deflateStrategy = 3,
        filterType = PNGFilterType.AUTO,
        colorType,
        inputHasAlpha,
        ...options
      }: PNGOptions = {}
    ) => {
      const png = new PNG({
        width: bitmap.width,
        height: bitmap.height,
      });

      png.data = bitmap.data;

      return PNG.sync.write(png, {
        ...options,
        deflateLevel,
        deflateStrategy,
        filterType,
        colorType:
          typeof colorType !== "undefined"
            ? colorType
            : inputHasAlpha === false
              ? PNGColorType.COLOR
              : getLosslessColorType(bitmap.data),
        // The bitmap is always RGBA. Telling pngjs otherwise makes it read the
        // data as RGB, which garbles the image.
        inputHasAlpha: true,
      });
    },
    decode: (data, options?: DecodePngOptions) => {
      const result = PNG.sync.read(trimTrailingData(data), options);

      return {
        data: result.data,
        width: result.width,
        height: result.height,
      };
    },
  } satisfies Format<"image/png">;
}
