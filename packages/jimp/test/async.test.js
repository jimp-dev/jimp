import fs from 'fs';
import should from 'should';
import { Jimp, getTestDir } from '@jimp/test-utils';

const imagesDir = getTestDir(__dirname) + '/images';

describe('Async functions', () => {
  it('write returns promise', async () => {
    // process.env is undefined in the browser tests. If BABEL_ENV
    // isn't found don't run this test in the browser
    if (process.env.ENV === 'browser') {
      return;
    }

    const writePath = './test.png';
    const image = await Jimp.read(imagesDir + '/dice.png');
    const writtenImage = await image.writeAsync(writePath);

    should.exist(writtenImage);
    fs.existsSync(writePath).should.be.true();
    fs.unlinkSync(writePath);
  });

  it('getBuffer returns promise', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');
    const buffer = await image.getBufferAsync(Jimp.AUTO);

    should.exist(buffer);
  });

  it('getBase64 returns promise', async () => {
    const image = await Jimp.read(imagesDir + '/dice.png');
    const bas64 = await image.getBase64Async(Jimp.AUTO);

    should.exist(bas64);
  });
});
