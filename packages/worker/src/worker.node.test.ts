import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { Worker } from "node:worker_threads";
import { getTestImagePath } from "@jimp/test-utils";
import { Jimp, loadFont } from "jimp";
import { SANS_16_BLACK } from "jimp/fonts";
import { afterEach, describe, expect, test } from "vitest";
import { createJimpWorker, JimpWorkerError, type JimpWorker } from "./index.js";
// A JavaScript fixture, so it can run in a worker
import { TestJimp as UntypedTestJimp } from "./fixtures/test-jimp.mjs";

const TestJimp = UntypedTestJimp as typeof Jimp;

const fixture = (name: string) =>
  new URL(`./fixtures/${name}`, import.meta.url);
const photoPath = fixture("exif-p3.jpg");
const dicePath = pathToFileURL(getTestImagePath("dice.png"));

/** Edits only the test worker's class has */
type TestEdit =
  ["spin", number] | ["exit", number] | ["throwSoon"] | ["markThread"];

const testEdits = (...edits: TestEdit[]) => edits as never[];

/** The error a task rejects with */
const rejection = (task: Promise<unknown>) =>
  task.then(
    () => {
      throw new Error("The task didn't fail");
    },
    (error: unknown) => error as JimpWorkerError,
  );

const exifOf = (image: object) =>
  (image as { _exif: { tags: Record<string, unknown> } })._exif;

const pools: JimpWorker<typeof Jimp>[] = [];

function createPool(concurrency = 1) {
  const pool = createJimpWorker(() => new Worker(fixture("test.worker.mjs")), {
    Jimp: TestJimp,
    concurrency,
  });

  pools.push(pool);

  return pool;
}

afterEach(async () => {
  await Promise.all(pools.splice(0).map((pool) => pool.terminate()));
});

describe("tasks", () => {
  test("decodes bytes, edits them and returns an image", async () => {
    const jimp = createPool();
    const bytes = await readFile(dicePath);
    const image = await jimp.run({
      input: bytes,
      edits: [["resize", { w: 100 }], ["greyscale"]],
    });
    const expected = (await Jimp.read(bytes)).resize({ w: 100 }).greyscale();

    expect(image).toBeInstanceOf(TestJimp);
    expect(image.width).toBe(100);
    expect(image.height).toBe(75);
    expect(image.mime).toBe("image/png");
    expect(Buffer.isBuffer(image.bitmap.data)).toBe(true);
    expect(image.bitmap.data.equals(expected.bitmap.data)).toBe(true);

    // Still a working image
    image.invert();
    expect(await image.getBuffer("image/png")).toBeInstanceOf(Buffer);
  });

  test("encodes the result with output", async () => {
    const jimp = createPool();
    const bytes = await jimp.run({
      input: await readFile(dicePath),
      edits: [["cover", { w: 40, h: 40 }]],
      output: { mime: "image/jpeg", options: { quality: 50 } },
    });

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.byteOffset).toBe(0);

    const image = await Jimp.fromBuffer(bytes);

    expect(image.mime).toBe("image/jpeg");
    expect(image.width).toBe(40);
  });

  test("reads file paths, file: URLs and Blobs in the worker", async () => {
    const jimp = createPool();
    const bytes = await readFile(dicePath);

    for (const input of [
      dicePath,
      dicePath.href,
      fileURLToPath(dicePath),
      new Blob([bytes]),
    ]) {
      const image = await jimp.run({ input, edits: [["resize", { w: 8 }]] });

      expect(image.width).toBe(8);
    }
  });

  test("passes read options", async () => {
    const jimp = createPool();
    const rotated = await jimp.run({ input: photoPath });
    const stored = await jimp.run({
      input: photoPath,
      read: { exifRotate: false },
    });

    // Orientation 6: stored on its side
    expect([rotated.width, rotated.height]).toEqual([200, 150]);
    expect([stored.width, stored.height]).toEqual([150, 200]);
  });

  test("runs without edits", async () => {
    const jimp = createPool();
    const image = await jimp.run({ input: await readFile(dicePath) });

    expect(image.width).toBe(800);
  });

  test("edits a Jimp image and keeps its metadata", async () => {
    const jimp = createPool();
    const photo = await Jimp.read(fileURLToPath(photoPath));

    photo.background = 0x123456ff;

    const image = await jimp.run({ input: photo, edits: [["invert"]] });

    expect(image.mime).toBe("image/jpeg");
    expect(image.background).toBe(0x123456ff);
    expect(image.colorSpace).toBe("display-p3");
    expect(image.iccProfile?.equals(photo.iccProfile!)).toBe(true);
    expect(exifOf(image).tags).toEqual(exifOf(photo).tags);

    // The EXIF block is kept for exif: true, in both directions
    const jpeg = await image.getBuffer("image/jpeg", { exif: true });
    const encodedInWorker = await jimp.run({
      input: photo,
      output: { mime: "image/jpeg", options: { exif: true } },
    });

    for (const data of [jpeg, encodedInWorker]) {
      const reread = await Jimp.fromBuffer(data);
      expect(exifOf(reread).tags.Model).toBe("Canon EOS 5D Mark IV");
      expect(reread.colorSpace).toBe("display-p3");
    }
  });

  test("sends Jimp images in edits' arguments", async () => {
    const jimp = createPool();
    const base = new Jimp({ width: 4, height: 4, color: 0x000000ff });
    const src = new Jimp({ width: 2, height: 2, color: 0xff0000ff });
    const transparent = new Jimp({ width: 2, height: 2, color: 0x00000000 });
    const image = await jimp.run({
      input: base,
      edits: [
        ["blit", src],
        ["mask", { src: transparent, x: 2, y: 2 }],
      ],
    });

    expect(image.getPixelColor(1, 1)).toBe(0xff0000ff);
    expect(image.getPixelColor(3, 0)).toBe(0x000000ff);
    expect(image.getPixelColor(3, 3)).toBe(0x00000000);
    // The source is still usable
    expect(src.bitmap.data.byteLength).toBe(16);
  });

  test("sends fonts in edits' arguments", async () => {
    const jimp = createPool();
    const font = await loadFont(SANS_16_BLACK);
    const input = new Jimp({ width: 120, height: 30, color: 0xffffffff });
    const image = await jimp.run({
      input,
      edits: [["print", { font, x: 2, y: 2, text: "Hello" }]],
    });
    const expected = input.clone().print({ font, x: 2, y: 2, text: "Hello" });

    expect(image.bitmap.data.equals(expected.bitmap.data)).toBe(true);
    expect(image.bitmap.data.equals(input.bitmap.data)).toBe(false);
  });
});

describe("custom Jimp classes", () => {
  test("can use WASM formats", async () => {
    const jimp = createJimpWorker<typeof Jimp>(
      () => new Worker(fixture("webp.worker.mjs")),
    );

    pools.push(jimp);

    const webp = await jimp.run({
      input: dicePath,
      edits: [["resize", { w: 50 }]],
      output: { mime: "image/webp" as "image/png", options: { quality: 80 } },
    });

    expect(new TextDecoder().decode(webp.subarray(8, 12))).toBe("WEBP");

    const png = await jimp.run({ input: webp, output: { mime: "image/png" } });

    expect((await Jimp.fromBuffer(png)).width).toBe(50);
  });
});

describe("copying and transferring", () => {
  test("copies inputs by default", async () => {
    const jimp = createPool();
    const bytes = await readFile(dicePath);
    const arrayBuffer = bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );
    const image = new Jimp({ width: 2, height: 2, color: 0xffffffff });

    await jimp.run({ input: arrayBuffer });
    await jimp.run({ input: bytes });
    await jimp.run({ input: image });

    expect(arrayBuffer.byteLength).toBe(bytes.byteLength);
    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(image.bitmap.data.byteLength).toBe(16);
  });

  test("transfer detaches the input's memory", async () => {
    const jimp = createPool();
    const bytes = await readFile(dicePath);
    const arrayBuffer = new Uint8Array(bytes).buffer;
    const view = new Uint8Array(bytes);
    const image = new Jimp({ width: 2, height: 2, color: 0xffffffff });

    await jimp.run({ input: arrayBuffer }, { transfer: true });
    await jimp.run({ input: view }, { transfer: true });
    await jimp.run({ input: image }, { transfer: true });

    expect(arrayBuffer.byteLength).toBe(0);
    expect(view.byteLength).toBe(0);
    expect(image.bitmap.data.byteLength).toBe(0);
  });

  test("copies a view of part of a buffer even with transfer", async () => {
    const jimp = createPool();
    const bytes = await readFile(dicePath);
    const shared = new Uint8Array(bytes.byteLength + 8);

    shared.set(bytes, 4);

    const view = shared.subarray(4, 4 + bytes.byteLength);
    const image = await jimp.run({ input: view }, { transfer: true });

    expect(image.width).toBe(800);
    expect(shared.byteLength).toBe(bytes.byteLength + 8);
  });
});

describe("errors", () => {
  test("says which edit failed", async () => {
    const jimp = createPool();
    const error = await rejection(
      jimp.run({
        input: await readFile(dicePath),
        edits: [["greyscale"], ["resize", { w: -1 }]],
      }),
    );

    expect(error).toBeInstanceOf(JimpWorkerError);
    expect(error.message).toMatch(/^Edit 1 \(resize\) failed: /);
    expect(error.editIndex).toBe(1);
    expect(error.cause).toBeInstanceOf(Error);
    expect((error.cause as Error).message).toBe(
      error.message.replace("Edit 1 (resize) failed: ", ""),
    );
  });

  test("rejects unknown methods before running any edit", async () => {
    const jimp = createPool();

    await expect(
      jimp.run({
        input: await readFile(dicePath),
        edits: [["greyscale"], ["nope"]] as never[],
      }),
    ).rejects.toMatchObject({
      message: 'Edit 1: "nope" isn\'t a plugin method of this Jimp class',
      editIndex: 1,
    });
  });

  test("passes on errors reading the input", async () => {
    const jimp = createPool();
    const error = await rejection(
      jimp.run({ input: new Uint8Array([1, 2, 3]) }),
    );

    expect(error).toBeInstanceOf(JimpWorkerError);
    expect(error.message).toBe("Could not find MIME for Buffer");
    expect(error.editIndex).toBeUndefined();

    await expect(jimp.run({ input: "does-not-exist.png" })).rejects.toThrow(
      "ENOENT",
    );
    await expect(
      jimp.run({
        input: await readFile(dicePath),
        output: { mime: "image/nope" as "image/png" },
      }),
    ).rejects.toThrow("Unsupported MIME type: image/nope");
  });

  test("checks tasks and options", async () => {
    const jimp = createPool();

    await expect(jimp.run({ input: 42 as never })).rejects.toThrow(
      "input must be encoded image data",
    );
    await expect(
      jimp.run({ input: "a.png", output: { mime: 1 as never } }),
    ).rejects.toThrow();
    expect(() =>
      createJimpWorker(() => new Worker(fixture("test.worker.mjs")), {
        concurrency: 0,
      }),
    ).toThrow();
  });

  test("needs the Jimp class to return images", async () => {
    const jimp = createJimpWorker<typeof Jimp>(
      () => new Worker(fixture("test.worker.mjs")),
    );

    pools.push(jimp);

    await expect(jimp.run({ input: dicePath })).rejects.toThrow(
      "To get an image back, pass the Jimp class to createJimpWorker's Jimp option",
    );
    await expect(
      jimp.run({ input: dicePath, output: { mime: "image/png" } }),
    ).resolves.toBeInstanceOf(Uint8Array);
  });

  test("rejects the task if the worker exits, and starts a new worker", async () => {
    const jimp = createPool();
    const input = await readFile(dicePath);

    await expect(
      jimp.run({ input, edits: testEdits(["exit", 3]) }),
    ).rejects.toThrow("The Jimp worker stopped: it exited with code 3");
    await expect(jimp.run({ input })).resolves.toBeDefined();
  });

  test("rejects the task if the worker has an uncaught error", async () => {
    const jimp = createPool();
    const input = await readFile(dicePath);
    const error = await rejection(
      jimp.run({
        input,
        edits: testEdits(["throwSoon"]),
        output: { mime: "image/png" },
      }),
    );

    expect(error).toBeInstanceOf(JimpWorkerError);
    expect(error.message).toBe("The Jimp worker stopped: thrown soon");
    expect((error.cause as Error).message).toBe("thrown soon");
    await expect(jimp.run({ input })).resolves.toBeDefined();
  });

  test("rejects if the worker script can't load", async () => {
    const jimp = createJimpWorker<typeof Jimp>(
      () => new Worker(fixture("missing.worker.mjs")),
    );

    pools.push(jimp);

    await expect(
      jimp.run({ input: dicePath, output: { mime: "image/png" } }),
    ).rejects.toThrow(/^The Jimp worker stopped: Cannot find module/);
  });

  test("rejects if starting a worker throws", async () => {
    const jimp = createJimpWorker<typeof Jimp>(() => {
      throw new Error("no workers here");
    });

    await expect(
      jimp.run({ input: dicePath, output: { mime: "image/png" } }),
    ).rejects.toThrow("no workers here");
  });
});

describe("pool", () => {
  test("runs up to `concurrency` tasks at once, in different workers", async () => {
    const jimp = createPool(2);
    const input = new Jimp({ width: 1, height: 1 });
    const tasks = Array.from({ length: 5 }, () =>
      jimp.run({ input, edits: testEdits(["spin", 100], ["markThread"]) }),
    );

    expect(jimp.running).toBe(2);
    expect(jimp.queued).toBe(3);

    const images = await Promise.all(tasks);
    const threads = new Set(images.map((image) => image.background));

    expect(threads.size).toBe(2);
    expect(jimp.running).toBe(0);
    expect(jimp.queued).toBe(0);
  });

  test("runs queued tasks in order", async () => {
    const jimp = createPool(1);
    const input = new Jimp({ width: 1, height: 1 });
    const finished: number[] = [];

    await Promise.all(
      [30, 0, 10].map((ms, i) =>
        jimp
          .run({ input, edits: testEdits(["spin", ms]) })
          .then(() => finished.push(i)),
      ),
    );

    expect(finished).toEqual([0, 1, 2]);
  });

  test("terminate rejects running and queued tasks, and later runs", async () => {
    const jimp = createPool(1);
    const input = new Jimp({ width: 1, height: 1 });
    const running = expect(
      jimp.run({ input, edits: testEdits(["spin", 5000]) }),
    ).rejects.toThrow("The Jimp worker was terminated");
    const queued = expect(jimp.run({ input })).rejects.toThrow(
      "The Jimp worker was terminated",
    );

    await jimp.terminate();
    await running;
    await queued;
    await expect(jimp.run({ input })).rejects.toThrow(
      "The Jimp worker was terminated",
    );
  });

  test("lets the process exit without terminate", async () => {
    const { stdout } = await promisify(execFile)(
      process.execPath,
      [fileURLToPath(fixture("no-exit.mjs"))],
      { timeout: 10000 },
    );

    expect(stdout.trim()).toBe("done true");
  });
});

describe("abort", () => {
  test("removes a queued task", async () => {
    const jimp = createPool(1);
    const input = new Jimp({ width: 1, height: 1 });
    const controller = new AbortController();
    const running = jimp.run({ input, edits: testEdits(["spin", 200]) });
    const queued = jimp.run({ input }, { signal: controller.signal });

    controller.abort(new Error("not needed"));

    await expect(queued).rejects.toThrow("not needed");
    expect(jimp.queued).toBe(0);
    await expect(running).resolves.toBeDefined();
  });

  test("stops a running task's worker", async () => {
    const jimp = createPool(1);
    const input = new Jimp({ width: 1, height: 1 });
    const start = Date.now();
    const running = jimp.run(
      { input, edits: testEdits(["spin", 10000]) },
      { signal: AbortSignal.timeout(100) },
    );

    await expect(running).rejects.toMatchObject({ name: "TimeoutError" });
    expect(Date.now() - start).toBeLessThan(5000);
    expect(jimp.running).toBe(0);

    // A new worker runs the next task
    await expect(jimp.run({ input })).resolves.toBeDefined();
  });

  test("rejects at once for an aborted signal, without detaching the input", async () => {
    const jimp = createPool(1);
    const input = new Uint8Array(await readFile(dicePath));

    await expect(
      jimp.run(
        { input },
        { signal: AbortSignal.abort(new Error("already")), transfer: true },
      ),
    ).rejects.toThrow("already");
    expect(input.byteLength).toBeGreaterThan(0);
  });
});
