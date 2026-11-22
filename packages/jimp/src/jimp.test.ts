import { describe, expect, test } from "vitest";
import { Jimp } from "./index.js";
import { getTestImagePath } from "@jimp/test-utils";

describe("hasAlpha", () => {
  test("image with no alpha", async () => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    expect(image.hasAlpha()).toBe(false);
  });

  test("image with alpha", async () => {
    const image = await Jimp.read(getTestImagePath("dice.png"));
    expect(image.hasAlpha()).toBe(true);
  });
});

describe("fromBitmap", () => {
  test("Buffer view only copies its own bytes", () => {
    const backing = Buffer.alloc(64, 0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const before = Buffer.from(backing);
    const image = Jimp.fromBitmap({ data, width: 2, height: 2 });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);

    image.bitmap.data.fill(0);
    expect(backing.equals(before)).toBe(true);
  });

  test("Uint8Array view only uses its own bytes", () => {
    const backing = new Uint8Array(64).fill(0xaa);
    const data = backing.subarray(16, 32).fill(0xff);
    const image = Jimp.fromBitmap({ data, width: 2, height: 2 });

    expect(image.bitmap.data.length).toBe(16);
    expect(image.getPixelColor(0, 0)).toBe(0xffffffff);
  });
});
