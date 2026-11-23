import { expect, test, describe } from "vitest";
import "@jimp/test-utils/image-snapshot";

import { getExifOrientation } from "@jimp/core";
import { Jimp, diff, distance } from "./index.js";

function imageWithOrientation(orientation: number) {
  const imageName = `Landscape_${orientation}.jpg`;
  const path = __dirname + "/images/exif-orientation/" + imageName;
  return Jimp.read(path);
}

function imageWithOrientation2(orientation: number) {
  const imageName = `Portrait_${orientation}.jpg`;
  const path = __dirname + "/images/exif-orientation/" + imageName;
  return Jimp.read(path);
}

describe("EXIF orientation", () => {
  for (let orientation = 1; orientation <= 8; orientation++) {
    test(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation(1);
      const orientedImg = await imageWithOrientation(orientation);

      expect(orientedImg.bitmap.width).toBe(regularImg.bitmap.width);
      expect(orientedImg.bitmap.height).toBe(regularImg.bitmap.height);

      const output = await orientedImg.getBuffer("image/png");
      expect(output).toMatchImageSnapshot();

      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg),
      );
    });
  }

  for (let orientation = 1; orientation <= 8; orientation++) {
    test(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation2(1);
      const orientedImg = await imageWithOrientation2(orientation);

      expect(orientedImg.bitmap.width).toBe(regularImg.bitmap.width);
      expect(orientedImg.bitmap.height).toBe(regularImg.bitmap.height);

      const output = await orientedImg.getBuffer("image/png");
      expect(output).toMatchImageSnapshot();

      expect(distance(regularImg, orientedImg)).toBeLessThan(0.07);
      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg),
      );
    });
  }
});

describe("exifRotate: false", () => {
  const landscape = (orientation: number) =>
    __dirname + `/images/exif-orientation/Landscape_${orientation}.jpg`;

  for (let orientation = 1; orientation <= 8; orientation++) {
    test(`keeps the pixels as stored when EXIF orientation is ${orientation}`, async () => {
      const rotated = await Jimp.read(landscape(orientation));
      const stored = await Jimp.read(landscape(orientation), {
        exifRotate: false,
      });

      // 5-8 are stored with width and height swapped
      if (orientation > 4) {
        expect(stored.width).toBe(rotated.height);
        expect(stored.height).toBe(rotated.width);
      } else {
        expect(stored.width).toBe(rotated.width);
        expect(stored.height).toBe(rotated.height);
      }

      if (orientation === 1) {
        expect(stored.bitmap.data).toEqual(rotated.bitmap.data);
      } else {
        expect(stored.bitmap.data).not.toEqual(rotated.bitmap.data);
      }

      expect(getExifOrientation(stored)).toBe(orientation);
      expect(getExifOrientation(rotated)).toBe(1);
    });

    test(`writes EXIF orientation ${orientation} back with the exif option`, async () => {
      const stored = await Jimp.read(landscape(orientation), {
        exifRotate: false,
      });
      const output = await stored.getBuffer("image/jpeg", { exif: true });
      const written = await Jimp.read(output, { exifRotate: false });

      expect(exifOf(written)?.tags?.Orientation).toBe(orientation);
      expect(written.width).toBe(stored.width);
      expect(written.height).toBe(stored.height);

      // Reading the output with the default rotates it like the original
      const original = await Jimp.read(landscape(orientation));
      const reread = await Jimp.read(output);

      expect(reread.width).toBe(original.width);
      expect(reread.height).toBe(original.height);
      expect(diff(reread, original).percent).toBeLessThan(0.05);
    });
  }

  test("is the same as the default for images without EXIF data", async () => {
    const png = await new Jimp({
      width: 3,
      height: 2,
      color: 0xff0000ff,
    }).getBuffer("image/png");
    const image = await Jimp.fromBuffer(png, { exifRotate: false });

    expect(image.width).toBe(3);
    expect(image.height).toBe(2);
    expect(getExifOrientation(image)).toBe(1);
  });

  test("keeps the EXIF data and ICC profile of a camera photo", async () => {
    // Canon_240dpi_6.jpg with a Display P3 profile
    const image = await Jimp.read(
      __dirname + "/images/icc-profile/Canon_240dpi_6_p3.jpg",
      { exifRotate: false },
    );

    expect(image.width).toBe(150);
    expect(image.height).toBe(200);
    expect(image.colorSpace).toBe("display-p3");

    const clone = image.clone().resize({ w: 75 });
    const written = await Jimp.read(
      await clone.getBuffer("image/jpeg", { exif: true }),
      { exifRotate: false },
    );

    expect(exifOf(written)?.tags).toMatchObject({
      Make: "Canon",
      Orientation: 6,
      ExifImageWidth: 75,
      ExifImageHeight: 100,
    });
    expect(written.width).toBe(75);
    expect(written.height).toBe(100);
    expect(written.colorSpace).toBe("display-p3");
  });
});

interface ParsedExif {
  tags?: Record<string, unknown>;
  thumbnailOffset?: number;
}

function exifOf(image: object) {
  return (image as { _exif?: ParsedExif })._exif;
}

/** Lists the JPEG segment markers before the start of scan */
function markers(jpeg: Buffer) {
  const found: number[] = [];
  let offset = 2;

  while (jpeg[offset + 1] !== 0xda) {
    found.push(jpeg[offset + 1]!);
    offset += 2 + jpeg.readUInt16BE(offset + 2);
  }

  return found;
}

// Stored as 150x200 with orientation 6 (rotate 90 CW), 240 dpi, GPS and a
// thumbnail, see images/exif-metadata/README.md
const cameraPhoto = __dirname + "/images/exif-metadata/Canon_240dpi_6.jpg";

describe("EXIF preservation", () => {
  test("writes the EXIF data of the source with the exif option", async () => {
    const image = await Jimp.read(cameraPhoto);

    expect(image.width).toBe(200);
    expect(image.height).toBe(150);

    image.resize({ w: 100 });

    const output = await image.getBuffer("image/jpeg", { exif: true });
    const written = await Jimp.read(output);
    const tags = exifOf(written)?.tags;

    expect(tags).toMatchObject({
      Make: "Canon",
      Model: "Canon EOS 5D Mark IV",
      XResolution: 240,
      YResolution: 240,
      ResolutionUnit: 2,
      // The pixels were rotated on read, so they mustn't be rotated again
      Orientation: 1,
      ExifImageWidth: 100,
      ExifImageHeight: 75,
      GPSLatitude: 51.5,
    });
    expect(written.width).toBe(100);
    expect(written.height).toBe(75);
    expect(exifOf(written)?.thumbnailOffset).toBeUndefined();
  });

  test("puts the APP1 segment after APP0 and matches the JFIF density", async () => {
    const image = await Jimp.read(cameraPhoto);
    const output = await image.getBuffer("image/jpeg", { exif: true });

    expect(markers(output).slice(0, 2)).toEqual([0xe0, 0xe1]);
    expect(output.toString("latin1", 6, 11)).toBe("JFIF\0");
    // JFIF units 1 = dots per inch
    expect(output[13]).toBe(1);
    expect(output.readUInt16BE(14)).toBe(240);
    expect(output.readUInt16BE(16)).toBe(240);
  });

  test("writes no EXIF data by default", async () => {
    const image = await Jimp.read(cameraPhoto);
    const output = await image.getBuffer("image/jpeg");

    expect(markers(output)).not.toContain(0xe1);
    expect(output.includes("Canon")).toBe(false);
    expect(exifOf(await Jimp.read(output))?.tags).toEqual({});
  });

  test("keeps the EXIF data on clones", async () => {
    const image = await Jimp.read(cameraPhoto);
    const clone = image.clone().resize({ w: 50 });
    const written = await Jimp.read(
      await clone.getBuffer("image/jpeg", { exif: true }),
    );

    expect(exifOf(clone)?.tags?.Make).toBe("Canon");
    expect(exifOf(written)?.tags).toMatchObject({
      Model: "Canon EOS 5D Mark IV",
      Orientation: 1,
      ExifImageWidth: 50,
    });
  });

  test("keeps the orientation of an image that didn't need rotating", async () => {
    const image = await imageWithOrientation(1);
    const written = await Jimp.read(
      await image.getBuffer("image/jpeg", { exif: true }),
    );

    expect(exifOf(written)?.tags).toEqual({
      Orientation: 1,
      XResolution: 72,
      YResolution: 72,
      ResolutionUnit: 2,
      YCbCrPositioning: 1,
    });
  });

  test("ignores the exif option for images without EXIF data", async () => {
    const image = new Jimp({ width: 4, height: 4, color: 0xff0000ff });
    const output = await image.getBuffer("image/jpeg", { exif: true });

    expect(markers(output)).not.toContain(0xe1);
  });
});
