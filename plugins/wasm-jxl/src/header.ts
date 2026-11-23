/**
 * Reads the start of a JPEG XL codestream (ISO/IEC 18181-1): the image size
 * and, when the file describes its colours with an enum rather than an ICC
 * profile, the transfer function. Field encodings follow libjxl's
 * `SizeHeader`, `ImageMetadata` and `ColorEncoding`.
 */

/** The ISOBMFF signature box of the container format (ISO/IEC 18181-2) */
const CONTAINER_SIGNATURE = [
  0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
];
/** The header fields are a few hundred bytes at most */
const MAX_HEADER_BYTES = 65536;

export const TransferFunction = {
  PQ: 16,
  HLG: 18,
} as const;

export interface JxlHeader {
  width: number;
  height: number;
  /**
   * The CICP transfer characteristic, e.g. 13 for sRGB. Undefined when the
   * colours are described by an ICC profile or with a custom gamma, or if
   * the header couldn't be read that far.
   */
  transferFunction?: number;
}

/** Thrown when a field runs past the end of the data */
class EndOfData extends Error {}

/** A distribution of U32 fields: a value, or [extra bits, offset] */
type U32Distribution = number | [bits: number, offset: number];

class BitReader {
  private readonly data: Uint8Array;
  private position = 0;

  constructor(data: Uint8Array) {
    this.data = data;
  }

  bits(count: number) {
    let value = 0;

    // Least significant bit first, from 32 bit values without overflowing
    for (let i = 0; i < count; i++) {
      const byte = this.data[this.position >> 3];

      if (byte === undefined) {
        throw new EndOfData();
      }

      value += ((byte >> (this.position & 7)) & 1) * 2 ** i;
      this.position++;
    }

    return value;
  }

  bool() {
    return this.bits(1) === 1;
  }

  u32(...distributions: U32Distribution[]) {
    const distribution = distributions[this.bits(2)]!;

    return typeof distribution === "number"
      ? distribution
      : this.bits(distribution[0]) + distribution[1];
  }

  enum() {
    return this.u32(0, 1, [4, 2], [6, 18]);
  }
}

/** Whole-number ratios of width to height that SizeHeader can store */
const ASPECT_RATIOS = [
  [1, 1],
  [12, 10],
  [4, 3],
  [3, 2],
  [16, 9],
  [5, 4],
  [2, 1],
] as const;

function readSize(reader: BitReader) {
  const small = reader.bool();
  const readDimension = () =>
    small
      ? (reader.bits(5) + 1) * 8
      : reader.u32([9, 1], [13, 1], [18, 1], [30, 1]);
  const height = readDimension();
  const ratio = reader.bits(3);

  if (ratio === 0) {
    return { width: readDimension(), height };
  }

  const [numerator, denominator] = ASPECT_RATIOS[ratio - 1]!;
  return { width: Math.floor((height * numerator) / denominator), height };
}

function skipPreviewSize(reader: BitReader) {
  const div8 = reader.bool();
  const skipDimension = () =>
    div8
      ? reader.u32(16, 32, [5, 1], [9, 33])
      : reader.u32([6, 1], [8, 65], [10, 321], [12, 1345]);

  skipDimension();

  if (reader.bits(3) === 0) {
    skipDimension();
  }
}

function skipBitDepth(reader: BitReader) {
  if (reader.bool()) {
    reader.u32(32, 16, 24, [6, 1]);
    reader.bits(4);
  } else {
    reader.u32(8, 10, 12, [6, 1]);
  }
}

function skipExtraChannelInfo(reader: BitReader) {
  if (reader.bool()) {
    return;
  }

  const type = reader.enum();

  skipBitDepth(reader);
  // Dimension shift
  reader.u32(0, 3, 4, [3, 1]);
  // Name, in bytes
  reader.bits(reader.u32(0, [4, 0], [5, 16], [10, 48]) * 8);

  if (type === 0) {
    // Alpha: whether it's premultiplied
    reader.bits(1);
  } else if (type === 2) {
    // Spot colour: four 16 bit floats
    reader.bits(64);
  } else if (type === 5) {
    // CFA channel
    reader.u32(1, [2, 0], [4, 3], [8, 19]);
  }
}

function skipCustomXy(reader: BitReader) {
  for (let i = 0; i < 2; i++) {
    reader.u32([19, 0], [19, 524288], [20, 1048576], [21, 2097152]);
  }
}

/** The transfer function of the image's colour encoding */
function readTransferFunction(reader: BitReader) {
  if (reader.bool()) {
    // Fields are all default: sRGB
    return 13;
  }

  const wantIcc = reader.bool();
  const colorSpace = reader.enum();
  const gray = colorSpace === 1;
  const xyb = colorSpace === 2;

  if (wantIcc || xyb) {
    return undefined;
  }

  if (reader.enum() === 2) {
    // Custom white point
    skipCustomXy(reader);
  }

  if (!gray && reader.enum() === 2) {
    // Custom primaries
    for (let i = 0; i < 3; i++) {
      skipCustomXy(reader);
    }
  }

  // Images with a gamma exponent don't have a transfer function
  return reader.bool() ? undefined : reader.enum();
}

function readTransferFunctionFromMetadata(reader: BitReader) {
  if (reader.bool()) {
    // Fields are all default: sRGB
    return 13;
  }

  if (reader.bool()) {
    // Orientation
    reader.bits(3);

    if (reader.bool()) {
      // Intrinsic size
      readSize(reader);
    }

    if (reader.bool()) {
      skipPreviewSize(reader);
    }

    if (reader.bool()) {
      // Animation: ticks per second, number of loops and timecodes
      reader.u32(100, 1000, [10, 1], [30, 1]);
      reader.u32(1, 1001, [8, 1], [10, 1]);
      reader.u32(0, [3, 0], [16, 0], [32, 0]);
      reader.bits(1);
    }
  }

  skipBitDepth(reader);
  // Whether 16 bit buffers are enough for modular images
  reader.bits(1);

  const extraChannels = reader.u32(0, 1, [4, 2], [12, 1]);

  for (let i = 0; i < extraChannels; i++) {
    skipExtraChannelInfo(reader);
  }

  // Whether it's XYB encoded, which doesn't change the colour encoding
  reader.bits(1);

  return readTransferFunction(reader);
}

/** The codestream, from a bare codestream or the boxes of a container */
function getCodestream(data: Uint8Array) {
  if (data[0] === 0xff && data[1] === 0x0a) {
    return data;
  }

  if (CONTAINER_SIGNATURE.some((byte, i) => data[i] !== byte)) {
    return undefined;
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const parts: Uint8Array[] = [];
  let length = 0;
  let offset = 0;

  while (offset + 8 <= data.length && length < MAX_HEADER_BYTES) {
    let size = view.getUint32(offset);
    let headerSize = 8;
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8));

    if (size === 1) {
      if (offset + 16 > data.length) {
        break;
      }

      size = Number(view.getBigUint64(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      // The last box, to the end of the file
      size = data.length - offset;
    }

    if (size < headerSize) {
      break;
    }

    const contents = data.subarray(offset + headerSize, offset + size);

    if (type === "jxlc") {
      return contents;
    }

    if (type === "jxlp") {
      // Partial codestreams start with their index
      parts.push(contents.subarray(4));
      length += contents.length - 4;
    }

    offset += size;
  }

  const codestream = new Uint8Array(length);
  let position = 0;

  for (const part of parts) {
    codestream.set(part, position);
    position += part.length;
  }

  return codestream;
}

/**
 * Reads the size, and the transfer function if it's in the header, of a
 * JPEG XL codestream or container. Returns undefined if the data isn't
 * JPEG XL or is too short to have a size.
 */
export function readJxlHeader(data: Uint8Array): JxlHeader | undefined {
  const codestream = getCodestream(data);

  if (!codestream || codestream[0] !== 0xff || codestream[1] !== 0x0a) {
    return undefined;
  }

  const reader = new BitReader(codestream.subarray(2));
  let size;

  try {
    size = readSize(reader);
  } catch (error) {
    if (error instanceof EndOfData) {
      return undefined;
    }

    throw error;
  }

  try {
    return {
      ...size,
      transferFunction: readTransferFunctionFromMetadata(reader),
    };
  } catch (error) {
    if (error instanceof EndOfData) {
      return size;
    }

    throw error;
  }
}
