const { Jimp, getTestDir } = require('./test-helper');

describe('FileType', () => {
    const imagesDir = getTestDir() + '/samples';

    it('load PNG', done => {
        new Jimp(imagesDir + '/dice.png')
            .then(image => {
                image.getPixelColor(10, 10).should.be.equal(0x00000000);
                image.getPixelColor(160, 80).should.be.equal(0x1c1cd4ff);
                image.getPixelColor(400, 250).should.be.equal(0x7e0c0cda);
                done();
            })
            .catch(done);
    });

    it('load JPG', done => {
        new Jimp(imagesDir + '/cops.jpg')
            .then(image => {
                image.getPixelColor(10, 10).should.be.equal(0x3f4a02ff);
                image.getPixelColor(220, 190).should.be.equal(0x5d94b6ff);
                image.getPixelColor(350, 130).should.be.equal(0xdf7944ff);
                done();
            })
            .catch(done);
    });

    it('load JPG with fill bytes', done => {
        new Jimp(imagesDir + '/fillbytes.jpg')
            .then(image => {
                image.getPixelColor(10, 10).should.be.equal(0xaeb8c3ff);
                image.getPixelColor(220, 190).should.be.equal(0x262b21ff);
                image.getPixelColor(350, 130).should.be.equal(0x4e5d30ff);
                done();
            })
            .catch(done);
    });

    it('load BMP', done => {
        new Jimp(imagesDir + '/windows95.bmp')
            .then(image => {
                image.getPixelColor(10, 10).should.be.equal(0xf7f7ef);
                image.getPixelColor(150, 80).should.be.equal(0xd6ad73);
                image.getPixelColor(190, 200).should.be.equal(0xc3f7);
                done();
            })
            .catch(done);
    });

    it('load TIFF', done => {
        new Jimp(imagesDir + '/rgb.tiff')
            .then(image => {
                image.getPixelColor(10, 10).should.be.equal(0xa4988bff);
                image.getPixelColor(220, 190).should.be.equal(0xe0d7ddff);
                image.getPixelColor(350, 130).should.be.equal(0x565433ff);
                done();
            })
            .catch(done);
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
        new Jimp(simpleJGD).getBuffer('image/png', (err, buffer) => {
            buffer.toString().should.match(/^.PNG\r\n/);
            done();
        });
    });

    it('export JPG', done => {
        new Jimp(simpleJGD).getBuffer('image/jpeg', (err, buffer) => {
            buffer.toString().should.match(/^.{3,9}JFIF\u0000/);
            done();
        });
    });

    it('export BMP', done => {
        new Jimp(simpleJGD).getBuffer('image/bmp', (err, buffer) => {
            buffer.toString().should.match(/^BMZ\u0000/);
            done();
        });
    });

    it('export TIFF', done => {
        new Jimp(simpleJGD).getBuffer('image/tiff', (err, buffer) => {
            buffer.toString().should.match(/^MM\u0000*\u0000/);
            done();
        });
    });
});
