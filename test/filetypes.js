var Jimp = require("../index.js");

var lenna = new Jimp("lenna.png", function(err, image) {
    this.exifRotate().quality(60).write("./output/lenna-copy.jpg", loadJPEG); // JPEG copy
    this.write("./output/lenna-copy.bmp", loadBMP); // BMP copy
});

function loadJPEG(){
    var jpg = new Jimp("./output/lenna-copy.jpg", function(err, image) {
        jpg.filterType(Jimp.PNG_FILTER_NONE).deflateLevel(0).invert().write("./output/lenna-invert.png");
    });
}

function loadBMP(){
    var bmp = new Jimp("./output/lenna-copy.bmp", function(err, image) {
        bmp.invert().write("./output/lenna-invert.gif");
    });
}

function loadJPEGfromURL(){
    var jpg = new Jimp("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg", function(err, image) {
        jpg.filterType(Jimp.PNG_FILTER_NONE).deflateLevel(0).invert().write("./output/url-invert.png");
    });
}

loadJPEGfromURL();


var moon = new Jimp("moon.gif", function(err, image) {
    this.write("./output/moon.png"); // BMP copy
    this.write("./output/moon.jpg"); // BMP copy
    this.write("./output/moon.bmp"); // BMP copy
});
