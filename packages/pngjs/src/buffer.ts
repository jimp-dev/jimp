// Node.js: hand out Buffers, like pngjs did. Browsers use buffer-browser.mts.
import { Buffer } from "node:buffer";

/** A Buffer in Node.js, a Uint8Array in browsers */
export type BufferLike = Buffer;

/** Wraps bytes in a Buffer without copying them */
export function toBuffer(data: Uint8Array): BufferLike {
  return Buffer.isBuffer(data)
    ? data
    : Buffer.from(data.buffer, data.byteOffset, data.byteLength);
}

export function toUint8Array(data: Uint8Array | ArrayBuffer): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}
