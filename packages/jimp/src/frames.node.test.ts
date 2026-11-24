import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { getTestImagePath } from "@jimp/test-utils";

import { Jimp } from "./index.js";

let dir: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "jimp-frames-"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

const gifPath = getTestImagePath("animated-disposal.gif");
const tiffPath = getTestImagePath("multipage.tiff");

function solid(color: number, width = 4, height = 3) {
  return new Jimp({ width, height, color });
}

describe("readFrames", () => {
  test("reads every frame of an animated GIF", async () => {
    const { frames, loop } = await Jimp.readFrames(gifPath);

    expect(loop).toBe(3);
    expect(frames.map(({ delay }) => delay)).toEqual([100, 200, 300, 0]);

    for (const { image } of frames) {
      expect(image.mime).toBe("image/gif");
      expect(image.width).toBe(8);
      expect(image.height).toBe(8);
    }

    // Frames are full Jimp images, drawn over the previous ones
    expect(frames[1]!.image.getPixelColor(0, 0)).toBe(0xff0000ff);
    expect(frames[1]!.image.getPixelColor(2, 2)).toBe(0x00ff00ff);
    expect(frames[1]!.image.clone().greyscale().width).toBe(8);
  });

  test("reads every page of a multi-page TIFF", async () => {
    const { frames, loop } = await Jimp.readFrames(tiffPath);

    expect(loop).toBeUndefined();
    expect("loop" in (await Jimp.readFrames(tiffPath))).toBe(false);
    expect(frames.map(({ image }) => [image.width, image.height])).toEqual([
      [2, 2],
      [3, 1],
      [1, 2],
    ]);
    expect(frames.map(({ delay }) => delay)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    expect(frames[2]!.image.getPixelColor(0, 1)).toBe(0xc8c8c8ff);
  });

  test("reads a single frame from other formats", async () => {
    const { frames, loop } = await Jimp.readFrames(
      getTestImagePath("dice.png"),
    );
    const image = await Jimp.read(getTestImagePath("dice.png"));

    expect(loop).toBeUndefined();
    expect(frames).toHaveLength(1);
    expect(frames[0]!.delay).toBeUndefined();
    expect(frames[0]!.image.mime).toBe("image/png");
    expect(frames[0]!.image.bitmap.data).toEqual(image.bitmap.data);
  });

  test("applies read options to single-frame formats", async () => {
    const path = getTestImagePath("cops.jpg");

    await expect(
      Jimp.readFrames(path, { "image/jpeg": { maxResolutionInMP: 0.0001 } }),
    ).rejects.toThrow(/maxResolutionInMP limit exceeded/);
  });

  test("fromBufferFrames takes encoded data", async () => {
    const buffer = await readFile(gifPath);
    const { frames } = await Jimp.fromBufferFrames(
      new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
    );

    expect(frames).toHaveLength(4);
  });

  test("maxFrames limits the frames decoded", async () => {
    expect(
      (await Jimp.readFrames(gifPath, { maxFrames: 2 })).frames,
    ).toHaveLength(2);
    expect(
      (await Jimp.readFrames(tiffPath, { maxFrames: 1 })).frames,
    ).toHaveLength(1);
    expect(
      (await Jimp.readFrames(getTestImagePath("dice.png"), { maxFrames: 5 }))
        .frames,
    ).toHaveLength(1);
  });

  test("throws for a maxFrames below 1", async () => {
    await expect(Jimp.readFrames(gifPath, { maxFrames: 0 })).rejects.toThrow(
      "maxFrames must be at least 1",
    );
    await expect(
      Jimp.readFrames(gifPath, { maxFrames: Number.NaN }),
    ).rejects.toThrow("maxFrames must be at least 1");
  });

  test("passes decode options to the format", async () => {
    await expect(
      Jimp.readFrames(gifPath, { "image/gif": { maxResolutionInMP: 0.0002 } }),
    ).rejects.toThrow("together exceed the maximum resolution");
  });
});

describe("encodeFrames", () => {
  test("encodes an animated GIF from images and { image, delay } frames", async () => {
    const red = solid(0xff0000ff);
    const blue = solid(0x0000ffff);
    const buffer = await Jimp.encodeFrames(
      "image/gif",
      [{ image: red, delay: 500 }, blue],
      { loop: 4 },
    );
    const { frames, loop } = await Jimp.fromBufferFrames(buffer);

    expect(loop).toBe(4);
    expect(frames.map(({ delay }) => delay)).toEqual([500, 100]);
    expect(frames[0]!.image.bitmap.data).toEqual(red.bitmap.data);
    expect(frames[1]!.image.bitmap.data).toEqual(blue.bitmap.data);
  });

  test("round trips the frames readFrames returns", async () => {
    const read = await Jimp.readFrames(gifPath);
    const reread = await Jimp.fromBufferFrames(
      await Jimp.encodeFrames("image/gif", read.frames, { loop: read.loop }),
    );

    expect(reread.loop).toBe(3);
    expect(reread.frames.map(({ delay }) => delay)).toEqual([100, 200, 300, 0]);
    reread.frames.forEach(({ image }, i) => {
      expect(image.bitmap.data).toEqual(read.frames[i]!.image.bitmap.data);
    });
  });

  test("encodes a multi-page TIFF with pages of different sizes", async () => {
    // Not made with a color, which would also be the background that pixels
    // are drawn over, as TIFF output isn't treated as having alpha
    const pages = [
      Jimp.fromBitmap({
        width: 3,
        height: 2,
        data: new Array(6).fill(0xff000080),
      }),
      solid(0x00ff00ff, 1, 5),
    ];
    const { frames } = await Jimp.fromBufferFrames(
      await Jimp.encodeFrames("image/tiff", pages),
    );

    expect(frames.map(({ image }) => image.bitmap)).toEqual(
      pages.map(({ bitmap }) => bitmap),
    );
  });

  test("converts images in other colour spaces to sRGB", async () => {
    const p3 = new Jimp({
      width: 2,
      height: 2,
      color: "#ff0000",
      colorSpace: "display-p3",
    });
    const { frames } = await Jimp.fromBufferFrames(
      await Jimp.encodeFrames("image/tiff", [p3]),
    );

    expect(frames[0]!.image.getPixelColor(0, 0)).toBe(0xff0000ff);
    // The image itself isn't changed
    expect(p3.colorSpace).toBe("display-p3");
  });

  test("encodes a single frame for formats without animation", async () => {
    const image = solid(0x336699ff);
    const buffer = await Jimp.encodeFrames("image/png", [{ image }]);

    expect(buffer).toEqual(await image.getBuffer("image/png"));
  });

  test("throws for more than one frame for formats without animation", async () => {
    await expect(
      Jimp.encodeFrames("image/png", [solid(0), solid(0)]),
    ).rejects.toThrow(
      "image/png can't hold more than one frame, but got 2. Formats that can: image/gif, image/tiff",
    );
  });

  test("throws for invalid frames", async () => {
    await expect(Jimp.encodeFrames("image/gif", [])).rejects.toThrow(
      "encodeFrames needs an array of at least one frame",
    );
    await expect(
      // @ts-expect-error not a frame
      Jimp.encodeFrames("image/gif", [solid(0), { delay: 10 }]),
    ).rejects.toThrow(
      "Frame 1 must be a Jimp image or an object with an image and an optional delay",
    );
    await expect(
      // @ts-expect-error not a frame
      Jimp.encodeFrames("image/gif", [solid(0), 5]),
    ).rejects.toThrow("Frame 1 must be a Jimp image");
    await expect(
      Jimp.encodeFrames("image/gif", [
        // @ts-expect-error not a number
        { image: solid(0), delay: "10" },
      ]),
    ).rejects.toThrow("Frame 0's delay must be a number of milliseconds");
  });

  test("throws for GIF frames of different sizes", async () => {
    await expect(
      Jimp.encodeFrames("image/gif", [solid(0, 2, 2), solid(0, 3, 3)]),
    ).rejects.toThrow("Every frame of a GIF must be the same size");
  });

  test("throws for an unsupported MIME type", async () => {
    await expect(
      // @ts-expect-error not a supported MIME type
      Jimp.encodeFrames("image/webp", [solid(0)]),
    ).rejects.toThrow("Unsupported MIME type: image/webp");
  });
});

describe("writeFrames", () => {
  test("writes an animated GIF and a multi-page TIFF", async () => {
    const frames = [
      { image: solid(0xff0000ff), delay: 250 },
      { image: solid(0x00ff00ff), delay: 750 },
    ];
    const gif = path.join(dir, "animation.gif");
    const tiff = path.join(dir, "pages.tif");

    await Jimp.writeFrames(gif, frames, { loop: null });
    await Jimp.writeFrames(tiff, frames);

    const readGif = await Jimp.readFrames(gif);
    const readTiff = await Jimp.readFrames(tiff);

    expect(readGif.loop).toBeNull();
    expect(readGif.frames.map(({ delay }) => delay)).toEqual([250, 750]);
    expect(readTiff.frames).toHaveLength(2);
    expect(readTiff.frames[1]!.image.getPixelColor(0, 0)).toBe(0x00ff00ff);
  });

  test("throws for a path without an extension", async () => {
    await expect(
      Jimp.writeFrames(path.join(dir, "animation"), [solid(0)]),
    ).rejects.toThrow("the path has no recognisable file extension");
  });
});
