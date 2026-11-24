import { mergeConfig } from "vitest/config";
import config from "@jimp/config-vitest/browser";

export default mergeConfig(config, {
  resolve: {
    // Mirror the tshy browser dialect when testing from source
    alias: [
      { find: "./zlib.js", replacement: "./zlib-browser.mjs" },
      { find: "./buffer.js", replacement: "./buffer-browser.mjs" },
      { find: "./stream-base.js", replacement: "./stream-base-browser.mjs" },
    ],
  },
});
