// Browsers have no Buffer, so the data stays a Uint8Array

/** A Buffer in Node.js, a Uint8Array in browsers */
export type BufferLike = Uint8Array;

export function toBuffer(data: Uint8Array): BufferLike {
  return data;
}

export function toUint8Array(data: Uint8Array | ArrayBuffer): Uint8Array {
  return data instanceof Uint8Array ? data : new Uint8Array(data);
}
