import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import * as crop from "@jimp/plugin-crop";
import png from "@jimp/js-png";
import { Jimp, JimpInstance } from "./index.js";

declare const buffer: Buffer;

describe("JimpInstance", () => {
  test("constructor, readers and chained methods are interchangeable (#1337, #1364)", async () => {
    let image: JimpInstance = new Jimp({ width: 1, height: 1 });
    let read = await Jimp.read("image.png");
    let fromBuffer = await Jimp.fromBuffer(buffer);
    let fromBitmap = Jimp.fromBitmap({ width: 1, height: 1, data: [0] });
    let cropped = read.crop({ x: 0, y: 0, w: 1, h: 1 });
    let cloned = read.clone();

    // Assignments below would pass trivially for `any`
    expectTypeOf(image).not.toBeAny();
    expectTypeOf(read).not.toBeAny();
    expectTypeOf(fromBuffer).not.toBeAny();
    expectTypeOf(cropped).not.toBeAny();
    expectTypeOf(cloned).not.toBeAny();

    image = read;
    image = fromBuffer;
    image = fromBitmap;
    image = cropped;
    image = cloned;
    image = read.resize({ w: 1 }).greyscale();

    read = image;
    fromBuffer = image;
    fromBitmap = image;
    cropped = image;
    cloned = image;

    read = cropped;
    cropped = read;
  });

  test("the instance types users spell out are interchangeable (#1337)", async () => {
    type ReadResult = Awaited<ReturnType<typeof Jimp.read>>;

    const takesInstance = (image: JimpInstance) => image;
    const takesRead = (image: ReadResult) => image;

    takesInstance(await Jimp.read("image.png"));
    takesRead(new Jimp({ width: 1, height: 1 }));
    takesRead(takesInstance(new Jimp({ width: 1, height: 1 }).blur(1)));
  });

  test("core methods that return the image keep its type when chained", () => {
    const image = new Jimp({ width: 2, height: 2 });
    const scanned = image.scan(() => {});
    const scannedRegion = image.scan(0, 0, 1, 1, () => {});
    const colored = image.setPixelColor(0xff0000ff, 0, 0);
    const composited = image.composite(new Jimp({ width: 1, height: 1 }));

    expectTypeOf(scanned).not.toBeAny();
    expectTypeOf(scannedRegion).not.toBeAny();
    expectTypeOf(colored).not.toBeAny();
    expectTypeOf(composited).not.toBeAny();

    let chained: JimpInstance = image
      .scan(() => {})
      .resize({ w: 1 })
      .setPixelColor(0xff0000ff, 0, 0)
      .composite(new Jimp({ width: 1, height: 1 }), 0, 0)
      .greyscale();
    chained = scanned;
    chained = scannedRegion;
    chained = colored;
    chained = composited;
    expectTypeOf(chained).not.toBeAny();

    for (const pixel of image.scanIterator()) {
      expectTypeOf(pixel.image).not.toBeAny();
      expectTypeOf(pixel.image).toMatchTypeOf<JimpInstance>();
    }

    // @ts-expect-error unknown methods are rejected after chaining
    image.scan(() => {}).notAMethod();
    // @ts-expect-error composite needs a Jimp image
    image.composite({});
  });

  test("fromBitmap is not any (#1386)", () => {
    const image = Jimp.fromBitmap({ width: 1, height: 1, data: [0] });

    expectTypeOf(image).not.toBeAny();
    expectTypeOf(image.resize).toBeFunction();
    // @ts-expect-error unknown methods are rejected
    image.notAMethod();
  });

  test("classes made with createJimp behave the same", async () => {
    const CustomJimp = createJimp({ plugins: [crop.methods], formats: [png] });
    let image: InstanceType<typeof CustomJimp> = new CustomJimp();
    let read = await CustomJimp.read("image.png");
    const fromBitmap = CustomJimp.fromBitmap({
      width: 1,
      height: 1,
      data: [0],
    });

    expectTypeOf(fromBitmap).not.toBeAny();

    image = read;
    image = fromBitmap;
    image = read.crop({ x: 0, y: 0, w: 1, h: 1 });
    read = image;
  });
});
