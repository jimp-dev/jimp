import { vi } from "vitest";

import { testFuzz } from "../test/fuzz.js";

// The browser build's zlib, pako
vi.mock("./zlib.js", () => import("./zlib-browser.mjs"));

testFuzz();
