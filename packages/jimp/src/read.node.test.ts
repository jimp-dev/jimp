import { describe, expect, test } from "vitest";

import { Jimp } from "./index.js";

describe("read", () => {
  test("reports a missing file instead of fetching the path", async () => {
    await expect(Jimp.read("./does-not-exist.png")).rejects.toThrow(
      "ENOENT: no such file or directory, open './does-not-exist.png'",
    );
  });

  test("fetches data URLs", async () => {
    const image = new Jimp({ width: 2, height: 1, color: 0xff0000ff });
    const read = await Jimp.read(await image.getBase64("image/png"));

    expect(read.width).toBe(2);
    expect(read.getPixelColor(1, 0)).toBe(0xff0000ff);
  });
});
