import { Jimp, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';

import ico from '../src';

const jimp = configure({ types: [ico] }, Jimp);

describe('ICO', () => {
  const imagesDir = getTestDir(__dirname) + '/images';

  it('Save ICO', async () => {
    const image = await jimp.read(imagesDir + '/128.png');
    const buffer = await image.getBufferAsync('image/x-icon');
    buffer.readUInt16LE(4).should.equal(7);
  });

  it('Save ICO cops', async () => {
    const image = await jimp.read(imagesDir + '/cops.jpg');
    image.icoLayers([{ width: 100, height: 66 }, { width: 200, height: 133 }]);
    const buffer = await image.getBufferAsync('image/x-icon');
    buffer.readUInt16LE(4).should.equal(2);
  });
});
