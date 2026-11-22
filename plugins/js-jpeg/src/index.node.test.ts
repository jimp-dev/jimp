import { expect, test, describe } from "vitest";
import { promises as fs } from "fs";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";

import jpeg from "./index.js";

const jimp = createJimp({ formats: [jpeg] });

describe("JPEG", () => {
  test("load JPG without trailing EOI marker", async () => {
    const original = await fs.readFile(getTestImagePath("cops.jpg"));
    const withoutEoi = original.subarray(0, original.length - 2);
    const copy = Buffer.from(withoutEoi);

    const expected = await jimp.read(original);
    const image = await jimp.read(withoutEoi);

    expect(image.bitmap.width).toBe(expected.bitmap.width);
    expect(image.bitmap.height).toBe(expected.bitmap.height);
    expect(withoutEoi.equals(copy)).toBe(true);
  });

  test("truncated JPG still fails to load", async () => {
    const original = await fs.readFile(getTestImagePath("cops.jpg"));
    const truncated = original.subarray(0, original.length / 2);

    await expect(jimp.read(truncated)).rejects.toThrow();
  });
});
