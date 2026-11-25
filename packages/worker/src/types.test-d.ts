import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import * as crop from "@jimp/plugin-crop";
import { Jimp } from "jimp";
import { createJimpWorker, expose, type JimpWorker } from "./index.js";

declare const createWorker: () => Worker;
declare const bytes: ArrayBuffer;

const CropJimp = createJimp({ plugins: [crop.methods], formats: [png] });

describe("createJimpWorker", () => {
  test("infers the class from the Jimp option", () => {
    const jimp = createJimpWorker(createWorker, { Jimp });

    expectTypeOf(jimp).toEqualTypeOf<JimpWorker<typeof Jimp>>();
    expectTypeOf(
      jimp.run({ input: bytes, edits: [["resize", { w: 100 }], ["greyscale"]] })
    ).resolves.toEqualTypeOf<InstanceType<typeof Jimp>>();
    expectTypeOf(
      jimp.run({ input: bytes, output: { mime: "image/png" } })
    ).resolves.toEqualTypeOf<Uint8Array<ArrayBuffer>>();
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

