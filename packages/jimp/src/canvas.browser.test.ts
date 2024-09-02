import { expect, test, describe } from "vitest";
import { Jimp } from "./index.js";

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
});
