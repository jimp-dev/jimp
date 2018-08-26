import { Jimp, getTestDir, isWeb } from './test-helper';

describe('Exif', function() {
  this.timeout(15000);

  const imagesDir = getTestDir() + '/samples/exif-orientation';

  let imgs;
  let firstLandscapeImg;
  let firstPortraitImg;

  before(done => {
    imgs = [];
    let i;
    for (i = 1; i <= 8; i++)
      imgs.push(Jimp.read(imagesDir + '/Landscape_' + i + '.jpg'));
    for (i = 1; i <= 8; i++)
      imgs.push(Jimp.read(imagesDir + '/Portrait_' + i + '.jpg'));
    Promise.all(imgs)
      .then(loadedImgs => {
        imgs = loadedImgs;
        firstLandscapeImg = imgs[0];
        firstPortraitImg = imgs[8];
        done();
      })
      .catch(done);
  });

  it('read orientation in landscape picture', () => {
    Jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
    if (isWeb('Browsers has no Exif orientation support.')) return;
    for (let i = 0; i < 8; i++) {
      Jimp.diff(firstLandscapeImg, imgs[i]).percent.should.be.below(0.1);
    }
  });

  it('read orientation in portrait picture', () => {
    Jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
    if (isWeb('Browsers has no Exif orientation support.')) return;
    for (let i = 8; i < 16; i++) {
      Jimp.diff(firstPortraitImg, imgs[i]).percent.should.be.below(0.1);
    }
  });
});
