import { Jimp, getTestDir } from '@jimp/test-utils';

import configure from '@jimp/custom';

const jimp = configure({ plugins: [] }, Jimp);

describe('EXIF orientation', () => {
  for (let orientation = 1; orientation <= 8; orientation++) {
    it(`is fixed when EXIF orientation is ${orientation}`, async () => {
      const regularImg = await imageWithOrientation(1);
      const orientedImg = await imageWithOrientation(orientation);

      orientedImg.getWidth().should.be.equal(regularImg.getWidth());
      orientedImg.getHeight().should.be.equal(regularImg.getHeight());
      Jimp.distance(regularImg, orientedImg).should.lessThan(0.07);
    });
  }
});

function imageWithOrientation(orientation) {
  const imageName = `Landscape_${orientation}.jpg`;
  const path = getTestDir(__dirname) + '/images/exif-orientation/' + imageName;
  return jimp.read(path);
}
