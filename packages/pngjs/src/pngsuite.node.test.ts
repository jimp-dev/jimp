import { describe } from "vitest";

import { testPngSuite } from "../test/pngsuite.js";

// PngSuite (http://www.schaik.com/pngsuite/), compared with the pixels libpng
// decodes, with Node's native zlib
describe("PngSuite", () => {
  testPngSuite();
});
