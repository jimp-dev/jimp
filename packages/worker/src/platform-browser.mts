import type { MessageScope } from "./endpoint.js";

/** The worker's global scope, if this is a worker */
export function getWorkerScope(): MessageScope | undefined {
  const scope = globalThis as { WorkerGlobalScope?: unknown };

  return typeof scope.WorkerGlobalScope === "function"
    ? (globalThis as unknown as MessageScope)
    : undefined;
}

/** Browsers fetch every URL */
export function toReadable(url: string) {
  return url;
}
