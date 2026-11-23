import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";

import jpeg2000 from "./index.js";

const images = "../../../packages/jimp/src/images/icc-profile/";
const p3Image = new URL(images + "p3.png", import.meta.url);
const p3Profile = new URL(images + "display-p3.icc", import.meta.url);

function box(type: string, data: Buffer) {
  const header = Buffer.alloc(8);

  header.writeUInt32BE(data.length + 8, 0);
  header.write(type, 4, "latin1");

  return Buffer.concat([header, data]);
}

/** Replaces the sRGB colour specification box with a restricted ICC one */
function withProfile(jp2: Buffer, profile: Buffer) {
  const jp2h = jp2.indexOf("jp2h") - 4;
  const ihdr = jp2.subarray(jp2h + 8, jp2h + 8 + 22);
  const colr = box("colr", Buffer.concat([Buffer.from([2, 0, 0]), profile]));

  return Buffer.concat([
    jp2.subarray(0, jp2h),
    box("jp2h", Buffer.concat([ihdr, colr])),
    jp2.subarray(jp2h + jp2.readUInt32BE(jp2h)),
  ]);
}

describe("ICC profile", () => {
  const Jimp = createJimp({ formats: [png, jpeg2000] });

  test("reads the ICC profile of a JP2", async () => {
    const source = await Jimp.read(await readFile(p3Image));
    const profile = await readFile(p3Profile);
    const jp2 = await source.getBuffer("image/jp2", {});
    const image = await Jimp.read(withProfile(jp2, profile));

    expect(image.iccProfile).toEqual(profile);
    expect(image.colorSpace).toBe("display-p3");
    // The pixels stay in the profile's colour space
    expect(image.bitmap.data).toEqual((await Jimp.read(jp2)).bitmap.data);
  });

  test("writes Display P3 images as sRGB", async () => {
    const source = await Jimp.read(await readFile(p3Image));
    const image = await Jimp.read(await source.getBuffer("image/jp2"));

    expect(source.colorSpace).toBe("display-p3");
    expect(image.iccProfile).toBeUndefined();
    expect(image.bitmap.data).toEqual(
      source.clone().toColorSpace("srgb").bitmap.data,
    );
  });
});
