import { expect, test, describe } from "vitest";
import { Jimp } from "./index.js";

function redCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 3;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return { canvas, ctx };
}

describe("Canvas", () => {
  test("should be able to create a Jimp from a canvas", async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // make all the pixels red
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const beforeValue = ctx.getImageData(0, 0, canvas.width, canvas.height)
      .data[0];

    const image = await Jimp.fromBitmap(
      ctx.getImageData(0, 0, canvas.width, canvas.height)
    );

    // The jimp image is red
    expect(image.bitmap.data[0]).toBe(255);
    expect(image.bitmap.data[1]).toBe(0);
    expect(image.bitmap.data[2]).toBe(0);
    expect(image.bitmap.data[3]).toBe(255);

    // Modify the image
    image.greyscale();

    const imageData = new ImageData(
      new Uint8ClampedArray(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height
    );

    // Write back to the canvas
    ctx.putImageData(imageData, 0, 0);

    // The canvas should have changed
    expect(beforeValue).not.toBe(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data[0]
    );
  });

  test.each([
    ["fromBitmap", (data: ImageData) => Jimp.fromBitmap(data)],
    ["the constructor", (data: ImageData) => new Jimp(data)],
  ])("%s takes ImageData and copies it", (_name, make) => {
    const { canvas, ctx } = redCanvas();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const image = make(imageData);

    expect(image.width).toBe(4);
    expect(image.height).toBe(3);
    expect(Buffer.isBuffer(image.bitmap.data)).toBe(true);
    expect(image.getPixelColor(3, 2)).toBe(0xff0000ff);

    // Editing the image leaves the ImageData alone
    image.setPixelColor(0x0000ffff, 0, 0);
    expect([...imageData.data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
  });

  test("round trips through a canvas after a resize", () => {
    const { canvas, ctx } = redCanvas();
    const image = Jimp.fromBitmap(
      ctx.getImageData(0, 0, canvas.width, canvas.height)
    );

    image.resize({ w: 2, h: 2 }).setPixelColor(0x0000ffff, 1, 1);

    const { data, width, height } = image.bitmap;
    // Pass the view's bounds: Buffers can be slices of a larger ArrayBuffer
    const out = new ImageData(
      new Uint8ClampedArray(data.buffer, data.byteOffset, data.length),
      width,
      height
    );
    ctx.putImageData(out, 0, 0);

    const back = ctx.getImageData(0, 0, 2, 2);
    expect([...back.data.slice(0, 4)]).toEqual([255, 0, 0, 255]);
    expect([...back.data.slice(12, 16)]).toEqual([0, 0, 255, 255]);
  });

  test("rejects ImageData that's too small for the size it claims", () => {
    const imageData = new ImageData(2, 2);

    expect(() =>
      Jimp.fromBitmap({ data: imageData.data, width: 50, height: 50 })
    ).toThrow("bitmap data is 16 bytes, but a 50x50 RGBA image needs exactly");
  });
});
