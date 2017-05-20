var Jimp = require("../index.js");
var JPEG = require("jpeg-js");
var assert = require('assert');

var lenna = new Jimp("lenna.png", function(err, image) {
    this.quality(1).write("./output/lenna-copy.jpg", loadJPEG); // JPEG copy
    this.write("./output/lenna-copy.bmp", loadBMP); // BMP copy

    new Jimp(
        {
            buffer: image.bitmap.data,
            width: image.width,
            height: image.height
        },
        checkRaw
    );
});

function loadJPEG(){
    var jpg = new Jimp("./output/lenna-copy.jpg", function(err, image) {
        jpg.filterType(Jimp.PNG_FILTER_NONE).deflateLevel(0).invert().write("./output/lenna-invert.png");
    });
}

function loadBMP(){
    var jpg = new Jimp("./output/lenna-copy.bmp", function(err, image) {
        jpg.invert().write("./output/lenna-invert.bmp");
    });
}

function loadJPEGfromURL(){
    var jpg = new Jimp("https://pbs.twimg.com/profile_images/576731845196386304/NbMtcjUb.jpeg", function(err, image) {
        jpg.filterType(Jimp.PNG_FILTER_NONE).deflateLevel(0).invert().write("./output/url-invert.png");
    });
}

function checkRaw(err, image) {
    assert(!err, 'No error when creating from raw buffer.');
    assert(image.bitmap.data.length > 0, 'Image has data.');
}
