import { describe, expectTypeOf, test } from "vitest";
import { createJimp } from "@jimp/core";
import * as crop from "@jimp/plugin-crop";
import { Jimp, JimpInstance, defaultPlugins, type JimpEdit } from "./index.js";

declare const image: JimpInstance;

describe("apply", () => {
  test("takes edits of plugin methods with their arguments", () => {
    expectTypeOf(
      image.apply([
        ["resize", { w: 100 }],
        ["greyscale"],
        ["blur", 2],
        ["cover", { w: 10, h: 10 }],
      ]),
    ).toEqualTypeOf<JimpInstance>();

    // @ts-expect-error wrong arguments
    image.apply([["resize", { width: 100 }]]);
    // @ts-expect-error wrong argument type
    image.apply([["blur", "2"]]);
    // @ts-expect-error unknown method
    image.apply([["notAMethod"]]);
  });

  test("doesn't take core methods or methods that return a value", () => {
    // @ts-expect-error core method
    image.apply([["write", "out.png"]]);
    // @ts-expect-error core method
    image.apply([["composite", image]]);
    // @ts-expect-error core method
    image.apply([["clone"]]);
    // @ts-expect-error core method
    image.apply([["setPixelColor", 0, 0, 0]]);
    // @ts-expect-error returns a string
    image.apply([["hash"]]);
    // @ts-expect-error returns a number
    image.apply([["distanceFromHash", "abc"]]);
    // @ts-expect-error returns a color
    image.apply([["dominantColor"]]);
    // @ts-expect-error returns a list of colors
    image.apply([["palette", 5]]);
  });

  test("JimpEdit names exactly the plugin methods that change the image", () => {
    type Names = JimpEdit[0];
    type KeysOf<T> = T extends unknown ? keyof T : never;
    type PluginNames = KeysOf<(typeof defaultPlugins)[number]>;

    expectTypeOf<Names>().toExtend<PluginNames>();
    expectTypeOf<
      "resize" | "greyscale" | "print" | "drawRect"
    >().toExtend<Names>();
    expectTypeOf<
      | "hash"
      | "pHash"
      | "distanceFromHash"
      | "autocropRect"
      | "dominantColor"
      | "palette"
    >().not.toExtend<Names>();
  });

  test("a custom Jimp only takes its own plugins", () => {
    const CropJimp = createJimp({ plugins: [crop.methods] });
    const cropImage = new CropJimp({ width: 1, height: 1 });

    cropImage.apply([["crop", { x: 0, y: 0, w: 1, h: 1 }], ["autocrop"]]);
    // @ts-expect-error not one of its plugins
    cropImage.apply([["resize", { w: 1 }]]);
  });

  test("the result keeps chaining", () => {
    expectTypeOf(
      Jimp.fromBitmap({ width: 1, height: 1, data: [0, 0, 0, 0] })
        .apply([["invert"]])
        .resize({ w: 2 }),
    ).toEqualTypeOf<JimpInstance>();
  });
});
