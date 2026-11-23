/** The first bytes of every wasm module */
const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d];

/**
 * The build copies resvg's wasm next to this file. Bundlers like Vite,
 * webpack 5 and Rollup emit it as an asset from the `new URL`.
 */
export async function loadWasm() {
  const url = new URL("./resvg.wasm", import.meta.url);
  const response = await fetch(url);
  const wasm = new Uint8Array(await response.arrayBuffer());

  // A dev server can answer with its HTML page instead
  if (!response.ok || WASM_MAGIC.some((byte, i) => wasm[i] !== byte)) {
    throw new Error(
      `Failed to load resvg's wasm from ${url}. If your bundler moves @jimp/wasm-svg away from it, like Vite 7's dependency pre-bundling, see the package's README, or pass the compiled module as the wasm.resvg option.`,
    );
  }

  return WebAssembly.compile(wasm);
}
