/* eslint-disable no-control-regex */

import { Jimp, getTestDir } from './test-helper';

const imagesDir = getTestDir() + '/samples';

describe('hash', () => {
  it('base 2', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');

    image
      .hash(2)
      .should.be.equal(
        '1100010000011111011010111110000000010101001011010101101000010010'
      );
  });

  it('base 10 (decimal)', async () => {
    const image = await Jimp.read(imagesDir + '/cops.jpg');

    image.hash(10).should.be.equal('13442314021806033441');
  });

  it('base 16 (hex)', async () => {
    const image = await Jimp.read(imagesDir + '/rgb.tiff');

    image.hash(16).should.be.equal('949800481007044c');
  });

  it('base 64', async () => {
    const image = await Jimp.read(imagesDir + '/windows95.bmp');

    image.hash(64).should.be.equal('fb0xj0Mw400');
  });

  it('base 23', async function() {
    // large image need large timeout, but this really seems to be an issue
    // with should. If I change the expected value it will complete quicker! :(
    this.timeout(10000);
    const image = await Jimp.read(imagesDir + '/panoramic.jpg');

    image.hash(23).should.be.exactly('0m1m2id7l7cl4fb');
  });

  it('base 17', async () => {
    const image = await Jimp.read(imagesDir + '/lenna.png');

    image.hash(17).should.be.equal('4fa6aga5a64ad0c1');
  });
});

describe('pHash', () => {
  it('should calculate the distance', async () => {
    const image1 = await Jimp.read(imagesDir + '/lenna.png');
    const image2 = await Jimp.read(imagesDir + '/mask.png');

    const hash = image1.pHash();
    image2
      .distanceFromHash(hash)
      .should.be.equal(Jimp.distance(image1, image2));
  });

  it('should calculate the distance', async () => {
    const image1 = await Jimp.read(imagesDir + '/lenna.png');
    const image2 = await Jimp.read(imagesDir + '/mask.png');

    const hash1 = image1.pHash();
    const hash2 = image2.pHash();

    Jimp.compareHashes(hash1, hash2).should.be.equal(
      Jimp.distance(image1, image2)
    );
  });
});
