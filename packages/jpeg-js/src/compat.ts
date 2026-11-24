/**
 * The API of jpeg-js, so @jimp/jpeg-js is a drop-in replacement for it:
 * `decode(data, options)` and `encode(image, quality)`.
 */

import { decodeJpeg, type DecodeJpegOptions, type JpegData } from "./decode.js";
import { encodeJpeg, type RawImageData } from "./encode.js";

interface NodeBuffer extends Uint8Array {
  toString(encoding?: string): string;
}

interface BufferConstructor {
  from(buffer: ArrayBuffer, byteOffset: number, length: number): NodeBuffer;
}

/**
 * Like jpeg-js, Node.js gets a `Buffer`. It's found at runtime, so bundlers
 * don't add a Buffer polyfill for browsers, which get a `Uint8Array`.
 */
function toBuffer(data: Uint8Array): Uint8Array {
  const Buffer = (globalThis as { Buffer?: BufferConstructor }).Buffer;

  return Buffer
    ? Buffer.from(data.buffer as ArrayBuffer, data.byteOffset, data.byteLength)
    : data;
}

export interface DecodeOptions extends DecodeJpegOptions {
  /**
   * Return the pixels as a `Uint8Array` instead of a Node.js `Buffer`. Where
   * there is no `Buffer` (browsers) it's always a `Uint8Array`.
   * @default false
   */
  useTArray?: boolean;
}

export interface DecodedImage<T extends Uint8Array = Uint8Array> {
  width: number;
  height: number;
  data: T;
  exifBuffer?: Uint8Array;
  comments?: string[];
}

/**
 * Decodes a JPEG to RGBA (or RGB) pixels, like jpeg-js's `decode`. See
 * `decodeJpeg` for the errors it throws.
 */
export function decode(
  jpegData: JpegData,
  options: DecodeOptions = {},
): DecodedImage {
  const { useTArray = false, ...decodeOptions } = options;
  const image = decodeJpeg(jpegData, decodeOptions);

  if (!useTArray) {
    image.data = toBuffer(image.data);
  }

  return image;
}

export interface EncodeInput extends RawImageData {
  /** Text to write in COM segments, one per string. */
  comments?: string[];
  /** EXIF data to write in an APP1 segment, see `EncodeJpegOptions.exif`. */
  exifBuffer?: JpegData;
}

export interface EncodedImage<T extends Uint8Array = Uint8Array> {
  width: number;
  height: number;
  data: T;
}

/**
 * Encodes RGBA (or RGB, or greyscale) pixels as a JPEG of the given quality
 * (1..100), like jpeg-js's `encode`.
 * @param quality defaults to 50, like jpeg-js
 */
export function encode(image: EncodeInput, quality = 50): EncodedImage {
  const data = encodeJpeg(image, {
    quality,
    comments: image.comments,
    exif: image.exifBuffer,
  });

  return { data: toBuffer(data), width: image.width, height: image.height };
}
