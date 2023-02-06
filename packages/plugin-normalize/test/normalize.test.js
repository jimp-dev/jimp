import { Jimp, mkJGD } from "@jimp/test-utils";
import configure from "@jimp/custom";

import normalize from "../src";
import { expectToBeJGD } from "@jimp/test-utils/src";

const jimp = configure({ plugins: [normalize] }, Jimp);

describe("Normalize", () => {
  it("change grayscale image", async () => {
    const image = await jimp.read(mkJGD("36▦", "6▦9", "▦9C"));

    expectToBeJGD(image.normalize().getJGDSync(), mkJGD("■5▦", "5▦A", "▦A□"));
  });

  it("change red/blue image", async () => {
    const image = await jimp.read({
      width: 3,
      height: 2,
      data: [
        0x000000ff, 0x400022ff, 0x40002200, 0x400000ff, 0x000022ff, 0x800055ff,
      ],
    });

    expectToBeJGD(image.normalize().getJGDSync(), {
      width: 3,
      height: 2,
      data: [
        0x000000ff, 0x7f0066ff, 0x7f006600, 0x7f0000ff, 0x000066ff, 0xff00ffff,
      ],
    });
  });
});
