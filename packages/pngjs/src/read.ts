import {
  ALLOWED_BIT_DEPTHS,
  ColorType,
  GAMMA_DIVISION,
  MAX_CHUNK_LENGTH,
  PNG_SIGNATURE,
  isColorType,
} from "./constants.js";
import type { BitDepth } from "./constants.js";
import { decodeLatin1, decodeUtf8 } from "./text.js";
import type {
  IccProfile,
  PaletteColor,
  PhysicalDimensions,
  PngHeader,
  PngText,
  RenderingIntent,
} from "./types.js";
import { crc32 } from "./zlib.js";
import { MAX_METADATA_LENGTH, inflateZlib } from "./zlib-stream.js";

/** An APNG fcTL chunk */
export interface FrameControl {
  width: number;
  height: number;
  x: number;
  y: number;
  /** In milliseconds */
  delay: number;
  /** 0 none, 1 background, 2 previous */
  dispose: number;
  /** 0 source, 1 over */
  blend: number;
}

export interface ApngFrame {
  control: FrameControl;
  /** The compressed image data, from IDAT or fdAT chunks */
  data: Uint8Array[];
}

/** Everything read from a PNG's chunks, before the pixels are decoded */
export interface PngFile {
  header: PngHeader;
  /** RGB triples */
  plte?: Uint8Array;
  /** The raw tRNS data */
  trns?: Uint8Array;
  palette?: PaletteColor[];
  transparentColor?: number[];
  gamma?: number;
  srgb?: RenderingIntent;
  iccProfile?: IccProfile;
  physical?: PhysicalDimensions;
  text: PngText[];
  exif?: Uint8Array;
  /** The compressed data of the default image */
  idat: Uint8Array[];
  /** APNG animation control: number of frames and loops */
  animation?: { frames: number; loops: number };
  /** APNG frames, in order. Only read when asked for. */
  frames: ApngFrame[];
  /** Whether the default image (IDAT) is the first frame of the animation */
  idatIsFrame: boolean;
}

export interface ReadOptions {
  checkCRC: boolean;
  /** Read APNG frames too */
  frames?: boolean;
  /**
   * Stop at the first IDAT chunk, for the header and the chunks before it.
   * Returns undefined if the data ends before then.
   */
  headersOnly?: boolean;
}

function readUint32(data: Uint8Array, offset: number) {
  return (
    data[offset]! * 0x1000000 +
    ((data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!)
  );
}

function readUint16(data: Uint8Array, offset: number) {
  return (data[offset]! << 8) | data[offset + 1]!;
}

function chunkName(data: Uint8Array, offset: number) {
  return String.fromCharCode(
    data[offset]!,
    data[offset + 1]!,
    data[offset + 2]!,
    data[offset + 3]!,
  );
}

function isLetter(code: number) {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

export function hasPngSignature(data: Uint8Array) {
  if (data.length < PNG_SIGNATURE.length) {
    return false;
  }

  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (data[i] !== PNG_SIGNATURE[i]) {
      return false;
    }
  }

  return true;
}

export function parseHeader(chunk: Uint8Array): PngHeader {
  if (chunk.length !== 13) {
    throw new Error(`Invalid IHDR chunk: length ${chunk.length}, expected 13`);
  }

  const width = readUint32(chunk, 0);
  const height = readUint32(chunk, 4);
  const depth = chunk[8]!;
  const colorType = chunk[9]!;
  const compression = chunk[10]!;
  const filter = chunk[11]!;
  const interlace = chunk[12]!;

  if (width === 0 || height === 0) {
    throw new Error(`Invalid image size ${width}x${height}`);
  }

  if (width > MAX_CHUNK_LENGTH || height > MAX_CHUNK_LENGTH) {
    throw new Error(`Invalid image size ${width}x${height}: too large`);
  }

  if (!isColorType(colorType)) {
    throw new Error(`Unsupported color type ${colorType}`);
  }

  if (!ALLOWED_BIT_DEPTHS[colorType].includes(depth as BitDepth)) {
    throw new Error(
      `Unsupported bit depth ${depth} for color type ${colorType}`,
    );
  }

  if (compression !== 0) {
    throw new Error(`Unsupported compression method ${compression}`);
  }

  if (filter !== 0) {
    throw new Error(`Unsupported filter method ${filter}`);
  }

  if (interlace !== 0 && interlace !== 1) {
    throw new Error(`Unsupported interlace method ${interlace}`);
  }

  return {
    width,
    height,
    depth: depth as BitDepth,
    colorType,
    interlace: interlace === 1,
  };
}

/** Splits "keyword\0rest" */
function splitKeyword(chunk: Uint8Array) {
  const end = chunk.indexOf(0);

  if (end < 1 || end > 79) {
    throw new Error("Invalid keyword");
  }

  return { keyword: decodeLatin1(chunk.subarray(0, end)), rest: end + 1 };
}

function parseText(name: string, chunk: Uint8Array): PngText {
  const { keyword, rest } = splitKeyword(chunk);

  if (name === "tEXt") {
    return { keyword, text: decodeLatin1(chunk.subarray(rest)) };
  }

  if (name === "zTXt") {
    if (chunk[rest] !== 0) {
      throw new Error("Unknown compression method");
    }

    const text = inflateZlib(chunk.subarray(rest + 1), MAX_METADATA_LENGTH);

    return { keyword, text: decodeLatin1(text), compressed: true };
  }

  // iTXt
  const compressed = chunk[rest] === 1;

  if (compressed && chunk[rest + 1] !== 0) {
    throw new Error("Unknown compression method");
  }

  const languageEnd = chunk.indexOf(0, rest + 2);
  const translatedEnd =
    languageEnd < 0 ? -1 : chunk.indexOf(0, languageEnd + 1);

  if (rest + 2 > chunk.length || languageEnd < 0 || translatedEnd < 0) {
    throw new Error("Invalid iTXt chunk");
  }

  const body = chunk.subarray(translatedEnd + 1);

  return {
    keyword,
    text: decodeUtf8(
      compressed ? inflateZlib(body, MAX_METADATA_LENGTH) : body,
    ),
    compressed,
    language: decodeLatin1(chunk.subarray(rest + 2, languageEnd)),
    translatedKeyword: decodeUtf8(
      chunk.subarray(languageEnd + 1, translatedEnd),
    ),
  };
}

function parseIccProfile(chunk: Uint8Array): IccProfile {
  const { keyword, rest } = splitKeyword(chunk);

  if (chunk[rest] !== 0) {
    throw new Error("Unknown compression method");
  }

  return {
    name: keyword,
    data: inflateZlib(chunk.subarray(rest + 1), MAX_METADATA_LENGTH),
  };
}

function parseFrameControl(chunk: Uint8Array, header: PngHeader) {
  if (chunk.length !== 26) {
    throw new Error("Invalid fcTL chunk");
  }

  const control: FrameControl = {
    width: readUint32(chunk, 4),
    height: readUint32(chunk, 8),
    x: readUint32(chunk, 12),
    y: readUint32(chunk, 16),
    delay: 0,
    dispose: chunk[24]!,
    blend: chunk[25]!,
  };
  const numerator = readUint16(chunk, 20);
  // A denominator of 0 means 1/100 seconds
  const denominator = readUint16(chunk, 22) || 100;

  control.delay = (numerator / denominator) * 1000;

  if (
    control.width === 0 ||
    control.height === 0 ||
    control.x + control.width > header.width ||
    control.y + control.height > header.height ||
    control.dispose > 2 ||
    control.blend > 1
  ) {
    throw new Error("Invalid APNG frame");
  }

  return control;
}

/** The ancillary chunks parsed into PngFile */
function parseAncillary(
  name: string,
  chunk: Uint8Array,
  file: PngFile,
  seenIdat: boolean,
) {
  const { colorType } = file.header;

  switch (name) {
    case "tRNS": {
      if (seenIdat || file.trns) {
        return;
      }

      if (colorType === ColorType.PALETTE) {
        // tRNS must come after PLTE. Extra entries are ignored, like libpng.
        if (file.plte) {
          file.trns = chunk.subarray(0, file.plte.length / 3);
        }
      } else if (colorType === ColorType.GRAYSCALE && chunk.length === 2) {
        file.trns = chunk;
        file.transparentColor = [readUint16(chunk, 0)];
      } else if (colorType === ColorType.COLOR && chunk.length === 6) {
        file.trns = chunk;
        file.transparentColor = [
          readUint16(chunk, 0),
          readUint16(chunk, 2),
          readUint16(chunk, 4),
        ];
      }

      return;
    }
    case "gAMA": {
      const gamma = chunk.length === 4 ? readUint32(chunk, 0) : 0;

      if (gamma > 0 && file.gamma === undefined) {
        file.gamma = gamma / GAMMA_DIVISION;
      }

      return;
    }
    case "sRGB":
      if (chunk.length === 1 && chunk[0]! <= 3) {
        file.srgb = chunk[0] as RenderingIntent;
      }

      return;
    case "iCCP":
      if (!file.iccProfile) {
        file.iccProfile = parseIccProfile(chunk);
      }

      return;
    case "pHYs":
      if (chunk.length === 9 && chunk[8]! <= 1) {
        file.physical = {
          x: readUint32(chunk, 0),
          y: readUint32(chunk, 4),
          unit: chunk[8] === 1 ? "meter" : "unknown",
        };
      }

      return;
    case "tEXt":
    case "zTXt":
    case "iTXt":
      file.text.push(parseText(name, chunk));
      return;
    case "eXIf":
      if (!file.exif) {
        file.exif = chunk.slice();
      }

      return;
  }
}

/**
 * Reads a PNG's chunks. Data after IEND is ignored, like browsers do.
 *
 * Errors in the critical chunks throw. Broken metadata chunks are skipped, so
 * they don't stop the image from loading. A file that's cut off or has junk
 * after the image data only throws if that leaves too little image data,
 * which `decodePixels` checks.
 */
export function readPng(
  data: Uint8Array,
  options: ReadOptions & { headersOnly: true },
): PngFile | undefined;
export function readPng(data: Uint8Array, options: ReadOptions): PngFile;
export function readPng(
  data: Uint8Array,
  options: ReadOptions,
): PngFile | undefined {
  if (!hasPngSignature(data)) {
    throw new Error("Invalid file signature: not a PNG file");
  }

  let file: PngFile | undefined;
  let seenIdat = false;
  let offset = PNG_SIGNATURE.length;
  // APNG: the frame the next IDAT or fdAT chunks belong to
  let frame: ApngFrame | undefined;

  for (;;) {
    // Once there's image data, a broken file ends the chunks instead of
    // throwing, so as much of it as possible is decoded
    const structureError = (message: string) => {
      if ((file && seenIdat) || options.headersOnly) {
        return true;
      }

      throw new Error(message);
    };

    if (offset === data.length) {
      if (structureError("Unexpected end of file: no image data")) {
        break;
      }
    }

    if (offset + 12 > data.length) {
      if (structureError("Unexpected end of file")) {
        break;
      }
    }

    const length = readUint32(data, offset);
    const typeOffset = offset + 4;
    const name = chunkName(data, typeOffset);

    if (
      !isLetter(data[typeOffset]!) ||
      !isLetter(data[typeOffset + 1]!) ||
      !isLetter(data[typeOffset + 2]!) ||
      !isLetter(data[typeOffset + 3]!)
    ) {
      if (structureError("Invalid chunk type")) {
        break;
      }
    }

    // The header is done once image data starts, which needn't be complete
    if (options.headersOnly && file && name === "IDAT") {
      seenIdat = true;
      break;
    }

    if (length > MAX_CHUNK_LENGTH || typeOffset + 8 + length > data.length) {
      if (structureError(`Unexpected end of file in ${name} chunk`)) {
        break;
      }
    }

    const start = typeOffset + 4;
    const end = start + length;
    const chunk = data.subarray(start, end);
    const critical = (data[typeOffset]! & 0x20) === 0;

    offset = end + 4;

    if (options.checkCRC) {
      const crc = crc32(data.subarray(typeOffset, end));

      if (crc !== readUint32(data, end)) {
        if (critical) {
          throw new Error(`CRC error in ${name} chunk`);
        }

        // Skip broken metadata, like libpng
        continue;
      }
    }

    if (!file) {
      if (name !== "IHDR") {
        throw new Error(`IHDR must be the first chunk, found ${name}`);
      }

      file = {
        header: parseHeader(chunk),
        text: [],
        idat: [],
        frames: [],
        idatIsFrame: false,
      };
      continue;
    }

    if (name === "IDAT") {
      // IDAT chunks must be consecutive. libpng errors when they aren't, but
      // there's no doubt about what the file means, so use the data.
      seenIdat = true;
      file.idat.push(chunk);

      if (frame && file.frames.length === 1 && file.frames[0] === frame) {
        frame.data.push(chunk);
        file.idatIsFrame = true;
      }

      continue;
    }

    if (name === "IEND") {
      break;
    }

    switch (name) {
      case "IHDR":
        throw new Error("Duplicate IHDR chunk");
      case "PLTE": {
        if (file.plte || seenIdat) {
          continue;
        }

        const isPalette = file.header.colorType === ColorType.PALETTE;
        const entries = length / 3;

        if (length % 3 !== 0 || entries < 1 || entries > 256) {
          if (isPalette) {
            throw new Error(`Invalid palette with ${length} bytes`);
          }

          continue;
        }

        // Grayscale images can't have a palette, and colour images only have
        // a suggested one, which isn't needed to decode them. Entries the bit
        // depth can't index are ignored, like libpng.
        if (isPalette) {
          file.plte = chunk.subarray(
            0,
            Math.min(entries, 2 ** file.header.depth) * 3,
          );
        }

        continue;
      }
      case "acTL":
        if (options.frames && chunk.length === 8 && !seenIdat) {
          file.animation = {
            frames: readUint32(chunk, 0),
            loops: readUint32(chunk, 4),
          };
        }

        continue;
      case "fcTL":
        if (options.frames && file.animation) {
          try {
            frame = {
              control: parseFrameControl(chunk, file.header),
              data: [],
            };
          } catch {
            // A broken animation falls back to the default image
            file.animation = undefined;
            file.frames = [];
            frame = undefined;
            continue;
          }

          // The first frame must be the size of the image
          if (
            !seenIdat &&
            (frame.control.width !== file.header.width ||
              frame.control.height !== file.header.height ||
              frame.control.x !== 0 ||
              frame.control.y !== 0)
          ) {
            file.animation = undefined;
            frame = undefined;
            continue;
          }

          file.frames.push(frame);
        }

        continue;
      case "fdAT":
        if (options.frames && frame && seenIdat && length > 4) {
          frame.data.push(chunk.subarray(4));
        }

        continue;
    }

    if (critical) {
      throw new Error(`Unsupported critical chunk ${name}`);
    }

    try {
      parseAncillary(name, chunk, file, seenIdat);
    } catch {
      // Broken metadata doesn't stop the image from loading
    }
  }

  if (options.headersOnly && (!file || !seenIdat)) {
    return undefined;
  }

  if (!file) {
    throw new Error("Unexpected end of file: no IHDR chunk");
  }

  if (!seenIdat) {
    throw new Error("No image data: the file has no IDAT chunk");
  }

  if (file.header.colorType === ColorType.PALETTE) {
    if (!file.plte) {
      throw new Error("Missing palette: palette images need a PLTE chunk");
    }

    const { plte, trns } = file;
    const palette: PaletteColor[] = [];

    for (let i = 0; i < plte.length / 3; i++) {
      palette.push([
        plte[i * 3]!,
        plte[i * 3 + 1]!,
        plte[i * 3 + 2]!,
        trns && i < trns.length ? trns[i]! : 255,
      ]);
    }

    file.palette = palette;
  }

  return file;
}
