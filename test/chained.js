var Jimp = require("../jimp.js");

// open a file called "lenna.png"
var lenna = new Jimp("lenna.png", function (err) {
    if (err) throw err;
    
    this.write("./output/lenna-copy.png") // PNG copy
        .write("./output/lenna-copy.jpg") // JPEG copy
        .quality(10).write("./output/lenna-copy-low.jpg").quality(100) // JPEG copy at 10 quality
        .invert().write("./output/lenna-invert.png").invert() // invert
        .rotate(90).write("./output/lenna-rotate.png").rotate(-90) // rotate
        .flip(true, false).write("./output/lenna-flip-horizontal.png").flip(true, false) // flip horizontal
        .flip(false, true).write("./output/lenna-flip-vertical.png").flip(false, true) // flip vertical

    // greyscale (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.greyscale().write("./output/lena-greyscale.png") // black and white
        });
    }); 
    
    // blur (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.blur(5).write("./output/lena-blur.png") // blur
        });
    }); 
    
    // Gaussian blur (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.gaussian(5).write("./output/lena-gaussian.png") // gaussian
        });
    }); 
    
    // resize (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.resize(64, 64).write("./output/lenna-resized.png") // resize
        });
    }); 
    
    // sepia (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.sepia().write("./output/lenna-sepia.png") // sepia
        });
    }); 
    
    // opacity (destructive)
    this.getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.opacity(0.5).write("./output/lenna-opacity.png") // opacity
        });
    }); 
    
    // crop (destructive)
    this.getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.crop(128, 192, 256, 128).write("./output/lenna-cropped.png") // opacity
        });
    }); 
    
    // scale and blit (destructive)
    this.getBuffer(Jimp.MIME_PNG, function(err, buffer) {
        if (err) throw err;
        var img = new Jimp(buffer, function () {
            this.scale(0.5).write("./output/lenna-scale.png") // scale
            lenna.greyscale().blit(this, Math.round(lenna.bitmap.width / 4), Math.round(lenna.bitmap.height / 4));
            lenna.write("./output/lenna-blitted.png")
        });
    });


});
