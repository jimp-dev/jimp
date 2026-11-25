import { describe, expect, test } from "vitest";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import { createJimp } from "@jimp/core";
import "@jimp/test-utils/image-snapshot";

import { methods, type GrainOptions } from "./index.js";

const jimp = createJimp({ formats: [png, jpeg], plugins: [methods] });

describe("grain", () => {
  test.each<GrainOptions>([
    {},
    { amount: 0.2, size: 3 },
    { monochrome: false, seed: 7 },
  ])("matches the snapshot for %o", async (options) => {
    const image = await jimp.read(__dirname + "/images/tiles.jpg");
    const output = await image.grain(options).getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });
});
