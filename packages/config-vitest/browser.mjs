import { defineConfig } from "vitest/config";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const imagesFolder = path.join(
  path.join(path.dirname(require.resolve("@jimp/test-utils")), "../../"),
  "images"
);

export default defineConfig({
  test: {
    exclude: [
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
  optimizeDeps: {
    include: ["@jimp/core"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true })],
    },
  },
});
