import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Those run in a browser, with vitest.config.browser.mjs
    exclude: [...configDefaults.exclude, "**/*.browser.test.ts"],
    typecheck: { enabled: true },
  },
});
