import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { createJimp } from "@jimp/core";

import jpeg from "./index.js";

const images = "../../../packages/jimp/src/images/icc-profile/";
// A Display P3 profile split over two APP2 segments
const p3Photo = new URL(images + "p3-two-segments.jpg", import.meta.url);
const p3Profile = new URL(images + "display-p3-sampled.icc", import.meta.url);

/** The ICC profile in a JPEG's APP2 segments, in sequence number order */
function jpegProfile(data: Buffer) {
  const chunks: Buffer[] = [];
  let offset = 2;

  while (data[offset + 1] !== 0xda) {
    const end = offset + 2 + data.readUInt16BE(offset + 2);

    if (
      data[offset + 1] === 0xe2 &&
      data.toString("latin1", offset + 4, offset + 16) === "ICC_PROFILE\0"
    ) {
      chunks[data[offset + 16]! - 1] = data.subarray(offset + 18, end);
    }

    offset = end;
  }

  return chunks.length ? Buffer.concat(chunks) : undefined;
}

describe("ICC profile", () => {
  const Jimp = createJimp({ formats: [jpeg] });

  test("writes the ICC profile of the source", async () => {
    const image = await Jimp.fromBuffer(await readFile(p3Photo));
    const output = await image.getBuffer("image/jpeg");

    expect(jpegProfile(output)).toEqual(await readFile(p3Profile));
    expect((await Jimp.fromBuffer(output)).width).toBe(image.width);
  });

  test("leaves the profile out with icc: false", async () => {
    const image = await Jimp.fromBuffer(await readFile(p3Photo));
    const output = await image.getBuffer("image/jpeg", { icc: false });

    expect(jpegProfile(output)).toBeUndefined();
  });
});
