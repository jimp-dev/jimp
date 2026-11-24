/*
 * JPEG decoder: marker parsing, frame setup and orchestration.
 *
 * Copyright 2011 notmasteryet
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This code was forked from https://github.com/notmasteryet/jpgjs, through
 * jpeg-js (https://github.com/jpeg-js/jpeg-js) and pdf.js
 * (https://github.com/mozilla/pdf.js, src/core/jpg.js and jpeg_utils.js).
 *
 * - The JPEG specification can be found in the ITU CCITT Recommendation T.81
 *   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
 * - The JFIF specification can be found in the JPEG File Interchange Format
 *   (www.w3.org/Graphics/JPEG/jfif3.pdf)
 * - The Adobe Application-Specific JPEG markers in the
 *   Supporting the DCT Filters in PostScript Level 2, Technical Note #5116
 *   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)
 *
 * Modified by Jimp contributors (2026):
 * - translated to TypeScript, with a JpegError subclass for every failure
 *   instead of TypeErrors on malformed input;
 * - every segment is bounds-checked; SOS before SOF, unknown component IDs,
 *   missing tables, bad sampling factors and bad progression parameters are
 *   rejected;
 * - recovery from junk between segments, a lost 0xFF before a marker, segment
 *   lengths that are off and a missing EOI, merged from jpeg-js and Jimp;
 * - DNL support only for frames whose SOF height is 0, found by scanning ahead
 *   instead of re-parsing;
 * - entropy decoding, IDCT, upsampling and colour conversion are replaced by
 *   ports of libjpeg-turbo's (scan.ts, idct.ts, output.ts);
 * - sequential images are decoded one MCU row at a time, straight into sample
 *   planes, and colour conversion picks the colour space like libjpeg;
 * - resolution and memory limits from jpeg-js, plus external tables (JPEG
 *   abbreviated format).
 */

import {
  JpegFormatError,
  JpegLimitError,
  JpegUnsupportedError,
} from "../errors.js";
import { buildHuffmanTable, type HuffmanTable } from "./huffman.js";
import {
  createIdctContext,
  idctBlock,
  type IdctContext,
  type SampleArray,
} from "./idct.js";
import {
  type ColorSpace,
  convertToRgb,
  type OutputComponent,
} from "./output.js";
import { decodeScan, NATURAL_ORDER, type ScanComponent } from "./scan.js";
import { STANDARD_TABLES } from "./standard-tables.js";

export interface DecoderOptions {
  colorTransform?: boolean;
  tolerantDecoding: boolean;
  allowTruncated: boolean;
  maxResolutionInMP: number;
  maxMemoryUsageInMB: number;
  /** An abbreviated JPEG with the DQT and DHT tables the image refers to. */
  tables?: Uint8Array;
}

interface Component extends ScanComponent {
  id: number;
  quantId: number;
  /** Latched when the component's first scan starts, like libjpeg. */
  quantTable: Uint16Array | null;
  blocksPerColumnMcu: number;
  /** Size of the component's real samples. */
  width: number;
  height: number;
  plane: SampleArray | null;
  /** Some scan has covered this component. */
  scanned: boolean;
}

interface Frame {
  progressive: boolean;
  precision: number;
  width: number;
  height: number;
  components: Component[];
  maxH: number;
  maxV: number;
  mcusPerLine: number;
  mcusPerColumn: number;
}

/** Maximum number of blocks in an MCU, as in libjpeg (D_MAX_BLOCKS_IN_MCU). */
const MAX_BLOCKS_IN_MCU = 10;
/** Defends against files with an absurd number of (empty) scans. */
const MAX_SCANS = 1000;

const SOF_NAMES: Record<number, string> = {
  0xc3: "lossless",
  0xc5: "differential sequential (hierarchical)",
  0xc6: "differential progressive (hierarchical)",
  0xc7: "differential lossless (hierarchical)",
  0xc9: "arithmetic-coded sequential",
  0xca: "arithmetic-coded progressive",
  0xcb: "arithmetic-coded lossless",
  0xcd: "arithmetic-coded differential sequential (hierarchical)",
  0xce: "arithmetic-coded differential progressive (hierarchical)",
  0xcf: "arithmetic-coded differential lossless (hierarchical)",
};

function hex(value: number) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function isMarkerCode(code: number | undefined) {
  return code !== undefined && code >= 0xc0 && code <= 0xfe;
}

/** Markers that are followed by a length field. */
function hasLength(code: number) {
  return !(code >= 0xd0 && code <= 0xd9) && code !== 0x01;
}

export class JpegDecoder {
  width = 0;
  height = 0;
  jfif = false;
  adobe: { transformCode: number } | null = null;
  exif: Uint8Array | undefined;
  comments: string[] = [];

  private frame: Frame | null = null;
  private quantTables: (Uint16Array | undefined)[] = [];
  private dcTables: (HuffmanTable | undefined)[] = [];
  private acTables: (HuffmanTable | undefined)[] = [];
  private restartInterval = 0;
  /** Sequential image whose single scan is decoded one MCU row at a time. */
  private streaming = false;
  private scans = 0;
  private idct: IdctContext | null = null;
  private memoryUsed = 0;

  constructor(private readonly options: DecoderOptions) {}

  private get tolerant() {
    return this.options.tolerantDecoding;
  }

  private corrupt(message: string) {
    if (!this.tolerant) {
      throw new JpegFormatError(message);
    }
  }

  /** Tracks memory use against maxMemoryUsageInMB, like jpeg-js. */
  requestMemory(bytes: number) {
    const max = this.options.maxMemoryUsageInMB * 1024 * 1024;

    this.memoryUsed += bytes;

    if (this.memoryUsed > max) {
      const exceeded = Math.ceil((this.memoryUsed - max) / 1024 / 1024);

      throw new JpegLimitError(
        `maxMemoryUsageInMB limit exceeded by at least ${exceeded}MB`,
      );
    }
  }

  parse(data: Uint8Array) {
    if (this.options.tables) {
      this.parseMarkers(this.options.tables, true);
    }

    this.parseMarkers(data, false);

    const frame = this.frame;

    if (!frame) {
      throw new JpegFormatError("JPEG data contains no image (no SOF marker)");
    }

    if (this.scans === 0) {
      throw new JpegFormatError(
        "JPEG data contains no image data (no SOS marker)",
      );
    }

    if (!this.streaming) {
      this.finishCoefficients(frame);
    }
  }

  private parseMarkers(data: Uint8Array, tablesOnly: boolean) {
    const length = data.length;

    if (length < 2 || data[0] !== 0xff || data[1] !== 0xd8) {
      throw new JpegFormatError(
        tablesOnly
          ? "JPEG tables don't start with an SOI marker"
          : "SOI not found: the data is not a JPEG",
      );
    }

    let offset = 2;

    while (offset < length) {
      if (data[offset] !== 0xff || !isMarkerCode(data[offset + 1])) {
        // Fill bytes before a marker
        if (data[offset] === 0xff && data[offset + 1] === 0xff) {
          offset++;
          continue;
        }

        const next = this.recoverMarker(data, offset);

        if (next < 0) {
          break;
        }

        // Unless the marker only lost its 0xFF, parse from where it is
        if (next !== offset) {
          offset = next;
          continue;
        }
      }

      const code = data[offset + 1]!;
      let segmentEnd = offset + 2;

      if (hasLength(code)) {
        if (offset + 4 > length) {
          this.corrupt("JPEG data ends inside a marker segment");
          break;
        }

        const segmentLength = (data[offset + 2]! << 8) | data[offset + 3]!;

        segmentEnd = offset + 2 + segmentLength;

        if (segmentLength < 2 || segmentEnd > length) {
          // Only metadata can be cut short and leave a usable image
          if (code >= 0xe0 || code === 0xfe) {
            this.corrupt(`Bad length of ${this.describe(code)}`);
            break;
          }

          throw new JpegFormatError(`Bad length of ${this.describe(code)}`);
        }
      }

      const start = offset + 4;

      if (code === 0xd9) {
        break;
      }

      if (
        tablesOnly &&
        code !== 0xdb &&
        code !== 0xc4 &&
        code !== 0xdd &&
        !(code >= 0xe0 && code <= 0xef) &&
        code !== 0xfe
      ) {
        throw new JpegFormatError(
          `JPEG tables can only contain DQT, DHT and DRI markers, not ${this.describe(code)}`,
        );
      }

      switch (code) {
        case 0xe0:
        case 0xe1:
        case 0xe2:
        case 0xe3:
        case 0xe4:
        case 0xe5:
        case 0xe6:
        case 0xe7:
        case 0xe8:
        case 0xe9:
        case 0xea:
        case 0xeb:
        case 0xec:
        case 0xed:
        case 0xee:
        case 0xef:
        case 0xfe:
          segmentEnd = this.fixSegmentEnd(data, start, segmentEnd);

          if (!tablesOnly) {
            this.readAppSegment(code, data.subarray(start, segmentEnd));
          }

          offset = segmentEnd;
          break;

        case 0xdb:
          this.readQuantTables(data, start, segmentEnd);
          offset = segmentEnd;
          break;

        case 0xc4:
          this.readHuffmanTables(data, start, segmentEnd);
          offset = segmentEnd;
          break;

        case 0xdd:
          if (segmentEnd - start < 2) {
            throw new JpegFormatError("Bad length of DRI marker");
          }

          this.restartInterval = (data[start]! << 8) | data[start + 1]!;
          offset = segmentEnd;
          break;

        case 0xc0:
        case 0xc1:
        case 0xc2:
          this.readFrame(code, data, start, segmentEnd);
          offset = segmentEnd;
          break;

        case 0xc3:
        case 0xc5:
        case 0xc6:
        case 0xc7:
        case 0xc9:
        case 0xca:
        case 0xcb:
        case 0xcd:
        case 0xce:
        case 0xcf:
          throw new JpegUnsupportedError(
            `Unsupported JPEG process: ${SOF_NAMES[code]} (SOF${code - 0xc0}) JPEGs are not supported`,
          );

        case 0xda:
          offset = this.readScan(data, start, segmentEnd);
          break;

        case 0xd8: // SOI
        case 0xd0: // RSTn outside a scan, e.g. extra ones after it
        case 0xd1:
        case 0xd2:
        case 0xd3:
        case 0xd4:
        case 0xd5:
        case 0xd6:
        case 0xd7:
          offset += 2;
          break;

        case 0xdc: // DNL: read ahead in readFrame() when it's needed
        case 0xcc: // DAC: only used by arithmetic coding
          offset = segmentEnd;
          break;

        default:
          // JPGn, DHP, EXP, ... Skip them like APPn if their length is sane
          this.corrupt(`Unsupported JPEG marker ${this.describe(code)}`);
          offset = this.fixSegmentEnd(data, start, segmentEnd);
          break;
      }
    }
  }

  private describe(code: number) {
    return `marker 0xFF${hex(code)}`;
  }

  /**
   * Called when a marker was expected at `offset` but isn't there. Finds where
   * parsing should go on, or returns -1 to stop.
   */
  private recoverMarker(data: Uint8Array, offset: number) {
    const length = data.length;

    this.corrupt(
      `Corrupt JPEG data: expected a marker at offset ${offset}, found 0x${hex(data[offset]!)}`,
    );

    // The 0xFF of the marker was lost (seen from Pixel phones, jpeg-js #84):
    // parse it from here
    const code = data[offset + 1];

    if (
      isMarkerCode(code) &&
      hasLength(code!) &&
      offset + 4 <= length &&
      this.segmentEndsWell(
        data,
        offset + 2 + ((data[offset + 2]! << 8) | data[offset + 3]!),
      )
    ) {
      return offset;
    }

    // Otherwise skip to the next marker, like libjpeg does (and Jimp did
    // with skipJunkBeforeMarkers)
    for (let i = offset + 1; i + 1 < length; i++) {
      if (data[i] !== 0xff) {
        continue;
      }

      const next = data[i + 1]!;

      if (!isMarkerCode(next) || next === 0xff) {
        continue;
      }

      if (
        !hasLength(next) ||
        next === 0xda ||
        (i + 4 <= length &&
          this.segmentEndsWell(
            data,
            i + 2 + ((data[i + 2]! << 8) | data[i + 3]!),
          ))
      ) {
        return i;
      }
    }

    return -1;
  }

  /** Whether a segment ending at `end` is followed by a marker or the end. */
  private segmentEndsWell(data: Uint8Array, end: number) {
    return end === data.length || (end < data.length && data[end] === 0xff);
  }

  /**
   * Fixes the end of a segment whose length doesn't lead to a marker, by
   * searching for one in the data (pdf.js readDataBlock).
   */
  private fixSegmentEnd(data: Uint8Array, start: number, end: number) {
    if (this.segmentEndsWell(data, end)) {
      return end;
    }

    this.corrupt("Corrupt JPEG data: bad marker segment length");

    for (let i = start; i + 1 < data.length; i++) {
      if (
        data[i] === 0xff &&
        isMarkerCode(data[i + 1]) &&
        data[i + 1] !== 0xff
      ) {
        return i;
      }
    }

    return data.length;
  }

  private readAppSegment(code: number, segment: Uint8Array) {
    const is = (...bytes: number[]) =>
      bytes.every((byte, index) => segment[index] === byte);

    if (code === 0xfe) {
      let comment = "";

      for (let i = 0; i < segment.length; i += 0x8000) {
        comment += String.fromCharCode(...segment.subarray(i, i + 0x8000));
      }

      this.comments.push(comment);
    } else if (code === 0xe0 && is(0x4a, 0x46, 0x49, 0x46, 0)) {
      // JFIF\0
      this.jfif = true;
    } else if (code === 0xe1 && is(0x45, 0x78, 0x69, 0x66, 0)) {
      // Exif\0. Like jpeg-js, everything after "Exif\0", so starting with the
      // second padding byte
      this.exif = segment.slice(5);
    } else if (code === 0xee && is(0x41, 0x64, 0x6f, 0x62, 0x65)) {
      // Adobe
      this.adobe = { transformCode: segment[11] ?? 0 };
    }
  }

  private readQuantTables(data: Uint8Array, offset: number, end: number) {
    while (offset < end) {
      const spec = data[offset++]!;
      const precision = spec >> 4;

      if (precision > 1) {
        throw new JpegFormatError("Bogus DQT: invalid table precision");
      }

      if (offset + 64 * (precision + 1) > end) {
        throw new JpegFormatError("Bad length of DQT marker");
      }

      const table = new Uint16Array(64);

      for (let i = 0; i < 64; i++) {
        if (precision === 0) {
          table[NATURAL_ORDER[i]!] = data[offset++]!;
        } else {
          table[NATURAL_ORDER[i]!] = (data[offset]! << 8) | data[offset + 1]!;
          offset += 2;
        }
      }

      this.quantTables[spec & 15] = table;
    }
  }

  private readHuffmanTables(data: Uint8Array, offset: number, end: number) {
    while (offset < end) {
      const spec = data[offset++]!;
      const tableClass = spec >> 4;

      if (tableClass > 1 || offset + 16 > end) {
        throw new JpegFormatError("Bogus DHT: invalid table");
      }

      const counts = data.subarray(offset, offset + 16);
      let count = 0;

      for (let i = 0; i < 16; i++) {
        count += counts[i]!;
      }

      offset += 16;

      if (count > 256 || offset + count > end) {
        throw new JpegFormatError("Bogus DHT: invalid table");
      }

      const table = buildHuffmanTable(
        counts,
        data.subarray(offset, offset + count),
        tableClass === 0,
      );

      offset += count;
      (tableClass === 0 ? this.dcTables : this.acTables)[spec & 15] = table;
    }
  }

  private readFrame(
    code: number,
    data: Uint8Array,
    offset: number,
    end: number,
  ) {
    if (this.frame) {
      throw new JpegFormatError(
        "JPEG data has more than one frame (SOF marker)",
      );
    }

    if (end - offset < 6) {
      throw new JpegFormatError("Bad length of SOF marker");
    }

    const precision = data[offset]!;
    let height = (data[offset + 1]! << 8) | data[offset + 2]!;
    const width = (data[offset + 3]! << 8) | data[offset + 4]!;
    const count = data[offset + 5]!;

    if (precision !== 8 && precision !== 12) {
      throw new JpegUnsupportedError(
        `Unsupported JPEG data precision: ${precision} bits (only 8 and 12 are supported)`,
      );
    }

    if (count === 0 || end - offset < 6 + count * 3) {
      throw new JpegFormatError("Bad length of SOF marker");
    }

    if (count !== 1 && count !== 3 && count !== 4) {
      throw new JpegUnsupportedError(
        `Unsupported JPEG colour format: ${count} components`,
      );
    }

    if (width === 0) {
      throw new JpegFormatError("Empty JPEG image (width is 0)");
    }

    if (height === 0) {
      // The height is in a DNL marker after the first scan
      height = this.findDnlHeight(data, end);
    }

    const megapixels = (width * height) / 1e6;

    if (megapixels > this.options.maxResolutionInMP) {
      const exceeded = Math.ceil(megapixels - this.options.maxResolutionInMP);

      throw new JpegLimitError(
        `maxResolutionInMP limit exceeded by ${exceeded}MP`,
      );
    }

    const components: Component[] = [];
    let maxH = 1;
    let maxV = 1;

    for (let i = 0; i < count; i++) {
      const p = offset + 6 + i * 3;
      const id = data[p]!;
      const h = data[p + 1]! >> 4;
      const v = data[p + 1]! & 15;

      if (h < 1 || h > 4 || v < 1 || v > 4) {
        throw new JpegFormatError(
          "Invalid sampling factor, expected values from 1 to 4",
        );
      }

      maxH = Math.max(maxH, h);
      maxV = Math.max(maxV, v);
      components.push({
        id,
        h,
        v,
        quantId: data[p + 2]!,
        quantTable: null,
        blocksPerLine: 0,
        blocksPerColumn: 0,
        blocksPerLineMcu: 0,
        blocksPerColumnMcu: 0,
        width: 0,
        height: 0,
        coefficients: new Int16Array(0),
        plane: null,
        dcTable: null,
        acTable: null,
        pred: 0,
        scanned: false,
      });
    }

    const mcusPerLine = Math.ceil(width / (8 * maxH));
    const mcusPerColumn = Math.ceil(height / (8 * maxV));
    const sampleBytes = precision > 8 ? 2 : 1;
    let planeBytes = 0;
    let coefficientBytes = 0;

    for (const component of components) {
      component.width = Math.ceil((width * component.h) / maxH);
      component.height = Math.ceil((height * component.v) / maxV);
      component.blocksPerLine = Math.ceil(component.width / 8);
      component.blocksPerColumn = Math.ceil(component.height / 8);
      component.blocksPerLineMcu = mcusPerLine * component.h;
      component.blocksPerColumnMcu = mcusPerColumn * component.v;
      planeBytes +=
        component.blocksPerLine * component.blocksPerColumn * 64 * sampleBytes;
      coefficientBytes +=
        component.blocksPerLineMcu * component.blocksPerColumnMcu * 128;
    }

    this.width = width;
    this.height = height;
    this.frame = {
      progressive: code === 0xc2,
      precision,
      width,
      height,
      components,
      maxH,
      maxV,
      mcusPerLine,
      mcusPerColumn,
    };

    // The planes and the output, plus the coefficients of a progressive JPEG
    this.requestMemory(planeBytes + width * height * 4);

    if (code === 0xc2) {
      this.requestMemory(coefficientBytes);
    }
  }

  /** Finds the DNL marker that gives the height of a frame. */
  private findDnlHeight(data: Uint8Array, offset: number) {
    for (let i = offset; i + 5 < data.length; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xdc) {
        const height = (data[i + 4]! << 8) | data[i + 5]!;

        if (height > 0) {
          return height;
        }
      }
    }

    throw new JpegFormatError(
      "Empty JPEG image (height is 0 and there is no DNL marker)",
    );
  }

  private readScan(data: Uint8Array, offset: number, end: number) {
    const frame = this.frame;

    if (!frame) {
      throw new JpegFormatError(
        "Corrupt JPEG data: SOS marker before SOF marker",
      );
    }

    if (++this.scans > MAX_SCANS) {
      throw new JpegLimitError(`JPEG has more than ${MAX_SCANS} scans`);
    }

    const count = data[offset++]!;

    if (count < 1 || count > 4 || end - offset !== count * 2 + 3) {
      throw new JpegFormatError("Bad length of SOS marker");
    }

    const components: Component[] = [];

    for (let i = 0; i < count; i++) {
      const id = data[offset++]!;
      const tables = data[offset++]!;
      const component = frame.components.find((c) => c.id === id);

      if (!component || components.includes(component)) {
        throw new JpegFormatError(`Invalid component ID ${id} in SOS marker`);
      }

      component.dcTable = this.huffmanTable(this.dcTables, tables >> 4, true);
      component.acTable = this.huffmanTable(this.acTables, tables & 15, false);
      components.push(component);
    }

    const spectralStart = data[offset++]!;
    const spectralEnd = data[offset++]!;
    const approxHigh = data[offset]! >> 4;
    const approxLow = data[offset]! & 15;

    if (frame.progressive) {
      const dc = spectralStart === 0;

      if (
        (dc
          ? spectralEnd !== 0
          : spectralStart > spectralEnd || spectralEnd > 63 || count !== 1) ||
        (approxHigh !== 0 && approxLow !== approxHigh - 1) ||
        approxLow > 13
      ) {
        throw new JpegFormatError(
          `Invalid progressive parameters Ss=${spectralStart} Se=${spectralEnd} Ah=${approxHigh} Al=${approxLow}`,
        );
      }
    }

    // Check the tables each kind of scan needs
    const needsDC =
      !frame.progressive || (spectralStart === 0 && approxHigh === 0);
    const needsAC = !frame.progressive || spectralStart > 0;

    for (const component of components) {
      if ((needsDC && !component.dcTable) || (needsAC && !component.acTable)) {
        throw new JpegFormatError("Huffman table missing for SOS component");
      }
    }

    if (count > 1) {
      let blocks = 0;

      for (const component of components) {
        blocks += component.h * component.v;
      }

      if (blocks > MAX_BLOCKS_IN_MCU) {
        throw new JpegFormatError(
          "Sampling factors too large for interleaved scan",
        );
      }
    }

    const scanStart = end;

    if (!frame.progressive && this.streaming) {
      // The image is complete, ignore further scans
      return this.skipScan(data, scanStart);
    }

    for (const component of components) {
      if (!component.quantTable) {
        component.quantTable = this.quantTables[component.quantId] ?? null;

        if (
          !component.quantTable &&
          !frame.progressive &&
          count === frame.components.length
        ) {
          throw new JpegFormatError(
            `Quantization table ${component.quantId} is missing`,
          );
        }
      }
    }

    this.checkEnoughData(
      frame,
      data,
      scanStart,
      components,
      needsDC ? (frame.progressive ? 1 : 2) : 0,
    );

    const firstScan = this.scans === 1;

    if (firstScan) {
      this.idct = createIdctContext(frame.precision);
      this.streaming = !frame.progressive && count === frame.components.length;
    }

    if (this.streaming) {
      return this.decodeStreamingScan(frame, data, scanStart, components);
    }

    for (const component of components) {
      if (component.coefficients.length === 0) {
        if (!frame.progressive) {
          this.requestMemory(
            component.blocksPerLineMcu * component.blocksPerColumnMcu * 128,
          );
        }

        component.coefficients = this.allocate(
          () =>
            new Int16Array(
              component.blocksPerLineMcu * component.blocksPerColumnMcu * 64,
            ),
        );
      }

      component.scanned = true;
    }

    return decodeScan(
      data,
      scanStart,
      {
        components,
        progressive: frame.progressive,
        spectralStart,
        spectralEnd,
        approxHigh,
        approxLow,
        mcusPerLine: frame.mcusPerLine,
        mcusPerColumn: frame.mcusPerColumn,
        restartInterval: this.restartInterval,
      },
      this.scanOptions(),
    );
  }

  private scanOptions() {
    return {
      tolerant: this.tolerant,
      allowTruncated: this.options.allowTruncated,
    };
  }

  private huffmanTable(
    tables: (HuffmanTable | undefined)[],
    id: number,
    isDC: boolean,
  ) {
    let table = tables[id];

    // Like libjpeg-turbo, fall back on the tables of the JPEG standard
    // (Annex K), which Motion JPEG frames leave out
    if (!table && id < 2) {
      const standard = STANDARD_TABLES[isDC ? "dc" : "ac"][id]!;

      table = buildHuffmanTable(standard.counts, standard.symbols, isDC);
      tables[id] = table;
    }

    return table ?? null;
  }

  /**
   * Rejects a frame that is too big for the data left before decoding it, so
   * a small file can't make the decoder allocate and decode a huge image.
   * Every block needs at least one bit per scan for its DC coefficient, two
   * for a sequential scan (with the end-of-block code).
   */
  private checkEnoughData(
    frame: Frame,
    data: Uint8Array,
    offset: number,
    components: Component[],
    bitsPerBlock: number,
  ) {
    if (this.options.allowTruncated || bitsPerBlock === 0) {
      return;
    }

    let blocks = 0;

    for (const component of components) {
      blocks +=
        components.length === 1
          ? component.blocksPerLine * component.blocksPerColumn
          : frame.mcusPerLine * frame.mcusPerColumn * component.h * component.v;
    }

    // Leave a row of MCUs, which may be missing (see checkTruncated())
    const rowBlocks =
      frame.mcusPerLine * frame.maxH * frame.maxV * components.length;

    if (((blocks - rowBlocks) * bitsPerBlock) / 8 > data.length - offset) {
      throw new JpegFormatError(
        "JPEG data is truncated: the image data ends before the image is complete",
      );
    }
  }

  private allocate<T>(create: () => T): T {
    try {
      return create();
    } catch (error) {
      if (error instanceof RangeError) {
        throw new JpegLimitError(
          "Could not allocate enough memory for the image",
        );
      }

      throw error;
    }
  }

  private createPlane(frame: Frame, component: Component) {
    const size = component.blocksPerLine * component.blocksPerColumn * 64;

    component.plane = this.allocate(() =>
      frame.precision > 8 ? new Uint16Array(size) : new Uint8Array(size),
    );
  }

  private decodeStreamingScan(
    frame: Frame,
    data: Uint8Array,
    offset: number,
    components: Component[],
  ) {
    const single = components.length === 1;
    const idct = this.idct!;

    for (const component of components) {
      const rows = single ? 1 : component.v;

      component.coefficients = new Int16Array(
        component.blocksPerLineMcu * rows * 64,
      );
      this.createPlane(frame, component);
      component.scanned = true;
    }

    const onRow = (mcuRow: number) => {
      for (const component of components) {
        const rows = single ? 1 : component.v;
        const {
          blocksPerLine,
          blocksPerColumn,
          blocksPerLineMcu,
          coefficients,
        } = component;
        const plane = component.plane!;
        const stride = blocksPerLine * 8;
        const quantTable = component.quantTable!;

        for (let j = 0; j < rows; j++) {
          const blockRow = mcuRow * rows + j;

          if (blockRow >= blocksPerColumn) {
            break;
          }

          for (let col = 0; col < blocksPerLine; col++) {
            idctBlock(
              idct,
              coefficients,
              (j * blocksPerLineMcu + col) * 64,
              quantTable,
              plane,
              blockRow * 8 * stride + col * 8,
              stride,
            );
          }
        }

        coefficients.fill(0);
      }
    };

    return decodeScan(
      data,
      offset,
      {
        components,
        progressive: false,
        spectralStart: 0,
        spectralEnd: 63,
        approxHigh: 0,
        approxLow: 0,
        mcusPerLine: frame.mcusPerLine,
        mcusPerColumn: frame.mcusPerColumn,
        restartInterval: this.restartInterval,
        onRow,
      },
      this.scanOptions(),
    );
  }

  /** Skips the data of a scan that isn't decoded. */
  private skipScan(data: Uint8Array, offset: number) {
    for (let i = offset; i + 1 < data.length; i++) {
      const next = data[i + 1]!;

      if (
        data[i] === 0xff &&
        next !== 0 &&
        next !== 0xff &&
        !(next >= 0xd0 && next <= 0xd7)
      ) {
        return i;
      }
    }

    return data.length;
  }

  /** IDCT of the stored coefficients of a progressive or multi-scan JPEG. */
  private finishCoefficients(frame: Frame) {
    const idct = this.idct!;

    for (const component of frame.components) {
      if (!component.scanned) {
        this.corrupt("JPEG data is missing a colour component");
      }

      const quantTable =
        component.quantTable ?? this.quantTables[component.quantId];

      if (!quantTable) {
        throw new JpegFormatError(
          `Quantization table ${component.quantId} is missing`,
        );
      }

      this.createPlane(frame, component);

      if (!component.scanned) {
        continue;
      }

      const { blocksPerLine, blocksPerColumn, blocksPerLineMcu, coefficients } =
        component;
      const plane = component.plane!;
      const stride = blocksPerLine * 8;

      for (let row = 0; row < blocksPerColumn; row++) {
        for (let col = 0; col < blocksPerLine; col++) {
          idctBlock(
            idct,
            coefficients,
            (row * blocksPerLineMcu + col) * 64,
            quantTable,
            plane,
            row * 8 * stride + col * 8,
            stride,
          );
        }
      }

      // Free the coefficients before the output is allocated
      component.coefficients = new Int16Array(0);
    }
  }

  /**
   * The colour space of the data, picked like libjpeg does unless
   * `colorTransform` says whether to transform from YCbCr (or YCCK).
   */
  get colorSpace(): ColorSpace {
    const frame = this.frame!;
    const count = frame.components.length;
    const transform = this.options.colorTransform;

    if (count === 1) {
      return "grayscale";
    }

    if (count === 3) {
      if (transform !== undefined) {
        return transform ? "ycbcr" : "rgb";
      }

      if (this.jfif) {
        return "ycbcr";
      }

      if (this.adobe) {
        return this.adobe.transformCode === 0 ? "rgb" : "ycbcr";
      }

      const [a, b, c] = frame.components as [Component, Component, Component];

      // ASCII 'R', 'G', 'B'
      return a.id === 0x52 && b.id === 0x47 && c.id === 0x42 ? "rgb" : "ycbcr";
    }

    if (transform !== undefined) {
      return transform ? "ycck" : "cmyk";
    }

    return this.adobe && this.adobe.transformCode !== 0 ? "ycck" : "cmyk";
  }

  /** Converts the decoded image to RGBA (`channels` 4) or RGB. */
  getPixels(output: Uint8Array, channels: 3 | 4) {
    const frame = this.frame!;
    const components: OutputComponent[] = frame.components.map((c) => ({
      plane: c.plane!,
      stride: c.blocksPerLine * 8,
      width: c.width,
      height: c.height,
      h: c.h,
      v: c.v,
    }));

    convertToRgb(
      components,
      this.colorSpace,
      frame.width,
      frame.height,
      frame.precision,
      channels,
      output,
    );
  }
}
