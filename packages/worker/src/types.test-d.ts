import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import webp from "@jimp/wasm-webp";
import * as crop from "@jimp/plugin-crop";
import { Jimp } from "jimp";
import { createJimpWorker, expose, type JimpWorker } from "./index.js";

declare const createWorker: () => Worker;
declare const bytes: ArrayBuffer;

const CropJimp = createJimp({ plugins: [crop.methods], formats: [png] });
const WebpJimp = createJimp({ formats: [png, webp] });

describe("createJimpWorker", () => {
  test("infers the class from the Jimp option", () => {
    const jimp = createJimpWorker(createWorker, { Jimp });

    expectTypeOf(jimp).toEqualTypeOf<JimpWorker<typeof Jimp>>();
    expectTypeOf(
      jimp.run({
        input: bytes,
        edits: [["resize", { w: 100 }], ["greyscale"]],
      }),
    ).resolves.toEqualTypeOf<InstanceType<typeof Jimp>>();
    expectTypeOf(
      jimp.run({ input: bytes, output: { mime: "image/png" } }),
    ).resolves.toEqualTypeOf<Uint8Array<ArrayBuffer>>();
  });

  test("only takes edits that change the image", () => {
    const jimp = createJimpWorker(createWorker, { Jimp });

    // @ts-expect-error returns a color, not the image
    void jimp.run({ input: bytes, edits: [["dominantColor"]] });
    // @ts-expect-error returns a list of colors, not the image
    void jimp.run({ input: bytes, edits: [["palette", 5]] });
  });

  test("checks edits against the class", () => {
    const jimp = createJimpWorker<typeof CropJimp>(createWorker);

    void jimp.run({
      input: bytes,
      edits: [["crop", { x: 0, y: 0, w: 1, h: 1 }]],
      output: { mime: "image/png" },
    });
    // @ts-expect-error CropJimp has no resize
    void jimp.run({ input: bytes, edits: [["resize", { w: 100 }]] });
    // @ts-expect-error wrong arguments
    void jimp.run({ input: bytes, edits: [["crop", { width: 1 }]] });
    // @ts-expect-error CropJimp can't write JPEG
    void jimp.run({ input: bytes, output: { mime: "image/jpeg" } });
  });

  test("takes the type of what the worker exposes", () => {
    // As in a worker script: `const exposed = expose(CropJimp)`
    type Exposed = ReturnType<typeof expose<typeof CropJimp>>;

    const jimp = createJimpWorker<Exposed>(createWorker);

    void jimp.run({
      input: bytes,
      edits: [["crop", { x: 0, y: 0, w: 1, h: 1 }]],
      output: { mime: "image/png" },
    });
    // @ts-expect-error the worker's class has no resize
    void jimp.run({ input: bytes, edits: [["resize", { w: 100 }]] });

    // The Jimp option must be the class the worker exposes
    type ExposedJimp = ReturnType<typeof expose<typeof Jimp>>;

    createJimpWorker<ExposedJimp>(createWorker, { Jimp });
    // @ts-expect-error a class without the worker's methods
    createJimpWorker<ExposedJimp>(createWorker, { Jimp: CropJimp });
  });

  test("takes read options of the class", () => {
    const jimp = createJimpWorker(createWorker, { Jimp });

    void jimp.run({ input: "photo.jpg", read: { exifRotate: false } });
    // @ts-expect-error not a read option
    void jimp.run({ input: "photo.jpg", read: { rotate: false } });
  });
});

describe("custom classes", () => {
  test("take the class's formats", () => {
    const jimp = createJimpWorker(createWorker, { Jimp: WebpJimp });

    void jimp.run({ input: bytes, output: { mime: "image/webp" } });
    // @ts-expect-error not one of the class's formats
    void jimp.run({ input: bytes, output: { mime: "image/gif" } });
  });
});

describe("output", () => {
  test("checks the MIME type against the class's formats", () => {
    const jimp = createJimpWorker(createWorker, { Jimp: CropJimp });

    void jimp.run({ input: bytes, output: { mime: "image/png" } });
    // @ts-expect-error CropJimp can't write JPEG
    void jimp.run({ input: bytes, output: { mime: "image/jpeg" } });
  });

  test("checks the options against the MIME type's format", () => {
    const jimp = createJimpWorker(createWorker, { Jimp });

    expectTypeOf(
      jimp.run({
        input: bytes,
        output: { mime: "image/jpeg", options: { quality: 50, exif: true } },
      }),
    ).resolves.toEqualTypeOf<Uint8Array<ArrayBuffer>>();
    void jimp.run({
      input: bytes,
      output: { mime: "image/png", options: { deflateLevel: 9 } },
    });
    void jimp.run({
      input: bytes,
      // @ts-expect-error a PNG option for JPEG
      output: { mime: "image/jpeg", options: { deflateLevel: 9 } },
    });
    void jimp.run({
      input: bytes,
      // @ts-expect-error wrong option type
      output: { mime: "image/jpeg", options: { quality: "high" } },
    });
  });

  test("checks options for a custom class's formats", () => {
    const jimp = createJimpWorker(createWorker, { Jimp: WebpJimp });

    void jimp.run({
      input: bytes,
      output: { mime: "image/webp", options: { quality: 80 } },
    });
    void jimp.run({
      input: bytes,
      // @ts-expect-error not a WebP option
      output: { mime: "image/webp", options: { deflateLevel: 9 } },
    });
  });
});
