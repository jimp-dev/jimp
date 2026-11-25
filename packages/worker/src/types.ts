import type { JimpEdit } from "@jimp/core";
import type { JimpClass } from "@jimp/types";

declare const exposedClass: unique symbol;

/**
 * A Jimp class: the one `jimp` exports, or one made with `createJimp`.
 * Only what the worker uses is listed.
 */
export interface JimpClassLike {
  new (options: {
    data: Buffer;
    width: number;
    height: number;
  }): JimpClass & {
    apply(edits: never[]): unknown;
    getBuffer(mime: never, options?: never): Promise<Uint8Array>;
  };
  read(url: string, options?: never): Promise<JimpClass>;
  fromBuffer(data: Uint8Array | Blob, options?: never): Promise<JimpClass>;
}

/**
 * What `expose` returns. Its type records the Jimp class the worker runs, so
 * `createJimpWorker<typeof exposed>` types tasks for that class.
 */
export interface ExposedJimp<Class extends JimpClassLike = JimpClassLike> {
  /** Stop answering tasks */
  close(): void;
  /** @internal Only a type, to carry the class */
  readonly [exposedClass]?: Class;
}

/** The Jimp class of `typeof Jimp` or `typeof exposed` */
export type JimpClassOf<T> =
  T extends ExposedJimp<infer Class> ? Class : Extract<T, JimpClassLike>;

/** The images a Jimp class makes */
export type JimpImageOf<T> = InstanceType<JimpClassOf<T>>;

type MimeTypeOf<T> = Parameters<JimpImageOf<T>["getBuffer"]>[0];

/**
 * Encode the result in the worker, as `image.getBuffer(mime, options)`
 * would, and get the bytes back.
 */
export interface JimpWorkerOutput<T> {
  /** The MIME type to encode to, one the worker's Jimp class can write */
  mime: MimeTypeOf<T>;
  /**
   * The format's encode options, as for `getBuffer`. They're checked in the
   * worker, not by TypeScript.
   */
  options?: Record<string, unknown>;
}

/**
 * The image a task starts from:
 *
 * - Encoded image data: an `ArrayBuffer`, a `Uint8Array` or other view (such
 *   as a Node.js `Buffer`), or a `Blob` or `File`. It's decoded in the worker.
 * - A URL, or in Node.js a file path, as a string or `URL`. It's read in the
 *   worker. In a browser, relative URLs are resolved against the page.
 * - A Jimp image. Its pixels, MIME type, background, ICC profile and EXIF
 *   data are sent.
 */
export type JimpWorkerInput =
  | string
  | URL
  | ArrayBuffer
  | ArrayBufferView
  | Blob
  | JimpClass;

/** A task for a Jimp worker: read an image, edit it, and send it back */
export interface JimpWorkerTask<T> {
  /** The image to start from */
  input: JimpWorkerInput;
  /**
   * Options for reading encoded inputs and URLs, as for `Jimp.read`:
   * `exifRotate` and each format's decode options
   */
  read?: Parameters<JimpClassOf<T>["read"]>[1];
  /** The edits to make, as for `image.apply` */
  edits?: JimpEdit<JimpImageOf<T>>[];
  /**
   * Encode the result in the worker and get bytes back. Without it, you get
   * a Jimp image, which needs the `Jimp` option of `createJimpWorker`.
   */
  output?: JimpWorkerOutput<T>;
}

/** Options for one task */
export interface JimpWorkerRunOptions {
  /**
   * Cancels the task. A task waiting for a worker is removed from the queue;
   * a running task's worker is stopped, and a new one is started for the next
   * task. The promise rejects with the signal's reason.
   */
  signal?: AbortSignal;
  /**
   * Transfer the input's memory to the worker instead of copying it. Saves a
   * copy, but the `ArrayBuffer` behind encoded data, or a Jimp image's
   * pixels, is detached: it's empty afterwards and can't be used again.
   * @default false
   */
  transfer?: boolean;
}

/** Runs tasks on a pool of Jimp workers */
export interface JimpWorker<T> {
  /**
   * Run a task in a worker. Resolves with the encoded bytes if the task has
   * an `output`, or else with the image.
   */
  run(
    task: JimpWorkerTask<T> & { output: JimpWorkerOutput<T> },
    options?: JimpWorkerRunOptions
  ): Promise<Uint8Array<ArrayBuffer>>;
  run(
    task: JimpWorkerTask<T> & { output?: undefined },
    options?: JimpWorkerRunOptions
  ): Promise<JimpImageOf<T>>;
  /** How many tasks are waiting for a worker */
  readonly queued: number;
  /** How many tasks are running */
  readonly running: number;
  /**
   * Stop every worker. Tasks that are running or waiting reject, and so does
   * every later `run`.
   */
  terminate(): Promise<void>;
}
