/* eslint-disable no-control-regex */

const { Jimp, getTestDir } = require('./test-helper');

describe('hash', () => {
    const imagesDir = getTestDir() + '/samples';

    it('base 2', done => {
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            if (err) done(err);
            image
                .hash(2)
                .should.be.equal(
                    '1100010000011111011010111110000000010101001011010101101000010010'
                );
            done();
        });
    });

    it('base 10 (decimal)', done => {
        new Jimp(imagesDir + '/cops.jpg', (err, image) => {
            if (err) done(err);
            image.hash(10).should.be.equal('13442314021806033441');
            done();
        });
    });

    it('base 16 (hex)', done => {
        new Jimp(imagesDir + '/rgb.tiff', (err, image) => {
            if (err) done(err);
            image.hash(16).should.be.equal('949800481007044c');
            done();
        });
    });

    it('base 64', done => {
        new Jimp(imagesDir + '/windows95.bmp', (err, image) => {
            if (err) done(err);
            image.hash(64).should.be.equal('f30wi0ww000');
            done();
        });
    });

    it('base 23', function(done) {
        // large image need large timeout, but this really seems to be an issue
        // with should. If I change the expected value it will complete quicker! :(
        this.timeout(10000);
        new Jimp(imagesDir + '/panoramic.jpg', (err, image) => {
            if (err) done(err);
            image.hash(23).should.be.exactly('0m1m2id7l7cl4fb');
            done();
        });
    });

    it('base 17', done => {
        new Jimp(imagesDir + '/lenna.png', (err, image) => {
            if (err) done(err);
            image.hash(17).should.be.equal('4fa6aga5a64ad0c1');
            done();
        });
    });
});
