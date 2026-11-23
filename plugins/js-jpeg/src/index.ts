import decodeJpeg from "jpeg-js/lib/decoder.js";
import { Format } from "@jimp/types";

import { ChromaSubsampling, encode } from "./encoder.js";

export type { ChromaSubsampling };

/** The quality used when none is passed, the same as sharp's. */
const DEFAULT_QUALITY = 80;

/** Quality from which color is kept at full resolution by default. */
const FULL_CHROMA_QUALITY = 90;

export interface JPEGOptions {
  /**
   * Quality from 1 to 100. Lower values give smaller files with more
   * compression artifacts. The scale is libjpeg's, so a quality gives about
   * the same result as in sharp, Pillow or ImageMagick.
   * @default 80
   */
  quality?: number;
  /**
   * The resolution color (chroma) is stored at.
   *
   * - `"4:2:0"`: half the width and height of the image. The eye is much less
   *   sensitive to color detail than to brightness, so this makes files 10 to
   *   20% smaller with little visible difference. Sharp edges between
   *   saturated colors, like red text, can bleed a little.
   * - `"4:4:4"`: full resolution.
   *
   * Defaults to `"4:2:0"`, or `"4:4:4"` when `quality` is 90 or more.
   */
  chromaSubsampling?: ChromaSubsampling;
  /**
   * Write the EXIF data of the JPEG the image was read from (camera make and
   * model, resolution, date, GPS location, ...). Orientation is set to 1, as
   * the pixels were already rotated on read, and the pixel dimensions are
   * updated to the image's current size. The embedded thumbnail is dropped.
   *
   * Off by default, as EXIF can contain private data such as the location.
   * @default false
   */
  exif?: boolean;
}

export interface DecodeJpegOptions {
  useTArray?: false;
  colorTransform?: boolean;
  formatAsRGBA?: boolean;
  tolerantDecoding?: boolean;
  maxResolutionInMP?: number;
  maxMemoryUsageInMB?: number;
}

const EOI_MARKER = Buffer.from([0xff, 0xd9]);

/**
 * Some encoders omit the trailing EOI (end of image) marker. Image viewers
 * tolerate this, but jpeg-js throws "marker was not found", so append the
 * marker when it's missing. The caller's buffer is never modified.
 */
function ensureEoiMarker(data: Buffer) {
  const length = data.length;

  if (
    length >= 2 &&
    data[length - 2] === EOI_MARKER[0] &&
    data[length - 1] === EOI_MARKER[1]
  ) {
    return data;
  }

  return Buffer.concat([data, EOI_MARKER], length + 2);
}

/** Give up on a gap longer than this and let jpeg-js report the error. */
const MAX_JUNK_BYTES = 64 * 1024;

function isMarkerAt(data: Buffer, offset: number) {
  const code = data[offset + 1];

  return (
    data[offset] === 0xff && code !== undefined && code >= 0xc0 && code <= 0xfe
  );
}

/**
 * Some encoders write stray bytes between header segments, e.g. leftover
 * Photoshop "8BIM" data after an APP1 segment. libjpeg skips them with an
 * "extraneous bytes before marker" warning, but jpeg-js throws
 * "unknown JPEG marker". Walk the segments up to SOS and drop any bytes found
 * where a marker should start. Returns the input unchanged when there are no
 * stray bytes; the caller's buffer is never modified.
 */
function skipJunkBeforeMarkers(data: Buffer) {
  if (data[0] !== 0xff || data[1] !== 0xd8) {
    return data;
  }

  const pieces: Buffer[] = [];
  let pieceStart = 0;
  let offset = 2;

  while (offset + 1 < data.length) {
    // Fill bytes: the marker starts at the last 0xFF.
    if (data[offset] === 0xff && data[offset + 1] === 0xff) {
      offset++;
      continue;
    }

    if (!isMarkerAt(data, offset)) {
      let next = offset + 1;
      const limit = Math.min(data.length - 1, offset + MAX_JUNK_BYTES);

      while (next < limit && !isMarkerAt(data, next)) {
        next++;
      }

      if (!isMarkerAt(data, next)) {
        return data;
      }

      pieces.push(data.subarray(pieceStart, offset));
      pieceStart = next;
      offset = next;
    }

    const code = data[offset + 1]!;

    // Start of scan or end of image: entropy-coded data follows, stop here.
    if (code === 0xda || code === 0xd9) {
      break;
    }

    // Standalone markers have no length field.
    if (code >= 0xd0 && code <= 0xd8) {
      offset += 2;
      continue;
    }

    if (offset + 3 >= data.length) {
      break;
    }

    offset += 2 + data.readUInt16BE(offset + 2);
  }

  if (pieces.length === 0) {
    return data;
  }

  pieces.push(data.subarray(pieceStart));

  return Buffer.concat(pieces);
}

export default function jpeg() {
  return {
    mime: "image/jpeg",
    encode: (
      bitmap,
      {
        quality = DEFAULT_QUALITY,
        chromaSubsampling = quality >= FULL_CHROMA_QUALITY ? "4:4:4" : "4:2:0",
      }: JPEGOptions = {},
    ) => {
      const data = encode(bitmap, { quality, chromaSubsampling });

      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    },
    decode: (data, options?: DecodeJpegOptions) =>
      decodeJpeg(ensureEoiMarker(skipJunkBeforeMarkers(data)), options),
  } satisfies Format<"image/jpeg">;
}
