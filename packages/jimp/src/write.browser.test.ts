import { expect, test } from "vitest";
import { Jimp } from "./index.js";

test("writing to a local path in the browser suggests getBuffer", async () => {
  const image = new Jimp({ width: 1, height: 1 });

  await expect(image.write("output.png")).rejects.toThrow(
    /cannot write directly to a local path in the browser.*getBuffer/
  );

  const buffer = await image.getBuffer("image/png");
  expect(Array.from(buffer.subarray(0, 8))).toEqual([
    137, 80, 78, 71, 13, 10, 26, 10,
  ]);
});
