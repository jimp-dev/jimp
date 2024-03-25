import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { makeTestImage } from "@jimp/test-utils";

import flip from "./index.js";

const jimp = createJimp({ plugins: [flip] });

describe("Flipping plugin", () => {
  test("can flip horizontally", () => {
    const src = jimp.fromBitmap(
      makeTestImage(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    expect(src.flip(true, false)).toMatchSnapshot();
  });

  test("can flip vertically", () => {
    const src = jimp.fromBitmap(
      makeTestImage(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    expect(src.flip(false, true)).toMatchSnapshot();
  });

  test("can flip both horizontally and vertically at once", async () => {
    const src = jimp.fromBitmap(
      makeTestImage(
        "AAAABBBB",
        "AAABAAAB",
        "ABABABAB",
        "CCCCCCCC",
        "CCCCCCCC",
        "CCCCCCCC",
        "AACCCCAA"
      )
    );

    expect(src.flip(true, true)).toMatchSnapshot();
  });
});
