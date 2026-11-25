import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import * as crop from "@jimp/plugin-crop";
import { Jimp, defaultPlugins, type JimpEdit } from "./index.js";

const red = 0xff0000ff;
const white = 0xffffffff;

function makeImage() {
  const image = new Jimp({ width: 4, height: 4, color: white });
  image.setPixelColor(red, 0, 0);
  return image;
}

describe("apply", () => {
  test("runs the edits in order, like chaining the methods", () => {
    const edits: JimpEdit[] = [
      ["crop", { x: 0, y: 0, w: 2, h: 2 }],
      ["resize", { w: 4 }],
      ["flip", { horizontal: true }],
      ["greyscale"],
      ["blur", 1],
    ];

    const chained = makeImage()
      .crop({ x: 0, y: 0, w: 2, h: 2 })
      .resize({ w: 4 })
      .flip({ horizontal: true })
      .greyscale()
      .blur(1);

    const image = makeImage();
    expect(image.apply(edits)).toBe(image);
    expect(image.bitmap).toEqual(chained.bitmap);
  });

  test("works with edits that went through JSON", () => {
    const edits = JSON.parse(
      JSON.stringify([["cover", { w: 2, h: 2 }], ["invert"]]),
    );

    const image = makeImage().apply(edits);
    const chained = makeImage().cover({ w: 2, h: 2 }).invert();

    expect(image.bitmap).toEqual(chained.bitmap);
  });

  test("an empty list leaves the image unchanged", () => {
    const image = makeImage();
    const before = Buffer.from(image.bitmap.data);

    image.apply([]);

    expect(image.bitmap.data).toEqual(before);
  });

  test("checks every method name before running any edit", () => {
    const image = makeImage();
    const before = Buffer.from(image.bitmap.data);
    const edits = [["invert"], ["notAMethod"]] as unknown as JimpEdit[];

    expect(() => image.apply(edits)).toThrow(
      'Edit 1: "notAMethod" isn\'t a plugin method of this Jimp class',
    );
    expect(image.bitmap.data).toEqual(before);
  });

  test("rejects core methods and object properties", () => {
    for (const name of [
      "write",
      "getBuffer",
      "clone",
      "composite",
      "scan",
      "apply",
      "constructor",
      "__proto__",
      "toString",
    ]) {
      expect(() =>
        makeImage().apply([[name]] as unknown as JimpEdit[]),
      ).toThrow(`Edit 0: "${name}" isn't a plugin method of this Jimp class`);
    }
  });

  test("rejects edits that aren't a method name and arguments", () => {
    const image = makeImage();

    for (const edits of [
      [{ resize: { w: 2 } }],
      ["resize"],
      [[]],
      [[1]],
      [null],
    ]) {
      expect(() => image.apply(edits as unknown as JimpEdit[])).toThrow(
        'Edit 0 must be an array of a method name and its arguments, like ["resize", { w: 100 }]',
      );
    }

    expect(() =>
      image.apply({ resize: { w: 2 } } as unknown as JimpEdit[]),
    ).toThrow("apply needs an array of edits");
  });

  test("says which edit failed and keeps the original error", () => {
    let error: Error | undefined;

    try {
      makeImage().apply([["invert"], ["resize", { w: -1 } as never]]);
    } catch (e) {
      error = e as Error;
    }

    expect(error?.message).toMatch(/^Edit 1 \(resize\) failed: /);
    expect(error?.cause).toBeInstanceOf(Error);
    expect(error).toHaveProperty("editIndex", 1);
  });

  test("errors from the name check have the edit's index too", () => {
    expect(() =>
      makeImage().apply([["invert"], ["nope"]] as unknown as JimpEdit[]),
    ).toThrow(expect.objectContaining({ editIndex: 1 }));
    expect(() =>
      makeImage().apply([["invert"], ["hash"]] as unknown as JimpEdit[]),
    ).toThrow(expect.objectContaining({ editIndex: 1 }));
  });

  test("rejects methods that return a value instead of changing the image", () => {
    expect(() =>
      makeImage().apply([["hash"]] as unknown as JimpEdit[]),
    ).toThrow(
      'Edit 0: "hash" returns a value instead of changing the image, so it can\'t be used in apply',
    );

    for (const edit of [["dominantColor"], ["palette", 5]]) {
      const image = makeImage();
      const before = new Uint8Array(image.bitmap.data);

      expect(() => image.apply([edit] as unknown as JimpEdit[])).toThrow(
        `Edit 0: "${edit[0]}" returns a value instead of changing the image, so it can't be used in apply`,
      );
      expect(new Uint8Array(image.bitmap.data)).toEqual(before);
    }
  });

  test("only allows the plugins of a custom Jimp class", () => {
    const CropJimp = createJimp({ plugins: [crop.methods] });
    const image = new CropJimp({ width: 4, height: 4, color: white });

    image.apply([["crop", { x: 0, y: 0, w: 2, h: 2 }]]);
    expect(image.bitmap.width).toBe(2);

    expect(() =>
      image.apply([["resize", { w: 1 }]] as unknown as Parameters<
        typeof image.apply
      >[0]),
    ).toThrow('Edit 0: "resize" isn\'t a plugin method of this Jimp class');
  });

  test("every default plugin method is a known name", () => {
    const image = makeImage();
    const names = defaultPlugins.flatMap(Object.keys);

    // Methods that don't return the image get past the name check, then fail
    for (const name of names) {
      try {
        image.clone().apply([[name]] as unknown as JimpEdit[]);
      } catch (e) {
        expect((e as Error).message).not.toMatch(/isn't a plugin method/);
      }
    }
  });
});
