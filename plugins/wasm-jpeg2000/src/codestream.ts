import { Buffer } from "buffer";

/** The signature box JP2 and JPX files start with */
const JP2_SIGNATURE = Buffer.from([
  0x00, 0x00, 0x00, 0x0c, 0x6a, 0x50, 0x20, 0x20, 0x0d, 0x0a, 0x87, 0x0a,
]);

/** Codestream markers */
const SOC = 0xff4f;
const SIZ = 0xff51;
const COD = 0xff52;
const SOT = 0xff90;

/** Enumerated colour spaces of the JP2 colour specification box */
const SRGB = 16;

export interface Component {
  /** Bits per sample */
  precision: number;
  signed: boolean;
  /** Horizontal subsampling */
  dx: number;
  /** Vertical subsampling */
  dy: number;
}

export interface CodestreamHeader {
  width: number;
  height: number;
  components: Component[];
  /** Wavelet decomposition levels, the most a decoder can reduce by */
  decompositions: number;
}

/** Finds the codestream of a JP2 or JPX file, or a raw codestream */
function findCodestream(data: Buffer) {
  if (data.readUInt16BE(0) === SOC) {
    return data;
  }

  if (!data.subarray(0, 12).equals(JP2_SIGNATURE)) {
    return undefined;
  }

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

    if (length < headerLength) {
      return undefined;
    }

    if (data.toString("latin1", offset + 4, offset + 8) === "jp2c") {
      return data.subarray(offset + headerLength, offset + length);
    }

    offset += length;
  }

  return undefined;
}

/**
 * Reads the image size, components and decomposition levels from the main
 * header of the codestream. Returns undefined if it can't be read.
 */
export function readCodestreamHeader(
  data: Buffer,
): CodestreamHeader | undefined {
  try {
    const codestream = findCodestream(data);

    if (!codestream) {
      return undefined;
    }

    let header: Partial<CodestreamHeader> = {};
    // Skip SOC. Each marker segment is the marker, then its length including
    // the length's 2 bytes.
    let offset = 2;

    while (offset + 4 <= codestream.length) {
      const marker = codestream.readUInt16BE(offset);

      if (marker === SOT) {
        break;
      }

      if (marker === SIZ) {
        const width =
          codestream.readUInt32BE(offset + 6) -
          codestream.readUInt32BE(offset + 14);
        const height =
          codestream.readUInt32BE(offset + 10) -
          codestream.readUInt32BE(offset + 18);
        const count = codestream.readUInt16BE(offset + 38);
        const components: Component[] = [];

        for (let i = 0; i < count; i++) {
          const ssiz = codestream[offset + 40 + i * 3]!;

          components.push({
            precision: (ssiz & 0x7f) + 1,
            signed: (ssiz & 0x80) !== 0,
            dx: codestream[offset + 41 + i * 3]!,
            dy: codestream[offset + 42 + i * 3]!,
          });
        }

        header = { ...header, width, height, components };
      } else if (marker === COD) {
        // After Scod, the progression order, layer count and MCT
        header.decompositions = codestream[offset + 9];
      }

      offset += 2 + codestream.readUInt16BE(offset + 2);
    }

    const { width, height, components, decompositions } = header;

    return width && height && components && decompositions !== undefined
      ? { width, height, components, decompositions }
      : undefined;
  } catch {
    return undefined;
  }
}

function box(type: string, ...contents: Buffer[]) {
  const data = Buffer.concat(contents);
  const header = Buffer.alloc(8);

  header.writeUInt32BE(data.length + 8, 0);
  header.write(type, 4, "latin1");

  return Buffer.concat([header, data]);
}

/**
 * Wraps an 8-bit RGB codestream in the boxes of a JP2 file: the signature,
 * file type, JP2 header (image header and sRGB colour specification) and
 * codestream boxes.
 */
export function writeJp2(codestream: Buffer, width: number, height: number) {
  const brand = Buffer.from("jp2 \0\0\0\0jp2 ", "latin1");
  const ihdr = Buffer.alloc(14);

  ihdr.writeUInt32BE(height, 0);
  ihdr.writeUInt32BE(width, 4);
  ihdr.writeUInt16BE(3, 8);
  // 8 bits per component, stored minus one
  ihdr[10] = 7;
  // Compressed with JPEG 2000
  ihdr[11] = 7;

  const colr = Buffer.alloc(7);

  // Enumerated colour space
  colr[0] = 1;
  colr.writeUInt32BE(SRGB, 3);

  return Buffer.concat([
    JP2_SIGNATURE,
    box("ftyp", brand),
    box("jp2h", box("ihdr", ihdr), box("colr", colr)),
    box("jp2c", codestream),
  ]);
}
