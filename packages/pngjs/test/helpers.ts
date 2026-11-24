import { PNG_SIGNATURE } from "../src/constants.js";
import { makeChunk } from "../src/encode.js";
import { deflate } from "../src/zlib.js";

export { makeChunk };

export function concat(...parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

export function ihdr(
  width: number,
  height: number,
  depth = 8,
  colorType = 6,
  interlace = 0,
) {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);

  view.setUint32(0, width);
  view.setUint32(4, height);
  data[8] = depth;
  data[9] = colorType;
  data[12] = interlace;

  return makeChunk("IHDR", data);
}

/** A PNG from its chunks, after the signature */
export function buildPng(...chunks: Uint8Array[]) {
  return concat(PNG_SIGNATURE, ...chunks);
}

/** An IDAT chunk with the given uncompressed image data */
export function idat(raw: Uint8Array) {
  return makeChunk("IDAT", deflate(raw, { level: 9 }));
}

export function iend() {
  return makeChunk("IEND");
}

/** Splits a PNG into its chunks, as [type, data] */
export function readChunks(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const chunks: [string, Uint8Array][] = [];

  for (let offset = 8; offset < png.length;) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...png.subarray(offset + 4, offset + 8));

    chunks.push([type, png.subarray(offset + 8, offset + 8 + length)]);
    offset += 12 + length;
  }

  return chunks;
}

/** A deterministic random number generator (mulberry32) */
export function random(seed: number) {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;

    let t = Math.imul(state ^ (state >>> 15), 1 | state);

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An RGBA test image: a gradient, with alpha unless `opaque` */
export function gradient(width: number, height: number, opaque = false) {
  const data = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      data[i] = (x * 255) / Math.max(width - 1, 1);
      data[i + 1] = (y * 255) / Math.max(height - 1, 1);
      data[i + 2] = ((x + y) * 7) & 0xff;
      data[i + 3] = opaque ? 255 : (x * 13 + y * 3) & 0xff;
    }
  }

  return { width, height, data };
}

/** Collects a PNG's packed output */
export function packToBytes(png: {
  pack(): unknown;
  on(event: string, listener: (...args: never[]) => void): unknown;
}) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const parts: Uint8Array[] = [];

    png.on("data", (chunk: Uint8Array) => parts.push(chunk));
    png.on("end", () => resolve(concat(...parts)));
    png.on("error", reject);
    png.pack();
  });
}
