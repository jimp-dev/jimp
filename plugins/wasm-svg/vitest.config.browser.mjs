import { mergeConfig } from "vitest/config";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import config from "@jimp/config-vitest/browser";

const require = createRequire(import.meta.url);

export default mergeConfig(config, {
  resolve: {
    // Mirror the tshy browser dialect when testing from source
    alias: [{ find: "./load-wasm.js", replacement: "./load-wasm-browser.mjs" }],
  },
  plugins: [
    {
      // The build copies the wasm next to the browser dialect, so serve it
      // next to the source
      name: "serve-resvg-wasm",
      configureServer(server) {
        server.middlewares.use("/src/resvg.wasm", async (_, res) => {
          res.setHeader("Content-Type", "application/wasm");
          res.end(
            await readFile(require.resolve("@resvg/resvg-wasm/index_bg.wasm")),
          );
        });
      },
    },
  ],
});
