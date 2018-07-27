const fs = require('fs');
const should = require('should');
const { Jimp, getTestDir } = require('./test-helper');

const imagesDir = getTestDir() + '/samples';

describe.only('Async functions', () => {
    it('write returns promise', done => {
        const writePath = './test.png';

        // process.env is undefined in the browser tests. If BABEL_ENV
        // isn't found don't run this test in the browser
        if (process.env.BABEL_ENV === undefined) {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            if (err) done(err);

            this.write(writePath, 'async').then(image => {
                should.exist(image);
                fs.existsSync(writePath).should.be.true();
                fs.unlinkSync(writePath);
                done();
            });
        });
    });

    it('getBuffer returns promise', done => {
        if (process.env.BABEL_ENV === undefined) {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            if (err) done(err);

            this.getBuffer(Jimp.AUTO, 'async').then(buffer => {
                should.exist(buffer);
                done();
            });
        });
    });
});
