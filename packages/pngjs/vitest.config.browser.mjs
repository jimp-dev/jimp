import { mergeConfig } from "vitest/config";
import config from "@jimp/config-vitest/browser";

export default mergeConfig(config, {
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
});
