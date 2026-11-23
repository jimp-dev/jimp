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

  test("rejects options no format takes for a plain string path", () => {
    const output: string = path.join("output", "image.png");

    // @ts-expect-error no format takes this option
    image.write(output, { notAnOption: true });
  });

  test("narrows options for literal paths", () => {
    image.write("output.jpg", { quality: 50 });
    image.write("output.png", { deflateLevel: 5 });
    // @ts-expect-error PNG doesn't take a JPEG quality
    image.write("output.png", { quality: 50 });
  });

  test("maps every extension to its format's options", () => {
    image.write("output.jpeg", { quality: 50 });
    image.write("output.jpg", { quality: 50, exif: true });
    image.write("output.JPG", { quality: 50 });
    // @ts-expect-error JPEG doesn't take a PNG deflateLevel
    image.write("output.jpg", { deflateLevel: 5 });
    // @ts-expect-error JPEG doesn't take a PNG deflateLevel
    image.write("output.jpe", { deflateLevel: 5 });

    image.write("output.gif");
    image.write("output.tif");
    image.write("output.tiff");
    image.write("output.bmp");
    // @ts-expect-error GIF has no options
    image.write("output.gif", { quality: 50 });
    // @ts-expect-error TIFF has no options
    image.write("output.tif", { quality: 50 });
    // @ts-expect-error TIFF has no options
    image.write("output.tiff", { quality: 50 });
    // @ts-expect-error BMP has no options
    image.write("output.bmp", { quality: 50 });
  });

  test("uses the last extension of paths with directories and dots", () => {
    const dir: string = "output";

    image.write("./output/image.v2.png", { deflateLevel: 5 });
    image.write(`${dir}/image.png`, { deflateLevel: 5 });
    // @ts-expect-error PNG doesn't take a JPEG quality
    image.write("./output/image.v2.png", { quality: 50 });
    // @ts-expect-error PNG doesn't take a JPEG quality
    image.write(`${dir}/image.png`, { quality: 50 });
  });
});
