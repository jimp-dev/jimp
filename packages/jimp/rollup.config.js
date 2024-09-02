import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import nodePolyfills from "rollup-plugin-polyfill-node";
import inject from "@rollup/plugin-inject";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

import { promises as fs } from "fs";

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

export default [
  {
    input: `src/index.ts`,
    plugins: [
      injectCodePlugin('import "node-self"'),
      esbuild(),

      // Polyfill Node.js builtins
      nodePolyfills(),
      nodeResolve({ browser: true, preferBuiltins: false }),
      commonjs(),
      inject({ Buffer: ["buffer", "Buffer"] }),

      // Use the browser version of some packages
      alias({
        entries: [{ find: "pngjs", replacement: "pngjs/browser" }],
      }),

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
