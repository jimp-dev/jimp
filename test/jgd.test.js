const should = require('should');
let { Jimp, donutJGD } = require('./test-helper');

donutJGD = donutJGD(
  // RRGGBBAA
  0xffffff00,
  0xff880088,
  0xff8800ff
);

const donutPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAklEQVR' +
  '4AewaftIAAABnSURBVI3BwY3DMBAEMEpwz6MSvFXvOZAN53GPkKO7/e' +
  'LwrcaJ2Ep6uU2PGo14RY12mz5qnF6F8qhxukxbbCW9pBfKFpfpR4etE' +
  'EQNt9jKZfpIL68gHunlMj3SA+VV0sPt8C29sPzjD0ceIlrzVjb+AAAA' +
  'AElFTkSuQmCC';

const donutPngBuffer = Buffer.from(donutPngBase64, 'base64');

describe('JGD - JS Graphic Description', () => {
  it('Jimp loads JGD', done => {
    new Jimp(donutJGD, (err, image) => {
      should.not.exist(err);
      image.getBuffer('image/png', (err, buffer) => {
        should.not.exist(err);
        buffer.toString('base64').should.be.equal(donutPngBase64);
        done();
      });
    });
  });

  it('Jimp exports JGD sync', done => {
    new Jimp(donutPngBuffer, (err, image) => {
      should.not.exist(err);
      image.getJGDSync().should.be.deepEqual(donutJGD);
      done();
    });
  });

  it('Jimp exports JGD async', done => {
    new Jimp(donutPngBuffer, (err, image) => {
      should.not.exist(err);
      image.getJGD((err, jgd) => {
        should.not.exist(err);
        jgd.data.length.should.be.equal(donutJGD.data.length);
        jgd.should.be.deepEqual(donutJGD);
        done();
      });
    });
  });
});
