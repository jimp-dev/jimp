import { Jimp, mkJGD } from '@jimp/test-utils';

describe('Compare image difference', () => {
  let imgs = [
    Jimp.read(mkJGD('2222', '4444', '6666', '8888')),
    Jimp.read(mkJGD('2468', '2468', '2468', '2468')),
    Jimp.read(mkJGD('2212', '4434', '6656', '8878')),
    Jimp.read(mkJGD('2232', '4454', '6676', '8898'))
  ];

  before(done => {
    Promise.all(imgs)
      .then(imgsJimp => {
        imgs = imgsJimp;
        done();
      })
      .catch(done);
  });

  it('images 0 and 1', () => {
    const diff = Jimp.diff(imgs[0], imgs[1]);
    diff.percent.should.be.equal(0.75);
    diff.image.getJGDSync().should.be.sameJGD({
      width: 4,
      height: 4,
      data: [
        0xe8e8e8ff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xecececff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xefefefff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xff0000ff,
        0xf3f3f3ff
      ]
    });
  });

  it('images 0 and 2', () => {
    const diff = Jimp.diff(imgs[0], imgs[2]);
    diff.percent.should.be.equal(0);
    diff.image.getJGDSync().should.be.sameJGD({
      width: 4,
      height: 4,
      data: [
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xecececff,
        0xecececff,
        0xecececff,
        0xecececff,
        0xefefefff,
        0xefefefff,
        0xefefefff,
        0xefefefff,
        0xf3f3f3ff,
        0xf3f3f3ff,
        0xf3f3f3ff,
        0xf3f3f3ff
      ]
    });
  });

  it('images 0 and 3', () => {
    const diff = Jimp.diff(imgs[0], imgs[3]);
    diff.percent.should.be.equal(0);
    diff.image.getJGDSync().should.be.sameJGD({
      width: 4,
      height: 4,
      data: [
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xe8e8e8ff,
        0xecececff,
        0xecececff,
        0xecececff,
        0xecececff,
        0xefefefff,
        0xefefefff,
        0xefefefff,
        0xefefefff,
        0xf3f3f3ff,
        0xf3f3f3ff,
        0xf3f3f3ff,
        0xf3f3f3ff
      ]
    });
  });

  it('allows to set a different threshold', () => {
    Jimp.diff(imgs[0], imgs[3], 0.1).percent.should.be.equal(0);
    Jimp.diff(imgs[0], imgs[3], 0).percent.should.be.equal(0.25);
  });

  it('throws an error if threshold is invalid', () => {
    (() => Jimp.diff(imgs[0], imgs[3], 'invalid')).should.throw(
      'threshold must be a number between 0 and 1'
    );
  });
});
