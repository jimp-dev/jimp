import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

import { methods as lutMethods, parseCubeLut } from "./index.js";

const Jimp = createJimp({ formats: [png], plugins: [lutMethods] });

const fixture = (name: string) =>
  new URL(`./fixtures/${name}`, import.meta.url);
const readImage = async (name: string) =>
  Jimp.fromBuffer(await readFile(fixture(name)));
const tealOrange = parseCubeLut(
  await readFile(fixture("teal-orange.cube"), "utf8"),
);

/**
 * Compare with FFmpeg's output. FFmpeg truncates to 8 bits where Jimp
 * rounds, so Jimp's red, green and blue may be 1 higher. Alpha is the same.
 */
function expectToMatchFfmpeg(
  actual: InstanceType<typeof Jimp>,
  expected: InstanceType<typeof Jimp>,
) {
  const a = actual.bitmap.data;
  const e = expected.bitmap.data;
  let higher = 0;

  expect(a.length).toBe(e.length);

  for (let i = 0; i < a.length; i++) {
    const difference = a[i]! - e[i]!;

    if (difference !== 0 && (i % 4 === 3 || difference !== 1)) {
      throw new Error(
        `Pixel ${i >> 2}, channel ${i % 4}: ${a[i]} where FFmpeg has ${e[i]}`,
      );
    }

    higher += difference;
  }

  // Not all of them, which would mean an offset rather than rounding
  expect(higher).toBeLessThan(a.length / 2);
}

describe("matches FFmpeg's tetrahedral interpolation", () => {
  test("for a .cube LUT (lut3d)", async () => {
    expect(tealOrange.title).toBe("Teal and orange");
    expect(tealOrange.size).toBe(5);

    const image = await readImage("sweep.png");

    expectToMatchFfmpeg(
      image.colorGrade(tealOrange),
      await readImage("sweep-teal-orange.png"),
    );
  });

  test("for a Hald CLUT image (haldclut)", async () => {
    const image = await readImage("sweep.png");

    expectToMatchFfmpeg(
      image.colorGrade(await readImage("teal-orange-hald.png")),
      await readImage("sweep-teal-orange-hald.png"),
    );
  });

  test("an identity .cube file changes nothing", async () => {
    const identity = parseCubeLut(
      await readFile(fixture("identity.cube"), "utf8"),
    );
    const image = await readImage("sweep.png");
    const original = Buffer.from(image.bitmap.data);

    expect(image.colorGrade(identity).bitmap.data).toEqual(original);
  });
});
