import { defineConfig } from "vitest/config";
import { createRequire } from "module";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const require = createRequire(import.meta.url);
const imagesFolder = path.join(
  path.join(path.dirname(require.resolve("@jimp/test-utils")), "../../"),
  "images",
);

export default defineConfig({
  resolve: {
    alias: {
      pngjs: "pngjs/browser.js",
    },
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
      provider: "playwright",
      name: "chromium",
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
