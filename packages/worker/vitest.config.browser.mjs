import config from "@jimp/config-vitest/browser";
import { mergeConfig } from "vitest/config";

// Vite only sees the test workers' imports when a test starts one, and
// reloads the tests if they need dependencies it hasn't pre-bundled. Scan
// the workers up front instead, and pre-bundle the polyfill shims that
// @jimp/core's dependencies (used by the test worker's class) need.
export default mergeConfig(config, {
  optimizeDeps: {
    entries: ["src/**/*.browser.test.ts", "src/fixtures/*.worker.ts"],
    include: [
      "vite-plugin-node-polyfills/shims/global",
      "vite-plugin-node-polyfills/shims/process",
    ],
  },
});
