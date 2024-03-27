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
