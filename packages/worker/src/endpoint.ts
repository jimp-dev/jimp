// One interface over the two kinds of worker: the web's `Worker` (and a
// worker's `self`), which emit events with the message in `event.data`, and
// Node's `worker_threads` `Worker` (and `parentPort`), which are event
// emitters that pass the message itself.

// The DOM's and Node's `Transferable` types differ, so these take any[]

/** A web `Worker` or a Node.js `worker_threads` `Worker` */
export interface WorkerLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message: unknown, transfer: any[]): void;
  terminate(): unknown;
}

/** A worker's `self`, Node's `parentPort` or a `MessagePort` */
export interface MessageScope {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage(message: unknown, transfer: any[]): void;
}

interface NodeEmitter {
  on(event: string, listener: (value: unknown) => void): unknown;
  off(event: string, listener: (value: unknown) => void): unknown;
}

interface WebEventTarget {
  addEventListener(type: string, listener: (event: unknown) => void): void;
  removeEventListener(type: string, listener: (event: unknown) => void): void;
}

/** Node's emitters have `on`; Node's MessagePort has both, so check it first */
function isNodeEmitter(target: object): target is NodeEmitter {
  return typeof (target as Partial<NodeEmitter>).on === "function";
}

export interface Listeners {
  message(data: unknown): void;
  /** The worker stopped, or can't be used any more */
  crash?(error: Error): void;
}

/** Listen to a worker or scope. Returns a function that stops listening. */
export function listen(target: object, listeners: Listeners): () => void {
  const { message, crash } = listeners;

  if (isNodeEmitter(target)) {
    const events: [string, (value: unknown) => void][] = [["message", message]];

    if (crash) {
      events.push(
        ["error", (error) => crash(asError(error))],
        [
          "messageerror",
          () => crash(new Error("it sent a message that couldn't be read")),
        ],
        ["exit", (code) => crash(new Error(`it exited with code ${code}`))],
      );
    }

    for (const [event, listener] of events) {
      target.on(event, listener);
    }

    return () => {
      for (const [event, listener] of events) {
        target.off(event, listener);
      }
    };
  }

  const web = target as WebEventTarget;
  const events: [string, (event: unknown) => void][] = [
    ["message", (event) => message((event as MessageEvent).data)],
  ];

  if (crash) {
    events.push(
      [
        "error",
        (event) => {
          // An ErrorEvent for an uncaught error, a plain Event when the
          // script couldn't be loaded
          const { message, error } = event as Partial<ErrorEvent>;

          (event as Event).preventDefault?.();
          crash(
            error instanceof Error
              ? error
              : new Error(
                  message || "it couldn't be loaded, or threw an error",
                ),
          );
        },
      ],
      [
        "messageerror",
        () => crash(new Error("it sent a message that couldn't be read")),
      ],
    );
  }

  for (const [type, listener] of events) {
    web.addEventListener(type, listener);
  }

  return () => {
    for (const [type, listener] of events) {
      web.removeEventListener(type, listener);
    }
  };
}

/** Let a Node.js worker keep the process running, or not. Web workers don't. */
export function setRef(worker: object, ref: boolean) {
  const method = (worker as { ref?: () => void; unref?: () => void })[
    ref ? "ref" : "unref"
  ];

  method?.call(worker);
}

function asError(value: unknown) {
  return value instanceof Error ? value : new Error(String(value));
}
