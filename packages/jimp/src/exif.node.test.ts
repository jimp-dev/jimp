import { expect, test, describe } from "vitest";
import "@jimp/test-utils/image-snapshot";

import { getExifOrientation } from "@jimp/core";
import { Jimp, distance } from "./index.js";

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
    test.only(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation(1);
      const orientedImg = await imageWithOrientation(orientation);

      expect(orientedImg.bitmap.width).toBe(regularImg.bitmap.width);
      expect(orientedImg.bitmap.height).toBe(regularImg.bitmap.height);

      const output = await orientedImg.getBuffer("image/png");
      expect(output).toMatchImageSnapshot();

      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg)
      );
    });
  }

  for (let orientation = 1; orientation <= 8; orientation++) {
    test.only(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation2(1);
      const orientedImg = await imageWithOrientation2(orientation);

      expect(orientedImg.bitmap.width).toBe(regularImg.bitmap.width);
      expect(orientedImg.bitmap.height).toBe(regularImg.bitmap.height);

      const output = await orientedImg.getBuffer("image/png");
      expect(output).toMatchImageSnapshot();

      expect(distance(regularImg, orientedImg)).toBeLessThan(0.07);
      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg)
      );
    });
  }
});
