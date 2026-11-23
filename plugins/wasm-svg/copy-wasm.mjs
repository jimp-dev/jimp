// The browser build loads resvg's wasm with
// `new URL("./resvg.wasm", import.meta.url)`, which bundlers emit as an
// asset. Unlike a path into another package, a relative path still works
// after Vite 8 pre-bundles the plugin, so the wasm is copied next to the
// browser build.
import { copyFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

await copyFile(
  require.resolve("@resvg/resvg-wasm/index_bg.wasm"),
  "dist/browser/resvg.wasm",
);
