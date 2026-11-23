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

  test("load JPG with stray bytes between header segments", async () => {
    const original = await fs.readFile(getTestImagePath("cops.jpg"));
    // End of the APP0 segment that follows SOI.
    const app0End = 4 + original.readUInt16BE(4);
    // Leftover Photoshop data, like the image in issue #994, plus a stray
    // 0xFF that doesn't start a marker.
    const junk = Buffer.from(
      "IM\x04\x04\x00\x00\x00\x008BIM\x04%\xff\x00",
      "latin1",
    );
    const withJunk = Buffer.concat([
      original.subarray(0, app0End),
      junk,
      original.subarray(app0End),
    ]);
    const copy = Buffer.from(withJunk);

    const expected = await jimp.read(original);
    const image = await jimp.read(withJunk);

    expect(image.bitmap.width).toBe(expected.bitmap.width);
    expect(image.bitmap.height).toBe(expected.bitmap.height);
    expect(image.bitmap.data.equals(expected.bitmap.data)).toBe(true);
    expect(withJunk.equals(copy)).toBe(true);
  });

  test("JPG with only garbage after SOI still fails to load", async () => {
    const garbage = Buffer.concat([
      Buffer.from([0xff, 0xd8]),
      Buffer.alloc(100_000, 0x42),
    ]);

    await expect(jimp.read(garbage)).rejects.toThrow();
  });

  test("re-encoding a JPG at the default quality doesn't make it larger (#1018)", async () => {
    for (const name of ["cops.jpg", "fillbytes.jpg", "hands.jpg"] as const) {
      const original = await fs.readFile(getTestImagePath(name));
      const image = await jimp.read(original);
      const buffer = await image.getBuffer("image/jpeg");

      expect(buffer.length).toBeLessThan(original.length);
    }
  });

  test("truncated JPG still fails to load", async () => {
    const original = await fs.readFile(getTestImagePath("cops.jpg"));
    const truncated = original.subarray(0, original.length / 2);

    await expect(jimp.read(truncated)).rejects.toThrow();
  });
});
