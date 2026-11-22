import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import nodePolyfills from "rollup-plugin-polyfill-node";
import inject from "@rollup/plugin-inject";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

import { promises as fs } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function maybeUnlink(path) {
  try {
    await fs.unlink(path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

// Remove tshy's output
await maybeUnlink("dist/browser/index-browser.d.mts.map");
await maybeUnlink("dist/browser/index-browser.mjs.map");
await maybeUnlink("dist/browser/index.d.ts");
await maybeUnlink("dist/browser/index.js");

function injectCodePlugin(code) {
  return {
    name: "inject-code",
    transform(src, id) {
      if (id.endsWith("jimp/src/index.ts")) {
        const injectedCode = `${code}\n${src}`;
        const lines = code.split("\n");
        const injectedLines = injectedCode.split("\n");
        const mappings = [];

        for (let i = 0; i < injectedLines.length; i++) {
          mappings.push([i, 0, 0, 0]);
        }

        for (let i = 0; i < lines.length; i++) {
          mappings.push([i + injectedLines.length, 0, i, 0]);
        }

        return {
          code: injectedCode,
          map: {
            version: 3,
            file: id,
            sources: [id],
            sourcesContent: [code],
            names: [],
            mappings: mappings.map((mapping) => mapping.join(",")).join(";"),
          },
        };
      }
    },
  };
}

/**
 * rollup-plugin-polyfill-node ships buffer v5, which detects typed array
 * support through `__proto__`. Runtimes that disable `__proto__` (like Deno)
 * then get plain Uint8Arrays instead of Buffers. Resolve every `buffer` import,
 * including the ones the polyfill plugin injects, to buffer v6 instead.
 */
function bufferV6Plugin() {
  const bufferPath = require.resolve("buffer/");

  return {
    name: "buffer-v6",
    resolveId(importee) {
      if (/^(\0polyfill-node\.)?buffer(\.js)?\/?$/.test(importee)) {
        return bufferPath;
      }
    },
  };
}

/**
 * pngjs/browser.js is a browserify bundle with its own copy of buffer v5, which
 * sets prototypes by assigning `__proto__`. Use Object.setPrototypeOf instead.
 */
function pngjsSetPrototypeOfPlugin() {
  return {
    name: "pngjs-set-prototype-of",
    transform(code, id) {
      if (id.endsWith("pngjs/browser.js")) {
        return {
          code: code.replace(
            /([\w.]+)\.__proto__ = ([^;\n]+)/g,
            "Object.setPrototypeOf($1, $2)",
          ),
          // Only columns change, so the existing mappings stay usable
          map: null,
        };
      }
    },
  };
}

export default [
  {
    input: `src/index.ts`,
    plugins: [
      injectCodePlugin('import "node-self"'),
      esbuild(),

      // Polyfill Node.js builtins
      bufferV6Plugin(),
      nodePolyfills(),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      inject({ Buffer: ["buffer", "Buffer"] }),

      // Use the browser version of some packages
      alias({
        entries: [{ find: /^pngjs$/, replacement: "pngjs/browser.js" }],
      }),
      pngjsSetPrototypeOfPlugin(),

      terser(),
    ],
    output: [
      {
        file: "dist/browser/index.js",
        format: "es",
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
  },
  {
    input: `src/index.ts`,
    output: [{ file: "dist/browser/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
