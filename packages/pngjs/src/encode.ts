import { toBuffer } from "./buffer.js";
import {
  ColorType,
  GAMMA_DIVISION,
  MAX_CHUNK_LENGTH,
  PNG_SIGNATURE,
} from "./constants.js";
import { filter } from "./filter.js";
import { getFilterStride, getLineBytes, getPasses } from "./interlace.js";
import { buildPalette, chooseFormat, getPixelStats, packPass } from "./pack.js";
import type { PackOptions, Palette, PixelSource } from "./pack.js";
import { encodeLatin1, encodeUtf8 } from "./text.js";
import type {
  EncodeOptions,
  ImageData,
  PngHeader,
  PngMetadata,
  PngText,
} from "./types.js";
import { crc32, deflate } from "./zlib.js";

const ALL_FILTERS = [0, 1, 2, 3, 4];

function writeUint32(data: Uint8Array, offset: number, value: number) {
  data[offset] = value >>> 24;
  data[offset + 1] = (value >>> 16) & 0xff;
  data[offset + 2] = (value >>> 8) & 0xff;
  data[offset + 3] = value & 0xff;
}

/** Length, type, data and CRC */
export function makeChunk(type: string, data?: Uint8Array) {
  const length = data?.length ?? 0;
  const chunk = new Uint8Array(length + 12);

  writeUint32(chunk, 0, length);

  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i);
  }

  if (data) {
    chunk.set(data, 8);
  }

  writeUint32(chunk, length + 8, crc32(chunk.subarray(4, length + 8)));

  return chunk;
}

function concatBytes(parts: Uint8Array[]) {
  let length = 0;

  for (const part of parts) {
    length += part.length;
  }

  const result = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function encodeKeyword(keyword: string) {
  const bytes = encodeLatin1(keyword);

  if (!bytes || bytes.length < 1 || bytes.length > 79 || bytes.includes(0)) {
    throw new Error(
      `Invalid keyword "${keyword}": it must be 1-79 Latin-1 characters`,
    );
  }

  return bytes;
}

export interface DeflateSettings {
  deflateLevel?: number | undefined;
  deflateStrategy?: number | undefined;
  deflateChunkSize?: number | undefined;
}

export function compress(data: Uint8Array, settings: DeflateSettings) {
  try {
    return deflate(data, {
      level: settings.deflateLevel ?? 9,
      strategy: settings.deflateStrategy ?? 3,
      chunkSize: settings.deflateChunkSize,
    });
  } catch (error) {
    throw new Error(
      `Compression failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

function textChunk(entry: PngText, settings: DeflateSettings) {
  const keyword = encodeKeyword(entry.keyword);
  const latin1 = encodeLatin1(entry.text);
  const international =
    !latin1 ||
    entry.language !== undefined ||
    entry.translatedKeyword !== undefined;

  if (!international) {
    if (entry.compressed) {
      return makeChunk(
        "zTXt",
        concatBytes([
          keyword,
          new Uint8Array([0, 0]),
          compress(latin1, settings),
        ]),
      );
    }

    return makeChunk(
      "tEXt",
      concatBytes([keyword, new Uint8Array([0]), latin1]),
    );
  }

  const text = encodeUtf8(entry.text);

  return makeChunk(
    "iTXt",
    concatBytes([
      keyword,
      new Uint8Array([0, entry.compressed ? 1 : 0, 0]),
      encodeLatin1(entry.language ?? "") ?? new Uint8Array(),
      new Uint8Array([0]),
      encodeUtf8(entry.translatedKeyword ?? ""),
      new Uint8Array([0]),
      entry.compressed ? compress(text, settings) : text,
    ]),
  );
}

/** The chunks that go before PLTE */
function colorSpaceChunks(metadata: PngMetadata, settings: DeflateSettings) {
  const chunks: Uint8Array[] = [];

  if (metadata.gamma) {
    const data = new Uint8Array(4);

    writeUint32(data, 0, Math.round(metadata.gamma * GAMMA_DIVISION));
    chunks.push(makeChunk("gAMA", data));
  }

  if (metadata.srgb !== undefined) {
    chunks.push(makeChunk("sRGB", new Uint8Array([metadata.srgb])));
  }

  if (metadata.iccProfile) {
    chunks.push(
      makeChunk(
        "iCCP",
        concatBytes([
          encodeKeyword(metadata.iccProfile.name),
          new Uint8Array([0, 0]),
          compress(metadata.iccProfile.data, settings),
        ]),
      ),
    );
  }

  return chunks;
}

/** The chunks that go between PLTE and IDAT */
function otherMetadataChunks(metadata: PngMetadata, settings: DeflateSettings) {
  const chunks: Uint8Array[] = [];

  if (metadata.physical) {
    const data = new Uint8Array(9);

    writeUint32(data, 0, metadata.physical.x);
    writeUint32(data, 4, metadata.physical.y);
    data[8] = metadata.physical.unit === "meter" ? 1 : 0;
    chunks.push(makeChunk("pHYs", data));
  }

  if (metadata.exif) {
    chunks.push(makeChunk("eXIf", metadata.exif));
  }

  for (const entry of metadata.text ?? []) {
    chunks.push(textChunk(entry, settings));
  }

  return chunks;
}

export function getFilterTypes(
  filterType: number | number[] | undefined,
  header: PngHeader,
) {
  if (filterType === undefined) {
    // Filters rarely help palette and low bit depth images, which is why
    // libpng doesn't use them there either
    return header.colorType === ColorType.PALETTE || header.depth < 8
      ? [0]
      : ALL_FILTERS;
  }

  const types = Array.isArray(filterType)
    ? filterType
    : filterType === -1
      ? ALL_FILTERS
      : [filterType];

  if (
    types.length === 0 ||
    types.some((type) => !Number.isInteger(type) || type < 0 || type > 4)
  ) {
    throw new Error(
      `Invalid filterType ${JSON.stringify(filterType)}: use -1 or filter types 0-4`,
    );
  }

  return types;
}

export interface WriteSettings extends DeflateSettings {
  filterType?: number | number[] | undefined;
  idatChunkSize?: number | undefined;
}

/**
 * Everything before the image data: the signature and the chunks before
 * IDAT. Also returns the filtered image data, ready to compress.
 */
export function preparePng(
  source: PixelSource,
  header: PngHeader,
  pack: PackOptions,
  metadata: PngMetadata,
  settings: WriteSettings,
) {
  const { width, height } = header;
  const filterTypes = getFilterTypes(settings.filterType, header);
  const stride = getFilterStride(header);
  const passes = getPasses(width, height, header.interlace);
  let size = 0;

  for (const pass of passes) {
    size += (getLineBytes(header, pass.width) + 1) * pass.height;
  }

  const filtered = new Uint8Array(size);
  let offset = 0;

  for (const pass of passes) {
    const lineBytes = getLineBytes(header, pass.width);
    const packed = packPass(source, header, pass, pack);

    filter(
      packed,
      0,
      lineBytes,
      pass.height,
      stride,
      filterTypes,
      filtered,
      offset,
    );
    offset += (lineBytes + 1) * pass.height;
  }

  const ihdr = new Uint8Array(13);

  writeUint32(ihdr, 0, width);
  writeUint32(ihdr, 4, height);
  ihdr[8] = header.depth;
  ihdr[9] = header.colorType;
  ihdr[12] = header.interlace ? 1 : 0;

  const head = [
    PNG_SIGNATURE,
    makeChunk("IHDR", ihdr),
    ...colorSpaceChunks(metadata, settings),
  ];

  if (pack.palette) {
    head.push(makeChunk("PLTE", pack.palette.plte));

    if (pack.palette.trns) {
      head.push(makeChunk("tRNS", pack.palette.trns));
    }
  }

  head.push(...otherMetadataChunks(metadata, settings));

  return { head, filtered };
}

/** Splits compressed data into IDAT chunks */
export function makeIdatChunks(compressed: Uint8Array, idatChunkSize?: number) {
  const size = Math.min(
    idatChunkSize && idatChunkSize > 0 ? Math.ceil(idatChunkSize) : Infinity,
    MAX_CHUNK_LENGTH,
  );
  const chunks: Uint8Array[] = [];

  for (let start = 0; start < compressed.length; start += size) {
    chunks.push(makeChunk("IDAT", compressed.subarray(start, start + size)));
  }

  return chunks;
}

/** Filters, compresses and writes the chunks of an image */
export function writePng(
  source: PixelSource,
  header: PngHeader,
  pack: PackOptions,
  metadata: PngMetadata,
  settings: WriteSettings,
) {
  const { head, filtered } = preparePng(
    source,
    header,
    pack,
    metadata,
    settings,
  );

  return concatBytes([
    ...head,
    ...makeIdatChunks(compress(filtered, settings), settings.idatChunkSize),
    makeChunk("IEND"),
  ]);
}

export function validateImage(image: ImageData<Uint8Array | Uint16Array>) {
  const { width, height, data } = image;

  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_CHUNK_LENGTH ||
    height > MAX_CHUNK_LENGTH
  ) {
    throw new Error(`Invalid image size ${width}x${height}`);
  }

  if (!data || data.length < width * height * 4) {
    throw new Error(
      `Not enough pixel data: a ${width}x${height} image needs ${width * height * 4} RGBA samples, got ${data?.length ?? 0}`,
    );
  }
}

/**
 * Encodes RGBA pixels as a PNG. By default it picks the smallest colour type
 * and bit depth that keep every pixel as it is.
 *
 * @param image 8-bit samples in a Uint8Array (or Buffer), or 16-bit samples
 * in a Uint16Array
 */
export function encode(
  image: ImageData<Uint8Array | Uint16Array>,
  options: EncodeOptions = {},
) {
  validateImage(image);

  const source: PixelSource = {
    width: image.width,
    height: image.height,
    data: image.data,
    depth: image.data instanceof Uint16Array ? 16 : 8,
  };
  const stats = getPixelStats(source);
  const { colorType, depth } = chooseFormat(
    source,
    stats,
    options.colorType,
    options.bitDepth,
  );
  const max = depth === 16 ? 65535 : 255;
  let palette: Palette | undefined;

  if (colorType === ColorType.PALETTE) {
    palette = buildPalette(stats.colors!);
  }

  const header: PngHeader = {
    width: image.width,
    height: image.height,
    depth,
    colorType,
    interlace: options.interlace ?? false,
  };

  return toBuffer(
    writePng(
      source,
      header,
      {
        background: options.background ?? { red: max, green: max, blue: max },
        palette,
      },
      options,
      options,
    ),
  );
}
