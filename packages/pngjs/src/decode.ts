import { toBuffer, toUint8Array } from "./buffer.js";
import { decodePixels } from "./pixels.js";
import type { OutputMode } from "./pixels.js";
import { hasPngSignature, parseHeader, readPng } from "./read.js";
import type { PngFile } from "./read.js";
import type { DecodeOptions, DecodedPng, PngHeader } from "./types.js";

export type PngInput = Uint8Array | ArrayBuffer;

export function getDecodedInfo(file: PngFile) {
  return {
    ...file.header,
    palette: file.palette,
    transparentColor: file.transparentColor,
    gamma: file.gamma,
    srgb: file.srgb,
    iccProfile: file.iccProfile,
    physical: file.physical,
    text: file.text,
    exif: file.exif,
  };
}

/** Decodes a PNG to RGBA pixels and its metadata */
export function decode(
  data: PngInput,
  options: DecodeOptions & { outputDepth: 16 },
): DecodedPng<Uint16Array>;
export function decode(
  data: PngInput,
  options?: DecodeOptions & { outputDepth?: 8 },
): DecodedPng<Uint8Array>;
export function decode(
  data: PngInput,
  options?: DecodeOptions,
): DecodedPng<Uint8Array> | DecodedPng<Uint16Array>;
export function decode(
  data: PngInput,
  options: DecodeOptions = {},
): DecodedPng<Uint8Array> | DecodedPng<Uint16Array> {
  return decodeWithMode(data, options.outputDepth === 16 ? 16 : 8, options) as
    DecodedPng<Uint8Array> | DecodedPng<Uint16Array>;
}

export function decodeWithMode(
  input: PngInput,
  mode: OutputMode,
  { checkCRC = true }: DecodeOptions,
) {
  const file = readPng(toUint8Array(input), { checkCRC });
  const pixels = decodePixels(
    {
      ...file.header,
      palette: file.palette,
      transparentColor: file.transparentColor,
    },
    file.idat,
    mode,
  );

  return {
    ...getDecodedInfo(file),
    data: pixels instanceof Uint8Array ? toBuffer(pixels) : pixels,
  };
}

/**
 * Reads a PNG's header (IHDR chunk) without decoding the image. Throws if the
 * data doesn't start with a PNG signature and a valid IHDR chunk.
 */
export function readHeader(data: PngInput): PngHeader {
  const bytes = toUint8Array(data);

  if (!hasPngSignature(bytes)) {
    throw new Error("Invalid file signature: not a PNG file");
  }

  if (bytes.length < 33 || chunkType(bytes, 12) !== "IHDR") {
    throw new Error("IHDR must be the first chunk");
  }

  return parseHeader(bytes.subarray(16, 16 + 13));
}

function chunkType(data: Uint8Array, offset: number) {
  return String.fromCharCode(...data.subarray(offset, offset + 4));
}
