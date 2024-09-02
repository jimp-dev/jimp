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
];
