var Jimp = require("../jimp.js");

var lenna = new Jimp("lenna.png", function(err, image) {
    this.quality(1).write("./output/lenna-copy.jpg", loadJPEG); // JPEG copy
    this.write("./output/lenna-copy.bmp", loadBMP); // BMP copy
});

function loadJPEG(){
    var jpg = new Jimp("./output/lenna-copy.jpg", function(err, image) {
        jpg.invert().write("./output/lenna-invert.png");
    });
}

function loadBMP(){
    var jpg = new Jimp("./output/lenna-copy.bmp", function(err, image) {
        jpg.invert().write("./output/lenna-invert.bmp");
    });
}