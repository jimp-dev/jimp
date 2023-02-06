import { Jimp, mkJGD } from "@jimp/test-utils";
import configure from "@jimp/custom";

import crop from "../src";
import { expectToBeJGD } from "@jimp/test-utils/src";

const jimp = configure({ plugins: [crop] }, Jimp);

describe("Autocrop", () => {
  it("image with transparent surround color", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          "
      )
    );

    expectToBeJGD(
      imgSrc.autocrop().getJGDSync(),
      mkJGD("  ◆◆  ", " ◆▦▦◆ ", "◆▦▦▦▦◆", " ◆▦▦◆ ", "  ◆◆  ")
    );
  });

  it("image with opaque surround color", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥◆◆▥▥▥▥",
        "▥▥▥◆▦▦◆▥▥▥",
        "▥▥◆▦▦▦▦◆▥▥",
        "▥▥▥◆▦▦◆▥▥▥",
        "▥▥▥▥◆◆▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expectToBeJGD(
      imgSrc.autocrop().getJGDSync(),
      mkJGD("▥▥◆◆▥▥", "▥◆▦▦◆▥", "◆▦▦▦▦◆", "▥◆▦▦◆▥", "▥▥◆◆▥▥")
    );
  });

  it("image with one color border", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥   ◆◆   ▥▥",
        "▥▥  ◆▦▦◆  ▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥",
        "▥▥  ◆▦▦◆  ▥▥",
        "▥▥   ◆◆   ▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expectToBeJGD(
      imgSrc.autocrop().getJGDSync(),
      mkJGD("   ◆◆   ", "  ◆▦▦◆  ", " ◆▦▦▦▦◆ ", "  ◆▦▦◆  ", "   ◆◆   ")
    );
  });

  it("image border with small variation", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
    expectToBeJGD(
      imgSrc.clone().autocrop().getJGDSync(),
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
    expectToBeJGD(
      imgSrc.clone().autocrop(0.005).getJGDSync(),
      mkJGD("   ◆◆   ", "  ◆▦▦◆  ", " ◆▦▦▦▦◆ ", "  ◆▦▦◆  ", "   ◆◆   ")
    );
  });

  it("image border with small variation configured by options", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
    expectToBeJGD(
      imgSrc.clone().autocrop().getJGDSync(),
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
    expectToBeJGD(
      imgSrc.clone().autocrop({ tolerance: 0.005 }).getJGDSync(),
      mkJGD("   ◆◆   ", "  ◆▦▦◆  ", " ◆▦▦▦▦◆ ", "  ◆▦▦◆  ", "   ◆◆   ")
    );
  });

  it("image without frame", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "▥▥   ◆◆   ",
        "▥▥  ◆▦▦◆  ",
        "▥▥ ◆▦▦▦▦◆ ",
        "▥▥  ◆▦▦◆  ",
        "▥▥   ◆◆   ",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expectToBeJGD(
      imgSrc.autocrop(false).getJGDSync(),
      mkJGD("   ◆◆   ", "  ◆▦▦◆  ", " ◆▦▦▦▦◆ ", "  ◆▦▦◆  ", "   ◆◆   ")
    );
  });

  it("image without frame configured by options", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "▥▥   ◆◆   ",
        "▥▥  ◆▦▦◆  ",
        "▥▥ ◆▦▦▦▦◆ ",
        "▥▥  ◆▦▦◆  ",
        "▥▥   ◆◆   ",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expectToBeJGD(
      imgSrc.autocrop({ cropOnlyFrames: false }).getJGDSync(),
      mkJGD("   ◆◆   ", "  ◆▦▦◆  ", " ◆▦▦▦▦◆ ", "  ◆▦▦◆  ", "   ◆◆   ")
    );
  });

  it("image with symmetric border configured by options", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥"
      )
    );

    expectToBeJGD(
      imgSrc.autocrop({ cropSymmetric: true }).getJGDSync(),
      mkJGD(
        "   ◆◆   ▥▥",
        "  ◆▦▦◆  ▥▥",
        " ◆▦▦▦▦◆ ▥▥",
        "  ◆▦▦◆  ▥▥",
        "   ◆◆   ▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );
  });

  it("image without frame and with symmetric border configured by options", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥ ◆▦▦▦▦◆ ▥▥▥▥",
        "▥▥  ◆▦▦◆  ▥▥▥▥",
        "▥▥   ◆◆   ▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥▥▥▥▥"
      )
    );
    expectToBeJGD(
      imgSrc
        .autocrop({ cropSymmetric: true, cropOnlyFrames: false })
        .getJGDSync(),
      mkJGD(
        "   ◆◆   ▥▥",
        "  ◆▦▦◆  ▥▥",
        " ◆▦▦▦▦◆ ▥▥",
        "  ◆▦▦◆  ▥▥",
        "   ◆◆   ▥▥",
        "▥▥▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥▥▥"
      )
    );
  });

  it("image without frame and with some border left", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );

    expectToBeJGD(
      imgSrc
        .autocrop({
          tolerance: 0.005,
          leaveBorder: 1,
        })
        .getJGDSync(),
      mkJGD(
        "3232323232",
        "2   ◆◆   3",
        "3  ◆▦▦◆  2",
        "2 ◆▦▦▦▦◆ 3",
        "3  ◆▦▦◆  2",
        "2   ◆◆   3",
        "3232323232"
      )
    );
  });

  it('image not cropped given an out of bounds "leaveBorder" value ', async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
    expectToBeJGD(
      imgSrc
        .autocrop({
          tolerance: 0.005,
          leaveBorder: 100,
        })
        .getJGDSync(),
      mkJGD(
        "323232323232",
        "232323232323",
        "32   ◆◆   32",
        "23  ◆▦▦◆  23",
        "32 ◆▦▦▦▦◆ 32",
        "23  ◆▦▦◆  23",
        "32   ◆◆   32",
        "232323232323",
        "323232323232"
      )
    );
  });

  it("image with top and bottom frame and leaveBorder", async () => {
    const imgSrc = await Jimp.read(
      mkJGD(
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
        "▥▥▥▥▥▥▥▥"
      )
    );
    expectToBeJGD(
      imgSrc
        .autocrop({
          cropSymmetric: true,
          cropOnlyFrames: false,
          leaveBorder: 2,
        })
        .getJGDSync(),
      mkJGD(
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥",
        "   ◆◆   ",
        "  ◆▦▦◆  ",
        " ◆▦▦▦▦◆ ",
        "  ◆▦▦◆  ",
        "   ◆◆   ",
        "▥▥▥▥▥▥▥▥",
        "▥▥▥▥▥▥▥▥"
      )
    );
  });

  it("ignore sides north", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          "
      )
    );
    expectToBeJGD(
      imgSrc
        .autocrop({ cropOnlyFrames: false, ignoreSides: { north: true } })
        .getJGDSync(),
      mkJGD("      ", "  ◆◆  ", " ◆▦▦◆ ", "◆▦▦▦▦◆", " ◆▦▦◆ ", "  ◆◆  ")
    );
  });

  it("ignore sides south and west", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          "
      )
    );

    expectToBeJGD(
      imgSrc
        .autocrop({
          cropOnlyFrames: false,
          ignoreSides: { west: true, south: true },
        })
        .getJGDSync(),
      mkJGD(
        "  ◆◆    ",
        " ◆▦▦◆   ",
        "◆▦▦▦▦◆  ",
        " ◆▦▦◆   ",
        "  ◆◆    ",
        "        "
      )
    );
  });

  it("ignore sides east", async () => {
    const imgSrc = await jimp.read(
      mkJGD(
        "          ",
        "    ◆◆    ",
        "   ◆▦▦◆   ",
        "  ◆▦▦▦▦◆  ",
        "   ◆▦▦◆   ",
        "    ◆◆    ",
        "          "
      )
    );

    expectToBeJGD(
      imgSrc
        .autocrop({ cropOnlyFrames: false, ignoreSides: { east: true } })
        .getJGDSync(),
      mkJGD("    ◆◆  ", "   ◆▦▦◆ ", "  ◆▦▦▦▦◆", "   ◆▦▦◆ ", "    ◆◆  ")
    );
  });
});
