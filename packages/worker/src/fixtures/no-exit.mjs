/* global URL, console */
// Runs a task without calling terminate. The process should still exit.
import { Worker } from "node:worker_threads";
import { createJimpWorker } from "@jimp/worker";

const jimp = createJimpWorker(
  () => new Worker(new URL("./jimp.worker.mjs", import.meta.url)),
  { concurrency: 2 }
);

const bytes = await jimp.run({
  input: new URL("./exif-p3.jpg", import.meta.url),
  edits: [["resize", { w: 10 }]],
  output: { mime: "image/png" },
});

console.log(`done ${bytes.length > 0}`);
