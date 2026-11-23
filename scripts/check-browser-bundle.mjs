// Fails if jimp's browser bundle is tshy's stub instead of rollup's output.
// tshy writes a tiny `export {}` placeholder to dist/browser/index.js and
// rollup replaces it. If they run in the wrong order (or a cache restore
// misses the bundle) the stub ships. See #1402.
//
// Also fails if the bundle stops parsing once Babel's preset-env has
// transformed it, which many apps do to their dependencies. See #1405.
import { parseSync, transformSync } from "@babel/core";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const bundle = fileURLToPath(
  new URL("../packages/jimp/dist/browser/index.js", import.meta.url),
);
const MIN_BYTES = 100 * 1024;

function fail(reason) {
  console.error(`Invalid jimp browser bundle (${bundle}): ${reason}`);
  console.error(
    "Rebuild with `pnpm build`. The bundle comes from rollup (build:browser), which must run after tshy (build).",
  );
  process.exit(1);
}

let size;

try {
  size = statSync(bundle).size;
} catch {
  fail("file does not exist");
}

if (size < MIN_BYTES) {
  fail(`only ${size} bytes, expected at least ${MIN_BYTES}`);
}

const code = readFileSync(bundle, "utf8");

if (!/export\s*\{[^}]*\bas Jimp\b/.test(code)) {
  fail("it does not export Jimp");
}

try {
  const options = { babelrc: false, configFile: false, sourceType: "module" };
  const result = transformSync(code, {
    ...options,
    compact: true,
    presets: [["@babel/preset-env", { modules: false }]],
  });

  parseSync(result.code, options);
} catch (error) {
  // The bundle is a single line, so skip the code frame
  console.error(
    `Invalid jimp browser bundle (${bundle}): it does not parse after @babel/preset-env transforms it:`,
    error.message.split("\n")[0],
  );
  process.exit(1);
}

console.log(`jimp browser bundle OK (${size} bytes)`);
