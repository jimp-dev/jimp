import { describe, expect, test, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { makeTestImage } from "@jimp/test-utils";

import png from "./index.js";

// Fail if the plugin falls back to loading the wasm itself
vi.mock("./load-wasm.js", () => ({
  loadWasm: () => Promise.reject(new Error("loadWasm should not be called")),
}));

const require = createRequire(import.meta.url);

async function compile(specifier: string) {
  return WebAssembly.compile(await readFile(require.resolve(specifier)));
}

const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM PNG with precompiled modules", () => {
  test("round-trips an image", async () => {
    const format = png({
      wasm: {
        png: await compile("@jsquash/png/codec/pkg/squoosh_png_bg.wasm"),
        optimise: await compile(
          "@jsquash/oxipng/codec/pkg/squoosh_oxipng_bg.wasm",
        ),
      },
    });
    const decoded = await format.decode(
      await format.encode(image, { optimize: {} }),
    );

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
  });
});
