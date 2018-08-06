const fs = require('fs');
const should = require('should');
const { Jimp, getTestDir } = require('./test-helper');

const imagesDir = getTestDir() + '/samples';

describe('Async functions', () => {
    it('write returns promise', done => {
        const writePath = './test.png';

        // process.env is undefined in the browser tests. If BABEL_ENV
        // isn't found don't run this test in the browser
        if (process.env.ENV === 'browser') {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            should.not.exist(err);

            this.writeAsync(writePath).then(image => {
                should.exist(image);
                fs.existsSync(writePath).should.be.true();
                fs.unlinkSync(writePath);
                done();
            });
        });
    });

    it('getBuffer returns promise', done => {
        if (process.env.ENV === 'browser') {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            should.not.exist(err);
            this.getBufferAsync(Jimp.AUTO).then(buffer => {
                should.exist(buffer);
                done();
            });
        });
    });

    it('getBase64 returns promise', done => {
        if (process.env.ENV === 'browser') {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            should.not.exist(err);

            this.getBase64Async(Jimp.AUTO).then(buffer => {
                should.exist(buffer);
                done();
            });
        });
    });
});
