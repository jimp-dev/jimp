import { Jimp, mkJGD, getTestDir } from '@jimp/test-utils';
import jpeg from '@jimp/jpeg';
import configure from '@jimp/custom';

import blit from '../src';

const jimp = configure({ types: [jpeg], plugins: [blit] }, Jimp);

describe('Blit over image', function() {
  this.timeout(15000);
  const targetJGD = mkJGD(
    '▴▴▴▴▸▸▸▸',
    '▴▴▴▴▸▸▸▸',
    '▴▴▴▴▸▸▸▸',
    '▴▴▴▴▸▸▸▸',
    '▾▾▾▾◆◆◆◆',
    '▾▾▾▾◆◆◆◆',
    '▾▾▾▾◆◆◆◆',
    '▾▾▾▾◆◆◆◆'
  );
  const srcJGD = mkJGD(
    '□□□□□□',
    '□▥▥▥▥□',
    '□▥■■▥□',
    '□▥■■▥□',
    '□▥▥▥▥□',
    '□□□□□□'
  );

  let targetImg;
  let srcImg; // stores the Jimp instances of the JGD images above.

  before(done => {
    const img1 = jimp.read(targetJGD);
    const img2 = jimp.read(srcJGD);
    Promise.all([img1, img2])
      .then(images => {
        targetImg = images[0];
        srcImg = images[1];
        done();
      })
      .catch(done);
  });

  it('blit on top, with no crop', () => {
    targetImg
      .clone()
      .blit(srcImg, 0, 0)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '□□□□□□▸▸',
          '□▥▥▥▥□▸▸',
          '□▥■■▥□▸▸',
          '□▥■■▥□▸▸',
          '□▥▥▥▥□◆◆',
          '□□□□□□◆◆',
          '▾▾▾▾◆◆◆◆',
          '▾▾▾▾◆◆◆◆'
        )
      );
  });

  it('blit on middle, with no crop', () => {
    targetImg
      .clone()
      .blit(srcImg, 1, 1)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '▴▴▴▴▸▸▸▸',
          '▴□□□□□□▸',
          '▴□▥▥▥▥□▸',
          '▴□▥■■▥□▸',
          '▾□▥■■▥□◆',
          '▾□▥▥▥▥□◆',
          '▾□□□□□□◆',
          '▾▾▾▾◆◆◆◆'
        )
      );
  });

  it('blit on middle, with x,y crop', () => {
    targetImg
      .clone()
      .blit(srcImg, 2, 2, 1, 1, 5, 5)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '▴▴▴▴▸▸▸▸',
          '▴▴▴▴▸▸▸▸',
          '▴▴▥▥▥▥□▸',
          '▴▴▥■■▥□▸',
          '▾▾▥■■▥□◆',
          '▾▾▥▥▥▥□◆',
          '▾▾□□□□□◆',
          '▾▾▾▾◆◆◆◆'
        )
      );
  });

  it('blit on middle, with x,y,w,h crop', () => {
    targetImg
      .clone()
      .blit(srcImg, 2, 2, 1, 1, 4, 4)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '▴▴▴▴▸▸▸▸',
          '▴▴▴▴▸▸▸▸',
          '▴▴▥▥▥▥▸▸',
          '▴▴▥■■▥▸▸',
          '▾▾▥■■▥◆◆',
          '▾▾▥▥▥▥◆◆',
          '▾▾▾▾◆◆◆◆',
          '▾▾▾▾◆◆◆◆'
        )
      );
  });

  it('blit partially out, on top-left', () => {
    targetImg
      .clone()
      .blit(srcImg, -1, -1)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '▥▥▥▥□▸▸▸',
          '▥■■▥□▸▸▸',
          '▥■■▥□▸▸▸',
          '▥▥▥▥□▸▸▸',
          '□□□□□◆◆◆',
          '▾▾▾▾◆◆◆◆',
          '▾▾▾▾◆◆◆◆',
          '▾▾▾▾◆◆◆◆'
        )
      );
  });

  it('blit partially out, on bottom-right', () => {
    targetImg
      .clone()
      .blit(srcImg, 3, 3)
      .getJGDSync()
      .should.be.sameJGD(
        mkJGD(
          '▴▴▴▴▸▸▸▸',
          '▴▴▴▴▸▸▸▸',
          '▴▴▴▴▸▸▸▸',
          '▴▴▴□□□□□',
          '▾▾▾□▥▥▥▥',
          '▾▾▾□▥■■▥',
          '▾▾▾□▥■■▥',
          '▾▾▾□▥▥▥▥'
        )
      );
  });

  it('blit alpha', async () => {
    const expectedImg = await Jimp.read(
      getTestDir(__dirname) + '/images/blit-alpha.png'
    );
    const dice = await Jimp.read(getTestDir(__dirname) + '/images/dice.png');
    const image = await Jimp.read(getTestDir(__dirname) + '/images/cops.jpg');

    image
      .blit(dice, 0, 0)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });
});
