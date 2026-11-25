// zod/mini keeps the main thread's bundle small: it's what's left of the
// worker there, and the rest of zod is several times bigger than this file.
import * as z from "zod/mini";
import { listen, setRef, type WorkerLike } from "./endpoint.js";
import { JimpWorkerError } from "./error.js";
import {
  copyBytes,
  encodeEdits,
  fromWireImage,
  isJimpImage,
  isMessage,
  ownBytes,
  PROTOCOL,
  toWireImage,
  type FromWorkerMessage,
  type JimpConstructor,
  type ToWorkerMessage,
  type WireInput,
} from "./protocol.js";
import type {
  ExposedJimp,
  JimpClassLike,
  JimpClassOf,
  JimpWorker,
  JimpWorkerInput,
} from "./types.js";

const CreateJimpWorkerOptionsSchema = z.object({
  /**
   * How many workers to run at once. Each runs one task at a time, and they
   * start as tasks need them.
   * @default 1
   */
  concurrency: z.optional(z.int().check(z.minimum(1))),
  /**
   * The Jimp class to rebuild images with, needed to get images back
   * instead of encoded bytes. Use the same class the worker exposes.
   */
  Jimp: z.optional(
    z.custom<JimpClassLike>((value) => typeof value === "function", {
      error: "Jimp must be a Jimp class",
    }),
  ),
});

export type CreateJimpWorkerOptions<Class = JimpClassLike> = Omit<
  z.infer<typeof CreateJimpWorkerOptionsSchema>,
  "Jimp"
> & {
  /**
   * The Jimp class to rebuild images with, needed to get images back
   * instead of encoded bytes. Use the same class the worker exposes.
   */
  Jimp?: Class;
};

const RunOptionsSchema = z.object({
  signal: z.optional(
    z.custom<AbortSignal>(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        "aborted" in value &&
        typeof (value as AbortSignal).addEventListener === "function",
      { error: "signal must be an AbortSignal" },
    ),
  ),
  transfer: z.optional(z.boolean()),
});

const TaskSchema = z.object({
  input: z.custom<JimpWorkerInput>((value) => value !== undefined, {
    error: "input is required",
  }),
  read: z.optional(z.record(z.string(), z.unknown())),
  edits: z.optional(z.array(z.unknown())),
  output: z.optional(
    z.object({
      mime: z.string(),
      options: z.optional(z.record(z.string(), z.unknown())),
    }),
  ),
});

interface Task {
  message: ToWorkerMessage;
  transfer: Transferable[];
  resolve: (value: never) => void;
  reject: (reason: unknown) => void;
  /** Removes the abort listener */
  done: () => void;
}

interface Slot {
  worker: WorkerLike;
  stopListening: () => void;
  task?: Task;
}

/**
 * Turn a task's input into a message. Encoded data and images are copied
 * unless `transfer` is set.
 */
function toWireInput(
  input: JimpWorkerInput,
  transferList: Transferable[],
  transfer: boolean,
): WireInput {
  if (typeof input === "string" || input instanceof URL) {
    // A worker would resolve relative URLs against its own script
    const base = (globalThis as { location?: { href: string } }).location?.href;

    return {
      type: "url",
      url: base ? new URL(input, base).href : String(input),
    };
  }

  if (typeof Blob !== "undefined" && input instanceof Blob) {
    // Blobs are immutable, so posting one doesn't copy its data
    return { type: "blob", blob: input };
  }

  if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
    const view = ArrayBuffer.isView(input) ? input : new Uint8Array(input);
    const data = transfer ? ownBytes(view) : copyBytes(view);

    transferList.push(data.buffer);

    return { type: "bytes", data };
  }

  if (isJimpImage(input)) {
    return {
      type: "image",
      image: toWireImage(input, transferList, transfer),
    };
  }

  throw new Error(
    "input must be encoded image data (an ArrayBuffer, Uint8Array or Blob), a URL or file path, or a Jimp image",
  );
}

/**
 * Run Jimp in workers: web workers in browsers, `worker_threads` in Node.js.
 * Tasks are queued, and each runs in the first free worker.
 *
 * The worker script calls `expose` with the Jimp class to use.
 * @example
 * ```ts
 * import { createJimpWorker } from "@jimp/worker";
 * import type { JimpWorkerApi } from "./jimp.worker";
 *
 * const jimp = createJimpWorker<JimpWorkerApi>(
 *   () =>
 *     new Worker(new URL("./jimp.worker.ts", import.meta.url), {
 *       type: "module",
 *     }),
 *   { concurrency: 2 }
 * );
 *
 * const thumbnail = await jimp.run({
 *   input: file,
 *   edits: [["cover", { w: 200, h: 200 }]],
 *   output: { mime: "image/jpeg", options: { quality: 80 } },
 * });
 * ```
 * @param createWorker Starts a worker that runs your worker script: a web
 * `Worker` or a Node.js `Worker` from `node:worker_threads`
 * @param options `concurrency`, and the `Jimp` class to get images back
 */
export function createJimpWorker<Class extends JimpClassLike>(
  createWorker: () => WorkerLike,
  options: CreateJimpWorkerOptions<Class> & { Jimp: Class },
): JimpWorker<Class>;
export function createJimpWorker<T extends JimpClassLike | ExposedJimp>(
  createWorker: () => WorkerLike,
  options?: CreateJimpWorkerOptions<JimpClassOf<T>>,
): JimpWorker<T>;
export function createJimpWorker(
  createWorker: () => WorkerLike,
  options: CreateJimpWorkerOptions = {},
): JimpWorker<JimpClassLike> {
  if (typeof createWorker !== "function") {
    throw new Error(
      'createJimpWorker needs a function that starts a worker, like () => new Worker(url, { type: "module" })',
    );
  }

  const { concurrency = 1, Jimp } =
    CreateJimpWorkerOptionsSchema.parse(options);
  const queue: Task[] = [];
  const slots = new Set<Slot>();
  let nextId = 0;
  let terminated = false;

  function stopWorker(slot: Slot) {
    slots.delete(slot);
    slot.stopListening();

    // Node's terminate returns a promise
    return Promise.resolve(slot.worker.terminate()).catch(() => {});
  }

  function settle(task: Task, data: FromWorkerMessage) {
    task.done();

    try {
      if (data.type === "error") {
        task.reject(JimpWorkerError.fromWire(data.error));
      } else if (data.type === "bytes") {
        task.resolve(data.data as never);
      } else {
        task.resolve(
          fromWireImage(
            Jimp as unknown as JimpConstructor,
            data.image,
          ) as never,
        );
      }
    } catch (error) {
      task.reject(error);
    }
  }

  function startWorker() {
    const worker = createWorker();
    const slot: Slot = { worker, stopListening: () => {} };

    slot.stopListening = listen(worker, {
      message: (data) => {
        const { task } = slot;

        if (
          !isMessage<FromWorkerMessage>(data) ||
          !task ||
          data.id !== task.message.id
        ) {
          return;
        }

        slot.task = undefined;
        setRef(worker, false);
        settle(task, data);
        pump();
      },
      crash: (error) => {
        const { task } = slot;

        void stopWorker(slot);

        if (task) {
          task.done();
          task.reject(
            new JimpWorkerError(`The Jimp worker stopped: ${error.message}`, {
              cause: error,
            }),
          );
        }

        pump();
      },
    });

    slots.add(slot);

    return slot;
  }

  /** Start the tasks that have a free worker, or room for a new one */
  function pump() {
    while (queue.length > 0) {
      let slot = [...slots].find((slot) => !slot.task);

      if (!slot) {
        if (slots.size >= concurrency) {
          return;
        }

        try {
          slot = startWorker();
        } catch (error) {
          const task = queue.shift()!;

          task.done();
          task.reject(error);
          continue;
        }
      }

      const task = queue.shift()!;

      slot.task = task;
      // In Node.js, keep the process running until the task is done
      setRef(slot.worker, true);

      try {
        slot.worker.postMessage(task.message, task.transfer);
      } catch (error) {
        slot.task = undefined;
        setRef(slot.worker, false);
        task.done();
        task.reject(error);
      }
    }
  }

  function run(task: unknown, runOptions: unknown = {}) {
    return new Promise<never>((resolve, reject) => {
      if (terminated) {
        throw new JimpWorkerError("The Jimp worker was terminated");
      }

      const { signal, transfer = false } = RunOptionsSchema.parse(runOptions);
      const { input, read, edits = [], output } = TaskSchema.parse(task);

      if (!output && !Jimp) {
        throw new Error(
          "To get an image back, pass the Jimp class to createJimpWorker's Jimp option. To get encoded bytes, set the task's output.",
        );
      }

      signal?.throwIfAborted();

      const transferList: Transferable[] = [];
      const message: ToWorkerMessage = {
        protocol: PROTOCOL,
        type: "run",
        id: nextId++,
        task: {
          input: toWireInput(input, transferList, transfer),
          ...(read === undefined ? {} : { read }),
          edits: encodeEdits(edits, transferList) as unknown[],
          ...(output === undefined ? {} : { output }),
        },
      };

      const onAbort = () => {
        const index = queue.indexOf(queued);

        if (index !== -1) {
          queue.splice(index, 1);
        } else {
          // The only way to stop a running task is to stop its worker
          const slot = [...slots].find((slot) => slot.task === queued);

          if (slot) {
            void stopWorker(slot);
            pump();
          }
        }

        reject(signal!.reason);
      };

      const queued: Task = {
        message,
        transfer: transferList,
        resolve,
        reject,
        done: () => signal?.removeEventListener("abort", onAbort),
      };

      signal?.addEventListener("abort", onAbort, { once: true });
      queue.push(queued);
      pump();
    });
  }

  return {
    run,
    get queued() {
      return queue.length;
    },
    get running() {
      return [...slots].filter((slot) => slot.task).length;
    },
    async terminate() {
      terminated = true;

      const error = new JimpWorkerError("The Jimp worker was terminated");
      const tasks = [
        ...queue.splice(0),
        ...[...slots].flatMap((slot) => slot.task ?? []),
      ];

      for (const task of tasks) {
        task.done();
        task.reject(error);
      }

      await Promise.all([...slots].map(stopWorker));
    },
  } as JimpWorker<JimpClassLike>;
}
