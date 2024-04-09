import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import nodePolyfills from "rollup-plugin-polyfill-node";
import inject from "@rollup/plugin-inject";

export default [
  {
    input: `src/index.ts`,
    plugins: [
      esbuild(),
      alias({
        // Use the browser version of pngjs
        entries: [{ find: "pngjs", replacement: "pngjs/browser" }],
      }),
      // Polyfill Node.js builtins
      nodeResolve({ preferBuiltins: false, browser: true }),
      // Polyfill Node.js globals
      inject({ Buffer: ["buffer", "Buffer"] }),
      commonjs(),
      nodePolyfills(),
    ],
    output: [
      {
        file: `browser.js`,
        format: "es",
        sourcemap: true,
      },
    ],
  },
];
