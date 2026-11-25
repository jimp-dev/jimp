// The messages `createJimpWorker` and `expose` send each other, and how images
// and errors are turned into plain data that can be posted between threads.
//
// Nothing here imports Jimp: both sides use the Jimp class they're given, so a
// class from jimp's browser bundle works as well as one from @jimp/core.
import type { JimpClass } from "@jimp/types";

/** Tags every message, so a worker can share its port with other code */
export const PROTOCOL = "jimp-worker";

/**
 * Where `@jimp/core` keeps the EXIF data `getBuffer(..., { exif: true })`
 * writes. A registered symbol, so it's the same in every thread and bundle.
 */
const RAW_EXIF = Symbol.for("jimp.rawExif");

/** Replaces a Jimp image in an edit's arguments */
const IMAGE_KEY = "__jimpWorkerImage";

/** A Jimp image as plain data */
export interface WireImage {
  data: Uint8Array;
  width: number;
  height: number;
  background: number;
  mime?: string;
  iccProfile?: Uint8Array;
  /** The parsed EXIF data, `image._exif`, as plain data */
  exif?: unknown;
  /** The EXIF block written back by `exif: true` */
  rawExif?: Uint8Array;
}

export type WireInput =
  | { type: "bytes"; data: Uint8Array }
  | { type: "blob"; blob: Blob }
  | { type: "url"; url: string }
  | { type: "image"; image: WireImage };

export interface WireOutput {
  mime: string;
  options?: unknown;
}

export interface WireTask {
  input: WireInput;
  read?: unknown;
  edits: unknown[];
  output?: WireOutput;
}

export interface WireError {
  name: string;
  message: string;
  stack?: string;
  editIndex?: number;
  cause?: { name: string; message: string };
}

export type ToWorkerMessage = {
  protocol: typeof PROTOCOL;
  type: "run";
  id: number;
  task: WireTask;
};

export type FromWorkerMessage =
  | {
      protocol: typeof PROTOCOL;
      type: "image";
      id: number;
      image: WireImage;
    }
  | {
      protocol: typeof PROTOCOL;
      type: "bytes";
      id: number;
      data: Uint8Array;
    }
  | {
      protocol: typeof PROTOCOL;
      type: "error";
      id: number;
      error: WireError;
    };

export function isMessage<T extends { protocol: string }>(
  data: unknown,
): data is T {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { protocol?: unknown }).protocol === PROTOCOL
  );
}

/**
 * Bytes that can be transferred without detaching memory anyone else uses:
 * `bytes` itself if it's the whole of its ArrayBuffer, otherwise a copy.
 * A view of part of a buffer (like Node's small pooled Buffers) is copied,
 * because transferring would detach the rest of the buffer too.
 */
export function ownBytes(bytes: ArrayBufferView): Uint8Array<ArrayBuffer> {
  const view = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  if (
    view.buffer instanceof ArrayBuffer &&
    view.byteOffset === 0 &&
    view.byteLength === view.buffer.byteLength
  ) {
    return view as Uint8Array<ArrayBuffer>;
  }

  return view.slice();
}

/** A copy of the bytes, in an ArrayBuffer of their own */
export function copyBytes(bytes: ArrayBufferView): Uint8Array<ArrayBuffer> {
  return new Uint8Array(
    bytes.buffer,
    bytes.byteOffset,
    bytes.byteLength,
  ).slice();
}

/** Whether a value is a Jimp image, from any Jimp class */
export function isJimpImage(value: unknown): value is JimpClass {
  const bitmap = (value as { bitmap?: Partial<JimpClass["bitmap"]> } | null)
    ?.bitmap;

  return (
    typeof bitmap === "object" &&
    bitmap !== null &&
    bitmap.data instanceof Uint8Array &&
    typeof bitmap.width === "number" &&
    typeof bitmap.height === "number"
  );
}

/**
 * Turn a Jimp image into plain data. The pixels are copied unless
 * `transfer` is set; then they're the image's own memory where possible,
 * and their buffer is added to `transferList`.
 */
export function toWireImage(
  image: JimpClass,
  transferList: Transferable[],
  transfer: boolean,
): WireImage {
  const { bitmap, background, iccProfile } = image;
  const { mime, _exif } = image as { mime?: string; _exif?: unknown };
  const rawExif = (image as { [RAW_EXIF]?: Uint8Array })[RAW_EXIF];
  const data = transfer ? ownBytes(bitmap.data) : copyBytes(bitmap.data);

  transferList.push(data.buffer);

  return {
    data,
    width: bitmap.width,
    height: bitmap.height,
    background,
    ...(mime === undefined ? {} : { mime }),
    // Small, and may be shared with other images, so always copied
    ...(iccProfile ? { iccProfile: copyBytes(iccProfile) } : {}),
    ...(_exif === undefined ? {} : { exif: cloneableExif(_exif) }),
    ...(rawExif ? { rawExif: copyBytes(rawExif) } : {}),
  };
}

/**
 * exif-parser's result, without `startMarker`: a reader over the whole file,
 * with methods, that can't be posted. Methods on the result's prototype,
 * like `getThumbnailBuffer`, aren't posted either.
 */
function cloneableExif(exif: unknown) {
  if (typeof exif !== "object" || exif === null) {
    return exif;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startMarker, ...data } = exif as Record<string, unknown>;

  return data;
}

type BufferClass = {
  from(buffer: ArrayBufferLike, byteOffset: number, length: number): Buffer;
};

const bufferClasses = new WeakMap<object, BufferClass>();

/**
 * The Buffer class a Jimp class uses: Node's, or the polyfill bundled into
 * jimp's browser build. Wrapping pixels in it lets the constructor use them
 * without a copy.
 */
function bufferClassOf(Jimp: JimpConstructor): BufferClass {
  let BufferClass = bufferClasses.get(Jimp);

  if (!BufferClass) {
    BufferClass = new Jimp({ width: 1, height: 1 }).bitmap.data
      .constructor as unknown as BufferClass;
    bufferClasses.set(Jimp, BufferClass);
  }

  return BufferClass;
}

export type JimpConstructor = new (
  options:
    | { width: number; height: number }
    | { data: Buffer; width: number; height: number },
) => JimpClass;

/** Rebuild a Jimp image from plain data, without copying its pixels */
export function fromWireImage(Jimp: JimpConstructor, wire: WireImage) {
  const BufferClass = bufferClassOf(Jimp);
  const toBuffer = (bytes: Uint8Array) =>
    BufferClass.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const image = new Jimp({
    data: toBuffer(wire.data),
    width: wire.width,
    height: wire.height,
  });

  image.background = wire.background;
  image.iccProfile = wire.iccProfile ? toBuffer(wire.iccProfile) : undefined;

  if (wire.mime !== undefined) {
    (image as { mime?: string }).mime = wire.mime;
  }

  if (wire.exif !== undefined) {
    (image as { _exif?: unknown })._exif = wire.exif;
  }

  if (wire.rawExif) {
    Object.defineProperty(image, RAW_EXIF, {
      value: toBuffer(wire.rawExif),
      configurable: true,
      writable: true,
    });
  }

  return image;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
}

/**
 * Replace the Jimp images in edits' arguments, such as `blit`'s `src`, with
 * plain data. Their pixels are copied: the caller keeps using them.
 */
export function encodeEdits(edits: unknown, transferList: Transferable[]) {
  const encode = (value: unknown): unknown => {
    if (isJimpImage(value)) {
      return { [IMAGE_KEY]: toWireImage(value, transferList, false) };
    }

    if (Array.isArray(value)) {
      return value.map(encode);
    }

    if (isPlainObject(value)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, encode(item)]),
      );
    }

    return value;
  };

  return encode(edits);
}

/** Turn the images `encodeEdits` replaced back into Jimp images */
export function decodeEdits(edits: unknown, Jimp: JimpConstructor): unknown {
  const decode = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(decode);
    }

    if (isPlainObject(value)) {
      if (IMAGE_KEY in value) {
        return fromWireImage(Jimp, value[IMAGE_KEY] as WireImage);
      }

      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, decode(item)]),
      );
    }

    return value;
  };

  return decode(edits);
}

export function toWireError(error: unknown): WireError {
  if (!(error instanceof Error)) {
    return { name: "Error", message: String(error) };
  }

  const { editIndex } = error as { editIndex?: unknown };
  const cause = error.cause;

  return {
    name: error.name,
    message: error.message,
    ...(error.stack === undefined ? {} : { stack: error.stack }),
    ...(typeof editIndex === "number" ? { editIndex } : {}),
    ...(cause === undefined
      ? {}
      : cause instanceof Error
        ? { cause: { name: cause.name, message: cause.message } }
        : { cause: { name: "Error", message: String(cause) } }),
  };
}
