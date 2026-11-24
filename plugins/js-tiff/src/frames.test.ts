import { expect, test, describe } from "vitest";
import utif from "utif2";
import { createJimp, ReadFramesOptions } from "@jimp/core";
import { Bitmap } from "@jimp/types";
import { getTestImagePath } from "@jimp/test-utils";

import tiff, { DecodeTiffOptions } from "./index.js";

const jimp = createJimp({ formats: [tiff] });

/** See packages/test-utils/scripts/generate-multi-frame-images.mjs */
const fixture = getTestImagePath("multipage.tiff");

async function decodeFixture(
  options?: ReadFramesOptions & { "image/tiff"?: DecodeTiffOptions }
) {
  const { frames, loop } = await jimp.readFrames(fixture, options);

  return {
    frames: frames.map(({ image, delay }) => ({ bitmap: image.bitmap, delay })),
    loop,
  };
}

/** A bitmap where every byte is different, so pages can't be mixed up */
function createBitmap(width: number, height: number, seed: number): Bitmap {
  const data = Buffer.alloc(width * height * 4);

  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 31 + seed * 17) & 0xff;
  }

  return { data, width, height };
}

describe("TIFF frames", () => {
  test("decodes every page, keeping their sizes", async () => {
    const { frames, loop } = await decodeFixture();

    expect(loop).toBeUndefined();
    expect(
      frames.map(({ bitmap, delay }) => ({
        width: bitmap.width,
        height: bitmap.height,
        data: bitmap.data.toString("hex"),
        delay,
      }))
    ).toEqual([
      // RGBA: red, green, blue and half transparent white
      {
        width: 2,
        height: 2,
        data: "ff0000ff00ff00ff0000ffffffffff80",
        delay: undefined,
      },
      // RGB
      {
        width: 3,
        height: 1,
        data: "0a141eff28323cff46505aff",
        delay: undefined,
      },
      // Greyscale
      { width: 1, height: 2, data: "000000ffc8c8c8ff", delay: undefined },
    ]);
  });

  test("decode returns the first page", async () => {
    const { frames } = await decodeFixture();

    expect((await jimp.read(fixture)).bitmap).toEqual(frames[0]!.bitmap);
  });

  test("maxFrames decodes only the first pages", async () => {
    const { frames } = await decodeFixture({ maxFrames: 2 });

    expect(frames.map(({ bitmap }) => bitmap.width)).toEqual([2, 3]);
  });

  test("maxResolutionInMP limits all pages together", async () => {
    // The pages are 4, 3 and 2 pixels
    const maxResolutionInMP = 8 / 1_000_000;

    const options = { "image/tiff": { maxResolutionInMP } };

    await expect(decodeFixture(options)).rejects.toThrow(
      "TIFF pages together exceed the maximum resolution of 0.000008 megapixels"
    );
    expect(
      (await decodeFixture({ ...options, maxFrames: 2 })).frames
    ).toHaveLength(2);
  });
});

describe("TIFF encodeFrames", () => {
  test("round trips pages of different sizes exactly", async () => {
    const pages = [
      createBitmap(3, 2, 1),
      createBitmap(1, 1, 2),
      createBitmap(5, 4, 3),
    ];
    const encoded = tiff().encodeFrames(pages.map((bitmap) => ({ bitmap })));
    const { frames } = await tiff().decodeFrames(encoded);

    expect(frames.map(({ bitmap }) => bitmap)).toEqual(pages);
  });

  test("writes standard page tags", () => {
    const encoded = tiff().encodeFrames([
      { bitmap: createBitmap(2, 1, 1) },
      { bitmap: createBitmap(1, 2, 2) },
    ]);
    const ifds = utif.decode(encoded);

    expect(ifds).toHaveLength(2);
    expect(ifds.map((ifd) => [ifd.t254, ifd.t297, ifd.t338])).toEqual([
      [[2], [0, 2], [2]],
      [[2], [1, 2], [2]],
    ]);
  });

  test("writes more pages than utif2's encoder can", async () => {
    const pages = Array.from({ length: 150 }, (_, i) => ({
      bitmap: createBitmap(1, 1, i),
    }));
    const { frames } = await tiff().decodeFrames(tiff().encodeFrames(pages));

    expect(frames.map(({ bitmap }) => bitmap)).toEqual(
      pages.map(({ bitmap }) => bitmap)
    );
  });

  test("throws for no pages", () => {
    expect(() => tiff().encodeFrames([])).toThrow(
      "Can't encode a TIFF without pages"
    );
  });

  test("throws for an empty page", () => {
    expect(() =>
      tiff().encodeFrames([
        { bitmap: { data: Buffer.alloc(0), width: 0, height: 3 } },
      ])
    ).toThrow("Invalid TIFF dimensions 0x3");
  });
});
