// eslint-disable-next-line import/no-unresolved
import configure from "./index";
import gif from "@jimp/gif";
import png from "@jimp/png";
import displace from "@jimp/plugin-displace";
import resize from "@jimp/plugin-resize";
import scale from "@jimp/plugin-scale";
import types from "@jimp/types";
import plugins from "@jimp/plugins";

import Jimp from "@jimp/core";

import {test, assertType} from 'vitest'

// configure should return a valid Jimp type with addons
const CustomJimp = configure({
  types: [gif, png],
  plugins: [displace, resize],
});

test("should function the same as the `jimp` types", () => {
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  const jimpInst = new FullCustomJimp("test");

  // Main Jimp export should already have all of these already applied

  // @ts-expect-error
  assertType<never>(jimpInst.read("Test"));
  assertType<typeof Jimp>(jimpInst.displace(jimpInst, 2));
  assertType<typeof Jimp>(jimpInst.resize(40, 40));
  assertType<typeof Jimp>(jimpInst.displace(jimpInst, 2));
  assertType<typeof Jimp>(jimpInst.shadow((err, val, coords) => {}));
  assertType<typeof Jimp>(jimpInst.fishEye({ r: 12 }));
  assertType<typeof Jimp>(jimpInst.circle({ radius: 12, x: 12, y: 12 }));

  // @ts-expect-error
  assertType<never>(jimpInst.PNG_FILTER_NONE);

  // @ts-expect-error
  assertType<never>(jimpInst.test);

  // @ts-expect-error
  assertType<never>(jimpInst.func());

  // Main Jimp export should already have all of these already applied
  assertType<Promise<typeof Jimp>>(FullCustomJimp.read("Test"));

  assertType<0>(FullCustomJimp.PNG_FILTER_NONE);


  // @ts-expect-error
  assertType<never>(FullCustomJimp.test);

  // @ts-expect-error
  assertType<never>(FullCustomJimp.func());
});

test("can clone properly", async () => {
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  const baseImage = await FullCustomJimp.read("filename");
  const cloneBaseImage = baseImage.clone();

  assertType<number>(cloneBaseImage._deflateLevel);
});


test("can clone and handle `this` returns on the core type properly", async () => {
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  const baseImage = await FullCustomJimp.read("filename");
  const cloneBaseImage = baseImage.clone();

  assertType<number>(cloneBaseImage.posterize(3)._quality);
});

test("can clone and handle `this` returns properly", async () => {
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  const baseImage = await FullCustomJimp.read("filename");
  const cloneBaseImage = baseImage.clone();

  assertType<number>(cloneBaseImage
      .resize(1, 1)
      .crop(0, 0, 0, 0)
      .mask(cloneBaseImage, 2, 2)
      .print("a" as any, 2, 2, "a" as any)
      .resize(1, 1)
      .quality(1)
      .deflateLevel(2)._filterType);
});

test("can clone and handle imageCallbacks `this` properly", async () => {
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  const baseImage = await FullCustomJimp.read("filename");
  const cloneBaseImage = baseImage.clone();

  cloneBaseImage.rgba(false, (_, jimpCBIn) => {
    // @ts-expect-error
    assertType<never>(jimpCBIn.read("Test"));
    assertType<typeof Jimp>(jimpCBIn.displace(jimpCBIn, 2));
    assertType<typeof Jimp>(jimpCBIn.resize(40, 40));
    assertType<number>(jimpCBIn._filterType);

    // @ts-expect-error
    assertType<never>(jimpCBIn.test);

    // @ts-expect-error
    assertType<never>(jimpCBIn.func());
  });
});

test("Can clone and handle callback with constructor", () => {
  const myBmpBuffer: Buffer = {} as any;
  const FullCustomJimp = configure({
    types: [types],
    plugins: [plugins],
  });

  FullCustomJimp.read(myBmpBuffer, (err, cbJimpInst) => {
    // @ts-expect-error
    assertType<never>(cbJimpInst.read("Test"));
    assertType<typeof Jimp>(cbJimpInst.displace(cbJimpInst, 2));
    assertType<typeof Jimp>(cbJimpInst.resize(40, 40));
    assertType<number>(cbJimpInst._filterType);

    // @ts-expect-error
    assertType<never>(cbJimpInst.test);

    // @ts-expect-error
    assertType<never>(cbJimpInst.func());
  });
});

test("can handle custom jimp", () => {
  // Constants from types should be applied
  assertType<0>(CustomJimp.PNG_FILTER_NONE);

  // Core functions should still work from Jimp
  assertType<Promise<typeof Jimp>>(CustomJimp.read("Test"));

  // Constants should not(?) be applied from ill-formed plugins

  // @ts-expect-error
  assertType<never>(CustomJimp.displace(CustomJimp, 2));

  // Methods should be applied from well-formed plugins only to the instance

  // @ts-expect-error
  assertType<never>(CustomJimp.resize(40, 40));

  // Constants should be applied from well-formed plugins
  assertType<"nearestNeighbor">(CustomJimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(CustomJimp.test);

  // @ts-expect-error
  assertType<never>(CustomJimp.func());

  const Jiimp = new CustomJimp("test");
  // Methods from types should be applied
  assertType<typeof Jimp>(Jiimp.deflateLevel(4));
  // Constants from types should be applied to the static only

  // @ts-expect-error
  assertType<never>(Jiimp.PNG_FILTER_NONE);

  // Core functions should still work from Jimp
  assertType<number>(Jiimp.getPixelColor(1, 1));

  // Constants should be applied from ill-formed plugins
  assertType<typeof Jimp>(Jiimp.displace(Jiimp, 2));

  // Methods should be applied from well-formed plugins
  assertType<typeof Jimp>(Jiimp.resize(40, 40));

  // Constants should not be applied to the object
  // @ts-expect-error
  assertType<never>(Jiimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(Jiimp.test);

  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("can compose", () => {
  const OtherCustomJimp = configure(
    {
      plugins: [scale],
    },
    CustomJimp
  );
  // Constants from types should be applied
  assertType<0>(OtherCustomJimp.PNG_FILTER_NONE);

  // Core functions should still work from Jimp
  assertType<Promise<typeof Jimp>>(OtherCustomJimp.read("Test"));

  // Constants should not be applied to the static instance from ill-formed plugins
  // @ts-expect-error
  assertType<never>(OtherCustomJimp.displace(OtherCustomJimp, 2));

  // Methods should not be applied to the static instance from well-formed plugins
  // @ts-expect-error
  assertType<never>(OtherCustomJimp.resize(40, 40));

  // Constants should be applied from well-formed plugins
  assertType<"nearestNeighbor">(OtherCustomJimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(OtherCustomJimp.test);

  // @ts-expect-error
  assertType<never>(OtherCustomJimp.func());

  const Jiimp = new OtherCustomJimp("test");
  // Methods from types should be applied
  assertType<typeof Jimp>(Jiimp.deflateLevel(4));
  // Constants from types should not be applied to objects
  // @ts-expect-error
  assertType<never>(Jiimp.PNG_FILTER_NONE);

  // Methods from new plugins should be applied
  assertType<typeof Jimp>(Jiimp.scale(3));

  // Methods from types should be applied
  assertType<typeof Jimp>(Jiimp.filterType(4));

  // Core functions should still work from Jimp
  assertType<number>(Jiimp.getPixelColor(1, 1));

  // Constants should be applied from ill-formed plugins
  assertType<typeof Jimp>(Jiimp.displace(Jiimp, 2));

  // Methods should be applied from well-formed plugins
  assertType<typeof Jimp>(Jiimp.resize(40, 40));

  // Constants should not be applied from well-formed plugins to objects
  // @ts-expect-error
  assertType<never>(Jiimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(Jiimp.test);

  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("can handle only plugins", () => {
  const PluginsJimp = configure({
    plugins: [plugins],
  });

  // Core functions should still work from Jimp
  assertType<Promise<typeof Jimp>>(PluginsJimp.read("Test"));

  // Constants should not be applied from ill-formed plugins
  // @ts-expect-error
  assertType<never>(PluginsJimp.displace(PluginsJimp, 2));

  // Methods should be not be applied to from well-formed plugins to the top level
  // @ts-expect-error
  assertType<never>(PluginsJimp.resize(40, 40));

  // Constants should be applied from well-formed plugins
  assertType<"nearestNeighbor">(PluginsJimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(PluginsJimp.test);

  // @ts-expect-error
  assertType<never>(PluginsJimp.func());

  const Jiimp = new PluginsJimp("test");

  // Core functions should still work from Jimp
  assertType<number>(Jiimp.getPixelColor(1, 1));

  // Constants should be applied from ill-formed plugins
  assertType<typeof Jimp>(Jiimp.displace(Jiimp, 2));

  // Methods should be applied from well-formed plugins
  assertType<typeof Jimp>(Jiimp.resize(40, 40));

  // Constants should be not applied to objects from well-formed plugins
  // @ts-expect-error
  assertType<never>(Jiimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(Jiimp.test);

  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("can handle only all types", () => {
  const TypesJimp = configure({
    types: [types],
  });

  // Methods from types should not be applied

  // @ts-expect-error
  assertType<never>(TypesJimp.filterType(4));
  // Constants from types should be applied
  assertType<0>(TypesJimp.PNG_FILTER_NONE);

  // @ts-expect-error
  assertType<never>(TypesJimp.test);

  // @ts-expect-error
  assertType<never>(TypesJimp.func());

  const Jiimp = new TypesJimp("test");
  // Methods from types should be applied
  Jiimp.filterType(4);
  // Constants from types should be not applied to objects
  // @ts-expect-error
  assertType<never>(Jiimp.PNG_FILTER_NONE);

  // @ts-expect-error
  assertType<never>(Jiimp.test);

  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("can handle only one type", () => {
  const PngJimp = configure({
    types: [png],
  });

  // Constants from other types should be not applied

  // @ts-expect-error
  assertType<never>(PngJimp.MIME_TIFF);

  // Constants from types should be applied
  assertType<0>(PngJimp.PNG_FILTER_NONE);

  // @ts-expect-error
  assertType<never>(PngJimp.test);


  // @ts-expect-error
  assertType<never>(PngJimp.func());

  const Jiimp = new PngJimp("test");
  // Constants from other types should be not applied

  // @ts-expect-error
  assertType<never>(Jiimp.MIME_TIFF);

  // Constants from types should not be applied to objects

  // @ts-expect-error
  assertType<never>(Jiimp.PNG_FILTER_NONE);


  // @ts-expect-error
  assertType<never>(Jiimp.test);


  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("can handle only one plugin", () => {
  const ResizeJimp = configure({
    plugins: [resize],
  });

  // Constants from other plugins should be not applied
  // @ts-expect-error
  assertType<never>(ResizeJimp.FONT_SANS_8_BLACK);

  // Constants from plugin should be applied
  assertType<"nearestNeighbor">(ResizeJimp.RESIZE_NEAREST_NEIGHBOR);

  // @ts-expect-error
  assertType<never>(ResizeJimp.resize(2, 2));

  // @ts-expect-error
  assertType<never>(ResizeJimp.test);

  // @ts-expect-error
  assertType<never>(ResizeJimp.func());

  const Jiimp: InstanceType<typeof ResizeJimp> = new ResizeJimp("test");
  // Constants from other plugins should be not applied
  // @ts-expect-error
  assertType<never>(Jiimp.FONT_SANS_8_BLACK);

  // Constants from plugin should not be applied to the object
  // @ts-expect-error
  assertType<never>(Jiimp.RESIZE_NEAREST_NEIGHBOR);

  Jiimp.resize(2, 2);

  // @ts-expect-error
  assertType<never>(Jiimp.test);

  // @ts-expect-error
  assertType<never>(Jiimp.func());
});

test("Can handle appendConstructorOption", () => {
  const AppendJimp = configure({});

  AppendJimp.appendConstructorOption(
    "Name of Option",
    (args) => args.hasSomeCustomThing,
    function (resolve, reject, args) {
      // @ts-expect-error
      this.bitmap = 3;
      // @ts-expect-error
      AppendJimp.resize(2, 2);
      resolve();
    }
  );
});
