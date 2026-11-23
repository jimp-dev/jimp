import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import ts from "typescript";

import * as esm from "./index.js";
import { Edge, Jimp } from "./index.js";

// Enums and constant objects that options take. A type-only export compiles
// fine but leaves these undefined at runtime.
const runtimeExports = [
  "Edge",
  "ResizeStrategy",
  "HorizontalAlign",
  "VerticalAlign",
  "BlendMode",
  "PNGColorType",
  "PNGFilterType",
  "BmpCompression",
  "ColorActionName",
  "JimpMime",
] as const;

const packageDir = path.join(__dirname, "..");

let outDir: string;

beforeAll(() => {
  outDir = mkdtempSync(path.join(packageDir, ".runtime-exports-test-"));
});

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

// The test runs against the source, so compile it to CommonJS the way the
// build does and load it with Node's require. The @jimp/* dependencies
// resolve to their built CommonJS output.
function requireCommonJS() {
  const source = readFileSync(path.join(__dirname, "index.ts"), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const file = path.join(outDir, "index.cjs");

  writeFileSync(file, outputText);

  return createRequire(file)(file) as typeof esm;
}

describe("runtime exports", () => {
  test.each(runtimeExports)("%s is a value in ESM", (name) => {
    expect(esm[name]).toBeTypeOf("object");
  });

  test("enums are values in CommonJS", { timeout: 60_000 }, () => {
    const cjs = requireCommonJS();

    for (const name of runtimeExports) {
      expect(cjs[name], name).toEqual(esm[name]);
    }

    expect(cjs.Edge.WRAP).toBe(2);
  });

  test("convolution takes Edge.WRAP", () => {
    // Black, black, white. The kernel copies each pixel's left neighbour.
    const image = Jimp.fromBitmap({
      width: 3,
      height: 1,
      data: Buffer.from([0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]),
    });
    const kernel = [[1, 0, 0]];

    const wrapped = image
      .clone()
      .convolution({ kernel, edgeHandling: Edge.WRAP });
    const extended = image
      .clone()
      .convolution({ kernel, edgeHandling: Edge.EXTEND });

    expect(wrapped.getPixelColor(0, 0)).toBe(0xffffffff);
    expect(wrapped.getPixelColor(1, 0)).toBe(0x000000ff);
    expect(wrapped.getPixelColor(2, 0)).toBe(0x000000ff);
    expect(extended.getPixelColor(0, 0)).toBe(0x000000ff);
  });
});
