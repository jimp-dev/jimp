var Jimp = require("../jimp.js");

var lenna = new Jimp("lenna.png", function(err, image) {
    this.quality(1).write("./output/lenna-copy.jpg", loadJPEG); // JPEG copy
});

function loadJPEG(){
    var jpg = new Jimp("./output/lenna-copy.jpg", function(err, image) {
        jpg.invert().write("./output/lenna-invert.png");
    });
}