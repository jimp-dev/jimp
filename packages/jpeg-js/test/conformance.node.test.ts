/**
 * Decodes every JPEG of the corpus (test/corpus) and compares it with
 * libjpeg-turbo's djpeg, whose output is committed in test/corpus/references
 * (see test/corpus/generate.sh).
 *
 * Tolerance: 0. The decoder ports libjpeg-turbo's default pipeline (islow
 * IDCT, fancy upsampling, fixed-point colour conversion, djpeg's CMYK to RGB),
 * so its output must be identical. Other decoders usually differ by a few
 * levels because of their IDCT and upsampling, so any difference here means
 * something changed. The exceptions are listed in TOLERANCES with the reason.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { describe, expect, test } from "vitest";

import { decodeJpeg, JpegUnsupportedError } from "../src/index.js";

interface Reference {
  width: number;
  height: number;
  channels: 1 | 3;
  precision: 8 | 12;
  sha256: string;
  png?: string;
  djpegWarning?: string;
}

const TOLERANCE = 0;

/** Per-file maximum differences, with the reason. */
const TOLERANCES: Record<string, { max: number; reason: string }> = {};

const corpus = new URL("corpus/", import.meta.url);
const references: Record<string, Reference> = JSON.parse(
  readFileSync(new URL("references.json", corpus), "utf8"),
);

/** Reads the samples of the PNGs written by references.py. */
function readPng(path: string) {
  const file = readFileSync(new URL(path, corpus));
  let offset = 8;
  let width = 0;
  let height = 0;
  let bytesPerSample = 1;
  let channels = 1;
  const idat: Buffer[] = [];

  while (offset < file.length) {
    const length = file.readUInt32BE(offset);
    const type = file.toString("latin1", offset + 4, offset + 8);
    const data = file.subarray(offset + 8, offset + 8 + length);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bytesPerSample = data[8] === 16 ? 2 : 1;
      channels = data[9] === 2 ? 3 : 1;
    } else if (type === "IDAT") {
      idat.push(data);
    }

    offset += 12 + length;
  }

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels * bytesPerSample;
  const stride = width * bpp;
  const out = new Uint8Array(stride * height);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]!;
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const o = y * stride;

    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? out[o + i - bpp]! : 0;
      const b = y > 0 ? out[o + i - stride]! : 0;
      const c = i >= bpp && y > 0 ? out[o + i - stride - bpp]! : 0;
      let predictor = 0;

      if (filter === 1) {
        predictor = a;
      } else if (filter === 2) {
        predictor = b;
      } else if (filter === 3) {
        predictor = (a + b) >> 1;
      } else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);

        predictor = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }

      out[o + i] = (row[i]! + predictor) & 0xff;
    }
  }

  // Samples as numbers, 16-bit ones big-endian
  const samples = new Uint16Array(width * height * channels);

  for (let i = 0; i < samples.length; i++) {
    samples[i] =
      bytesPerSample === 2 ? (out[i * 2]! << 8) | out[i * 2 + 1]! : out[i]!;
  }

  return samples;
}

/** Scales a 12-bit sample to 8 bits, like the decoder does. */
function to8(value: number) {
  return Math.floor((value * 510 + 4095) / 8190);
}

/** JPEGs this decoder rejects: arithmetic coding and lossless JPEG. */
const unsupported = [
  "generated/unsupported-arithmetic.jpg",
  "generated/unsupported-arithmetic-progressive.jpg",
  "generated/unsupported-lossless.jpg",
  "libjpeg-turbo/testimgari.jpg",
];
const names = Object.keys(references).filter((n) => !unsupported.includes(n));

describe("conformance with libjpeg-turbo", () => {
  test("the corpus is complete", () => {
    expect(names.length).toBeGreaterThan(140);
  });

  test.each(names)("%s", (name) => {
    const reference = references[name]!;
    const image = decodeJpeg(readFileSync(new URL(name, corpus)), {
      formatAsRGBA: false,
    });

    expect(image.width).toBe(reference.width);
    expect(image.height).toBe(reference.height);

    const { channels } = reference;
    const pixels = reference.width * reference.height;
    const tolerance = TOLERANCES[name]?.max ?? TOLERANCE;

    if (reference.png) {
      const expected = readPng(reference.png);
      let maxDiff = 0;

      for (let i = 0; i < pixels; i++) {
        for (let c = 0; c < 3; c++) {
          let value = expected[i * channels + (channels === 3 ? c : 0)]!;

          if (reference.precision === 12) {
            value = to8(value);
          }

          maxDiff = Math.max(maxDiff, Math.abs(image.data[i * 3 + c]! - value));
        }
      }

      expect(maxDiff).toBeLessThanOrEqual(tolerance);
    }

    if (reference.precision === 8 && tolerance === 0) {
      // Same samples as djpeg: RGB, or one channel for greyscale
      let samples = image.data;

      if (channels === 1) {
        samples = new Uint8Array(pixels);

        for (let i = 0; i < pixels; i++) {
          samples[i] = image.data[i * 3]!;
        }
      }

      expect(createHash("sha256").update(samples).digest("hex")).toBe(
        reference.sha256,
      );
    }
  });

  test.each(unsupported)("%s is rejected", (name) => {
    expect(() => decodeJpeg(readFileSync(new URL(name, corpus)))).toThrow(
      JpegUnsupportedError,
    );
  });
});
