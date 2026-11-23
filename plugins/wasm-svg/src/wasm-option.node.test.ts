import { describe, expect, test, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

import svg from "./index.js";

// Fail if the plugin falls back to loading the wasm itself
vi.mock("./load-wasm.js", () => ({
  loadWasm: () => Promise.reject(new Error("loadWasm should not be called")),
}));

const require = createRequire(import.meta.url);

describe("WASM SVG with a precompiled module", () => {
  test("renders an SVG", async () => {
    const resvg = await WebAssembly.compile(
      await readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")),
    );
    const format = svg({ wasm: { resvg } });
    const image = await format.decode(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="red"/></svg>',
      ),
    );

    expect([...image.data]).toEqual([255, 0, 0, 255]);
  });
});
