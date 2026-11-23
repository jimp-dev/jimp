import { Buffer } from "buffer";

/**
 * Reads the EXIF block of a JPEG on decode and writes it back on encode.
 *
 * The block is kept as the original bytes rather than re-serialised from the
 * parsed tags, so tags jimp doesn't know about (maker notes, GPS, ...) survive
 * unchanged. Only fixed-size values are patched in place, so the block never
 * grows.
 */

const EXIF_HEADER = Buffer.from("Exif\0\0", "latin1");
/** An APP1 segment's 16-bit length counts itself and the "Exif\0\0" header */
const MAX_EXIF_LENGTH = 0xffff - 2 - EXIF_HEADER.length;

const SOI = 0xd8;
const SOS = 0xda;
const EOI = 0xd9;
const APP0 = 0xe0;
const APP1 = 0xe1;

const TYPE_SHORT = 3;
const TYPE_LONG = 4;
const TYPE_RATIONAL = 5;

const TAG_IMAGE_WIDTH = 0x0100;
const TAG_IMAGE_LENGTH = 0x0101;
const TAG_ORIENTATION = 0x0112;
const TAG_X_RESOLUTION = 0x011a;
const TAG_Y_RESOLUTION = 0x011b;
const TAG_RESOLUTION_UNIT = 0x0128;
const TAG_THUMBNAIL_OFFSET = 0x0201;
const TAG_THUMBNAIL_LENGTH = 0x0202;
const TAG_EXIF_IFD = 0x8769;
const TAG_PIXEL_X_DIMENSION = 0xa002;
const TAG_PIXEL_Y_DIMENSION = 0xa003;

/** Raw EXIF (TIFF) data read from each image, kept out of the public API */
const rawExif = new WeakMap<object, Buffer>();

interface JpegSegment {
  marker: number;
  /** Offset of the segment's 0xFF marker byte */
  start: number;
  /** Offset just past the segment */
  end: number;
}

/** Lists the segments between SOI and the start of scan */
function readJpegSegments(data: Buffer) {
  const segments: JpegSegment[] = [];

  if (data[0] !== 0xff || data[1] !== SOI) {
    return segments;
  }

  let offset = 2;

  while (offset + 3 < data.length && data[offset] === 0xff) {
    const marker = data[offset + 1]!;

    // Fill bytes: the marker starts at the last 0xFF.
    if (marker === 0xff) {
      offset++;
      continue;
    }

    if (marker === SOS || marker === EOI) {
      break;
    }

    const end = offset + 2 + data.readUInt16BE(offset + 2);

    if (end > data.length) {
      break;
    }

    segments.push({ marker, start: offset, end });
    offset = end;
  }

  return segments;
}

function tiffView(tiff: Buffer) {
  const byteOrder = tiff.toString("latin1", 0, 2);

  if (byteOrder !== "II" && byteOrder !== "MM") {
    throw new Error("EXIF data has an unknown byte order");
  }

  const le = byteOrder === "II";

  return {
    u16: (o: number) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o)),
    u32: (o: number) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o)),
    w16: (o: number, v: number) =>
      le ? tiff.writeUInt16LE(v, o) : tiff.writeUInt16BE(v, o),
    w32: (o: number, v: number) =>
      le ? tiff.writeUInt32LE(v, o) : tiff.writeUInt32BE(v, o),
  };
}

type TiffView = ReturnType<typeof tiffView>;

interface IfdEntry {
  tag: number;
  type: number;
  count: number;
  /** Offset of the 12-byte entry; its value (or value offset) is at +8 */
  offset: number;
}

/** Reads an IFD's entries and the offset of its next-IFD pointer */
function readIfd(view: TiffView, tiff: Buffer, offset: number) {
  const count = view.u16(offset);
  const next = offset + 2 + count * 12;

  if (next + 4 > tiff.length) {
    throw new Error("EXIF IFD is truncated");
  }

  const entries: IfdEntry[] = [];

  for (let i = 0; i < count; i++) {
    const entry = offset + 2 + i * 12;

    entries.push({
      tag: view.u16(entry),
      type: view.u16(entry + 2),
      count: view.u32(entry + 4),
      offset: entry,
    });
  }

  return { entries, next };
}

function readRational(view: TiffView, entry: IfdEntry) {
  if (entry.type !== TYPE_RATIONAL || entry.count !== 1) {
    return undefined;
  }

  const offset = view.u32(entry.offset + 8);
  const denominator = view.u32(offset + 4);

  return denominator ? view.u32(offset) / denominator : undefined;
}

/** Overwrites a single SHORT or LONG value, widening SHORT to LONG if needed */
function writeDimension(view: TiffView, entry: IfdEntry, value: number) {
  if (entry.count !== 1) {
    return;
  }

  if (entry.type === TYPE_SHORT && value <= 0xffff) {
    view.w16(entry.offset + 8, value);
  } else if (entry.type === TYPE_SHORT || entry.type === TYPE_LONG) {
    view.w16(entry.offset + 2, TYPE_LONG);
    view.w32(entry.offset + 8, value);
  }
}

interface ExifFields {
  width: number;
  height: number;
  orientation: number;
}

/**
 * Updates the size and orientation tags in place and drops the thumbnail,
 * which would still show the original (possibly uncropped) image.
 * Throws if the data isn't a TIFF structure it can walk.
 */
function patchExif(tiff: Buffer, { width, height, orientation }: ExifFields) {
  const view = tiffView(tiff);

  if (view.u16(2) !== 42) {
    throw new Error("EXIF data is not a TIFF structure");
  }

  const ifd0 = readIfd(view, tiff, view.u32(4));
  let unit = 2;
  let xResolution: number | undefined;
  let yResolution: number | undefined;

  for (const entry of ifd0.entries) {
    switch (entry.tag) {
      case TAG_ORIENTATION:
        // Leaving a stale orientation would rotate the pixels twice
        if (entry.type === TYPE_SHORT) {
          view.w16(entry.offset + 8, orientation);
        } else if (entry.type === TYPE_LONG) {
          view.w32(entry.offset + 8, orientation);
        } else {
          throw new Error("EXIF orientation has an unexpected type");
        }
        break;
      case TAG_IMAGE_WIDTH:
        writeDimension(view, entry, width);
        break;
      case TAG_IMAGE_LENGTH:
        writeDimension(view, entry, height);
        break;
      case TAG_X_RESOLUTION:
        xResolution = readRational(view, entry);
        break;
      case TAG_Y_RESOLUTION:
        yResolution = readRational(view, entry);
        break;
      case TAG_RESOLUTION_UNIT:
        unit = view.u16(entry.offset + 8);
        break;
      case TAG_EXIF_IFD: {
        const exifIfd = readIfd(view, tiff, view.u32(entry.offset + 8));

        for (const exifEntry of exifIfd.entries) {
          if (exifEntry.tag === TAG_PIXEL_X_DIMENSION) {
            writeDimension(view, exifEntry, width);
          } else if (exifEntry.tag === TAG_PIXEL_Y_DIMENSION) {
            writeDimension(view, exifEntry, height);
          }
        }
        break;
      }
    }
  }

  const ifd1Offset = view.u32(ifd0.next);

  if (!ifd1Offset) {
    return { tiff, unit, xResolution, yResolution };
  }

  view.w32(ifd0.next, 0);

  let thumbnailStart: number | undefined;
  let thumbnailLength: number | undefined;

  try {
    for (const entry of readIfd(view, tiff, ifd1Offset).entries) {
      if (entry.tag === TAG_THUMBNAIL_OFFSET) {
        thumbnailStart = view.u32(entry.offset + 8);
      } else if (entry.tag === TAG_THUMBNAIL_LENGTH) {
        thumbnailLength = view.u32(entry.offset + 8);
      }
    }
  } catch {
    // IFD1 is already unlinked, so a broken one doesn't matter
  }

  if (
    thumbnailStart !== undefined &&
    thumbnailLength !== undefined &&
    thumbnailStart + thumbnailLength <= tiff.length
  ) {
    const thumbnailEnd = thumbnailStart + thumbnailLength;

    tiff.fill(0, thumbnailStart, thumbnailEnd);

    // Writers put the thumbnail last, so usually it can be cut off entirely
    if (thumbnailEnd === tiff.length) {
      tiff = tiff.subarray(0, thumbnailStart);
    }
  }

  return { tiff, unit, xResolution, yResolution };
}

/**
 * Stores the EXIF block of a JPEG so it can be written back on encode.
 * Does nothing for other formats, or if the block can't be patched safely.
 */
export function storeJpegExif(image: object, data: Buffer) {
  for (const { marker, start, end } of readJpegSegments(data)) {
    const payload = start + 4;

    if (
      marker !== APP1 ||
      !data.subarray(payload, payload + EXIF_HEADER.length).equals(EXIF_HEADER)
    ) {
      continue;
    }

    const tiff = Buffer.from(data.subarray(payload + EXIF_HEADER.length, end));

    try {
      patchExif(Buffer.from(tiff), { width: 1, height: 1, orientation: 1 });
      rawExif.set(image, tiff);
    } catch {
      // Unreadable EXIF can't have its orientation fixed, so don't keep it
    }

    return;
  }
}

/** Gives a cloned image the same EXIF data as the original */
export function copyExif(from: object, to: object) {
  const tiff = rawExif.get(from);

  if (tiff) {
    rawExif.set(to, tiff);
  }
}

/** Maps EXIF ResolutionUnit (2 = inch, 3 = cm) to JFIF density units */
const JFIF_UNITS: Record<number, number> = { 2: 1, 3: 2 };

/**
 * Inserts the EXIF data stored for `image` into an encoded JPEG, after SOI or
 * the JFIF APP0 segment. Orientation, ImageWidth/ImageLength and
 * PixelXDimension/PixelYDimension are updated to match the image.
 * Returns the JPEG unchanged if the image has no stored EXIF.
 */
export function writeJpegExif(
  image: object,
  jpeg: Buffer,
  fields: ExifFields,
): Buffer {
  const stored = rawExif.get(image);

  if (!stored) {
    return jpeg;
  }

  const { tiff, unit, xResolution, yResolution } = patchExif(
    Buffer.from(stored),
    fields,
  );

  if (tiff.length > MAX_EXIF_LENGTH) {
    throw new Error(
      `EXIF data is ${tiff.length} bytes, more than the ${MAX_EXIF_LENGTH} a JPEG APP1 segment can hold`,
    );
  }

  const [first] = readJpegSegments(jpeg);
  const app0 = first?.marker === APP0 ? first : undefined;
  const head = Buffer.from(jpeg.subarray(0, app0 ? app0.end : 2));

  // Keep JFIF's density in line with the EXIF resolution
  const jfifUnit = JFIF_UNITS[unit];
  const x = Math.round(xResolution ?? 0);
  const y = Math.round(yResolution ?? 0);

  if (
    app0 &&
    app0.end - app0.start >= 16 &&
    head.toString("latin1", app0.start + 4, app0.start + 9) === "JFIF\0" &&
    jfifUnit &&
    x >= 1 &&
    x <= 0xffff &&
    y >= 1 &&
    y <= 0xffff
  ) {
    head[app0.start + 11] = jfifUnit;
    head.writeUInt16BE(x, app0.start + 12);
    head.writeUInt16BE(y, app0.start + 14);
  }

  const marker = Buffer.alloc(4);
  marker.writeUInt16BE(0xff00 | APP1, 0);
  marker.writeUInt16BE(2 + EXIF_HEADER.length + tiff.length, 2);

  return Buffer.concat([
    head,
    marker,
    EXIF_HEADER,
    tiff,
    jpeg.subarray(head.length),
  ]);
}
