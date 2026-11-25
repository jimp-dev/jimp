// Fails if jimp's browser bundle is tshy's stub instead of rollup's output.
// tshy writes a tiny placeholder to dist/browser/index.js and rollup replaces
// it, both in jimp's `build` script. If something runs tshy on its own (like
// `tshy --watch`) the stub ships. See #1402.
//
// Also fails if the bundle stops parsing once Babel's preset-env has
// transformed it, which many apps do to their dependencies. See #1405.
import { parseSync, transformSync } from "@babel/core";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";

const bundle = fileURLToPath(
  new URL("../packages/jimp/dist/browser/index.js", import.meta.url),
);
const MIN_BYTES = 100 * 1024;

function fail(reason) {
  console.error(`Invalid jimp browser bundle (${bundle}): ${reason}`);
  console.error(
    "Rebuild with `pnpm build`. The bundle comes from rollup, which jimp's build script runs after tshy.",
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

// Enums options take have to be values, not type-only exports
for (const name of [
  "Jimp",
  "Edge",
  "ResizeStrategy",
  "HorizontalAlign",
  "VerticalAlign",
  "BlendMode",
  "PNGColorType",
  "PNGFilterType",
  "BmpCompression",
  "ColorActionName",
  "JimpMime",
]) {
  if (!new RegExp(`export\\s*\\{[^}]*\\bas ${name}\\b`).test(code)) {
    fail(`it does not export ${name}`);
  }
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

// @jimp/worker's browser build must not import Node.js modules, which only
// its Node.js build (platform.ts) uses
const workerBuild = fileURLToPath(
  new URL("../packages/worker/dist/browser/", import.meta.url),
);
const nodeModules = new Set(builtinModules);

for (const file of readdirSync(workerBuild).filter((f) => f.endsWith(".js"))) {
  const source = readFileSync(workerBuild + file, "utf8");

  for (const [, specifier] of source.matchAll(
    /(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g,
  )) {
    if (specifier.startsWith("node:") || nodeModules.has(specifier)) {
      console.error(
        `@jimp/worker's browser build imports ${specifier} in ${workerBuild + file}`,
      );
      process.exit(1);
    }
  }
}

console.log("@jimp/worker browser build OK");
