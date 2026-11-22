import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";

import webp from "./index.js";

const format = webp();

describe("WASM WebP (Node)", () => {
  test("loads WebP fixtures in Node", async () => {
    const image = await format.decode(
      await readFile(new URL("./images/test.webp", import.meta.url))
    );

    expect(image.width).toBeGreaterThan(0);
    expect(image.height).toBeGreaterThan(0);
    expect(image.data.length).toBe(image.width * image.height * 4);
    expect(Buffer.from(image.data).some((value) => value !== 0)).toBe(true);
  });

  test("exports WebP buffers in Node", async () => {
    const bitmap = {
      width: 3,
      height: 3,
      data: Buffer.from([
        255, 0, 0, 255,
        255, 0, 128, 255,
        255, 0, 255, 255,
        255, 0, 128, 255,
        255, 0, 255, 255,
        128, 0, 255, 255,
        255, 0, 255, 255,
        128, 0, 255, 255,
        0, 0, 255, 255,
      ]),
    };

    const buffer = await format.encode(bitmap);
    expect(buffer.toString("ascii", 0, 4)).toBe("RIFF");
    expect(buffer.toString("ascii", 8, 12)).toBe("WEBP");

    const roundTrip = await format.decode(buffer);
    expect(roundTrip.width).toBe(3);
    expect(roundTrip.height).toBe(3);
  });
});
