var {Jimp, getTestDir} = require("./test-helper");

describe("Load files", function () {

    it("Load images", function (done) {
        var p1 = Jimp.read(getTestDir()+"/samples/lenna.png");
        var p2 = Jimp.read(getTestDir()+"/samples/cops.jpg");

        Promise.all([p1, p2]).then(function (images) {
            images[0].getMIME().should.be.equal("image/png");
            images[1].getMIME().should.be.equal("image/jpeg");
            done();
        }).catch(done);
    });

    it("Load font", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            font.chars.A.id.should.be.equal(65);
            done();
        }).catch(done);
    });

});
