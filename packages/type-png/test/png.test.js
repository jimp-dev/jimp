/* eslint-disable no-control-regex */

import { Jimp, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';

import png from '../src';

const jimp = configure({ types: [png] }, Jimp);

describe('PNG', () => {
  const imagesDir = getTestDir(__dirname) + '/images';

  it('load PNG', async () => {
    const image = await jimp.read(imagesDir + '/dice.png');

    image.getPixelColor(10, 10).should.be.equal(0x00000000);
    image.getPixelColor(160, 80).should.be.equal(0x1c1cd4ff);
    image.getPixelColor(400, 250).should.be.equal(0x7e0c0cda);
  });

  it('export PNG', async () => {
    const jgd = await jimp.read({
      width: 3,
      height: 3,
      data: [
        0xff0000ff,
        0xff0080ff,
        0xff00ffff,
        0xff0080ff,
        0xff00ffff,
        0x8000ffff,
        0xff00ffff,
        0x8000ffff,
        0x0000ffff
      ]
    });
    const buffer = await jgd.getBufferAsync('image/png');

    buffer.toString().should.match(/^.PNG\r\n/);
  });
});
