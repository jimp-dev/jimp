import { createHash } from "crypto";
import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";

import { methods as dither, DitherOptions } from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [dither] });

const sha256 = (data: Buffer) =>
  createHash("sha256").update(data).digest("hex");

describe("Dither", () => {
  // Hashes of dither() output before options were added. cops.jpg's changed
  // when JPEG decoding started matching libjpeg-turbo: with the pixels of
  // jpeg-js, the old decoder, dither() still gives 52f4bd92...
  test.each([
    [
      "cops.jpg",
      "5bbc1e969b52ba77d6f8d8138149f0df1076350ceabab02c68ea3f9e422953fa",
    ],
    [
      "dice.png",
      "68097c0ff71b9f29c66deb004af6934c87e4e465ac9917d9728580a738d0dbff",
    ],
    [
      "alpha-v5.png",
      "51d0542d53ddf3b7d97d088eef62f91c66edba13cbced35fa900db46b033d5bc",
    ],
  ] as const)("default output on %s is unchanged", async (name, hash) => {
    const image = await Jimp.read(getTestImagePath(name));

    expect(sha256(image.dither().bitmap.data)).toBe(hash);
  });

  test("default output on every byte value is unchanged", () => {
    const data = Buffer.alloc(64 * 16 * 4);

    for (let i = 0; i < 64 * 16; i++) {
      const v = i % 256;

      data[i * 4] = v;
      data[i * 4 + 1] = 255 - v;
      data[i * 4 + 2] = (v * 7) & 255;
      data[i * 4 + 3] = (v * 13) & 255;
    }

    const image = Jimp.fromBitmap({ data, width: 64, height: 16 });

    expect(sha256(image.dither().bitmap.data)).toBe(
      "a2528305dcf36b11ee4dfd016450786656dcfbc2ae7b7874cb0d07a1ef6af64c",
    );
  });

  test.each<DitherOptions>([
    { type: "floyd-steinberg" },
    { type: "atkinson" },
    { type: "bayer4" },
    { type: "bayer8" },
    { type: "floyd-steinberg", palette: 2 },
    { type: "bayer8", palette: 4 },
    { type: "atkinson", palette: "rgb565" },
  ])("matches the snapshot for %o", async (options) => {
    const image = await Jimp.read(getTestImagePath("cops.jpg"));
    const output = await image.dither(options).getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });
});
