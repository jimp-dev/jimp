import { Jimp, mkJGD } from "@jimp/test-utils";
import configure from "@jimp/custom";

import crop from "../src";
import { expectToBeJGD } from "@jimp/test-utils/src";

const jimp = configure({ plugins: [crop] }, Jimp);

describe("crop", () => {
  // 6x5 size
  const testImage = mkJGD("  ◆◆  ", " ◆▦▦◆ ", "◆▦▦▦▦◆", " ◆▦▦◆ ", "  ◆◆  ");

  it("full width from top", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(0, 0, 6, 2).getJGDSync(),
      mkJGD("  ◆◆  ", " ◆▦▦◆ ")
    );
  });

  it("full width from bottom", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(0, 3, 6, 2).getJGDSync(),
      mkJGD(" ◆▦▦◆ ", "  ◆◆  ")
    );
  });

  it("full width from middle", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(0, 2, 6, 2).getJGDSync(),
      mkJGD("◆▦▦▦▦◆", " ◆▦▦◆ ")
    );
  });

  it("full height from left", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(0, 0, 2, 5).getJGDSync(),
      mkJGD("  ", " ◆", "◆▦", " ◆", "  ")
    );
  });

  it("full height from right", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(4, 0, 2, 5).getJGDSync(),
      mkJGD("  ", "◆ ", "▦◆", "◆ ", "  ")
    );
  });

  it("full height from middle", async () => {
    const imgSrc = await jimp.read(testImage);

    expectToBeJGD(
      imgSrc.crop(2, 0, 2, 5).getJGDSync(),
      mkJGD("◆◆", "▦▦", "▦▦", "▦▦", "◆◆")
    );
  });
});
