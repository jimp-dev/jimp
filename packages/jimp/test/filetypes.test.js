/* eslint-disable no-control-regex */

import fs from 'fs';
import should from 'should';
import { Jimp, getTestDir } from './test-helper';

const imagesDir = getTestDir() + '/samples';

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

  it('load PNG', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');

    image.getPixelColor(10, 10).should.be.equal(0x00000000);
    image.getPixelColor(160, 80).should.be.equal(0x1c1cd4ff);
    image.getPixelColor(400, 250).should.be.equal(0x7e0c0cda);
  });

  it('load JPG', async () => {
    const image = await Jimp.read(imagesDir + '/cops.jpg');

    image.getPixelColor(10, 10).should.be.equal(0x3f4a02ff);
    image.getPixelColor(220, 190).should.be.equal(0x5d94b6ff);
    image.getPixelColor(350, 130).should.be.equal(0xdf7944ff);
  });

  it('load JPG with fill bytes', async () => {
    const image = await Jimp.read(imagesDir + '/fillbytes.jpg');

    image.getPixelColor(10, 10).should.be.equal(0xaeb8c3ff);
    image.getPixelColor(220, 190).should.be.equal(0x262b21ff);
    image.getPixelColor(350, 130).should.be.equal(0x4e5d30ff);
  });

  it('clones with the correct MIME type', async () => {
    const image = await Jimp.read(imagesDir + '/cops.jpg');
    const clone = image.clone();

    image.getMIME().should.be.equal(clone.getMIME());
  });

  it('load BMP', async () => {
    const image = await Jimp.read(imagesDir + '/windows95.bmp');

    image.getPixelColor(10, 10).should.be.equal(0xeff7f7ff);
    image.getPixelColor(150, 80).should.be.equal(0x73add6ff);
    image.getPixelColor(190, 200).should.be.equal(0xf7c300ff);
  });

  it('load TIFF', async () => {
    const image = await Jimp.read(imagesDir + '/rgb.tiff');

    image.getPixelColor(10, 10).should.be.equal(0xa4988bff);
    image.getPixelColor(220, 190).should.be.equal(0xe0d7ddff);
    image.getPixelColor(350, 130).should.be.equal(0x565433ff);
  });

  const simpleJGD = {
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
  };

  it('export PNG', async () => {
    const jgd = await Jimp.read(simpleJGD);
    const buffer = await jgd.getBufferAsync('image/png');

    buffer.toString().should.match(/^.PNG\r\n/);
  });

  it('export JPG', async () => {
    const image = await Jimp.read(simpleJGD);
    image.quality(50);
    const buffer = await image.getBufferAsync('image/jpeg');

    buffer.toString().should.match(/^.{3,9}JFIF\u0000/);
  });

  it('export BMP', async () => {
    const image = await Jimp.read(simpleJGD);
    const buffer = await image.getBufferAsync('image/bmp');

    buffer.toString().should.match(/^BMZ\u0000/);
  });

  it('export TIFF', async () => {
    const image = await Jimp.read(simpleJGD);
    const buffer = await image.getBufferAsync('image/tiff');

    buffer.toString().should.match(/^MM\u0000*\u0000/);
  });

  it('uses correct colors for BMP', async function() {
    this.timeout(4000);

    const expectedImg = await Jimp.read(
      getTestDir() + '/samples/windows95.png'
    );
    const image = await Jimp.read(getTestDir() + '/samples/windows95.bmp');

    image.bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
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
