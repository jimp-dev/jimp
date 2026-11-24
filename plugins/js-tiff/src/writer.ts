/**
 * Writes a multi-page TIFF of uncompressed RGBA pages.
 *
 * utif2's encode writes the IFDs into a fixed 20000 byte buffer, so it
 * silently drops the IFDs of files with more than about 70 pages.
 */

import type { Bitmap } from "@jimp/types";

const SHORT = 3;
const LONG = 4;
const RATIONAL = 5;

/** Largest offset a TIFF can hold */
const MAX_OFFSET = 0xffffffff;

interface Entry {
  tag: number;
  type: number;
  values: number[];
}

const TYPE_SIZES: Record<number, number> = {
  [SHORT]: 2,
  [LONG]: 4,
  [RATIONAL]: 8,
};

function entrySize({ type, values }: Entry) {
  return (
    TYPE_SIZES[type]! * (type === RATIONAL ? values.length / 2 : values.length)
  );
}

function pageEntries(
  { width, height }: Bitmap,
  page: number,
  pageCount: number,
  stripOffset: number
): Entry[] {
  // Sorted by tag, as TIFF requires
  return [
    // NewSubfileType: a page of a multi-page image
    { tag: 254, type: LONG, values: [pageCount > 1 ? 2 : 0] },
    { tag: 256, type: LONG, values: [width] },
    { tag: 257, type: LONG, values: [height] },
    // BitsPerSample
    { tag: 258, type: SHORT, values: [8, 8, 8, 8] },
    // Compression: none
    { tag: 259, type: SHORT, values: [1] },
    // PhotometricInterpretation: RGB
    { tag: 262, type: SHORT, values: [2] },
    // StripOffsets
    { tag: 273, type: LONG, values: [stripOffset] },
    // SamplesPerPixel
    { tag: 277, type: SHORT, values: [4] },
    // RowsPerStrip
    { tag: 278, type: LONG, values: [height] },
    // StripByteCounts
    { tag: 279, type: LONG, values: [width * height * 4] },
    // XResolution and YResolution: 72 per inch
    { tag: 282, type: RATIONAL, values: [72, 1] },
    { tag: 283, type: RATIONAL, values: [72, 1] },
    // PlanarConfiguration: chunky
    { tag: 284, type: SHORT, values: [1] },
    // ResolutionUnit: inch
    { tag: 296, type: SHORT, values: [2] },
    // PageNumber
    { tag: 297, type: SHORT, values: [page, pageCount] },
    // ExtraSamples: unassociated alpha
    { tag: 338, type: SHORT, values: [2] },
  ];
}

/** Bytes an IFD takes, including values that don't fit in its entries */
function ifdSize(entries: Entry[]) {
  let size = 2 + entries.length * 12 + 4;

  for (const entry of entries) {
    const bytes = entrySize(entry);

    if (bytes > 4) {
      size += bytes;
    }
  }

  return size;
}

/**
 * Write each bitmap as a page. Every page is an IFD followed by its values
 * and pixels, so the file can be written in one pass.
 */
export function writeTiff(pages: Bitmap[]) {
  // The IFD layout doesn't depend on the values, so the size is known upfront
  const sizes = pages.map(
    (bitmap) =>
      ifdSize(pageEntries(bitmap, 0, pages.length, 0)) +
      bitmap.width * bitmap.height * 4
  );
  const total = 8 + sizes.reduce((sum, size) => sum + size, 0);

  if (total > MAX_OFFSET) {
    throw new Error(
      `A TIFF can't be larger than 4 GB, but these pages need ${total} bytes`
    );
  }

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let p = 0;

  // Little endian header, then the offset of the first IFD
  out.set([0x49, 0x49, 42, 0], 0);
  view.setUint32(4, 8, true);
  p = 8;

  pages.forEach((bitmap, page) => {
    const ifdOffset = p;
    const entries = pageEntries(bitmap, page, pages.length, 0);
    const valuesOffset = ifdOffset + 2 + entries.length * 12 + 4;
    let valueOffset = valuesOffset;

    for (const entry of entries) {
      const bytes = entrySize(entry);

      if (bytes > 4) {
        valueOffset += bytes;
      }
    }

    // The pixels follow the IFD's values
    const stripOffset = valueOffset;
    const finalEntries = pageEntries(bitmap, page, pages.length, stripOffset);

    view.setUint16(p, finalEntries.length, true);
    p += 2;
    valueOffset = valuesOffset;

    for (const entry of finalEntries) {
      const { tag, type, values } = entry;
      const bytes = entrySize(entry);

      view.setUint16(p, tag, true);
      view.setUint16(p + 2, type, true);
      view.setUint32(
        p + 4,
        type === RATIONAL ? values.length / 2 : values.length,
        true
      );

      let at = p + 8;

      if (bytes > 4) {
        view.setUint32(p + 8, valueOffset, true);
        at = valueOffset;
        valueOffset += bytes;
      }

      for (const value of values) {
        if (type === SHORT) {
          view.setUint16(at, value, true);
          at += 2;
        } else {
          view.setUint32(at, value, true);
          at += 4;
        }
      }

      p += 12;
    }

    const isLast = page === pages.length - 1;
    const nextIfdOffset = stripOffset + bitmap.width * bitmap.height * 4;

    view.setUint32(p, isLast ? 0 : nextIfdOffset, true);
    out.set(
      bitmap.data.subarray(0, bitmap.width * bitmap.height * 4),
      stripOffset
    );
    p = nextIfdOffset;
  });

  return out;
}
