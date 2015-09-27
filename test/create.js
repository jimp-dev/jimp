var Jimp = require("../jimp.js");

var bars = new Jimp(256, 256, function(err, image) {
    this.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var p = Math.floor(x / (this.bitmap.width / 5));
        this.bitmap.data[idx] = (p % 5 == 0 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+1] = (p % 5 == 1 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+2] = (p % 5 == 2 || p % 5 == 4) ? 255 : 0;
        this.bitmap.data[idx+3] = (this.bitmap.height - 1) - y;
    });

    this.background(0xFFFFFF00).write("./output/bars.jpg");
    this.write("./output/bars.png");
    
    for (var x = 0; x < 256; x++) {
        for (var y = 0; y < 128; y++) {
            var hex = this.getPixelColor(x, y); // e.g. 0xFF000FF
            var rgba = Jimp.intToRGBA(hex); // e.g. {r: 255, g: 255, b: 255, a:255}
            
            var tmp = rgba.b;
            rgba.b = rgba.r;
            rgba.r = tmp;
            
            var hex2 = Jimp.rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a);
            this.setPixelColor(hex2, x, y);
        }
    }
    
    this.write("./output/bars-tweaked.png");
});

var square = new Jimp(256, 256, 0xFF0000FF,function(err, image) {
    this.background(0x0000FFFF).rotate(45).write("./output/square.jpg");
});
