import { describe, vi } from "vitest";

import { testPngSuite } from "../test/pngsuite.js";

// The browser build's zlib, pako
vi.mock("./zlib.js", () => import("./zlib-browser.mjs"));

describe("PngSuite with pako", () => {
  testPngSuite();
});
