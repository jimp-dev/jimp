import { Jimp, getTestDir, isWeb } from '@jimp/test-utils';
import configure from '@jimp/custom';
import plugins from '@jimp/plugins';

const jimp = configure({ plugins: [plugins] }, Jimp);

describe('Exif', function() {
  this.timeout(15000);

  const imagesDir = getTestDir(__dirname) + '/images/exif-orientation';

  let imgs;
  let firstLandscapeImg;
  let firstPortraitImg;

  before(done => {
    imgs = [];
    let i;
    for (i = 1; i <= 8; i++)
      imgs.push(jimp.read(imagesDir + '/Landscape_' + i + '.jpg'));
    for (i = 1; i <= 8; i++)
      imgs.push(jimp.read(imagesDir + '/Portrait_' + i + '.jpg'));
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
    jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
    if (isWeb('Browsers has no Exif orientation support.')) return;
    for (let i = 0; i < 8; i++) {
      jimp.diff(firstLandscapeImg, imgs[i]).percent.should.be.below(0.1);
    }
  });

  it('read orientation in portrait picture', () => {
    jimp.diff(firstLandscapeImg, firstPortraitImg).percent.should.be.above(0.7);
    if (isWeb('Browsers has no Exif orientation support.')) return;
    for (let i = 8; i < 16; i++) {
      jimp.diff(firstPortraitImg, imgs[i]).percent.should.be.below(0.1);
    }
  });
});
