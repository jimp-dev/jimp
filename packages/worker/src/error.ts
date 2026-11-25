import type { WireError } from "./protocol.js";

/**
 * An error from a Jimp worker: one the task threw in the worker, or the
 * worker stopping before the task finished.
 */
export class JimpWorkerError extends Error {
  override name = "JimpWorkerError";

  /**
   * For errors from `apply`, the position of the edit that failed in the
   * task's `edits`
   */
  editIndex?: number;

  constructor(
    message: string,
    options?: { cause?: unknown; editIndex?: number },
  ) {
    super(message, options?.cause === undefined ? undefined : options);

    if (options?.editIndex !== undefined) {
      this.editIndex = options.editIndex;
    }
  }

  /** @internal Rebuild an error a worker sent */
  static fromWire(wire: WireError) {
    let cause: Error | undefined;

    if (wire.cause) {
      cause = new Error(wire.cause.message);
      cause.name = wire.cause.name;
    }

    const error = new JimpWorkerError(wire.message, {
      cause,
      editIndex: wire.editIndex,
    });

    if (wire.stack) {
      error.stack = `${error.stack}\nFrom the worker: ${wire.stack}`;
    }

    return error;
  }
}
