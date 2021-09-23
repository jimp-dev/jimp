import { Jimp, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';

import svg from '../src';

const jimp = configure({ types: [svg] }, Jimp);

describe('SVG', () => {
  const imagesDir = getTestDir(__dirname) + '/images';

  it('load SVG', async () => {
    const image = await jimp.read(imagesDir + '/flower.SVG');
    image.getPixelColor(10, 10).should.be.equal(0xe5e6d9ff);
  });

  it('load animated SVG', async () => {
    const image = await jimp.read(imagesDir + '/animated.SVG');
    image.getPixelColor(10, 10).should.be.equal(0xa1d2f1ff);
  });
});
