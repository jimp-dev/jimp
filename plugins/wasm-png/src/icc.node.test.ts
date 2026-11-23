import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";
import { createJimp } from "@jimp/core";

import png from "./index.js";

const images = "../../../packages/jimp/src/images/icc-profile/";
const p3Image = new URL(images + "p3.png", import.meta.url);
const p3Profile = new URL(images + "display-p3.icc", import.meta.url);

/** The PNG's chunk types and the ICC profile in its iCCP chunk */
function readChunks(data: Buffer) {
  const types: string[] = [];
  let profile: Buffer | undefined;
  let offset = 8;

  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("latin1", offset + 4, offset + 8);
    const chunk = data.subarray(offset + 8, offset + 8 + length);

    if (type === "iCCP") {
      profile = inflateSync(chunk.subarray(chunk.indexOf(0) + 2));
    }

    types.push(type);
    offset += 12 + length;
  }

  return { types, profile };
}

describe("ICC profile", () => {
  const Jimp = createJimp({ formats: [png] });

  test("writes the ICC profile of the source", async () => {
    const image = await Jimp.fromBuffer(await readFile(p3Image));
    const output = await image.getBuffer("image/png", {
      optimize: { level: 2 },
    });
    const { types, profile } = readChunks(output);

    expect(types.slice(0, 2)).toEqual(["IHDR", "iCCP"]);
    expect(types).not.toContain("sRGB");
    expect(profile).toEqual(await readFile(p3Profile));
    expect((await Jimp.fromBuffer(output)).width).toBe(image.width);
  });

  test("leaves the profile out with icc: false", async () => {
    const image = await Jimp.fromBuffer(await readFile(p3Image));
    const output = await image.getBuffer("image/png", { icc: false });

    expect(readChunks(output).profile).toBeUndefined();
  });
});
