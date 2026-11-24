import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { defineConfig } from "vitest/config";

// Unlike the other packages, no Node.js polyfills: the package must work in
// browsers without Buffer.
export default defineConfig({
  publicDir: path.join(import.meta.dirname, "test/corpus"),
  test: {
    include: ["**/*.browser.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      headless: true,
    },
  },
});
