import { Jimp, mkJGD, getTestDir } from "@jimp/test-utils";
import configure from "@jimp/custom";
import expect from "@storybook/expect";

import circle from "../src";

const jimp = configure({ plugins: [circle] }, Jimp);

describe("Circle", () => {
  it("makes a circle based on image height and width", async () => {
    const expectedImg = await Jimp.read(
      getTestDir(__dirname) + "/images/circled.png"
    );
    const imgSrc = await jimp.read(
      mkJGD(
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦"
      )
    );

    expect(imgSrc.circle().bitmap.data).toEqual(expectedImg.bitmap.data);
  });

  it("makes a circle using provided radius", async () => {
    const expectedImg = await Jimp.read(
      getTestDir(__dirname) + "/images/radius-3-circle.png"
    );
    const imgSrc = await jimp.read(
      mkJGD(
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦"
      )
    );

    expect(imgSrc.circle({ radius: 3 }).bitmap.data).toEqual(
      expectedImg.bitmap.data
    );
  });

  it("should ", async () => {
    const expectedImg = await Jimp.read(
      getTestDir(__dirname) + "/images/x-y-circle.png"
    );
    const imgSrc = await jimp.read(
      mkJGD(
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦",
        "▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦"
      )
    );

    expect(imgSrc.circle({ radius: 5, x: 5, y: 5 }).bitmap.data).toEqual(
      expectedImg.bitmap.data
    );
  });
});
