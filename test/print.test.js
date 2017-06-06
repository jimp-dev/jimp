/* eslint key-spacing: ["error", { "align": "value" }] */

var {Jimp, getTestDir, hasOwnProp} = require("./test-helper");

describe("Write text over image", function () {

    this.timeout(30000);

    var fontDefs = {
        SANS_8_BLACK:  {w: 28,  h: 28,  bg: 0xFFFFFFff},
        SANS_16_BLACK: {w: 54,  h: 54,  bg: 0xFFFFFFff},
        SANS_32_BLACK: {w: 114, h: 114, bg: 0xFFFFFFff},
        SANS_64_BLACK: {w: 220, h: 220, bg: 0xFFFFFFff},
        SANS_8_WHITE:  {w: 28,  h: 28,  bg: 0x000000ff},
        SANS_16_WHITE: {w: 54,  h: 54,  bg: 0x000000ff},
        SANS_32_WHITE: {w: 114, h: 114, bg: 0x000000ff},
        SANS_64_WHITE: {w: 220, h: 220, bg: 0x000000ff}
    };

    for (var fontName in fontDefs) if (hasOwnProp(fontDefs, fontName)) ((fontName, conf)=> {
        it("Jimp preset "+fontName+" bitmap font", function (done) {
            Jimp.loadFont(Jimp["FONT_"+fontName]).then(function (font) {
                var expected = getTestDir()+"/samples/text-samples/"+fontName+".png";
                new Jimp(expected, function (err, expectedImg) {
                    if (err) return done(err);
                    new Jimp(conf.w, conf.h, conf.bg, function (err, image) {
                        if (err) return done(err);
                        image.print(font, 0, 0, "This is only a test.", image.bitmap.width)
                             .bitmap.should.be.deepEqual(expectedImg.bitmap);
                        done()
                    });
                });
            }).catch(done);
        });
    })(fontName, fontDefs[fontName]);

    it("Jimp preset SANS_16_BLACK bitmap font positioned", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/SANS_16_BLACK-positioned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(300, 100, 0xFF8800ff, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 150, 50, "This is only a test.", 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

    it("left-align text by default", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/left-aligned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(320, 240, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 0, 0, "This is only a test.", 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

    it("left-align text by default when passing object", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/left-aligned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(320, 240, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 0, 0, {text:"This is only a test."}, 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

    it("left-align text when passing object with alignment", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/left-aligned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(320, 240, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 0, 0, {text:"This is only a test.", alignment:Jimp.HORIZONTAL_ALIGN_LEFT}, 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

    it("center-align text when passing object with alignment", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/center-aligned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(320, 240, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 0, 0, {text:"This is only a test.", alignment:Jimp.HORIZONTAL_ALIGN_CENTER}, 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

    it("right-align text when passing object with alignment", function (done) {
        Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
            var expected = getTestDir()+"/samples/text-samples/right-aligned.png";
            new Jimp(expected, function (err, expectedImg) {
                if (err) return done(err);
                new Jimp(320, 240, function (err, image) {
                    if (err) return done(err);
                    image.print(font, 0, 0, {text:"This is only a test.", alignment:Jimp.HORIZONTAL_ALIGN_RIGHT}, 100)
                         .bitmap.should.be.deepEqual(expectedImg.bitmap);
                    done()
                });
            });
        }).catch(done);
    });

});
