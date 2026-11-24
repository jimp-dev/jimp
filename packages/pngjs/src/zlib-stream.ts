import { inflateRaw } from "./zlib.js";

/** The most a compressed metadata chunk (zTXt, iTXt, iCCP) may inflate to */
export const MAX_METADATA_LENGTH = 16 * 1024 * 1024;

/** Deflate can't compress better than this */
const MAX_DEFLATE_RATIO = 1032;

/**
 * Inflates a zlib stream, up to `maxLength` bytes. The Adler-32 checksum at
 * the end isn't checked: like browsers, a wrong one doesn't stop the image
 * from loading. Each chunk has a CRC anyway.
 */
export function inflateZlib(data: Uint8Array, maxLength: number) {
  if (data.length < 2) {
    throw new Error("Invalid compressed data: too short");
  }

  const cmf = data[0]!;
  const flg = data[1]!;

  if ((cmf & 0x0f) !== 8 || cmf >> 4 > 7 || ((cmf << 8) | flg) % 31 !== 0) {
    throw new Error("Invalid compressed data: bad zlib header");
  }

  if (flg & 0x20) {
    throw new Error("Invalid compressed data: zlib preset dictionary");
  }

  const sizeHint = Math.min(maxLength, data.length * MAX_DEFLATE_RATIO + 1024);

  try {
    return inflateRaw(data.subarray(2), maxLength, sizeHint);
  } catch (error) {
    throw new Error(
      `Invalid compressed data: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}
