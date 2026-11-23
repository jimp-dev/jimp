import { Buffer } from "buffer";
import { unzlibSync, zlibSync } from "fflate";

import { APP0, APP1, readJpegSegments } from "./exif.js";

/**
 * Reads the ICC colour profile of a JPEG or PNG on decode and writes it back
 * on encode.
 *
 * Jimp never converts colours, so the pixels stay in the colour space of the
 * profile they were read with (e.g. Display P3). Writing them without it would
 * make viewers treat them as sRGB, so the profile is kept as the original
 * bytes and written to JPEG and PNG output.
 */

const APP2 = 0xe2;
const ICC_HEADER = Buffer.from("ICC_PROFILE\0", "latin1");
/**
 * An APP2 segment's 16-bit length counts itself, the "ICC_PROFILE\0" header
 * and the sequence number and segment count bytes
 */
const MAX_JPEG_CHUNK = 0xffff - 2 - ICC_HEADER.length - 2;
const MAX_JPEG_SEGMENTS = 0xff;

/** SOF markers, which hold the number of colour components */
const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const PNG_PROFILE_NAME = "ICC Profile";

/** ICC profiles read from each image, kept out of the public API */
const iccProfiles = new WeakMap<object, Buffer>();

/**
 * The profile's data colour space. Only RGB and gray profiles describe the
 * pixels jimp decodes to; a CMYK profile, for example, doesn't.
 */
function profileColorSpace(profile: Buffer) {
  if (profile.length < 128 || profile.toString("latin1", 36, 40) !== "acsp") {
    return undefined;
  }

  const space = profile.toString("latin1", 16, 20);

  return space === "RGB " || space === "GRAY" ? space : undefined;
}

/** Reassembles a profile split over APP2 segments, in sequence number order */
function readJpegProfile(data: Buffer) {
  const chunks: Buffer[] = [];
  let count = 0;

  for (const { marker, start, end } of readJpegSegments(data)) {
    const payload = start + 4;

    if (
      marker !== APP2 ||
      !data.subarray(payload, payload + ICC_HEADER.length).equals(ICC_HEADER)
    ) {
      continue;
    }

    const sequence = data[payload + ICC_HEADER.length]!;
    const total = data[payload + ICC_HEADER.length + 1]!;

    // Segments that disagree on the count, or repeat a number, are corrupt
    if (
      !sequence ||
      sequence > total ||
      (count && total !== count) ||
      chunks[sequence - 1]
    ) {
      return undefined;
    }

    count = total;
    chunks[sequence - 1] = data.subarray(payload + ICC_HEADER.length + 2, end);
  }

  for (let i = 0; i < count; i++) {
    if (!chunks[i]) {
      return undefined;
    }
  }

  return count ? Buffer.concat(chunks) : undefined;
}

interface PngChunk {
  type: string;
  data: Buffer;
  /** Offset of the chunk's length */
  start: number;
  /** Offset just past the chunk's CRC */
  end: number;
}

/** Lists a PNG's chunks */
function readPngChunks(data: Buffer) {
  const chunks: PngChunk[] = [];

  if (!data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return chunks;
  }

  let offset = 8;

  while (offset + 12 <= data.length) {
    const length = data.readUInt32BE(offset);
    const end = offset + 12 + length;

    if (end > data.length) {
      break;
    }

    chunks.push({
      type: data.toString("latin1", offset + 4, offset + 8),
      data: data.subarray(offset + 8, offset + 8 + length),
      start: offset,
      end,
    });
    offset = end;
  }

  return chunks;
}

/** Inflates the profile in the iCCP chunk */
function readPngProfile(data: Buffer) {
  for (const { type, data: chunk } of readPngChunks(data)) {
    // iCCP has to come before the image data
    if (type === "IDAT") {
      return undefined;
    }

    if (type !== "iCCP") {
      continue;
    }

    // A 1-79 byte name, a null separator and compression method 0 (zlib)
    const nameEnd = chunk.indexOf(0);

    if (nameEnd < 1 || chunk[nameEnd + 1] !== 0) {
      return undefined;
    }

    return Buffer.from(unzlibSync(chunk.subarray(nameEnd + 2)));
  }

  return undefined;
}

/**
 * Stores the ICC profile of a JPEG or PNG so it can be written back on encode.
 * Does nothing for other formats, or if the profile is broken or isn't an RGB
 * or gray profile.
 */
export function storeIccProfile(image: object, data: Buffer) {
  try {
    const profile = data.subarray(0, 8).equals(PNG_SIGNATURE)
      ? readPngProfile(data)
      : readJpegProfile(data);

    if (profile && profileColorSpace(profile)) {
      iccProfiles.set(image, profile);
    }
  } catch {
    // A profile that can't be read is dropped, as before
  }
}

/** Gives a cloned image the same ICC profile as the original */
export function copyIccProfile(from: object, to: object) {
  const profile = iccProfiles.get(from);

  if (profile) {
    iccProfiles.set(to, profile);
  }
}

/**
 * Inserts the profile as APP2 segments after SOI and any APP0 (JFIF) and APP1
 * (EXIF) segments, split into chunks that fit a segment as the ICC spec
 * describes.
 */
function writeJpegProfile(profile: Buffer, jpeg: Buffer) {
  const segments = readJpegSegments(jpeg);
  const frame = segments.find(({ marker }) => SOF_MARKERS.has(marker));
  const components = frame ? jpeg[frame.start + 9] : undefined;
  const space =
    components === 1 ? "GRAY" : components === 3 ? "RGB " : undefined;
  const count = Math.ceil(profile.length / MAX_JPEG_CHUNK);

  // A gray profile can't describe an RGB JPEG, and the other way around
  if (profileColorSpace(profile) !== space || count > MAX_JPEG_SEGMENTS) {
    return jpeg;
  }

  let insertAt = 2;

  for (const { marker, end } of segments) {
    if (marker !== APP0 && marker !== APP1) {
      break;
    }

    insertAt = end;
  }

  const parts = [jpeg.subarray(0, insertAt)];

  for (let i = 0; i < count; i++) {
    const chunk = profile.subarray(
      i * MAX_JPEG_CHUNK,
      (i + 1) * MAX_JPEG_CHUNK,
    );
    const marker = Buffer.alloc(4);

    marker.writeUInt16BE(0xff00 | APP2, 0);
    marker.writeUInt16BE(2 + ICC_HEADER.length + 2 + chunk.length, 2);
    parts.push(marker, ICC_HEADER, Buffer.from([i + 1, count]), chunk);
  }

  parts.push(jpeg.subarray(insertAt));

  return Buffer.concat(parts);
}

let crcTable: Uint32Array | undefined;

function crc32(data: Uint8Array) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);

    for (let n = 0; n < 256; n++) {
      let c = n;

      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }

      crcTable[n] = c >>> 0;
    }
  }

  let crc = 0xffffffff;

  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Inserts the profile as an iCCP chunk right after IHDR, which puts it before
 * PLTE and IDAT as the PNG spec requires. Drops any sRGB chunk, which a PNG
 * with an ICC profile shouldn't have.
 */
function writePngProfile(profile: Buffer, png: Buffer) {
  const chunks = readPngChunks(png);
  const [header] = chunks;

  if (header?.type !== "IHDR") {
    return png;
  }

  // Colour types 0 and 4 are grayscale, 2, 3 and 6 are colour
  const colorType = header.data[9];
  const space = colorType === 0 || colorType === 4 ? "GRAY" : "RGB ";

  if (profileColorSpace(profile) !== space) {
    return png;
  }

  const body = Buffer.concat([
    Buffer.from("iCCP", "latin1"),
    Buffer.from(`${PNG_PROFILE_NAME}\0\0`, "latin1"),
    zlibSync(profile),
  ]);
  const iccp = Buffer.alloc(body.length + 8);

  iccp.writeUInt32BE(body.length - 4, 0);
  body.copy(iccp, 4);
  iccp.writeUInt32BE(crc32(body), body.length + 4);

  const parts = [png.subarray(0, header.end), iccp];

  for (const { type, start, end } of chunks.slice(1)) {
    if (type !== "sRGB" && type !== "iCCP") {
      parts.push(png.subarray(start, end));
    }
  }

  parts.push(png.subarray(chunks[chunks.length - 1]!.end));

  return Buffer.concat(parts);
}

/**
 * Writes the ICC profile stored for `image` into an encoded JPEG or PNG.
 * Returns the data unchanged for other formats, if the image has no profile,
 * or if the profile doesn't fit the encoded colour type (e.g. an RGB profile
 * and a grayscale PNG).
 */
export function writeIccProfile(image: object, mime: string, encoded: Buffer) {
  const profile = iccProfiles.get(image);

  if (!profile) {
    return encoded;
  }

  if (mime === "image/jpeg") {
    return writeJpegProfile(profile, encoded);
  }

  if (mime === "image/png") {
    return writePngProfile(profile, encoded);
  }

  return encoded;
}
