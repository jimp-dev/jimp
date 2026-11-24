import { describe, expectTypeOf, test } from "vitest";
import path from "node:path";
import { createJimp } from "@jimp/core";
import { Format } from "@jimp/types";

import { defaultFormats, Jimp, JimpInstance } from "./index.js";

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

    image.write("output.ico", { sizes: [16, 32] });
    // @ts-expect-error ICO doesn't take a JPEG quality
    image.write("output.ico", { quality: 50 });
  });

  test("maps .svg to image/svg+xml", () => {
    const svg = () =>
      ({
        mime: "image/svg+xml",
        encode: () => Buffer.alloc(0),
        decode: () => ({ data: Buffer.alloc(0), width: 0, height: 0 }),
      }) satisfies Format<"image/svg+xml">;
    const WithSvg = createJimp({ formats: [...defaultFormats, svg] });
    const svgImage = new WithSvg({ width: 1, height: 1 });

    svgImage.write("output.svg");
    // @ts-expect-error SVG has no options
    svgImage.write("output.svg", { quality: 50 });
  });

  test("takes any options for a format whose options are typed as any", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type AnyOptions = any;
    const encode = (() => Buffer.alloc(0)) as (
      bitmap: unknown,
      options: AnyOptions,
    ) => Buffer;
    const loose = () =>
      ({
        mime: "image/loose",
        encode,
        decode: () => ({ data: Buffer.alloc(0), width: 0, height: 0 }),
      }) satisfies Format<"image/loose">;
    const WithLoose = createJimp({ formats: [loose] });
    const looseImage = new WithLoose({ width: 1, height: 1 });

    looseImage.write("output.loose", { quality: 50 });
    looseImage.getBuffer("image/loose", { quality: 50 });
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

describe("frames", () => {
  test("readFrames returns Jimp instances", async () => {
    const { frames, loop } = await Jimp.readFrames("animation.gif");
    const fromBuffer = await Jimp.fromBufferFrames(Buffer.alloc(0));

    expectTypeOf(frames[0]!.image).toEqualTypeOf<JimpInstance>();
    expectTypeOf(fromBuffer.frames[0]!.image).toEqualTypeOf<JimpInstance>();
    expectTypeOf(frames[0]!.delay).toEqualTypeOf<number | undefined>();
    expectTypeOf(loop).toEqualTypeOf<number | null | undefined>();
    frames[0]!.image.resize({ w: 1 });

    Jimp.readFrames("animation.gif", {
      maxFrames: 10,
      "image/gif": { maxResolutionInMP: 500 },
    });
    // @ts-expect-error maxFrames is a number
    Jimp.readFrames("animation.gif", { maxFrames: "10" });
  });

  test("encodeFrames takes images, frames and each format's options", async () => {
    const { frames, loop } = await Jimp.readFrames("animation.gif");

    expectTypeOf(
      Jimp.encodeFrames("image/gif", frames, { loop }),
    ).toEqualTypeOf<Promise<Buffer>>();
    Jimp.encodeFrames("image/gif", [image, { image, delay: 100 }]);
    Jimp.encodeFrames("image/gif", [image], { loop: null });
    Jimp.encodeFrames("image/tiff", [image, image]);
    // Single-frame formats take their encode options
    Jimp.encodeFrames("image/jpeg", [image], { quality: 50 });

    // @ts-expect-error loop is a number or null
    Jimp.encodeFrames("image/gif", [image], { loop: "forever" });
    // @ts-expect-error TIFF frames have no options
    Jimp.encodeFrames("image/tiff", [image], { loop: 0 });
    // @ts-expect-error PNG doesn't take a loop count
    Jimp.encodeFrames("image/png", [image], { loop: 0 });
    // @ts-expect-error delay is a number
    Jimp.encodeFrames("image/gif", [{ image, delay: "100" }]);
    // @ts-expect-error unsupported MIME type
    Jimp.encodeFrames("image/webp", [image]);
  });

  test("writeFrames narrows options for literal paths", () => {
    const output: string = path.join("output", "animation.gif");

    expectTypeOf(Jimp.writeFrames("out.gif", [image])).toEqualTypeOf<
      Promise<void>
    >();
    Jimp.writeFrames("out.gif", [image], { loop: 2 });
    Jimp.writeFrames("out.tif", [image]);
    Jimp.writeFrames(output, [image], { loop: 2 });
    // @ts-expect-error TIFF frames have no options
    Jimp.writeFrames("out.tiff", [image], { loop: 2 });
  });
});
