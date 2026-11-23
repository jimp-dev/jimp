import { expect, test } from "vitest";
import { Jimp } from "./index.js";

test("reads a Blob, e.g. a file from an <input>", async () => {
  const png = await new Jimp({
    width: 2,
    height: 1,
    color: 0xff0000ff,
  }).getBuffer("image/png");
  const image = await Jimp.read(new Blob([png], { type: "image/png" }));

  expect(image.mime).toBe("image/png");
  expect(image.getPixelColor(1, 0)).toBe(0xff0000ff);
});

test("fetches relative paths", async () => {
  const image = await Jimp.read("/dice.png");

  expect(image.mime).toBe("image/png");
  expect(image.width).toBeGreaterThan(0);
});
