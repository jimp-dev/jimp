import { expect, test } from "vitest";
import { createJimp } from "@jimp/core";
import { getTestImagePath } from "@jimp/test-utils";
import "@jimp/test-utils/image-snapshot";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";

import { methods } from "./index.js";

const Jimp = createJimp({ formats: [jpeg, png], plugins: [methods] });

test("erode thickens the dark lines of a drawing", async () => {
  const image = await Jimp.read(getTestImagePath("hands_mx200_rp255.jpg"));
  const output = await image
    .erode({ radius: 2, shape: "disk" })
    .getBuffer("image/png");

  expect(output).toMatchImageSnapshot();
});
