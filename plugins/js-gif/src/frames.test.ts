import { expect, test, describe } from "vitest";
import GIF from "omggif";
import { createJimp, ReadFramesOptions } from "@jimp/core";
import { Bitmap } from "@jimp/types";
import { getTestImagePath } from "@jimp/test-utils";

import gif, { DecodeGifOptions } from "./index.js";

const jimp = createJimp({ formats: [gif] });

const RED = 0xff0000ff;
const GREEN = 0x00ff00ff;
const BLUE = 0x0000ffff;
const WHITE = 0xffffffff;
const CLEAR = 0x00000000;

/** See packages/test-utils/scripts/generate-multi-frame-images.mjs */
const fixture = getTestImagePath("animated-disposal.gif");

async function decodeFixture(
  options?: ReadFramesOptions & { "image/gif"?: DecodeGifOptions }
) {
  const { frames, loop } = await jimp.readFrames(fixture, options);

  return {
    frames: frames.map(({ image, delay }) => ({ bitmap: image.bitmap, delay })),
    loop,
  };
}

function pixel({ data, width }: Bitmap, x: number, y: number) {
  return data.readUInt32BE((y * width + x) * 4);
}

/** Every pixel's color, row by row */
function pixels(bitmap: Bitmap) {
  const result: number[][] = [];

  for (let y = 0; y < bitmap.height; y++) {
    const row: number[] = [];

    for (let x = 0; x < bitmap.width; x++) {
      row.push(pixel(bitmap, x, y));
    }

    result.push(row);
  }

  return result;
}

function solid(width: number, height: number, color: number): Bitmap {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    data.writeUInt32BE(color, i);
  }

  return { data, width, height };
}

/** Build a GIF with omggif: a palette of black and white, frames of indexes */
function createGif(
  width: number,
  height: number,
  frames: {
    x: number;
    y: number;
    width: number;
    height: number;
    indexes: number[];
    options?: GIF.FrameOptions;
  }[]
) {
  const buffer = new Uint8Array(4096);
  const writer = new GIF.GifWriter(buffer, width, height, {
    palette: [0x000000, 0xffffff],
  });

  for (const frame of frames) {
    writer.addFrame(
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      frame.indexes,
      frame.options
    );
  }

  return Buffer.from(buffer.subarray(0, writer.end()));
}

describe("GIF frames", () => {
  test("decodes every frame with its delay and the loop count", async () => {
    const { frames, loop } = await decodeFixture();

    expect(frames).toHaveLength(4);
    expect(frames.map(({ delay }) => delay)).toEqual([100, 200, 300, 0]);
    expect(loop).toBe(3);

    for (const { bitmap } of frames) {
      expect(bitmap.width).toBe(8);
      expect(bitmap.height).toBe(8);
    }
  });

  test("draws each frame over the previous ones, following disposal", async () => {
    const { frames } = await decodeFixture();
    const [first, second, third, fourth] = frames.map(({ bitmap }) =>
      pixels(bitmap)
    );
    const red = Array.from({ length: 8 }, () => new Array(8).fill(RED));

    // 1. Red everywhere
    expect(first).toEqual(red);

    // 2. A green square drawn over the kept red frame
    expect(second![2]!.slice(2, 6)).toEqual(new Array(4).fill(GREEN));
    expect(second![1]).toEqual(red[1]);
    expect(second![2]![1]).toBe(RED);

    // 3. The green square was disposed to the background (transparent).
    //    Blue is drawn in the corner, and its transparent pixel shows the
    //    red underneath.
    expect(third![2]!.slice(2, 6)).toEqual(new Array(4).fill(CLEAR));
    expect(third![2]![1]).toBe(RED);
    expect(third![0]!.slice(0, 2)).toEqual([BLUE, BLUE]);
    expect(third![1]!.slice(0, 2)).toEqual([BLUE, RED]);

    // 4. The blue corner was restored to what was there before it, and
    //    white is drawn in the other corner
    expect(fourth![0]!.slice(0, 2)).toEqual([RED, RED]);
    expect(fourth![1]!.slice(0, 2)).toEqual([RED, RED]);
    expect(fourth![2]!.slice(2, 6)).toEqual(new Array(4).fill(CLEAR));
    expect(fourth![6]!.slice(6, 8)).toEqual([WHITE, WHITE]);
    expect(fourth![7]!.slice(6, 8)).toEqual([WHITE, WHITE]);
  });

  test("frames don't share pixel data", async () => {
    const { frames } = await decodeFixture();

    frames[0]!.bitmap.data.fill(0);

    expect(pixel(frames[1]!.bitmap, 0, 0)).toBe(RED);
  });

  test("decode returns the first frame", async () => {
    const { frames } = await decodeFixture();

    expect((await jimp.read(fixture)).bitmap.data).toEqual(
      frames[0]!.bitmap.data
    );
  });

  test("maxFrames decodes only the first frames", async () => {
    const { frames, loop } = await decodeFixture({ maxFrames: 2 });

    expect(frames).toHaveLength(2);
    expect(loop).toBe(3);
    expect(pixel(frames[1]!.bitmap, 2, 2)).toBe(GREEN);
  });

  test("maxResolutionInMP limits all frames together", async () => {
    // 4 frames of 8x8 is 256 pixels, 3 frames are 192
    const maxResolutionInMP = 200 / 1_000_000;

    const options = { "image/gif": { maxResolutionInMP } };

    await expect(decodeFixture(options)).rejects.toThrow(
      "GIF has 4 frames of 8x8, which together exceed the maximum resolution of 0.0002 megapixels"
    );
    expect(
      (await decodeFixture({ ...options, maxFrames: 3 })).frames
    ).toHaveLength(3);
    // A single frame is well within the limit
    expect((await jimp.read(fixture, options)).width).toBe(8);
  });

  test("a frame without a graphic control extension doesn't inherit the previous one", async () => {
    const data = createGif(2, 1, [
      {
        x: 0,
        y: 0,
        width: 2,
        height: 1,
        indexes: [1, 1],
        options: { delay: 50, disposal: 1, transparent: 0 },
      },
      // omggif writes no extension for a frame without options
      { x: 0, y: 0, width: 2, height: 1, indexes: [0, 1] },
    ]);
    const { frames } = await gif().decodeFrames(data);

    expect(frames[1]!.delay).toBe(0);
    // Index 0 is black here, not transparent
    expect(pixels(frames[1]!.bitmap)).toEqual([[0x000000ff, WHITE]]);
  });

  test("clips frames that extend past the image", async () => {
    const data = createGif(2, 2, [
      // Without clipping, the second pixel of each row would wrap into the
      // start of the next row
      { x: 1, y: 0, width: 2, height: 3, indexes: [1, 1, 1, 1, 1, 1] },
      // Entirely outside the image
      { x: 5, y: 5, width: 1, height: 1, indexes: [1] },
    ]);
    const { frames } = await gif().decodeFrames(data);

    expect(pixels(frames[0]!.bitmap)).toEqual([
      [CLEAR, WHITE],
      [CLEAR, WHITE],
    ]);
    expect(pixels(frames[1]!.bitmap)).toEqual(pixels(frames[0]!.bitmap));
    expect(pixels(gif().decode(data))).toEqual(pixels(frames[0]!.bitmap));
  });

  test("loop is null for a GIF without a loop count", async () => {
    const data = createGif(1, 1, [
      { x: 0, y: 0, width: 1, height: 1, indexes: [1] },
    ]);

    expect((await gif().decodeFrames(data)).loop).toBeNull();
  });
});

describe("GIF encodeFrames", () => {
  test("round trips frames, delays and the loop count", async () => {
    const frames = [
      { bitmap: solid(3, 2, RED), delay: 120 },
      { bitmap: solid(3, 2, GREEN), delay: 40 },
      { bitmap: solid(3, 2, BLUE) },
    ];
    const decoded = await gif().decodeFrames(
      await gif().encodeFrames(frames, { loop: 2 })
    );

    expect(decoded.loop).toBe(2);
    // The default delay is 100ms
    expect(decoded.frames.map(({ delay }) => delay)).toEqual([120, 40, 100]);
    decoded.frames.forEach(({ bitmap }, i) => {
      expect(bitmap.data).toEqual(frames[i]!.bitmap.data);
    });
  });

  test("loops forever by default, or plays once with loop: null", async () => {
    const frames = [{ bitmap: solid(1, 1, RED) }];

    expect((await gif().decodeFrames(gif().encodeFrames(frames))).loop).toBe(0);
    expect(
      (await gif().decodeFrames(gif().encodeFrames(frames, { loop: null })))
        .loop
    ).toBeNull();
  });

  test("rounds delays to hundredths of a second and clamps them and loop", async () => {
    const frames = [-50, 14, 15, 1e9].map((delay) => ({
      bitmap: solid(1, 1, RED),
      delay,
    }));
    const decoded = await gif().decodeFrames(
      gif().encodeFrames(frames, { loop: 1e6 })
    );

    expect(decoded.frames.map(({ delay }) => delay)).toEqual([
      0, 10, 20, 655350,
    ]);
    expect(decoded.loop).toBe(65535);
  });

  test("gives each frame its own palette, so 256 colors per frame stay lossless", async () => {
    const frames = [0, 1].map((frame) => {
      const bitmap = solid(16, 16, 0);

      for (let i = 0; i < 256; i++) {
        bitmap.data.writeUInt32BE(
          ((((i * 7 + frame * 101) & 0xff) << 24) |
            (i << 16) |
            ((255 - i) << 8) |
            0xff) >>>
            0,
          i * 4
        );
      }

      return { bitmap };
    });
    const decoded = await gif().decodeFrames(gif().encodeFrames(frames));

    decoded.frames.forEach(({ bitmap }, i) => {
      expect(bitmap.data).toEqual(frames[i]!.bitmap.data);
    });
  });

  test("transparent pixels don't show the previous frame", async () => {
    const second = solid(2, 1, GREEN);

    second.data.writeUInt32BE(CLEAR, 0);

    const decoded = await gif().decodeFrames(
      gif().encodeFrames([{ bitmap: solid(2, 1, RED) }, { bitmap: second }])
    );

    expect(pixels(decoded.frames[1]!.bitmap)).toEqual([[CLEAR, GREEN]]);
  });

  test("quantizes frames with more than 256 colors", async () => {
    const bitmap = solid(64, 64, 0);

    for (let i = 0; i < 64 * 64; i++) {
      bitmap.data.writeUInt32BE(
        ((((i % 64) * 4) << 24) | ((Math.floor(i / 64) * 4) << 16) | 0x80ff) >>>
          0,
        i * 4
      );
    }

    const decoded = await gif().decodeFrames(
      gif().encodeFrames([{ bitmap }, { bitmap }])
    );
    let maxError = 0;

    for (const { bitmap: frame } of decoded.frames) {
      for (let i = 0; i < frame.data.length; i++) {
        maxError = Math.max(
          maxError,
          Math.abs(frame.data[i]! - bitmap.data[i]!)
        );
      }
    }

    expect(maxError).toBeLessThan(16);
  });

  test("throws for no frames", () => {
    expect(() => gif().encodeFrames([])).toThrow(
      "Can't encode a GIF without frames"
    );
  });

  test("throws for frames of different sizes", () => {
    expect(() =>
      gif().encodeFrames([
        { bitmap: solid(2, 2, RED) },
        { bitmap: solid(3, 2, RED) },
      ])
    ).toThrow(
      "Every frame of a GIF must be the same size, but frame 1 is 3x2 and frame 0 is 2x2"
    );
  });

  test("throws for a loop that isn't a number", () => {
    expect(() =>
      gif().encodeFrames([{ bitmap: solid(1, 1, RED) }], {
        loop: Number.NaN,
      })
    ).toThrow("loop must be a number, or null to play once");
  });

  test("throws for sizes a GIF can't store", () => {
    expect(() => gif().encodeFrames([{ bitmap: solid(0, 0, RED) }])).toThrow(
      "Invalid GIF dimensions 0x0"
    );
  });
});
