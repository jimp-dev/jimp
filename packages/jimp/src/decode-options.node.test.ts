import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { getTestImagePath } from "@jimp/test-utils";

import { Jimp } from "./index.js";

// cops.jpg is 640x426 (~0.27MP), so this limit makes jpeg-js throw if the
// option actually reaches the decoder.
const options = { "image/jpeg": { maxResolutionInMP: 0.0001 } };
const error = /maxResolutionInMP limit exceeded/;
const path = getTestImagePath("cops.jpg");

describe("decoder options", () => {
  test("are passed through when reading from a file path", async () => {
    await expect(Jimp.read(path, options)).rejects.toThrow(error);
  });

  test("are passed through when reading from a Buffer", async () => {
    const buffer = await readFile(path);
    await expect(Jimp.read(buffer, options)).rejects.toThrow(error);
  });

  test("are passed through when reading from an ArrayBuffer", async () => {
    const buffer = await readFile(path);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );
    await expect(Jimp.read(arrayBuffer, options)).rejects.toThrow(error);
  });

  test("are passed through by fromBuffer", async () => {
    const buffer = await readFile(path);
    await expect(Jimp.fromBuffer(buffer, options)).rejects.toThrow(error);
  });

  test("are passed through alongside exifRotate", async () => {
    await expect(
      Jimp.read(path, { ...options, exifRotate: false }),
    ).rejects.toThrow(error);
  });

  test("do not affect decoding when the limit is not hit", async () => {
    const image = await Jimp.read(path, {
      "image/jpeg": { maxMemoryUsageInMB: 1024 },
    });
    expect(image.width).toBe(640);
  });
});
