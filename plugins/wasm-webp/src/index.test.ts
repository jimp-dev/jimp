import { describe, expect, test } from "vitest";
import { makeTestImage } from "@jimp/test-utils";

import webp from "./index.js";

const format = webp();
const image = makeTestImage("▴▴▴▴▸▸▸▸", "▴▴▴▴▸▸▸▸", "▾▾▾▾◆◆◆◆", "▾▾▾▾◆◆◆◆");

describe("WASM WebP", () => {
  test("round-trips an image", async () => {
    // Run two of each at once so both race to initialize the codec
    const [buffer] = await Promise.all([
      format.encode(image),
      format.encode(image),
    ]);
    const [decoded] = await Promise.all([
      format.decode(buffer),
      format.decode(buffer),
    ]);

    expect(decoded.width).toBe(image.width);
    expect(decoded.height).toBe(image.height);
    expect(decoded.data.length).toBe(image.width * image.height * 4);
  });
});
