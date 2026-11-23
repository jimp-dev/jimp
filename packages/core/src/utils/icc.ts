import { Buffer } from "buffer";
import { unzlibSync, zlibSync } from "fflate";

import { APP0, APP1, readJpegSegments } from "./exif.js";

/**
 * Reads the ICC colour profile of a JPEG, PNG, WebP or JPEG 2000 on decode
 * and writes it back on encode.
 *
 * Jimp keeps the pixels in the colour space of the profile they were read
 * with (e.g. Display P3). Writing them without it would make viewers treat
 * them as sRGB, so the profile is kept as the original bytes and written to
 * JPEG, PNG and WebP output.
 *
 * JPEG 2000 profiles are only read. JP2 only allows ICC v2 profiles, and
 * readers like macOS's reject the whole image with a v4 one, like the Display
 * P3 profile of iPhone photos. So JPEG 2000 output is converted to sRGB.
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

/** The signature box JP2 and JPX files start with */
const JP2_SIGNATURE = Buffer.from([
  0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
]);
/**
 * Colour specification methods with an ICC profile: 2 is the restricted
 * (monochrome or matrix-based RGB) profile JP2 allows, 3 any profile in JPX
 */
const JP2_RESTRICTED_ICC = 2;
const JP2_ANY_ICC = 3;

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

interface RiffChunk {
  type: string;
  data: Buffer;
  /** Offset of the chunk's FourCC */
  start: number;
  /** Offset just past the chunk and its padding byte */
  end: number;
}

/** Lists a WebP's chunks */
function readWebpChunks(data: Buffer) {
  const chunks: RiffChunk[] = [];

  if (
    data.toString("latin1", 0, 4) !== "RIFF" ||
    data.toString("latin1", 8, 12) !== "WEBP"
  ) {
    return chunks;
  }

  let offset = 12;

  while (offset + 8 <= data.length) {
    const size = data.readUInt32LE(offset + 4);

    if (offset + 8 + size > data.length) {
      break;
    }

    chunks.push({
      type: data.toString("latin1", offset, offset + 4),
      data: data.subarray(offset + 8, offset + 8 + size),
      start: offset,
      // Chunks are padded to an even size
      end: Math.min(offset + 8 + size + (size & 1), data.length),
    });
    offset += 8 + size + (size & 1);
  }

  return chunks;
}

function readWebpProfile(data: Buffer) {
  const iccp = readWebpChunks(data).find(({ type }) => type === "ICCP");

  return iccp ? Buffer.from(iccp.data) : undefined;
}

interface Jp2Box {
  type: string;
  /** The box's contents, after its header */
  data: Buffer;
}

/** Lists the boxes of a JPEG 2000 file, or the boxes in a superbox's data */
function readJp2Boxes(data: Buffer) {
  const boxes: Jp2Box[] = [];
  let offset = 0;

  while (offset + 8 <= data.length) {
    let length = data.readUInt32BE(offset);
    let headerLength = 8;

    if (length === 1 && offset + 16 <= data.length) {
      // A 64-bit length follows the type
      length = Number(data.readBigUInt64BE(offset + 8));
      headerLength = 16;
    } else if (length === 0) {
      // The last box can run to the end of the file
      length = data.length - offset;
    }

    if (length < headerLength || offset + length > data.length) {
      break;
    }

    boxes.push({
      type: data.toString("latin1", offset + 4, offset + 8),
      data: data.subarray(offset + headerLength, offset + length),
    });
    offset += length;
  }

  return boxes;
}

function readJp2Profile(data: Buffer) {
  // The JP2 header box holds the image header and colour boxes
  const header = readJp2Boxes(data).find(({ type }) => type === "jp2h");
  // Readers only use the first colour specification box
  const colr = header
    ? readJp2Boxes(header.data).find(({ type }) => type === "colr")
    : undefined;
  const method = colr?.data[0];

  // The method, precedence and approximation bytes come before the profile
  return colr && (method === JP2_RESTRICTED_ICC || method === JP2_ANY_ICC)
    ? Buffer.from(colr.data.subarray(3))
    : undefined;
}

/**
 * Reads the ICC profile of a JPEG, PNG, WebP or JPEG 2000 (JP2 or JPX).
 * Returns undefined for other formats, or if the profile is broken or isn't
 * an RGB or gray profile.
 */
export function readIccProfile(data: Buffer) {
  try {
    const profile = data.subarray(0, 8).equals(PNG_SIGNATURE)
      ? readPngProfile(data)
      : data.toString("latin1", 0, 4) === "RIFF"
        ? readWebpProfile(data)
        : data.subarray(0, 12).equals(JP2_SIGNATURE)
          ? readJp2Profile(data)
          : readJpegProfile(data);

    return profile && profileColorSpace(profile) ? profile : undefined;
  } catch {
    // A profile that can't be read is dropped, as before
    return undefined;
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

function riffChunk(type: string, payload: Buffer) {
  const header = Buffer.alloc(8);

  header.write(type, 0, "latin1");
  header.writeUInt32LE(payload.length, 4);

  return Buffer.concat([header, payload, Buffer.alloc(payload.length & 1)]);
}

/**
 * Adds the profile as an ICCP chunk. That needs the extended format, so a
 * simple WebP (a lone VP8 or VP8L chunk) gets a VP8X header first. ICCP goes
 * right after VP8X, as the WebP container spec requires.
 */
function writeWebpProfile(
  profile: Buffer,
  webp: Buffer,
  width: number,
  height: number,
) {
  const chunks = readWebpChunks(webp);

  // WebP is always RGB
  if (!chunks.length || profileColorSpace(profile) !== "RGB ") {
    return webp;
  }

  const extended = chunks.find(({ type }) => type === "VP8X");
  let header: Buffer;

  if (extended) {
    header = Buffer.from(webp.subarray(extended.start, extended.end));
    header[8]! |= 0x20; // ICC profile flag
  } else {
    const flags = Buffer.alloc(10);
    const lossless = chunks.find(({ type }) => type === "VP8L");
    // After VP8L's signature byte: 14 bits each of width - 1 and height - 1,
    // then whether alpha is used
    const alpha =
      lossless &&
      lossless.data.length >= 5 &&
      (lossless.data.readUInt32LE(1) >>> 28) & 1;

    flags[0] = 0x20 | (alpha ? 0x10 : 0);
    flags.writeUIntLE(width - 1, 4, 3);
    flags.writeUIntLE(height - 1, 7, 3);
    header = riffChunk("VP8X", flags);
  }

  const body = Buffer.concat([
    Buffer.from("WEBP", "latin1"),
    header,
    riffChunk("ICCP", profile),
    ...chunks
      .filter(({ type }) => type !== "VP8X" && type !== "ICCP")
      .map(({ start, end }) => webp.subarray(start, end)),
  ]);
  const riff = Buffer.alloc(8);

  riff.write("RIFF", 0, "latin1");
  riff.writeUInt32LE(body.length, 4);

  return Buffer.concat([riff, body]);
}

/** The formats jimp can write an ICC profile to */
export const ICC_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/**
 * Writes an ICC profile into an encoded JPEG, PNG or WebP.
 * Returns the data unchanged for other formats, or if the profile doesn't
 * fit the encoded colour type (e.g. an RGB profile and a grayscale PNG).
 */
export function writeIccProfile(
  profile: Buffer,
  mime: string,
  encoded: Buffer,
  width: number,
  height: number,
) {
  if (mime === "image/jpeg") {
    return writeJpegProfile(profile, encoded);
  }

  if (mime === "image/png") {
    return writePngProfile(profile, encoded);
  }

  if (mime === "image/webp") {
    return writeWebpProfile(profile, encoded, width, height);
  }

  return encoded;
}
