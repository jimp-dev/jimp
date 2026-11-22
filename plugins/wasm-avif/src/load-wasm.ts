import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

/**
 * The @jsquash codecs fetch their wasm from a file: URL, which Node's fetch
 * can't load, so read and compile it from disk instead.
 */
export async function loadWasm(
  specifier: string,
): Promise<WebAssembly.Module | undefined> {
  const wasm = await readFile(require.resolve(specifier));
  return WebAssembly.compile(new Uint8Array(wasm));
}
