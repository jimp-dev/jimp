import { createBundle } from "dts-buddy";

await createBundle({
  project: "tsconfig.json",
  output: "browser.d.ts",
  modules: {
    jimp: "dist/esm/index.ts",
  },
});
