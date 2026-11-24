import type { BufferLike } from "./buffer.js";
import { toBuffer, toUint8Array } from "./buffer.js";
import { makeChunk, makeIdatChunks, preparePng } from "./encode.js";
import { adjustGamma } from "./gamma.js";
import {
  getMetadata,
  legacyRead,
  legacyWrite,
  prepareLegacyWrite,
} from "./legacy.js";
import type {
  Metadata,
  PNGWithMetadata,
  PackerOptions,
  ParserOptions,
} from "./legacy.js";
import { readPng } from "./read.js";
import { StreamBase } from "./stream-base.js";
import type {
  IccProfile,
  PaletteColor,
  PhysicalDimensions,
  PngText,
} from "./types.js";

export interface BaseOptions {
  /** Create a blank image of this size, to draw on and pack */
  width?: number | undefined;
  height?: number | undefined;
  /** Has no effect: new images are always filled with 0 */
  fill?: boolean | undefined;
}

export type PNGOptions = BaseOptions & ParserOptions & PackerOptions;

/** Stop looking for the header before this much data has arrived */
const MAX_HEADER_SEARCH = 4 * 1024 * 1024;

function concat(parts: Uint8Array[], length: number) {
  if (parts.length === 1) {
    return parts[0]!;
  }

  const result = new Uint8Array(length);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * pngjs's PNG class, a stream you can pipe a PNG file into and pipe a packed
 * PNG out of. In Node.js it's a classic Node Stream. In browsers it's an event
 * emitter with `.pipe()`.
 *
 * For most uses, the `decode` and `encode` functions are simpler.
 *
 * Events:
 * - "metadata" `(metadata)`: the header has been read
 * - "parsed" `(data)`: the image has been decoded to `data`
 * - "error" `(error)`
 * - "data" `(chunk)` and "end": the packed PNG, after `pack()`
 * - "finish" and "close": all the input has been parsed
 */
export class PNG extends StreamBase {
  static sync = {
    /** Decodes a PNG file to RGBA pixels and its metadata */
    read: legacyRead,
    /** Encodes an image's RGBA pixels as a PNG file */
    write: legacyWrite,
  };

  /**
   * Copies a rectangle of pixels from `src` to `dst`. Throws if it isn't
   * inside both images.
   */
  static bitblt(
    src: PNG,
    dst: PNG,
    srcX = 0,
    srcY = 0,
    width = 0,
    height = 0,
    deltaX = 0,
    deltaY = 0,
  ) {
    srcX |= 0;
    srcY |= 0;
    width |= 0;
    height |= 0;
    deltaX |= 0;
    deltaY |= 0;

    if (
      srcX < 0 ||
      srcY < 0 ||
      width < 0 ||
      height < 0 ||
      srcX + width > src.width ||
      srcY + height > src.height
    ) {
      throw new Error("bitblt reading outside image");
    }

    if (
      deltaX < 0 ||
      deltaY < 0 ||
      deltaX + width > dst.width ||
      deltaY + height > dst.height
    ) {
      throw new Error("bitblt writing outside image");
    }

    for (let y = 0; y < height; y++) {
      const start = ((srcY + y) * src.width + srcX) * 4;

      dst.data.set(
        src.data.subarray(start, start + width * 4),
        ((deltaY + y) * dst.width + deltaX) * 4,
      );
    }
  }

  /**
   * Applies the image's gamma for a display with a gamma of 2.2 (or
   * `displayGamma`), then sets `gamma` to 0. See `adjustGamma`.
   */
  static adjustGamma(src: PNG | PNGWithMetadata, displayGamma?: number) {
    adjustGamma(src, displayGamma);
  }

  width: number;
  height: number;
  /**
   * The pixels, as R, G, B, A samples. 8 bits each, unless the image was
   * parsed with `skipRescale` or `keepIndexed`.
   */
  data: BufferLike;
  /** The gAMA chunk's gamma, 0 if there isn't one */
  gamma = 0;
  readable = true;
  writable = true;

  /** The palette of a parsed palette image */
  palette?: PaletteColor[];
  /** The tRNS colour of a parsed grayscale or colour image */
  transColor?: number[];
  iccProfile?: IccProfile;
  physical?: PhysicalDimensions;
  text?: PngText[];

  #options: PNGOptions;
  #chunks: Uint8Array[] = [];
  #length = 0;
  #metadataEmitted = false;
  #failed = false;

  constructor(options: PNGOptions = {}) {
    super();
    this.#options = options;
    // Coerce to integers, and undefined to 0
    this.width = (options.width ?? 0) | 0;
    this.height = (options.height ?? 0) | 0;

    // 16-bit samples take 2 bytes each
    const bytesPerPixel = options.bitDepth === 16 ? 8 : 4;

    this.data = (
      this.width > 0 && this.height > 0
        ? toBuffer(new Uint8Array(bytesPerPixel * this.width * this.height))
        : null
    ) as BufferLike;
  }

  on(
    event: "metadata",
    listener: (this: PNG, metadata: Metadata) => void,
  ): this;
  on(event: "parsed", listener: (this: PNG, data: BufferLike) => void): this;
  on(event: "error", listener: (this: PNG, error: Error) => void): this;
  on(event: "data", listener: (this: PNG, chunk: BufferLike) => void): this;
  on(event: "close" | "end" | "finish", listener: (this: PNG) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  /** Parses PNG file data, then calls `callback` with an error or `this` */
  parse(
    data: Uint8Array | ArrayBuffer | string,
    callback?: (error: Error | null, png: PNG | null) => void,
  ): this {
    if (callback) {
      const onParsed = () => {
        this.removeListener("error", onError);
        callback(null, this);
      };
      const onError = (error: Error) => {
        this.removeListener("parsed", onParsed);
        callback(error, null);
      };

      this.once("parsed", onParsed);
      this.once("error", onError);
    }

    this.end(data);

    return this;
  }

  /** Adds PNG file data. Parsing finishes on `end()`. */
  write(data: Uint8Array | ArrayBuffer | string): boolean {
    if (!this.writable) {
      this.#emitLater("error", new Error("Stream not writable"));
      return false;
    }

    if (this.#failed) {
      return true;
    }

    const bytes =
      typeof data === "string"
        ? new TextEncoder().encode(data)
        : toUint8Array(data);

    this.#chunks.push(bytes);
    this.#length += bytes.length;
    this.#readHeaders();

    return true;
  }

  /** Adds the last of the PNG file data, if any, and parses it */
  end(data?: Uint8Array | ArrayBuffer | string): this {
    if (data !== undefined && data !== null) {
      this.write(data);
    }

    if (!this.writable) {
      return this;
    }

    this.writable = false;
    queueMicrotask(() => this.#parse());

    return this;
  }

  /**
   * Encodes `data` as a PNG and emits it as "data" events, then "end".
   * Pipe it somewhere, or iterate it with `for await`.
   */
  pack(): this {
    if (!this.data || !this.data.length) {
      this.emit("error", new Error("No data provided"));
      return this;
    }

    queueMicrotask(() => this.#pack());

    return this;
  }

  bitblt(
    dst: PNG,
    srcX?: number,
    srcY?: number,
    width?: number,
    height?: number,
    deltaX?: number,
    deltaY?: number,
  ): this {
    PNG.bitblt(this, dst, srcX, srcY, width, height, deltaX, deltaY);
    return this;
  }

  adjustGamma(displayGamma?: number) {
    adjustGamma(this, displayGamma);
  }

  /** The chunks of a packed PNG, once `pack()` has been called */
  async *[Symbol.asyncIterator](): AsyncGenerator<BufferLike> {
    const queue: BufferLike[] = [];
    let done = false;
    let failure: Error | undefined;
    let wake: (() => void) | undefined;
    const notify = () => {
      wake?.();
      wake = undefined;
    };
    const onData = (chunk: BufferLike) => {
      queue.push(chunk);
      notify();
    };
    const onEnd = () => {
      done = true;
      notify();
    };
    const onError = (error: Error) => {
      failure = error;
      notify();
    };

    this.on("data", onData);
    this.on("end", onEnd);
    this.on("error", onError);

    try {
      for (;;) {
        if (queue.length) {
          yield queue.shift()!;
        } else if (failure) {
          throw failure;
        } else if (done) {
          return;
        } else {
          await new Promise<void>((resolve) => {
            wake = resolve;
          });
        }
      }
    } finally {
      this.removeListener("data", onData);
      this.removeListener("end", onEnd);
      this.removeListener("error", onError);
    }
  }

  #emitLater(event: string, ...args: unknown[]) {
    queueMicrotask(() => this.emit(event, ...args));
  }

  #fail(error: unknown) {
    this.#failed = true;
    this.#chunks = [];
    this.#emitLater("error", toError(error));
    this.#emitLater("close");
  }

  /** Emits "metadata" as soon as the chunks before the image data are in */
  #readHeaders() {
    if (this.#metadataEmitted || this.#length > MAX_HEADER_SEARCH) {
      return;
    }

    const data = concat(this.#chunks, this.#length);

    this.#chunks = [data];

    try {
      const file = readPng(data, {
        checkCRC: this.#options.checkCRC !== false,
        headersOnly: true,
      });

      if (file) {
        this.#emitMetadata(getMetadata(file.header, file.trns !== undefined));
      }
    } catch (error) {
      this.#fail(error);
    }
  }

  #emitMetadata(metadata: Metadata) {
    this.#metadataEmitted = true;
    this.width = metadata.width;
    this.height = metadata.height;
    this.#emitLater("metadata", metadata);
  }

  #parse() {
    if (this.#failed) {
      return;
    }

    const data = concat(this.#chunks, this.#length);
    let result: PNGWithMetadata;

    this.#chunks = [];
    this.#length = 0;

    try {
      result = legacyRead(data, this.#options);
    } catch (error) {
      this.#failed = true;
      this.emit("error", toError(error));
      this.emit("close");
      return;
    }

    if (!this.#metadataEmitted) {
      this.#metadataEmitted = true;
      this.emit("metadata", getMetadata(result, result.alpha));
    }

    this.width = result.width;
    this.height = result.height;
    this.gamma = result.gamma;
    this.data = result.data;
    this.palette = result.palette || undefined;
    this.transColor = result.transColor;
    this.iccProfile = result.iccProfile;
    this.physical = result.physical;
    this.text = result.text;
    this.emit("parsed", result.data);
    this.emit("finish");
    this.emit("close");
  }

  #pack() {
    const options = this.#options;

    try {
      if (!options.deflateFactory) {
        this.emit("data", legacyWrite(this, options));
        this.emit("end");
        return;
      }

      // Compress with the given deflate stream, emitting an IDAT chunk for
      // each piece it outputs
      const { source, header, pack, metadata } = prepareLegacyWrite(
        this,
        options,
      );
      const { head, filtered } = preparePng(
        source,
        header,
        pack,
        metadata,
        options,
      );
      const deflate = options.deflateFactory({
        chunkSize: options.deflateChunkSize ?? 32 * 1024,
        level: options.deflateLevel ?? 9,
        strategy: options.deflateStrategy ?? 3,
      });

      for (const chunk of head) {
        this.emit("data", toBuffer(chunk));
      }

      deflate.on("error", (error) => this.emit("error", error));
      deflate.on("data", (compressed) => {
        for (const chunk of makeIdatChunks(compressed, options.idatChunkSize)) {
          this.emit("data", toBuffer(chunk));
        }
      });
      deflate.on("end", () => {
        this.emit("data", toBuffer(makeChunk("IEND")));
        this.emit("end");
      });
      deflate.end(filtered);
    } catch (error) {
      this.emit("error", toError(error));
    }
  }
}
