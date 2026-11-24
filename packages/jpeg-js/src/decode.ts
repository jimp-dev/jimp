import { JpegDecoder } from "./decoder/decoder.js";
import { JpegError, JpegFormatError, JpegLimitError } from "./errors.js";

/** Bytes of a JPEG: a Uint8Array (or Node Buffer), ArrayBuffer, other typed array or DataView, or an array of byte values. */
export type JpegData = ArrayBufferView | ArrayBuffer | ArrayLike<number>;

export interface DecodeJpegOptions {
  /**
   * Whether the data is YCbCr (or YCCK for 4 components) and must be
   * converted to RGB (or CMYK). By default this is picked from the JFIF and
   * Adobe markers and the component IDs, like libjpeg does.
   */
  colorTransform?: boolean;
  /**
   * Decode to RGBA (4 bytes per pixel, alpha always 255) instead of RGB.
   * @default true
   */
  formatAsRGBA?: boolean;
  /**
   * Recover from corrupt data like libjpeg does: skip junk between segments,
   * fix bad segment lengths, and decode damaged entropy-coded data as well as
   * possible. When false, any of these throws a `JpegFormatError`.
   * @default true
   */
  tolerantDecoding?: boolean;
  /**
   * Decode a JPEG whose image data was cut off, leaving the missing part grey
   * (or unrefined, for progressive JPEGs), like browsers show it. Otherwise
   * a truncated JPEG throws a `JpegFormatError`. A JPEG that only lacks its
   * end of image marker, or a few bits of its last row, always decodes.
   * @default false
   */
  allowTruncated?: boolean;
  /**
   * Throw a `JpegLimitError` instead of decoding an image of more than this
   * many megapixels.
   * @default 100
   */
  maxResolutionInMP?: number;
  /**
   * Throw a `JpegLimitError` instead of decoding an image that needs more than
   * about this many mebibytes of memory, including the decoded pixels.
   * @default 512
   */
  maxMemoryUsageInMB?: number;
  /**
   * The DQT and DHT tables of an "abbreviated" JPEG, which leaves them out
   * because they're stored elsewhere (e.g. the JPEGTables tag of a TIFF), as
   * a JPEG made of only SOI, tables and EOI.
   */
  tables?: JpegData;
}

export interface JpegImage {
  width: number;
  height: number;
  /** RGBA or RGB pixels, row by row. */
  data: Uint8Array;
  /**
   * The EXIF data of the APP1 segment, from its second padding byte (the
   * byte after "Exif\0"), like jpeg-js.
   */
  exifBuffer?: Uint8Array;
  /** The text of each COM segment, if there are any. */
  comments?: string[];
}

/** Views (or copies, for an array of numbers) `data` as bytes. */
export function toBytes(data: JpegData, name = "data"): Uint8Array {
  if (data instanceof Uint8Array) {
    return data;
  }

  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }

  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }

  if (
    data !== null &&
    typeof data === "object" &&
    typeof (data as ArrayLike<number>).length === "number"
  ) {
    return Uint8Array.from(data as ArrayLike<number>);
  }

  throw new TypeError(
    `Expected the ${name} to be a Uint8Array, ArrayBuffer, typed array or array of bytes`,
  );
}

const defaults = {
  formatAsRGBA: true,
  tolerantDecoding: true,
  allowTruncated: false,
  maxResolutionInMP: 100,
  maxMemoryUsageInMB: 512,
};

/**
 * Decodes a JPEG to RGBA (or RGB) pixels.
 *
 * Throws a `JpegFormatError` for data that isn't a JPEG or is corrupt, a
 * `JpegUnsupportedError` for JPEG features this decoder doesn't support (like
 * lossless and hierarchical JPEGs), and a `JpegLimitError` when a limit is
 * exceeded. All of them extend `JpegError`.
 */
export function decodeJpeg(
  data: JpegData,
  options: DecodeJpegOptions = {},
): JpegImage {
  const opts = { ...defaults };

  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      (opts as Record<string, unknown>)[key] = value;
    }
  }

  const bytes = toBytes(data);
  const decoder = new JpegDecoder({
    ...opts,
    colorTransform: options.colorTransform,
    tables:
      options.tables === undefined
        ? undefined
        : toBytes(options.tables, "tables"),
  });

  try {
    decoder.parse(bytes);

    const channels = opts.formatAsRGBA ? 4 : 3;
    const size = decoder.width * decoder.height * channels;
    let pixels: Uint8Array;

    try {
      pixels = new Uint8Array(size);
    } catch {
      throw new JpegLimitError(
        `Could not allocate enough memory for the image. Required: ${size}`,
      );
    }

    decoder.getPixels(pixels, channels);

    const image: JpegImage = {
      width: decoder.width,
      height: decoder.height,
      exifBuffer: decoder.exif,
      data: pixels,
    };

    if (decoder.comments.length > 0) {
      image.comments = decoder.comments;
    }

    return image;
  } catch (error) {
    if (error instanceof JpegError) {
      throw error;
    }

    // A bug, but keep the promise that only JpegErrors are thrown
    throw new JpegFormatError(
      `Failed to decode JPEG: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}
