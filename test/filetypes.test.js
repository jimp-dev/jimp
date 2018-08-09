/* eslint-disable no-control-regex */

const fs = require('fs');
const should = require('should');
const { Jimp, getTestDir } = require('./test-helper');

describe('FileType', () => {
    const imagesDir = getTestDir() + '/samples';

    it('write uses original MIME type', done => {
        const writePath = './test-result';

        if (process.env.BABEL_ENV === undefined) {
            return done();
        }

        new Jimp(imagesDir + '/dice.png', function(err) {
            should.not.exist(err);

            this.write(writePath, (err, image) => {
                should.not.exist(err);

                should.exist(image);
                fs.existsSync(writePath).should.be.true();
                fs.unlinkSync(writePath);
                done();
            });
        });
    });

    it('should load from raw data', done => {
        new Jimp(imagesDir + '/dice.png', (err, image) => {
            new Jimp(
                {
                    data: image.bitmap.data,
                    width: image.getWidth(),
                    height: image.getHeight()
                },
                (err, res) => {
                    should.not.exist(err);
                    should.exist(res);
                    done();
                }
            );
        });
    });

    it('load PNG', done => {
        new Jimp(imagesDir + '/dice.png', function(err) {
            should.not.exist(err);
            this.getPixelColor(10, 10).should.be.equal(0x00000000);
            this.getPixelColor(160, 80).should.be.equal(0x1c1cd4ff);
            this.getPixelColor(400, 250).should.be.equal(0x7e0c0cda);
            done();
        });
    });

    it('load JPG', done => {
        new Jimp(imagesDir + '/cops.jpg', function(err) {
            should.not.exist(err);
            this.getPixelColor(10, 10).should.be.equal(0x3f4a02ff);
            this.getPixelColor(220, 190).should.be.equal(0x5d94b6ff);
            this.getPixelColor(350, 130).should.be.equal(0xdf7944ff);
            done();
        });
    });

    it('load JPG with fill bytes', done => {
        new Jimp(imagesDir + '/fillbytes.jpg', function(err) {
            should.not.exist(err);
            this.getPixelColor(10, 10).should.be.equal(0xaeb8c3ff);
            this.getPixelColor(220, 190).should.be.equal(0x262b21ff);
            this.getPixelColor(350, 130).should.be.equal(0x4e5d30ff);
            done();
        });
    });

    it('clones with the correct MIME type', done => {
        new Jimp(imagesDir + '/cops.jpg', function(err, image) {
            should.not.exist(err);
            const clone = image.clone();

            image.getMIME().should.be.equal(clone.getMIME());
            done();
        });
    });

    it('load BMP', done => {
        new Jimp(imagesDir + '/windows95.bmp', function(err) {
            should.not.exist(err);
            this.getPixelColor(10, 10).should.be.equal(0xeff7f7ff);
            this.getPixelColor(150, 80).should.be.equal(0x73add6ff);
            this.getPixelColor(190, 200).should.be.equal(0xf7c300ff);
            done();
        });
    });

    it('load TIFF', done => {
        new Jimp(imagesDir + '/rgb.tiff', function(err) {
            should.not.exist(err);
            this.getPixelColor(10, 10).should.be.equal(0xa4988bff);
            this.getPixelColor(220, 190).should.be.equal(0xe0d7ddff);
            this.getPixelColor(350, 130).should.be.equal(0x565433ff);
            done();
        });
    });

    const simpleJGD = {
        width: 3,
        height: 3,
        data: [
            0xff0000ff,
            0xff0080ff,
            0xff00ffff,
            0xff0080ff,
            0xff00ffff,
            0x8000ffff,
            0xff00ffff,
            0x8000ffff,
            0x0000ffff
        ]
    };

    it('export PNG', done => {
        new Jimp(simpleJGD, function(err) {
            should.not.exist(err);
            this.getBuffer('image/png', (err, buffer) => {
                should.not.exist(err);
                buffer.toString().should.match(/^.PNG\r\n/);
                done();
            });
        });
    });

    it('export JPG', done => {
        new Jimp(simpleJGD, function(err) {
            should.not.exist(err);
            this.getBuffer('image/jpeg', (err, buffer) => {
                should.not.exist(err);
                buffer.toString().should.match(/^.{3,9}JFIF\u0000/);
                done();
            });
        });
    });

    it('export BMP', done => {
        new Jimp(simpleJGD, function(err) {
            should.not.exist(err);
            this.getBuffer('image/bmp', (err, buffer) => {
                should.not.exist(err);
                buffer.toString().should.match(/^BMZ\u0000/);
                done();
            });
        });
    });

    it('export TIFF', done => {
        new Jimp(simpleJGD, function(err) {
            should.not.exist(err);
            this.getBuffer('image/tiff', (err, buffer) => {
                should.not.exist(err);
                buffer.toString().should.match(/^MM\u0000*\u0000/);
                done();
            });
        });
    });

    it('uses correct colors for BMP', done => {
        const testImage = getTestDir() + '/samples/windows95.bmp';
        const expectedImgDir = getTestDir() + '/samples/windows95.png';

        new Jimp(expectedImgDir, (err, expectedImg) => {
            should.not.exist(err);
            new Jimp(testImage, (err, image) => {
                should.not.exist(err);
                image.bitmap.data.should.be.deepEqual(expectedImg.bitmap.data);
                done();
            });
        });
    });
});
