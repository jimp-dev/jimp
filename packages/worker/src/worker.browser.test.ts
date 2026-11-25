import { Jimp } from "jimp";
import {
  createJimpWorker,
  JimpWorkerError,
  type JimpWorker,
} from "@jimp/worker";
import { afterEach, describe, expect, test } from "vitest";

const pools: JimpWorker<typeof Jimp>[] = [];

function createPool(concurrency = 1) {
  const pool = createJimpWorker(
    () =>
      new Worker(new URL("./fixtures/browser.worker.ts", import.meta.url), {
        type: "module",
      }),
    { Jimp, concurrency },
  );

  pools.push(pool);

  return pool;
}

const edits = (...edits: unknown[][]) => edits as never[];

async function dice() {
  return (await fetch("/dice.png")).arrayBuffer();
}

afterEach(async () => {
  await Promise.all(pools.splice(0).map((pool) => pool.terminate()));
});

describe("web workers", () => {
  test("decodes a Blob, edits it and returns an image", async () => {
    const jimp = createPool();
    const data = await dice();
    const image = await jimp.run({
      input: new Blob([data]),
      edits: [["resize", { w: 100 }], ["greyscale"]],
    });
    const expected = (await Jimp.fromBuffer(data))
      .resize({ w: 100 })
      .greyscale();

    expect(image).toBeInstanceOf(Jimp);
    expect(image.width).toBe(100);
    expect(image.mime).toBe("image/png");
    expect(image.bitmap.data.equals(expected.bitmap.data)).toBe(true);
    expect(await image.getBase64("image/png")).toMatch(/^data:image\/png/);
  });

  test("reads URLs relative to the page", async () => {
    const jimp = createPool();
    const image = await jimp.run({ input: "/dice.png" });

    expect(image.width).toBe(800);
  });

  test("returns encoded bytes", async () => {
    const jimp = createPool();
    const bytes = await jimp.run({
      input: await dice(),
      edits: [["cover", { w: 20, h: 20 }]],
      output: { mime: "image/jpeg", options: { quality: 60 } },
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect((await Jimp.fromBuffer(bytes)).width).toBe(20);
  });

  test("copies an ArrayBuffer, or transfers it with transfer", async () => {
    const jimp = createPool();
    const copied = await dice();
    const transferred = await dice();

    await jimp.run({ input: copied });
    await jimp.run({ input: transferred }, { transfer: true });

    expect(copied.byteLength).toBeGreaterThan(0);
    expect(transferred.byteLength).toBe(0);
  });

  test("says which edit failed", async () => {
    const jimp = createPool();
    const error = await jimp
      .run({
        input: await dice(),
        edits: [
          ["blur", 1],
          ["blur", -1],
        ],
      })
      .then(
        () => undefined,
        (error: unknown) => error as JimpWorkerError,
      );

    expect(error).toBeInstanceOf(JimpWorkerError);
    expect(error?.message).toMatch(/^Edit 1 \(blur\) failed: /);
    expect(error?.editIndex).toBe(1);
    expect(error?.cause).toBeInstanceOf(Error);
  });

  test("rejects if the worker has an uncaught error", async () => {
    const jimp = createPool();

    await expect(
      jimp.run({
        input: await dice(),
        edits: edits(["throwSoon"]),
        output: { mime: "image/png" },
      }),
    ).rejects.toThrow("The Jimp worker stopped: Uncaught Error: thrown soon");
    await expect(jimp.run({ input: await dice() })).resolves.toBeDefined();
  });

  test("rejects if the worker script can't load", async () => {
    const jimp = createJimpWorker<typeof Jimp>(
      () => new Worker("/does-not-exist.js", { type: "module" }),
    );

    pools.push(jimp);

    await expect(
      jimp.run({ input: "/dice.png", output: { mime: "image/png" } }),
    ).rejects.toThrow(/^The Jimp worker stopped: /);
  });

  test("abort stops a running task, and runs the next one", async () => {
    const jimp = createPool();
    const input = new Jimp({ width: 1, height: 1 });

    await expect(
      jimp.run(
        { input, edits: edits(["spin", 10000]) },
        { signal: AbortSignal.timeout(100) },
      ),
    ).rejects.toMatchObject({ name: "TimeoutError" });
    await expect(jimp.run({ input })).resolves.toBeDefined();
  });

  test("runs tasks in parallel workers", async () => {
    const jimp = createPool(2);
    const input = new Jimp({ width: 1, height: 1 });
    const images = await Promise.all(
      Array.from({ length: 4 }, () =>
        jimp.run({ input, edits: edits(["spin", 50], ["markThread"]) }),
      ),
    );

    expect(new Set(images.map((image) => image.background)).size).toBe(2);
  });
});
