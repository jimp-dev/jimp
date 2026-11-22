import { describe, expectTypeOf, test } from "vitest";
import path from "node:path";

import { Jimp } from "./index.js";

const image = new Jimp({ width: 1, height: 1 });

describe("write", () => {
  test("accepts a plain string path", () => {
    const output: string = path.join("output", "image.png");

    expectTypeOf(image.write(output)).toEqualTypeOf<Promise<void>>();
    image.write(output, { quality: 50 });
    image.write(output, { deflateLevel: 5 });
  });

  test("narrows options for literal paths", () => {
    image.write("output.jpg", { quality: 50 });
    image.write("output.png", { deflateLevel: 5 });
    // @ts-expect-error PNG doesn't take a JPEG quality
    image.write("output.png", { quality: 50 });
  });
});
