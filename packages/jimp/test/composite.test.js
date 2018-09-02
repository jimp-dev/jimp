import fs from 'fs';
import should from 'should';

import { Jimp, getTestDir } from '@jimp/test-utils';

// TODO: Figure out why we need to write to file to get equal buffers
describe('composite', () => {
  it('can apply more than one color transformation', async () => {
    const image = getTestDir(__dirname) + '/samples/cops.jpg';
    const expectedImg = getTestDir(__dirname) + '/samples/cops-masked.jpg';

    if (process.env.ENV === 'browser') {
      return;
    }

    const testPath = image.replace('.jpg', '-test.jpg');
    const mask = await Jimp.create(100, 100, 0x0000ff);
    const cops = await Jimp.read(image);

    cops.composite(mask, 0, 0, {
      mode: Jimp.BLEND_SOURCE_OVER,
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
    const image = getTestDir(__dirname) + '/samples/cops.jpg';
    const testPath = image.replace('.jpg', '-test.jpg');

    if (process.env.ENV === 'browser') {
      return;
    }

    const background = await Jimp.create(100, 100, 0x0000ff);
    const cops = await Jimp.read(image);

    background.composite(cops, 0, -(cops.bitmap.height / 2), {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacityDest: 1,
      opacitySource: 0.8
    });

    await background.writeAsync(testPath);

    const one = fs.readFileSync(
      getTestDir(__dirname) + '/samples/cops-composited.jpg'
    );
    const two = fs.readFileSync(testPath);

    fs.unlinkSync(testPath);

    should.deepEqual(one, two);
  });
});
