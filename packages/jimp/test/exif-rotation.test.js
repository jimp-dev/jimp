import { Jimp, getTestDir } from "@jimp/test-utils";
import expect from "@storybook/expect";

import configure from "@jimp/custom";

const jimp = configure({ plugins: [] }, Jimp);

describe("EXIF orientation", () => {
  for (let orientation = 1; orientation <= 8; orientation++) {
    it(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation(1);
      const orientedImg = await imageWithOrientation(orientation);

      expect(orientedImg.getWidth()).toBe(regularImg.getWidth());
      expect(orientedImg.getHeight()).toBe(regularImg.getHeight());
      expect(Jimp.distance(regularImg, orientedImg)).toBeLessThan(0.07);
    });
  }
});

function imageWithOrientation(orientation) {
  const imageName = `Landscape_${orientation}.jpg`;
  const path = getTestDir(__dirname) + "/images/exif-orientation/" + imageName;
  return jimp.read(path);
}
