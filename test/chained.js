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
        .flip(false, true).write("./output/lenna-flip-vertical.png").flip(false, true); // flip vertical

    // brightness (destructive)
    this.clone().brightness(+0.75).write("./output/lenna-brightness-higher.png");

    // brightness (destructive)
    this.clone().brightness(-0.75).write("./output/lenna-brightness-lower.png");
    
    // contrast (destructive)
    this.clone().contrast(0.75).write("./output/lenna-contrast-higher.png");

    // contrast (destructive)
    this.clone().contrast(-0.75).write("./output/lenna-contrast-lower.png");
    
    // posterize (destructive)
    this.clone().posterize(4).write("./output/lenna-posterize.png");
    
    // greyscale (destructive)
    this.clone().greyscale().write("./output/lenna-greyscale.png");
    
    // blur (destructive)
    this.clone().blur(5).write("./output/lenna-blur.png");
    
    // Gaussian blur (destructive)
    this.clone().gaussian(5).write("./output/lenna-gaussian.png");
    
    // resize (destructive)
    this.clone().resize(64, 64).write("./output/lenna-resized.png");
    
    // sepia (destructive)
    this.clone().sepia().write("./output/lenna-sepia.png");
    
    // opacity (destructive)
    this.clone().opacity(0.5).write("./output/lenna-opacity.png");
    
    // crop (destructive)
    this.clone().crop(128, 192, 256, 128).write("./output/lenna-cropped.png");
    
    // scale and blit (destructive)
    this.clone().blit(this.clone().scale(0.5).write("./output/lenna-scale.png"), this.bitmap.width / 4, this.bitmap.height / 4).write("./output/lenna-blit.png");

    // compositing (destructive)
    var dice = new Jimp("dice.png", function (err) {
        lenna.clone().composite(this.scale(0.5), lenna.bitmap.width / 2 - this.bitmap.width / 2, lenna.bitmap.height / 2 - this.bitmap.height / 2).write("./output/lenna-composite.png");
    });
    

});
