import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/** Reads and compiles resvg's wasm from disk */
export async function loadWasm() {
  const wasm = await readFile(
    require.resolve("@resvg/resvg-wasm/index_bg.wasm"),
  );
  return WebAssembly.compile(new Uint8Array(wasm));
}
