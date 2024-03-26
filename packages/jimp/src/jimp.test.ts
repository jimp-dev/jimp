import { describe, expect, test } from "vitest";
import { Jimp } from "./index.js";
import fs from "fs";
import { getTestImagePath } from "@jimp/test-utils";

describe("hasAlpha", () => {
  test("image with no alpha", async () => {
    const image = await Jimp.fromBuffer(
      fs.readFileSync(getTestImagePath("cops.jpg"))
    );

    expect(image.hasAlpha()).toBe(false);
  });

  test("image with alpha", async () => {
    const image = await Jimp.fromBuffer(
      fs.readFileSync(getTestImagePath("dice.png"))
    );

    expect(image.hasAlpha()).toBe(true);
  });
});
