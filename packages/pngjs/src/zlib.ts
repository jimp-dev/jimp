// Node.js: use the native zlib. Browsers use zlib-browser.mts instead.
import { constants as bufferConstants } from "node:buffer";
import * as zlib from "node:zlib";

import { crc32Js } from "./crc.js";
import { inflateRawJs } from "./inflate-js.js";

export interface DeflateOptions {
  level?: number;
  strategy?: number;
  windowBits?: number;
  memLevel?: number;
  chunkSize?: number;
}

/**
 * zlib.crc32 is native from Node 22.2. It returns the same unsigned CRC-32 as
 * crc32Js.
 */
export const crc32: (data: Uint8Array, crc?: number) => number =
  typeof zlib.crc32 === "function"
    ? (data, crc = 0) => zlib.crc32(data, crc)
    : crc32Js;

/**
 * Inflates raw deflate data, up to `maxLength` bytes. Data that ends early
 * returns what it inflated so far.
 */
export function inflateRaw(
  data: Uint8Array,
  maxLength: number,
  sizeHint = maxLength,
): Uint8Array {
  try {
    return zlib.inflateRawSync(data, {
      // Don't throw on truncated data, the caller checks the length
      finishFlush: zlib.constants.Z_SYNC_FLUSH,
      maxOutputLength: Math.min(maxLength, bufferConstants.MAX_LENGTH),
      chunkSize: Math.max(
        Math.min(sizeHint, maxLength, 64 * 1024 * 1024),
        zlib.constants.Z_MIN_CHUNK,
      ),
    });
  } catch (error) {
    // There's more data than asked for. Native zlib can't stop early, so use
    // pako, which can. This is rare: only broken encoders write extra data.
    if ((error as { code?: string }).code === "ERR_BUFFER_TOO_LARGE") {
      return inflateRawJs(data, maxLength, sizeHint);
    }

    throw error;
  }
}

/** Compresses data to a zlib stream */
export function deflate(data: Uint8Array, options: DeflateOptions) {
  return zlib.deflateSync(data, options) as Uint8Array;
}
