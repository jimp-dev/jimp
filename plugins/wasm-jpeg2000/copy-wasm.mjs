// The browser build loads the codec's wasm with
// `new URL("./openjpegwasm.wasm", import.meta.url)`, which bundlers emit as an
// asset. Unlike a path into another package, a relative path still works
// after Vite 8 pre-bundles the plugin, so the wasm is copied next to the
// browser build.
import { copyFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

await copyFile(
  require.resolve("@cornerstonejs/codec-openjpeg/wasm"),
  "dist/browser/openjpegwasm.wasm",
);
