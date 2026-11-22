import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import * as crop from "@jimp/plugin-crop";
import * as resize from "@jimp/plugin-resize";
import png from "@jimp/js-png";
import jpeg from "@jimp/js-jpeg";
import type { BmFont } from "@jimp/plugin-print";
import { Jimp, JimpInstance, ResizeStrategy } from "./index.js";

declare const buffer: Buffer;
declare const image: JimpInstance;
declare const font: BmFont<JimpInstance>;

describe("one instance type (#1337, #1364)", () => {
  test("constructor, readers, clone and chained methods are interchangeable", async () => {
    let constructed: JimpInstance = new Jimp({ width: 1, height: 1 });
    let read = await Jimp.read("image.png");
    let fromBuffer = await Jimp.fromBuffer(buffer);
    let fromBitmap = Jimp.fromBitmap({ width: 1, height: 1, data: [0] });
    let cropped = read.crop({ x: 0, y: 0, w: 1, h: 1 });
    let cloned = read.clone();

    // The assignments below would pass trivially for `any`
    expectTypeOf(constructed).not.toBeAny();
    expectTypeOf(read).not.toBeAny();
    expectTypeOf(fromBuffer).not.toBeAny();
    expectTypeOf(fromBitmap).not.toBeAny();
    expectTypeOf(cropped).not.toBeAny();
    expectTypeOf(cloned).not.toBeAny();

    constructed = read;
    constructed = fromBuffer;
    constructed = fromBitmap;
    constructed = cropped;
    constructed = cloned;

    read = constructed;
    fromBuffer = constructed;
    fromBitmap = constructed;
    cropped = constructed;
    cloned = constructed;

    read = cropped;
    cropped = read;
  });

  test("the instance types users spell out are interchangeable", async () => {
    type ReadResult = Awaited<ReturnType<typeof Jimp.read>>;
    type FromBufferResult = Awaited<ReturnType<typeof Jimp.fromBuffer>>;
    type FromBitmapResult = ReturnType<typeof Jimp.fromBitmap>;
    type CropResult = ReturnType<JimpInstance["crop"]>;

    const takesInstance = (value: JimpInstance) => value;
    const takesRead = (value: ReadResult) => value;
    const takesFromBuffer = (value: FromBufferResult) => value;
    const takesFromBitmap = (value: FromBitmapResult) => value;
    const takesCrop = (value: CropResult) => value;

    for (const value of [
      new Jimp({ width: 1, height: 1 }),
      await Jimp.read("image.png"),
      image.blur(1),
    ]) {
      takesInstance(value);
      takesRead(value);
      takesFromBuffer(value);
      takesFromBitmap(value);
      takesCrop(value);
    }
  });

  test("fromBitmap is not any (#1386)", () => {
    const fromBitmap = Jimp.fromBitmap({ width: 1, height: 1, data: [0] });

    expectTypeOf(fromBitmap).not.toBeAny();
    expectTypeOf(fromBitmap.resize).toBeFunction();
    // @ts-expect-error unknown methods are rejected
    fromBitmap.notAMethod();
  });

  test("statics accept every bitmap and buffer shape", () => {
    Jimp.fromBitmap({ width: 1, height: 1, data: Buffer.alloc(4) });
    Jimp.fromBitmap({ width: 1, height: 1, data: new Uint8Array(4) });
    Jimp.fromBitmap({ width: 1, height: 1, data: new Uint8ClampedArray(4) });
    Jimp.fromBitmap({ width: 1, height: 1, data: [0xffffffff] });
    Jimp.fromBuffer(new ArrayBuffer(4));
    Jimp.read(new ArrayBuffer(4));
    Jimp.read(buffer);
    new Jimp({ width: 1, height: 1, color: "#ff0000" });
    new Jimp({ width: 1, height: 1, color: 0xff0000ff });
    new Jimp({ width: 1, height: 1, data: Buffer.alloc(4) });
    // @ts-expect-error width and height are required
    new Jimp({ width: 1 });
  });
});

describe("chainable methods return the instance type", () => {
  test("every chainable plugin method", () => {
    const results = {
      blit: image.blit({ src: image, x: 0, y: 0 }),
      blur: image.blur(1),
      gaussian: image.gaussian(1),
      circle: image.circle(),
      normalize: image.normalize(),
      invert: image.invert(),
      brightness: image.brightness(1),
      contrast: image.contrast(0.5),
      posterize: image.posterize(5),
      greyscale: image.greyscale(),
      opacity: image.opacity(0.5),
      sepia: image.sepia(),
      fade: image.fade(0.5),
      convolution: image.convolution({ kernel: [[1]] }),
      opaque: image.opaque(),
      pixelate: image.pixelate({ size: 2 }),
      convolute: image.convolute({ kernel: [[1]] }),
      color: image.color([{ apply: "red", params: [10] }]),
      contain: image.contain({ w: 1, h: 1 }),
      cover: image.cover({ w: 1, h: 1 }),
      crop: image.crop({ x: 0, y: 0, w: 1, h: 1 }),
      autocrop: image.autocrop(),
      displace: image.displace({ map: image, offset: 1 }),
      dither: image.dither(),
      fisheye: image.fisheye(),
      flip: image.flip({ horizontal: true }),
      mask: image.mask({ src: image }),
      print: image.print({ font, x: 0, y: 0, text: "hi" }),
      resize: image.resize({ w: 1, mode: ResizeStrategy.BILINEAR }),
      scale: image.scale(2),
      scaleToFit: image.scaleToFit({ w: 1, h: 1 }),
      rotate: image.rotate(90),
      threshold: image.threshold({ max: 100 }),
      quantize: image.quantize({ colors: 4 }),
    };

    for (const result of Object.values(results)) {
      expectTypeOf(result).not.toBeAny();
      expectTypeOf(result).toMatchTypeOf<JimpInstance>();
      const back: typeof result = image;
      void back;
    }
  });

  test("core methods that return the image", () => {
    const results = {
      scan: image.scan(() => {}),
      scanRegion: image.scan(0, 0, 1, 1, () => {}),
      setPixelColor: image.setPixelColor(0xff0000ff, 0, 0),
      composite: image.composite(image),
      compositeWithOptions: image.composite(image, 1, 1, {
        opacitySource: 0.5,
      }),
      clone: image.clone(),
    };

    for (const result of Object.values(results)) {
      expectTypeOf(result).not.toBeAny();
      expectTypeOf(result).toMatchTypeOf<JimpInstance>();
      const back: typeof result = image;
      void back;
    }

    for (const pixel of image.scanIterator()) {
      expectTypeOf(pixel.image).not.toBeAny();
      expectTypeOf(pixel.image).toMatchTypeOf<JimpInstance>();
      expectTypeOf(pixel.idx).toEqualTypeOf<number>();
    }
  });

  test("long chains keep their type", () => {
    const chained: JimpInstance = image
      .scan(() => {})
      .resize({ w: 1 })
      .setPixelColor(0xff0000ff, 0, 0)
      .composite(image, 0, 0)
      .clone()
      .crop({ x: 0, y: 0, w: 1, h: 1 })
      .greyscale();

    expectTypeOf(chained).not.toBeAny();
    // @ts-expect-error unknown methods are rejected after chaining
    image.scan(() => {}).notAMethod();
    // @ts-expect-error unknown methods are rejected after a plugin method
    image.resize({ w: 1 }).notAMethod();
  });

  test("arguments are still checked", () => {
    // @ts-expect-error composite needs a Jimp image
    image.composite({});
    // @ts-expect-error setPixelColor needs numbers
    image.setPixelColor("red", 0, 0);
    // @ts-expect-error crop needs w and h
    image.crop({ x: 0, y: 0 });
    // @ts-expect-error blur needs a radius
    image.blur();
  });
});

describe("other methods keep their return types", () => {
  test("core methods", () => {
    expectTypeOf(image.getPixelColor(0, 0)).toEqualTypeOf<number>();
    expectTypeOf(image.getPixelIndex(0, 0)).toEqualTypeOf<number>();
    expectTypeOf(image.hasAlpha()).toEqualTypeOf<boolean>();
    expectTypeOf(image.inspect()).toEqualTypeOf<string>();
    expectTypeOf(image.toString()).toEqualTypeOf<string>();
    expectTypeOf(image.width).toEqualTypeOf<number>();
    expectTypeOf(image.height).toEqualTypeOf<number>();
    expectTypeOf(image.background).toEqualTypeOf<number>();
    expectTypeOf(image.mime).toEqualTypeOf<string | undefined>();
    expectTypeOf(image.getBuffer("image/png")).toEqualTypeOf<Promise<Buffer>>();
    expectTypeOf(image.getBase64("image/png")).toEqualTypeOf<Promise<string>>();
    expectTypeOf(image.write("out.png")).toEqualTypeOf<Promise<void>>();
  });

  test("plugin methods that don't return the image", () => {
    expectTypeOf(image.autocropRect()).toEqualTypeOf<{
      x: number;
      y: number;
      w: number;
      h: number;
    }>();
    expectTypeOf(image.pHash()).toEqualTypeOf<string>();
    expectTypeOf(image.hash()).toEqualTypeOf<string>();
    expectTypeOf(image.hash(2)).toEqualTypeOf<string>();
    expectTypeOf(image.distanceFromHash("abc")).toEqualTypeOf<number>();
  });
});

describe("format options are still checked", () => {
  test("getBuffer and getBase64", () => {
    image.getBuffer("image/jpeg", { quality: 50 });
    image.getBuffer("image/png", { deflateLevel: 1 });
    image.getBuffer("image/bmp");
    image.getBuffer("image/tiff");
    image.getBuffer("image/gif");
    image.getBase64("image/jpeg", { quality: 50 });
    // @ts-expect-error unsupported mime type
    image.getBuffer("image/webp");
    // @ts-expect-error png has no quality option
    image.getBuffer("image/png", { quality: 50 });
    // @ts-expect-error quality is a number
    image.getBase64("image/jpeg", { quality: "high" });
  });

  test("write picks the options from the extension", () => {
    image.write("out.jpg", { quality: 50 });
    image.write("out.jpeg", { quality: 50 });
    image.write("out.png", { deflateLevel: 1 });
    image.write("out.bmp");
    image.write("dir/out.gif");
    // @ts-expect-error png has no quality option
    image.write("out.png", { quality: 50 });
    // @ts-expect-error quality is a number
    image.write("out.jpeg", { quality: "high" });
  });

  test("decode options", () => {
    Jimp.read("image.jpg", { "image/jpeg": { maxMemoryUsageInMB: 1024 } });
    Jimp.fromBuffer(buffer, { "image/png": { checkCRC: false } });
    // @ts-expect-error unknown mime types are rejected
    Jimp.read("image.webp", { "image/webp": {} });
  });
});

describe("classes made with createJimp", () => {
  test("share one instance type", async () => {
    const CustomJimp = createJimp({ plugins: [crop.methods], formats: [png] });
    let custom: InstanceType<typeof CustomJimp> = new CustomJimp();
    let read = await CustomJimp.read("image.png");
    const fromBitmap = CustomJimp.fromBitmap({
      width: 1,
      height: 1,
      data: [0],
    });

    expectTypeOf(read).not.toBeAny();
    expectTypeOf(fromBitmap).not.toBeAny();

    custom = read;
    custom = fromBitmap;
    custom = await CustomJimp.fromBuffer(buffer);
    custom = read.crop({ x: 0, y: 0, w: 1, h: 1 });
    custom = read.scan(() => {}).crop({ x: 0, y: 0, w: 1, h: 1 });
    custom = read.clone();
    read = custom;
  });

  test("only have the given plugins and formats", async () => {
    const CustomJimp = createJimp({
      plugins: [resize.methods],
      formats: [jpeg],
    });
    const custom = await CustomJimp.read("image.jpg");

    custom.resize({ w: 1 }).getBuffer("image/jpeg", { quality: 50 });
    // @ts-expect-error crop isn't installed
    custom.crop({ x: 0, y: 0, w: 1, h: 1 });
    // @ts-expect-error png isn't installed
    custom.getBuffer("image/png");
  });

  test("work without plugins or formats", () => {
    const Bare = createJimp();
    const bare = new Bare({ width: 1, height: 1 });

    expectTypeOf(bare).not.toBeAny();
    expectTypeOf(bare.scan(() => {})).toEqualTypeOf(bare);
    expectTypeOf(bare.clone()).toEqualTypeOf(bare);
    expectTypeOf(Bare.fromBitmap(bare.bitmap)).toMatchTypeOf(bare);
    // @ts-expect-error no plugins installed
    bare.resize({ w: 1 });
  });

  test("don't mix with other classes' images", async () => {
    const Small = createJimp({ plugins: [crop.methods] });
    const small = new Small({ width: 1, height: 1 });

    // @ts-expect-error a class without resize doesn't make JimpInstances
    const asJimp: JimpInstance = small;
    void asJimp;
  });
});
