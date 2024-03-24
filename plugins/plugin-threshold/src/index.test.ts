import { expect, test, describe } from "vitest";
import "@jimp/test-utils";
import { promises as fs } from "fs";

import jpeg from "@jimp/js-jpeg";
import hash from "@jimp/plugin-hash";
import { createJimp } from "@jimp/core";

import threshold from "./index.js";

const jimp = createJimp({ formats: [jpeg], plugins: [threshold, hash] });

describe("Threshold", () => {
  test("defines default threshold for lighter backgrounds", async () => {
    const expectedImageBuffer = await fs.readFile(
      __dirname + "/images/hands_mx200_rp255.jpg"
    );
    const expectedImage = await jimp.fromBuffer(expectedImageBuffer);

    const imageBuffer = await fs.readFile(__dirname + "/images/hands.jpg");
    const testImage = await jimp.fromBuffer(imageBuffer);
    const output = testImage.threshold({ max: 200, replace: 255 }).hash();
    console.log(output);

    expect(output).toStrictEqual(expectedImage.hash());
  });
});
