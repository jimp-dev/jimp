var Jimp = require("../jimp.js");

var bars = new Jimp(256, 256, function(err, image) {
    this.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var p = Math.floor(x / (this.bitmap.width / 5));
        this.bitmap.data[idx] = (p % 5 == 0 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+1] = (p % 5 == 1 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+2] = (p % 5 == 2 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+3] = (this.bitmap.height - 1) - y;
    });

    this.write("./output/bars.jpg");
    this.write("./output/bars.png");
});

Jimp.background = 0xFF0000FF;
var square = new Jimp(256, 256, function(err, image) {
    this.background(0x0000FFFF).rotate(45).write("./output/square.jpg");
});
