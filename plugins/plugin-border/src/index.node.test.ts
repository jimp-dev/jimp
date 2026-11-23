import { describe, expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";

import * as border from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [border.methods] });

function readCops() {
  return Jimp.read(getTestImagePath("cops.jpg"));
}

describe("Border", () => {
  test("rounds the corners", async () => {
    const image = await readCops();
    const output = await image
      .roundCorners({ radius: 60 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("rounds each corner differently", async () => {
    const image = await readCops();
    const output = await image
      .roundCorners({ radius: { topLeft: 150, bottomRight: 40 } })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("adds a rounded border", async () => {
    const image = await readCops();
    const output = await image
      .border({ width: 16, color: "#f5c518", radius: 60 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("adds a box shadow under rounded corners", async () => {
    const image = await readCops();
    const output = await image
      .roundCorners({ radius: 40 })
      .boxShadow({ x: 0, y: 16, blur: 32, radius: 40, color: 0x000000a0 })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });

  test("adds a border and a colored, spread shadow", async () => {
    const image = await readCops();
    const output = await image
      .border({ width: 10, color: 0xffffffff, radius: 50 })
      .boxShadow({
        x: -20,
        y: 20,
        blur: 10,
        spread: 8,
        radius: 50,
        color: "rgba(40, 80, 200, 0.8)",
      })
      .getBuffer("image/png");

    expect(output).toMatchImageSnapshot();
  });
});
