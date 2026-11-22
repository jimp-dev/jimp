import { mergeConfig } from "vitest/config";
import config from "@jimp/config-vitest/browser";

export default mergeConfig(config, {
  resolve: {
    // Mirror the tshy browser dialect when testing from source
    alias: [{ find: "./load-wasm.js", replacement: "./load-wasm-browser.mjs" }],
  },
  // Pre-bundling moves the codecs away from the wasm they load relative to import.meta.url
  optimizeDeps: { exclude: ["@jsquash/png", "@jsquash/oxipng"] },
});
