import { Jimp, getTestDir } from "@jimp/test-utils";
import expect from "@storybook/expect";

import { getExifOrientation } from "@jimp/core/src/utils/image-bitmap";
import configure from "@jimp/custom";

const jimp = configure({ plugins: [] }, Jimp);

describe("EXIF orientation", () => {
  for (let orientation = 1; orientation <= 8; orientation++) {
    it(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation(1);
      const orientedImg = await imageWithOrientation(orientation);

      orientedImg.write(
        getTestDir(__dirname) + `/Landscape-output-${orientation}-PR.jpg`
      );

      if (orientation > 4) {
        // 5, 6, 7, 8 dimmensions are swapped
        expect(orientedImg.getWidth()).toBe(regularImg.getHeight());
        expect(orientedImg.getHeight()).toBe(regularImg.getWidth());
      } else {
        expect(orientedImg.getWidth()).toBe(regularImg.getWidth());
        expect(orientedImg.getHeight()).toBe(regularImg.getHeight());
      }

      expect(Jimp.distance(regularImg, orientedImg)).toBeLessThan(0.07);

      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg)
      );
    });
  }

  for (let orientation = 1; orientation <= 8; orientation++) {
    it(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation2(1);
      const orientedImg = await imageWithOrientation2(orientation);

      orientedImg.write(
        getTestDir(__dirname) + `/Portrait-output-${orientation}-PR.jpg`
      );

      if (orientation > 4) {
        // 5, 6, 7, 8 dimmensions are swapped
        expect(orientedImg.getWidth()).toBe(regularImg.getHeight());
        expect(orientedImg.getHeight()).toBe(regularImg.getWidth());
      } else {
        expect(orientedImg.getWidth()).toBe(regularImg.getWidth());
        expect(orientedImg.getHeight()).toBe(regularImg.getHeight());
      }

      expect(Jimp.distance(regularImg, orientedImg)).toBeLessThan(0.07);

      expect(getExifOrientation(orientedImg)).toBe(
        getExifOrientation(regularImg)
      );
    });
  }
});

function imageWithOrientation(orientation) {
  const imageName = `Landscape_${orientation}.jpg`;
  const path = getTestDir(__dirname) + "/images/exif-orientation/" + imageName;
  return jimp.read(path);
}
function imageWithOrientation2(orientation) {
  const imageName = `Portrait_${orientation}.jpg`;
  const path = getTestDir(__dirname) + "/images/exif-orientation/" + imageName;
  return jimp.read(path);
}
