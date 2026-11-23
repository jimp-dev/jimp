import { expect, test, describe } from "vitest";
import { Buffer } from "buffer";

import { methods } from "./index.js";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

const jimp = createJimp({ plugins: [methods] });

describe("Autocrop", () => {
  test("image with transparent surround color", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(imgSrc.autocrop()).toMatchSnapshot();
  });

  test("image with opaque surround color", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥◆◆▥▥▥▥",
        "▥▥▥◆▦▦◆▥▥▥",
        "▥▥◆▦▦▦▦◆▥▥",
        "▥▥▥◆▦▦◆▥▥▥",
        "▥▥▥▥◆◆▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocrop()).toMatchSnapshot();
  });

  test("image with one color border", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥   ◆◆   ▥▥",
        "▥▥  ◆▦▦◆  ▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥",
        "▥▥  ◆▦▦◆  ▥▥",
        "▥▥   ◆◆   ▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocrop()).toMatchSnapshot();
  });

  test("image border with small variation", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232",
      ),
    );
    expect(imgSrc.clone().autocrop()).toMatchSnapshot();
    expect(imgSrc.clone().autocrop(0.005)).toMatchSnapshot();
  });

  test("image border with small variation configured by options", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232",
      ),
    );
    expect(imgSrc.clone().autocrop()).toMatchSnapshot();
    expect(imgSrc.clone().autocrop({ tolerance: 0.005 })).toMatchSnapshot();
  });

  test("image without frame", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥   ◆◆   ",
        "▥▥  ◆▦▦◆  ",
        "▥▥ ◆▦▦▦▦◆ ",
        "▥▥  ◆▦▦◆  ",
        "▥▥   ◆◆   ",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocrop({ cropOnlyFrames: false })).toMatchSnapshot();
  });

  test("image without frame configured by options", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥   ◆◆   ",
        "▥▥  ◆▦▦◆  ",
        "▥▥ ◆▦▦▦▦◆ ",
        "▥▥  ◆▦▦◆  ",
        "▥▥   ◆◆   ",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocrop({ cropOnlyFrames: false })).toMatchSnapshot();
  });

  test("image with symmetric border configured by options", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocrop({ cropSymmetric: true })).toMatchSnapshot();
  });

  test("image without frame and with symmetric border configured by options", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
      ),
    );
    expect(
      imgSrc.autocrop({ cropSymmetric: true, cropOnlyFrames: false }),
    ).toMatchSnapshot();
  });

  test("image without frame and with some border left", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232",
      ),
    );

    expect(
      imgSrc.autocrop({
        tolerance: 0.005,
        leaveBorder: 1,
      }),
    ).toMatchSnapshot();
  });

  test('image not cropped given an out of bounds "leaveBorder" value ', async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232",
      ),
    );
    expect(
      imgSrc.autocrop({
        tolerance: 0.005,
        leaveBorder: 100,
      }),
    ).toMatchSnapshot();
  });

  test("image with top and bottom frame and leaveBorder", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "   ◆◆   ",
        "  ◆▦▦◆  ",
        " ◆▦▦▦▦◆ ",
        "  ◆▦▦◆  ",
        "   ◆◆   ",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
      ),
    );
    expect(
      imgSrc.autocrop({
        cropSymmetric: true,
        cropOnlyFrames: false,
        leaveBorder: 2,
      }),
    ).toMatchSnapshot();
  });

  test("ignore sides north", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );
    expect(
      imgSrc.autocrop({ cropOnlyFrames: false, ignoreSides: { north: true } }),
    ).toMatchSnapshot();
  });

  test("ignore sides south and west", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(
      imgSrc.autocrop({
        cropOnlyFrames: false,
        ignoreSides: { west: true, south: true },
      }),
    ).toMatchSnapshot();
  });

  test("ignore sides east", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(
      imgSrc.autocrop({ cropOnlyFrames: false, ignoreSides: { east: true } }),
    ).toMatchSnapshot();
  });

  test("ignoreSides works with cropOnlyFrames", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(imgSrc.autocropRect({ ignoreSides: { north: true } })).toEqual({
      x: 2,
      y: 0,
      w: 6,
      h: 6,
    });
  });

  test("cropOnlyFrames still needs a border on the sides that aren't ignored", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          ",
      ),
    );

    expect(imgSrc.autocropRect({ ignoreSides: { east: true } })).toEqual({
      x: 0,
      y: 0,
      w: 10,
      h: 6,
    });
  });

  test("leaveBorder doesn't stop a frame from being cropped", async () => {
    const imgSrc = jimp.fromBitmap(
      makeTestImage(
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥◆◆▥▥▥▥▥▥▥",
        "▥◆◆▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
      ),
    );

    expect(imgSrc.autocropRect({ leaveBorder: 1 })).toEqual({
      x: 0,
      y: 2,
      w: 4,
      h: 4,
    });
  });

  test("fully transparent pixels match whatever color they hide", async () => {
    const width = 6;
    const height = 6;
    const data = Buffer.alloc(width * height * 4);

    for (let i = 0; i < data.length; i += 4) {
      // transparent, with a different hidden color for each pixel
      data.set([i % 256, (i * 7) % 256, (i * 13) % 256, 0], i);
    }

    for (const [x, y] of [
      [2, 2],
      [3, 2],
      [2, 3],
      [3, 3],
    ]) {
      data.set([0, 0, 0, 255], (y! * width + x!) * 4);
    }

    expect(jimp.fromBitmap({ width, height, data }).autocropRect()).toEqual({
      x: 2,
      y: 2,
      w: 2,
      h: 2,
    });
  });
});
