var {Jimp, getTestDir} = require("./test-helper");

describe("FileType", ()=> {

    var imagesDir = getTestDir() + "/samples";

    it("load PNG", (done)=> {
        new Jimp(imagesDir+"/dice.png", function (err, image) {
            if (err) done(err);
            this.getPixelColor(10,   10).should.be.equal(0x00000000);
            this.getPixelColor(160,  80).should.be.equal(0x1C1CD4ff);
            this.getPixelColor(400, 250).should.be.equal(0x7E0C0Cda);
            done();
        });
    });

    it("load JPG", (done)=> {
        new Jimp(imagesDir+"/cops.jpg", function (err, image) {
            if (err) done(err);
            this.getPixelColor(10,   10).should.be.equal(0x3F4A02ff);
            this.getPixelColor(220, 190).should.be.equal(0x5D94B6ff);
            this.getPixelColor(350, 130).should.be.equal(0xDF7944ff);
            done();
        });
    });

    it("load BMP", (done)=> {
        new Jimp(imagesDir+"/windows95.bmp", function (err, image) {
            if (err) done(err);
            this.getPixelColor(10,   10).should.be.equal(0xF7F7EFff);
            this.getPixelColor(150,  80).should.be.equal(0xD6AD73ff);
            this.getPixelColor(190, 200).should.be.equal(0x00C3F7ff);
            done();
        });
    });

    it("load TIFF", (done)=> {
        new Jimp(imagesDir+"/rgb.tiff", function (err, image) {
            if (err) done(err);
            this.getPixelColor(10,   10).should.be.equal(0xCC3767A2);
            this.getPixelColor(220, 190).should.be.equal(0x65B39725);
            this.getPixelColor(350, 130).should.be.equal(0x58D69735);
            done();
        });
    });

    var simpleJGD = {
        width: 3,
        height: 3,
        data: [
            0xFF0000ff, 0xFF0080ff, 0xFF00FFff,
            0xFF0080ff, 0xFF00FFff, 0x8000FFff,
            0xFF00FFff, 0x8000FFff, 0x0000FFff
        ]
    };

    it("export PNG", (done)=> {
        new Jimp(simpleJGD, function (err, image) {
            if (err) done(err);
            this.getBuffer('image/png', function (err, buffer) {
                if (err) done(err);
                buffer.toString().should.match(/^.PNG\r\n/);
                done();
            });
        });
    });

    it("export JPG", (done)=> {
        new Jimp(simpleJGD, function (err, image) {
            if (err) done(err);
            this.getBuffer('image/jpeg', function (err, buffer) {
                if (err) done(err);
                buffer.toString().should.match(/^.{3,9}JFIF\u0000/);
                done();
            });
        });
    });

    it("export BMP", (done)=> {
        new Jimp(simpleJGD, function (err, image) {
            if (err) done(err);
            this.getBuffer('image/bmp', function (err, buffer) {
                if (err) done(err);
                buffer.toString().should.match(/^BMZ\u0000/);
                done();
            });
        });
    });

    it("export TIFF", (done)=> {
        new Jimp(simpleJGD, function (err, image) {
            if (err) done(err);
            this.getBuffer('image/tiff', function (err, buffer) {
                if (err) done(err);
                buffer.toString().should.match(/^MM\u0000*\u0000/);
                done();
            });
        });
    });

});
