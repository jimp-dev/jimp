/* global queueMicrotask */
// A Jimp class with methods for testing the worker: busy work, crashes, and
// which thread ran a task
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";

// Not `process`, which the browser tests' polyfills would rewrite
const { process } = globalThis;
const isNode = !!process?.versions?.node;
const threadId = isNode
  ? (await import("node:worker_threads")).threadId
  : Math.floor(Math.random() * 1e9);

const testMethods = {
  /** Keep the thread busy for `ms` milliseconds */
  spin(image, ms) {
    const end = Date.now() + ms;

    while (Date.now() < end) {
      // busy
    }

    return image;
  },
  /** End the worker thread */
  exit(image, code) {
    process.exit(code);
    return image;
  },
  /**
   * Throw outside of the task, as a bug in a plugin might. It's thrown at
   * the task's next await, such as encoding the output.
   */
  throwSoon(image) {
    queueMicrotask(() => {
      throw new Error("thrown soon");
    });
    return image;
  },
  /** Record the thread in the image's background */
  markThread(image) {
    image.background = threadId;
    return image;
  },
};

export const TestJimp = createJimp({
  formats: defaultFormats,
  plugins: [...defaultPlugins, testMethods],
});
