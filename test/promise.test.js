const { Jimp, getTestDir } = require('./test-helper');

describe('Load files', () => {
  it('Load images', done => {
    const p1 = Jimp.read(getTestDir() + '/samples/lenna.png');
    const p2 = Jimp.read(getTestDir() + '/samples/cops.jpg');

    Promise.all([p1, p2])
      .then(images => {
        images[0].getMIME().should.be.equal('image/png');
        images[1].getMIME().should.be.equal('image/jpeg');
        done();
      })
      .catch(done);
  });

  it('Load font', done => {
    Jimp.loadFont(Jimp.FONT_SANS_16_BLACK)
      .then(font => {
        font.chars.A.id.should.be.equal(65);
        done();
      })
      .catch(done);
  });
});
