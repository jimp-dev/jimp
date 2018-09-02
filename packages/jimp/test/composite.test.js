import fs from 'fs';
import should from 'should';

import { Jimp, getTestDir } from '@jimp/test-utils';

import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const jimp = configure({ plugins: [plugins] }, Jimp);

// TODO: Figure out why we need to write to file to get equal buffers
describe('composite', () => {
  it('can apply more than one color transformation', async () => {
    const image = getTestDir(__dirname) + '/images/cops.jpg';
    const expectedImg = getTestDir(__dirname) + '/images/cops-masked.jpg';

    if (process.env.ENV === 'browser') {
      return;
    }

    const testPath = image.replace('.jpg', '-test.jpg');
    const mask = await jimp.create(100, 100, 0x0000ff);
    const cops = await jimp.read(image);

    cops.composite(mask, 0, 0, {
      mode: jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
      opacityDest: 0.5
    });

    await cops.writeAsync(testPath);

    const one = fs.readFileSync(expectedImg);
    const two = fs.readFileSync(testPath);

    fs.unlinkSync(testPath);

    should.deepEqual(one, two);
  });

  it('should handle edges correctly', async () => {
    const image = getTestDir(__dirname) + '/images/cops.jpg';
    const testPath = image.replace('.jpg', '-test.jpg');

    if (process.env.ENV === 'browser') {
      return;
    }

    const background = await jimp.create(100, 100, 0x0000ff);
    const cops = await jimp.read(image);

    background.composite(cops, 0, -(cops.bitmap.height / 2), {
      mode: jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.8
    });

    await background.writeAsync(testPath);

    const one = fs.readFileSync(
      getTestDir(__dirname) + '/images/cops-composited.jpg'
    );
    const two = fs.readFileSync(testPath);

    fs.unlinkSync(testPath);

    should.deepEqual(one, two);
  });
});
