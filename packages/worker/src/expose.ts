import { listen, type MessageScope } from "./endpoint.js";
import {
  decodeEdits,
  fromWireImage,
  isMessage,
  ownBytes,
  PROTOCOL,
  toWireError,
  toWireImage,
  type FromWorkerMessage,
  type JimpConstructor,
  type ToWorkerMessage,
  type WireTask,
} from "./protocol.js";
import { getWorkerScope, toReadable } from "./platform.js";
import type { ExposedJimp, JimpClassLike } from "./types.js";

type Image = InstanceType<JimpClassLike>;

export interface ExposeOptions {
  /**
   * Where tasks come from and results go. Defaults to the worker's `self`
   * in a web worker, and `parentPort` from `node:worker_threads` in Node.js.
   */
  scope?: MessageScope;
}

/**
 * Run the tasks `createJimpWorker` sends, with the given Jimp class. Call it
 * in your worker script:
 * @example
 * ```ts
 * // jimp.worker.ts
 * import { Jimp } from "jimp";
 * import { expose } from "@jimp/worker";
 *
 * const exposed = expose(Jimp);
 *
 * export type JimpWorkerApi = typeof exposed;
 * ```
 * @param Jimp The Jimp class to read, edit and write images with: `Jimp`
 * from `jimp`, or a class made with `createJimp` that has extra formats or
 * plugins
 */
export function expose<Class extends JimpClassLike>(
  Jimp: Class,
  options: ExposeOptions = {},
): ExposedJimp<Class> {
  const scope = options.scope ?? getWorkerScope();

  if (!scope) {
    throw new Error(
      "expose must be called in a worker: in a web worker or a Node.js worker thread",
    );
  }

  const post = (message: FromWorkerMessage, transfer: Transferable[] = []) =>
    scope.postMessage(message, transfer);

  const stopListening = listen(scope, {
    message: async (data) => {
      if (!isMessage<ToWorkerMessage>(data) || data.type !== "run") {
        return;
      }

      const { id, task } = data;

      try {
        const image = await readInput(Jimp, task);

        if (task.edits.length > 0) {
          image.apply(
            decodeEdits(
              task.edits,
              Jimp as unknown as JimpConstructor,
            ) as never[],
          );
        }

        if (task.output) {
          const bytes = ownBytes(
            await image.getBuffer(
              task.output.mime as never,
              task.output.options as never,
            ),
          );

          post({ protocol: PROTOCOL, type: "bytes", id, data: bytes }, [
            bytes.buffer,
          ]);
        } else {
          const transfer: Transferable[] = [];

          post(
            {
              protocol: PROTOCOL,
              type: "image",
              id,
              image: toWireImage(image, transfer, true),
            },
            transfer,
          );
        }
      } catch (error) {
        post({
          protocol: PROTOCOL,
          type: "error",
          id,
          error: toWireError(error),
        });
      }
    },
  });

  return { close: stopListening };
}

async function readInput(
  Jimp: JimpClassLike,
  { input, read }: WireTask,
): Promise<Image> {
  switch (input.type) {
    case "bytes":
      return (await Jimp.fromBuffer(input.data, read as never)) as Image;
    case "blob":
      return (await Jimp.fromBuffer(input.blob, read as never)) as Image;
    case "url":
      return (await Jimp.read(toReadable(input.url), read as never)) as Image;
    case "image":
      return fromWireImage(
        Jimp as unknown as JimpConstructor,
        input.image,
      ) as Image;
  }
}
