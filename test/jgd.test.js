const should = require('should');
let { Jimp, donutJGD } = require('./test-helper');

donutJGD = donutJGD(
    // RRGGBBAA
    0xffffff00,
    0xff880088,
    0xff8800ff
);

const donutPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAaUlEQVR' +
    '4AY3BwY3DMBAEMEpwz6MSvFXvOZAN53GPkKO7/eLwrcaJ2Ep6uU2PGo' +
    '14RY12mz5qnF6F8qhxukxbbCW9pBfKFpfpR4etEEQNt9jKZfpIL68gH' +
    'unlMj3SA+VV0sPt8C29sPzjD0ceIlrXDNOFAAAAAElFTkSuQmCC';

const donutPngBuffer = Buffer.from(donutPngBase64, 'base64');

describe('JGD - JS Graphic Description', () => {
    it('Jimp loads JGD', done => {
        new Jimp(donutJGD)
            .getBuffer('image/png')
            .then(buffer => {
                buffer.toString('base64').should.be.equal(donutPngBase64);
                done();
            })
            .catch(err => should.not.exist(err));
    });

    it('Jimp exports JGD sync', done => {
        new Jimp(donutPngBuffer)
            .then(image => {
                image.getJGDSync().should.be.deepEqual(donutJGD);
                done();
            })
            .catch(err => should.not.exist(err));
    });

    it('Jimp exports JGD async', done => {
        new Jimp(donutPngBuffer)
            .then(image => {
                image.getJGD((err, jgd) => {
                    should.not.exist(err);
                    jgd.data.length.should.be.equal(donutJGD.data.length);
                    jgd.should.be.deepEqual(donutJGD);
                    done();
                });
            })
            .catch(err => should.not.exist(err));
    });
});
