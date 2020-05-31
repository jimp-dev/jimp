import fs from 'fs';
import should from 'should';
import { Jimp, getTestDir } from '@jimp/test-utils';

const imagesDir = getTestDir(__dirname) + '/images';

describe('FileType', () => {
  it('write uses original MIME type', async () => {
    if (process.env.ENV === 'browser') {
      return;
    }

    const writePath = './test-result';
    const image = await Jimp.read(imagesDir + '/dice.png');
    const writtenImage = await image.writeAsync(writePath);

    should.exist(writtenImage);
    fs.existsSync(writePath).should.be.true();
    fs.unlinkSync(writePath);
  });

  it('should load from raw data', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');
    const imageFromBitmap = await Jimp.read({
      data: image.bitmap.data,
      width: image.getWidth(),
      height: image.getHeight()
    });

    should.exist(imageFromBitmap);
  });

  it('clones with the correct MIME type', async () => {
    const image = await Jimp.read(imagesDir + '/cops.jpg');
    const clone = image.clone();

    image.getMIME().should.be.equal(clone.getMIME());
  });

  it('clones gif with the correct MIME type', async () => {
    const image = await Jimp.read(imagesDir + '/flower.gif');
    const clone = image.clone();

    image.getMIME().should.be.equal(clone.getMIME());
  });
});

describe('hasAlpha', () => {
  it('image with no alpha', async () => {
    const image = await Jimp.read(imagesDir + '/cops.jpg');

    image.hasAlpha().should.be.equal(false);
  });

  it('image with alpha', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');

    image.hasAlpha().should.be.equal(true);
  });
});
