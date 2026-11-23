import { describe, expect, test, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { makeTestImage } from "@jimp/test-utils";

import jxl from "./index.js";

// Fail if the plugin falls back to loading the wasm itself
vi.mock("./load-wasm.js", () => ({
  loadWasm: () => Promise.reject(new Error("loadWasm should not be called")),
}));

const require = createRequire(import.meta.url);

async function compile(specifier: string) {
  return WebAssembly.compile(await readFile(require.resolve(specifier)));
}

const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM JPEG XL with precompiled modules", () => {
  test("round-trips an image", async () => {
    const format = jxl({
      wasm: {
        decoder: await compile("@jsquash/jxl/codec/dec/jxl_dec.wasm"),
        encoder: await compile("@jsquash/jxl/codec/enc/jxl_enc.wasm"),
      },
    });
    const decoded = await format.decode(await format.encode(image));

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
  });
});
