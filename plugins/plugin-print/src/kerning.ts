/**
 * Kerning from a font's GPOS table.
 *
 * opentype.js reads GPOS pair kerning, but not from extension lookups (type
 * 9), and large fonts like Inter and Noto keep all their kerning in those. So
 * the `kern` feature's pair adjustment lookups are read here instead,
 * straight from the table's bytes.
 */

/** A table's bytes, from a TrueType, OpenType or WOFF font */
export async function readTable(
  data: Uint8Array,
  tag: string,
): Promise<DataView | undefined> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const woff = view.getUint32(0) === 0x774f4646; // "wOFF"
  const numTables = view.getUint16(woff ? 12 : 4);
  const recordSize = woff ? 20 : 16;
  const firstRecord = woff ? 44 : 12;

  for (let i = 0; i < numTables; i++) {
    const record = firstRecord + i * recordSize;

    if (readTag(view, record) !== tag) {
      continue;
    }

    // An sfnt record is tag, checksum, offset and length. A WOFF record is
    // tag, offset, compressed length, length and checksum.
    const offset = view.getUint32(record + (woff ? 4 : 8));
    const length = view.getUint32(record + (woff ? 8 : 12));
    const bytes = data.subarray(offset, offset + length);

    // WOFF tables are compressed with zlib, unless that didn't make them smaller
    if (woff && length < view.getUint32(record + 12)) {
      const inflated = await new Response(
        new Blob([bytes.slice()])
          .stream()
          .pipeThrough(new DecompressionStream("deflate")),
      ).arrayBuffer();

      return new DataView(inflated);
    }

    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  return undefined;
}

function readTag(view: DataView, offset: number) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

/** The index of `glyph` in a coverage table, or -1 if it isn't covered */
function coverageIndex(view: DataView, offset: number, glyph: number) {
  const format = view.getUint16(offset);
  const count = view.getUint16(offset + 2);

  if (format === 1) {
    let low = 0;
    let high = count - 1;

    while (low <= high) {
      const middle = (low + high) >> 1;
      const value = view.getUint16(offset + 4 + middle * 2);

      if (value === glyph) {
        return middle;
      }

      if (value < glyph) {
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
  } else if (format === 2) {
    for (let i = 0; i < count; i++) {
      const range = offset + 4 + i * 6;
      const start = view.getUint16(range);

      if (glyph < start) {
        break;
      }

      if (glyph <= view.getUint16(range + 2)) {
        return view.getUint16(range + 4) + glyph - start;
      }
    }
  }

  return -1;
}

/** The class of `glyph` in a class definition table. Glyphs not in it are 0. */
function glyphClass(view: DataView, offset: number, glyph: number) {
  const format = view.getUint16(offset);

  if (format === 1) {
    const start = view.getUint16(offset + 2);
    const count = view.getUint16(offset + 4);

    return glyph >= start && glyph < start + count
      ? view.getUint16(offset + 6 + (glyph - start) * 2)
      : 0;
  }

  if (format === 2) {
    const count = view.getUint16(offset + 2);

    for (let i = 0; i < count; i++) {
      const range = offset + 4 + i * 6;

      if (
        glyph >= view.getUint16(range) &&
        glyph <= view.getUint16(range + 2)
      ) {
        return view.getUint16(range + 4);
      }
    }
  }

  return 0;
}

/** The size of a value record in bytes: 2 for each field in it */
function valueRecordSize(format: number) {
  let size = 0;

  for (let bits = format; bits; bits >>= 1) {
    size += (bits & 1) * 2;
  }

  return size;
}

/**
 * The XAdvance of the value record at `offset`, which is what kerning
 * changes. The fields before it are XPlacement and YPlacement.
 */
function xAdvance(view: DataView, offset: number, format: number) {
  if (!(format & 0x4)) {
    return 0;
  }

  return view.getInt16(offset + valueRecordSize(format & 0x3));
}

/**
 * The kerning a pair adjustment subtable gives a pair of glyphs, or
 * undefined if the subtable doesn't cover the pair.
 */
function pairKerning(
  view: DataView,
  subtable: number,
  left: number,
  right: number,
) {
  const format = view.getUint16(subtable);
  const covered = coverageIndex(
    view,
    subtable + view.getUint16(subtable + 2),
    left,
  );

  if (covered < 0) {
    return undefined;
  }

  const valueFormat1 = view.getUint16(subtable + 4);
  const valueFormat2 = view.getUint16(subtable + 6);
  const size1 = valueRecordSize(valueFormat1);
  const size2 = valueRecordSize(valueFormat2);

  if (format === 1) {
    const pairSet = subtable + view.getUint16(subtable + 10 + covered * 2);
    const recordSize = 2 + size1 + size2;
    let low = 0;
    let high = view.getUint16(pairSet) - 1;

    // Pairs are sorted by the second glyph
    while (low <= high) {
      const middle = (low + high) >> 1;
      const record = pairSet + 2 + middle * recordSize;
      const second = view.getUint16(record);

      if (second === right) {
        return xAdvance(view, record + 2, valueFormat1);
      }

      if (second < right) {
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return undefined;
  }

  if (format === 2) {
    const class1 = glyphClass(
      view,
      subtable + view.getUint16(subtable + 8),
      left,
    );
    const class2 = glyphClass(
      view,
      subtable + view.getUint16(subtable + 10),
      right,
    );
    const class2Count = view.getUint16(subtable + 14);
    const record =
      subtable + 16 + (class1 * class2Count + class2) * (size1 + size2);

    return xAdvance(view, record, valueFormat1);
  }

  return undefined;
}

/**
 * The offsets of the pair adjustment subtables of each lookup of the `kern`
 * feature, for the default language of the `DFLT` script (or `latn`, or the
 * first script if the font has neither).
 */
function kernLookups(view: DataView) {
  const scriptList = view.getUint16(4);
  const featureList = view.getUint16(6);
  const lookupList = view.getUint16(8);
  const scriptCount = view.getUint16(scriptList);
  const scripts = new Map<string, number>();

  for (let i = 0; i < scriptCount; i++) {
    const record = scriptList + 2 + i * 6;

    scripts.set(readTag(view, record), scriptList + view.getUint16(record + 4));
  }

  const script =
    scripts.get("DFLT") ?? scripts.get("latn") ?? scripts.values().next().value;
  const langSysOffset = script === undefined ? 0 : view.getUint16(script);

  if (script === undefined || langSysOffset === 0) {
    return [];
  }

  const langSys = script + langSysOffset;
  const lookupIndices = new Set<number>();

  for (let i = 0; i < view.getUint16(langSys + 4); i++) {
    const featureIndex = view.getUint16(langSys + 6 + i * 2);
    const record = featureList + 2 + featureIndex * 6;

    if (readTag(view, record) !== "kern") {
      continue;
    }

    const feature = featureList + view.getUint16(record + 4);

    for (let j = 0; j < view.getUint16(feature + 2); j++) {
      lookupIndices.add(view.getUint16(feature + 4 + j * 2));
    }
  }

  // Lookups are applied in the order of the lookup list
  return [...lookupIndices]
    .sort((a, b) => a - b)
    .map((index) => {
      const lookup = lookupList + view.getUint16(lookupList + 2 + index * 2);
      const type = view.getUint16(lookup);
      const subtables: number[] = [];

      for (let i = 0; i < view.getUint16(lookup + 4); i++) {
        let subtable = lookup + view.getUint16(lookup + 6 + i * 2);

        // An extension subtable points to the real one with a 32 bit offset
        if (type === 9) {
          if (view.getUint16(subtable + 2) !== 2) {
            continue;
          }

          subtable += view.getUint32(subtable + 4);
        } else if (type !== 2) {
          continue;
        }

        subtables.push(subtable);
      }

      return subtables;
    })
    .filter((subtables) => subtables.length > 0);
}

/**
 * Reads the kerning from a GPOS table. Returns undefined if the table has
 * no kerning for the default script, so the `kern` table can be used instead.
 * @returns the kerning between two glyphs, by index, in font units
 */
export function gposKerning(view: DataView) {
  let lookups: number[][];

  try {
    lookups = kernLookups(view);
  } catch {
    // A broken table isn't worth failing to load the font for
    return undefined;
  }

  if (lookups.length === 0) {
    return undefined;
  }

  const cache = new Map<number, number>();

  return (left: number, right: number) => {
    const key = left * 0x10000 + right;
    let kerning = cache.get(key);

    if (kerning === undefined) {
      kerning = 0;

      try {
        // Each lookup adjusts the pair once, with its first subtable that covers it
        for (const subtables of lookups) {
          for (const subtable of subtables) {
            const value = pairKerning(view, subtable, left, right);

            if (value !== undefined) {
              kerning += value;
              break;
            }
          }
        }
      } catch {
        kerning = 0;
      }

      cache.set(key, kerning);
    }

    return kerning;
  };
}
