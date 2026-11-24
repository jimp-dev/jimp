import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

// Unlike the other packages, no Node.js polyfills: the browser build must work
// without them
export default defineConfig({
  resolve: {
    // Mirror the tshy browser dialect when testing from source
    alias: [
      { find: /^(.*)\/zlib\.js$/, replacement: "$1/zlib-browser.mjs" },
      { find: /^(.*)\/buffer\.js$/, replacement: "$1/buffer-browser.mjs" },
      {
        find: /^(.*)\/stream-base\.js$/,
        replacement: "$1/stream-base-browser.mjs",
      },
    ],
  },
  // Pre-bundle pako so Vite doesn't discover it mid-run and reload the tests
  optimizeDeps: { include: ["pako"] },
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["**/*.node.test.ts", "**/node_modules/**", "**/dist/**"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
