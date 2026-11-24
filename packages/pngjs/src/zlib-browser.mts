// Browsers: use pako, a port of zlib, so output matches Node's byte for byte
// and every deflate level and strategy works the same way.
import { deflate as pakoDeflate } from "pako";
import type { Z_Strategy } from "pako";

import { crc32Js } from "./crc.js";
import { inflateRawJs } from "./inflate-js.js";

export interface DeflateOptions {
  level?: number;
  strategy?: number;
  windowBits?: number;
  memLevel?: number;
  chunkSize?: number;
}

export const crc32 = crc32Js;
export const inflateRaw = inflateRawJs;

/** Compresses data to a zlib stream */
export function deflate(data: Uint8Array, options: DeflateOptions) {
  const { level, strategy, windowBits, memLevel, chunkSize } = options;

  // pako's defaults are replaced by any key that's set, even to undefined
  return pakoDeflate(
    data,
    Object.fromEntries(
      Object.entries({
        level,
        strategy: strategy as Z_Strategy | undefined,
        windowBits,
        memLevel,
        chunkSize,
      }).filter(([, value]) => value !== undefined),
    ),
  );
}
