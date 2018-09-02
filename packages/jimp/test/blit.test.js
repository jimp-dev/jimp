import { Jimp, mkJGD, getTestDir } from './test-helper';

describe('Blit over image', () => {
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
    const img1 = Jimp.read(targetJGD);
    const img2 = Jimp.read(srcJGD);
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
      getTestDir() + '/samples/blit-alpha.png'
    );
    const dice = await Jimp.read(getTestDir() + '/samples/dice.png');
    const image = await Jimp.read(getTestDir() + '/samples/cops.jpg');

    image
      .blit(dice, 0, 0)
      .bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
  });
});
