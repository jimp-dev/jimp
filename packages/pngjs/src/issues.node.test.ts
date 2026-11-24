// Regression tests for pngjs bugs that need Node.js APIs to reproduce
import { Readable, Writable, pipeline } from "node:stream";
import { createDeflate } from "node:zlib";
import { describe, expect, test, vi } from "vitest";

import { concat, gradient, packToBytes, readChunks } from "../test/helpers.js";
import { PNG, decode, encode } from "./index.js";

describe("streams", () => {
  test("#101: stream.pipeline finishes when PNG is the last stream", async () => {
    const png = new PNG();
    const parsed = new Promise((resolve) => png.on("parsed", resolve));

    await new Promise<void>((resolve, reject) => {
      pipeline(
        Readable.from([encode(gradient(8, 8))]),
        png as unknown as Writable,
        (error) => (error ? reject(error) : resolve()),
      );
    });
    await parsed;

    expect(png.width).toBe(8);
  });

  test("#101: stream.pipeline passes errors on", async () => {
    await expect(
      new Promise<void>((resolve, reject) => {
        pipeline(
          Readable.from([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])]),
          new PNG() as unknown as Writable,
          (error) => (error ? reject(error) : resolve()),
        );
      }),
    ).rejects.toThrow("Invalid file signature");
  });

  test("#380, #395: new PNG() doesn't schedule anything that keeps it alive", () => {
    const nextTick = vi.spyOn(process, "nextTick");
    const microtask = vi.spyOn(globalThis, "queueMicrotask");

    for (let i = 0; i < 1000; i++) {
      new PNG({ width: 100, height: 100 });
    }

    expect(nextTick).not.toHaveBeenCalled();
    expect(microtask).not.toHaveBeenCalled();
    nextTick.mockRestore();
    microtask.mockRestore();
  });

  test("#64: the packed PNG can be iterated with for await", async () => {
    const png = new PNG({ width: 4, height: 4 });
    const parts: Uint8Array[] = [];

    png.data.set(gradient(4, 4).data);

    for await (const chunk of png.pack()) {
      parts.push(chunk);
    }

    expect([...decode(concat(...parts)).data]).toEqual([
      ...gradient(4, 4).data,
    ]);
  });

  test("streamed data emits metadata as soon as the header is in", async () => {
    const file = encode(gradient(64, 64), { deflateLevel: 0 });
    const png = new PNG();
    const events: string[] = [];

    png.on("metadata", () => events.push("metadata"));
    png.on("parsed", () => events.push("parsed"));

    png.write(file.subarray(0, 100));
    await Promise.resolve();
    expect(events).toEqual(["metadata"]);

    png.end(file.subarray(100));
    await new Promise((resolve) => png.on("close", resolve));
    expect(events).toEqual(["metadata", "parsed"]);
  });

  test("piping a file stream into PNG and back out", async () => {
    const file = encode(gradient(32, 32));
    const chunks = Array.from({ length: Math.ceil(file.length / 50) }, (_, i) =>
      file.subarray(i * 50, i * 50 + 50),
    );
    const png = await new Promise<PNG>((resolve, reject) => {
      const png = new PNG();

      png.on("parsed", () => resolve(png));
      png.on("error", reject);
      Readable.from(chunks).pipe(png as unknown as Writable);
    });
    const output: Uint8Array[] = [];

    await new Promise<void>((resolve) => {
      png.pack().pipe(
        new Writable({
          write(chunk, _, callback) {
            output.push(chunk);
            callback();
          },
          final(callback) {
            resolve();
            callback();
          },
        }),
      );
    });

    expect([...decode(concat(...output)).data]).toEqual([
      ...gradient(32, 32).data,
    ]);
  });

  test("deflateFactory compresses with the given stream", async () => {
    const factory = vi.fn(createDeflate);
    const png = new PNG({
      width: 64,
      height: 64,
      deflateFactory: factory,
      deflateChunkSize: 1024,
    });

    png.data.set(gradient(64, 64).data);

    const file = await packToBytes(png);

    expect(factory).toHaveBeenCalledWith({
      chunkSize: 1024,
      level: 9,
      strategy: 3,
    });
    expect(
      readChunks(file).filter(([type]) => type === "IDAT").length,
    ).toBeGreaterThan(1);
    expect([...decode(file).data]).toEqual([...gradient(64, 64).data]);
  });
});

describe("#286: large images", () => {
  // ~1s alone, but 12-25s on CI when it shares the CPU with the other packages
  test("a 6000x4000 image round-trips", { timeout: 60_000 }, () => {
    const width = 6000;
    const height = 4000;
    const data = new Uint8Array(width * height * 4);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = i & 0xff;
      data[i + 1] = (i >> 8) & 0xff;
      data[i + 3] = 255;
    }

    const decoded = decode(encode({ width, height, data }));

    expect(decoded.width).toBe(width);
    expect(Buffer.compare(decoded.data, data)).toBe(0);
  });
});
