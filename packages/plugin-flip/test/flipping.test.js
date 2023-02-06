import { Jimp, mkJGD } from "@jimp/test-utils";

import configure from "@jimp/custom";

import flip from "../src";
import { expectToBeJGD } from "@jimp/test-utils/src";

const jimp = configure({ plugins: [flip] }, Jimp);

describe("Flipping plugin", () => {
  it("can flip horizontally", async () => {
    const src = await jimp.read(
      mkJGD(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    const result = src.flip(true, false);

    expectToBeJGD(
      result.getJGDSync(),
      mkJGD(
        "BBBBAAAA",
        "BAAABAAA",
        "BABABABA",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );
  });

  it("can flip vertically", async () => {
    const src = await jimp.read(
      mkJGD(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    const result = src.flip(false, true);

    expectToBeJGD(
      result.getJGDSync(),
      mkJGD(
        "AACCCCAA",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "ABABABAB",
        "AAABAAAB",
        "AAAABBBB"
      )
    );
  });

  it("can flip both horizontally and vertically at once", async () => {
    const src = await jimp.read(
      mkJGD(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    const result = src.flip(true, true);

    expectToBeJGD(
      result.getJGDSync(),
      mkJGD(
        "AACCCCAA",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "BABABABA",
        "BAAABAAA",
        "BBBBAAAA"
      )
    );
  });
});
