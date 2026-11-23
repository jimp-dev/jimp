import { describe, expect, test } from "vitest";
import { readFile } from "node:fs/promises";
import { createJimp } from "@jimp/core";

import jpeg from "./index.js";

const cameraPhoto = new URL(
  "../../../packages/jimp/src/images/exif-metadata/Canon_240dpi_6.jpg",
  import.meta.url,
);

describe("EXIF", () => {
  const Jimp = createJimp({ formats: [jpeg] });

  test("writes the EXIF data of the source with the exif option", async () => {
    const image = await Jimp.fromBuffer(await readFile(cameraPhoto));
    const written = await Jimp.read(
      await image.getBuffer("image/jpeg", { exif: true }),
    );
    const { _exif } = written as unknown as {
      _exif: { tags: Record<string, unknown> };
    };

    expect(_exif.tags).toMatchObject({
      Make: "Canon",
      XResolution: 240,
      Orientation: 1,
      ExifImageWidth: 200,
      ExifImageHeight: 150,
    });
  });

  test("writes no EXIF data by default", async () => {
    const image = await Jimp.fromBuffer(await readFile(cameraPhoto));
    const output = await image.getBuffer("image/jpeg");

    expect(output.includes("Exif\0\0")).toBe(false);
  });
});
