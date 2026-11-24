import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ignores: [
      // Ignore dotfiles
      ".*.js",
      "node_modules/",
      "dist/",
      "**/browser.js",
    ],
  },
  {
    name: "eslint-config-turbo (recreated flat)",
    plugins: {
      turbo: { rules: turboPlugin.rules },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "error",
    },
  },
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // tsc names the schema types after the import, e.g.
          // `z.z.core.$strict`, which only resolves with NodeNext. With
          // bundler resolution the options are typed as `any`.
          selector:
            "ImportDeclaration[source.value='zod'] > ImportDefaultSpecifier",
          message:
            'Use `import { z } from "zod"`: the default import breaks the published types.',
        },
      ],
    },
  },
];
