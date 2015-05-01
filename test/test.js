var Jimp = require("../jimp.js");

// open a file called "lenna.png"
var lenna = new Jimp("lenna.png", function () {
    this.resize(220, 220) // resize
        .write("./output/lenna-small.png") // save
        .quality(60) // set JPEG quality
        .write("./output/lenna-small.jpg") // save as JPEG
        .greyscale() // set greyscale
        .write("./output/lena-small-bw.png") // save again
        .crop(80, 100, 80, 50) // crop
        .write("./output/lena-small-bw-cropped.png"); // save again
});
