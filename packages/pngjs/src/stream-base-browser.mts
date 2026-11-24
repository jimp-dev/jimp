// Browsers have no Node streams, so PNG gets a small event emitter with the
// parts of the Stream API it uses: events and `.pipe()`.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => void;

interface Writable {
  write(data: unknown): unknown;
  end(): unknown;
}

export class StreamBase {
  #listeners = new Map<string | symbol, Listener[]>();

  on(event: string | symbol, listener: Listener): this {
    const listeners = this.#listeners.get(event) ?? [];

    listeners.push(listener);
    this.#listeners.set(event, listeners);

    return this;
  }

  addListener(event: string | symbol, listener: Listener): this {
    return this.on(event, listener);
  }

  once(event: string | symbol, listener: Listener): this {
    const wrapper: Listener & { listener?: Listener } = (...args) => {
      this.removeListener(event, wrapper);
      listener.apply(this, args);
    };

    wrapper.listener = listener;

    return this.on(event, wrapper);
  }

  removeListener(event: string | symbol, listener: Listener): this {
    const listeners = this.#listeners.get(event);

    if (listeners) {
      const index = listeners.findIndex(
        (l) =>
          l === listener ||
          (l as { listener?: Listener }).listener === listener,
      );

      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }

    return this;
  }

  off(event: string | symbol, listener: Listener): this {
    return this.removeListener(event, listener);
  }

  removeAllListeners(event?: string | symbol): this {
    if (event === undefined) {
      this.#listeners.clear();
    } else {
      this.#listeners.delete(event);
    }

    return this;
  }

  listeners(event: string | symbol): Listener[] {
    return [...(this.#listeners.get(event) ?? [])];
  }

  listenerCount(event: string | symbol): number {
    return this.#listeners.get(event)?.length ?? 0;
  }

  emit(event: string | symbol, ...args: unknown[]): boolean {
    const listeners = this.#listeners.get(event);

    if (!listeners?.length) {
      if (event === "error") {
        throw args[0] instanceof Error ? args[0] : new Error(String(args[0]));
      }

      return false;
    }

    for (const listener of [...listeners]) {
      listener.apply(this, args);
    }

    return true;
  }

  /** Writes each "data" event to `destination`, and ends it on "end" */
  pipe<T extends Writable>(destination: T): T {
    this.on("data", (data) => destination.write(data));
    this.on("end", () => destination.end());

    return destination;
  }
}
