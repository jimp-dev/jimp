import { fileURLToPath } from "node:url";
import { parentPort } from "node:worker_threads";
import type { MessageScope } from "./endpoint.js";

/** The port to the thread that started this worker, if this is a worker */
export function getWorkerScope(): MessageScope | undefined {
  if (parentPort) {
    return parentPort;
  }

  // Deno and Bun run web workers too
  const scope = globalThis as { WorkerGlobalScope?: unknown };

  return typeof scope.WorkerGlobalScope === "function"
    ? (globalThis as unknown as MessageScope)
    : undefined;
}

/** Jimp reads paths, not file: URLs, from the file system */
export function toReadable(url: string) {
  return url.startsWith("file:") ? fileURLToPath(url) : url;
}
