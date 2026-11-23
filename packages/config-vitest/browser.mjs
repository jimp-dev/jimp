import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const require = createRequire(import.meta.url);
const imagesFolder = path.join(
  path.join(path.dirname(require.resolve("@jimp/test-utils")), "../../"),
  "images",
);

export default defineConfig({
  resolve: {
    alias: [
      // Exact match, so imports of "pngjs/browser.js" itself aren't rewritten.
      { find: /^pngjs$/, replacement: "pngjs/browser.js" },
      // nodePolyfills injects this import into every module that uses Buffer,
      // including built deps like @jimp/test-utils that can't resolve it under pnpm.
      {
        find: /^vite-plugin-node-polyfills\/shims\/buffer$/,
        replacement: fileURLToPath(
          import.meta.resolve("vite-plugin-node-polyfills/shims/buffer"),
        ),
      },
    ],
  },
  // Pre-bundle the shim so Vite doesn't discover it mid-run and reload tests.
  optimizeDeps: {
    include: ["vite-plugin-node-polyfills/shims/buffer"],
  },
  test: {
    exclude: [
      "**/.tshy-build",
      "**/.tshy",
      "**/*.node.test.ts",
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
  publicDir: imagesFolder,
  plugins: [
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
});
