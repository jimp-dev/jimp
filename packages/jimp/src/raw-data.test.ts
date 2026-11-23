import { describe, expect, test } from "vitest";
import { Jimp } from "./index.js";

const red = 0xff0000ff;
const green = 0x00ff00ff;
const blue = 0x0000ffff;

// A 2x1 image: a red pixel then a green one
const pixels = [255, 0, 0, 255, 0, 255, 0, 255];

const makers = {
  fromBitmap: (bitmap: Parameters<typeof Jimp.fromBitmap>[0]) =>
    Jimp.fromBitmap(bitmap),
  constructor: (bitmap: Parameters<typeof Jimp.fromBitmap>[0]) =>
    new Jimp(bitmap),
};

describe.each(Object.entries(makers))("%s", (_name, make) => {
  test("accepts a Uint8ClampedArray", () => {
    const image = make({
      data: new Uint8ClampedArray(pixels),
      width: 2,
      height: 1,
    });

    expect(Buffer.isBuffer(image.bitmap.data)).toBe(true);
    expect(image.getPixelColor(0, 0)).toBe(red);
    expect(image.getPixelColor(1, 0)).toBe(green);

    // Buffer methods work on the stored data
    image.setPixelColor(blue, 1, 0);
    expect(image.getPixelColor(1, 0)).toBe(blue);
  });

  test("accepts a Uint8Array", () => {
    const image = make({ data: new Uint8Array(pixels), width: 2, height: 1 });

    expect(Buffer.isBuffer(image.bitmap.data)).toBe(true);
    expect(image.getPixelColor(1, 0)).toBe(green);
  });

  test.each([Uint8Array, Uint8ClampedArray])(
    "reads only the bytes of a %o view with an offset",
    (TypedArray) => {
      const backing = new TypedArray([9, 9, 9, 9, ...pixels, 9, 9, 9, 9]);
      const view = new TypedArray(backing.buffer, 4, pixels.length);
      const image = make({ data: view, width: 2, height: 1 });

      expect([...image.bitmap.data]).toEqual(pixels);
    },
  );

  test("accepts an ImageData-shaped object", () => {
    // Node has no ImageData, but this is the shape it has
    const imageData = {
      data: new Uint8ClampedArray(pixels),
      width: 2,
      height: 1,
      colorSpace: "srgb" as const,
    };
    const image = make(imageData);

    expect(image.width).toBe(2);
    expect(image.height).toBe(1);
    expect(image.getPixelColor(0, 0)).toBe(red);
  });

  test("copies typed arrays instead of sharing their memory", () => {
    const data = new Uint8ClampedArray(pixels);
    const image = make({ data, width: 2, height: 1 });

    image.setPixelColor(blue, 0, 0);
    expect([...data]).toEqual(pixels);

    data[0] = 0;
    expect(image.getPixelColor(0, 0)).toBe(blue);
  });

  test.each([
    ["too short", 70, 50, 50],
    ["too long", 12, 2, 1],
    ["RGB rather than RGBA", 6, 2, 1],
  ])("rejects data that's %s", (_case, length, width, height) => {
    expect(() => make({ data: Buffer.alloc(length), width, height })).toThrow(
      `bitmap data is ${length} bytes, but a ${width}x${height} RGBA image needs exactly ${width * height * 4} (width * height * 4)`,
    );
    expect(() =>
      make({ data: new Uint8ClampedArray(length), width, height }),
    ).toThrow(`bitmap data is ${length} bytes`);
  });

  test("checks the length of number arrays in pixels", () => {
    expect(() => make({ data: [red], width: 2, height: 1 })).toThrow(
      "bitmap data is 4 bytes, but a 2x1 RGBA image needs exactly 8",
    );
  });

  test("rejects data that isn't bytes", () => {
    expect(() =>
      make({
        data: new Float32Array(8) as unknown as Uint8Array,
        width: 2,
        height: 1,
      }),
    ).toThrow(
      "data must be a Buffer, Uint8Array, Uint8ClampedArray or an array of numbers",
    );
  });
});

test("fromBitmap copies Buffers too", () => {
  const data = Buffer.from(pixels);
  const image = Jimp.fromBitmap({ data, width: 2, height: 1 });

  image.setPixelColor(blue, 0, 0);
  expect([...data]).toEqual(pixels);
});

test("the constructor still uses Buffers without copying", () => {
  const bitmap = { data: Buffer.from(pixels), width: 2, height: 1 };
  const image = new Jimp(bitmap);

  expect(image.bitmap).toBe(bitmap);
  expect(image.bitmap.data).toBe(bitmap.data);
});

test("round trips to ImageData's data", () => {
  const source = new Uint8ClampedArray(pixels);
  const image = Jimp.fromBitmap({ data: source, width: 2, height: 1 });

  image.setPixelColor(blue, 1, 0);

  const { data, width, height } = image.bitmap;
  // What the browser guide does to make an ImageData
  const out = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);

  expect(width).toBe(2);
  expect(height).toBe(1);
  expect(out.length).toBe(width * height * 4);
  expect([...out]).toEqual([255, 0, 0, 255, 0, 0, 255, 255]);

  const again = Jimp.fromBitmap({ data: out, width, height });
  expect(again.getPixelColor(0, 0)).toBe(red);
  expect(again.getPixelColor(1, 0)).toBe(blue);
});
