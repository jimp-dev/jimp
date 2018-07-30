/* eslint-disable no-control-regex */

const { Jimp, getTestDir } = require('./test-helper');

describe.only('hash', () => {
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
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            if (err) done(err);
            image.hash(10).should.be.equal('14132132765884045842');
            done();
        });
    });

    it('base 16 (hex)', done => {
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            if (err) done(err);
            image.hash(16).should.be.equal('c41f6be0152d5a12');
            done();
        });
    });

    it('base 64', done => {
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            if (err) done(err);
            image.hash(64).should.be.equal('cgvq$0lblEi');
            done();
        });
    });

    it('some random base', done => {
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            if (err) done(err);
            image.hash(23).should.be.equal('150k19a4jc1d5lh');
            done();
        });
    });
});
