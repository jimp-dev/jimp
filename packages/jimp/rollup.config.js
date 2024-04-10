import esbuild from "rollup-plugin-esbuild";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import nodePolyfills from "rollup-plugin-polyfill-node";
import inject from "@rollup/plugin-inject";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: `src/index.ts`,
    plugins: [
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
        file: `browser.js`,
        format: "es",
        sourcemap: true,
        inlineDynamicImports: true,
      },
    ],
  },
];
