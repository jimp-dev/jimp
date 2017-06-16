/* eslint key-spacing: ["error", { "align": "value" }] */

var {Jimp, getTestDir, hasOwnProp} = require("./test-helper");

function openImage (imagePath) {
    return new Promise((resolve, reject)=> {
        new Jimp(imagePath, (err, image)=> {
            if (err) {
                reject(err);
            } else {
                resolve(image);
            }
        });
    });
}

function createImage (width, height) {
    return new Promise((resolve, reject)=> {
        new Jimp(width, height, (error, image)=> {
            if (error) {
                reject(error);
            } else {
                resolve(image);
            }
        });
    });
}

function createTextImage (width, height, font, options, maxWidth, maxHeight) {
    return Jimp.loadFont(font).then((font)=> {
        return createImage(width, height).then((image)=> {
            image.print(font, 0, 0, options, maxWidth, maxHeight);
            return image;
        });
    });
}

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

    it("left-align text by default", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/left-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, "This is only a test.", 100);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("left-align text by default when passing object", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/left-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test." }, 100);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("left-align text when passing object with alignmentX", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/left-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test.", alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT }, 100);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("center-align text when passing object with alignmentX", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/center-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test.", alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 100);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("right-align text when passing object with alignmentX", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/right-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test.", alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT }, 100);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("middle-align text when passing object with alignmentY", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/middle-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test.", alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE }, 100, 240);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });

    it("bottom-align text when passing object with alignmentY", function () {
        var expectedImage = openImage(getTestDir() + "/samples/text-samples/bottom-aligned.png");
        var textImage = createTextImage(320, 240, Jimp.FONT_SANS_16_BLACK, { text: "This is only a test.", alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM }, 100, 240);

        return Promise.all([expectedImage, textImage]).then((results)=> {
            results[0].bitmap.should.be.deepEqual(results[1].bitmap);
        });
    });
});
