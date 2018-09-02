/* eslint-disable no-control-regex */

import { Jimp, getTestDir } from '@jimp/test-utils';
import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const jimp = configure({ plugins: [plugins] }, Jimp);

describe('hash', () => {
  const imagesDir = getTestDir(__dirname) + '/images';

  it('base 2', async () => {
    const image = await jimp.read(imagesDir + '/dice.png');

    image
      .hash(2)
      .should.be.equal(
        '1100010000011111011010111110000000010101001011010101101000010010'
      );
  });

  it('base 10 (decimal)', async () => {
    const image = await jimp.read(imagesDir + '/cops.jpg');

    image.hash(10).should.be.equal('13442314021806033441');
  });

  it('base 16 (hex)', async () => {
    const image = await jimp.read(imagesDir + '/rgb.tiff');

    image.hash(16).should.be.equal('949800481007044c');
  });

  it('base 64', async () => {
    const image = await jimp.read(imagesDir + '/windows95.bmp');

    image.hash(64).should.be.equal('fb0xj0Mw400');
  });

  it('base 23', async function() {
    // large image need large timeout, but this really seems to be an issue
    // with should. If I change the expected value it will complete quicker! :(
    this.timeout(10000);
    const image = await jimp.read(imagesDir + '/panoramic.jpg');

    image.hash(23).should.be.exactly('0m1m2id7l7cl4fb');
  });

  it('base 17', async () => {
    const image = await jimp.read(imagesDir + '/lenna.png');

    image.hash(17).should.be.equal('4fa6aga5a64ad0c1');
  });
});
