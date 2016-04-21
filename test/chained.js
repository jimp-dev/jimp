var Jimp = require("../index.js");

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

    var dice = new Jimp("dice.png", function (err) {
        // compositing (destructive)
        lenna.clone().composite(dice.clone().scale(0.5), lenna.bitmap.width / 2 - dice.bitmap.width / 2, lenna.bitmap.height / 2 - dice.bitmap.height / 2).write("./output/lenna-composite.png");
        dice.clone().rgba(false).write("./output/dice-noalpha.png");
        dice.clone().rgba(true).write("./output/dice-alpha.png");
    });
    
    // masking (destructive)
    var mask = new Jimp("mask.png", function (err) {
        lenna.clone().mask(mask, 0, 0).write("./output/lenna-mask.png");
    });
    
    this.clone().dither565().write("./output/lenna-565-bit.png");

    this.clone().cover(250, 125).write("./output/lenna-cover-250x125.png");
    this.clone().cover(125, 250).write("./output/lenna-cover-125x250.png");
    this.clone().cover(750, 500).write("./output/lenna-cover-750x500.png");
    this.clone().cover(500, 750).write("./output/lenna-cover-500x750.png");
    this.clone().cover(750, 750).write("./output/lenna-cover-750x750.png");

    this.clone().background(0xFF0000FF).contain(250, 125).write("./output/lenna-contain-250x125.png");
    this.clone().background(0x00FF00FF).contain(125, 250).write("./output/lenna-contain-125x250.png");
    this.clone().background(0x0000FFFF).contain(750, 500).write("./output/lenna-contain-750x500.png");
    this.clone().background(0xFFFF00FF).contain(500, 750).write("./output/lenna-contain-500x750.png");
    this.clone().background(0xFF00FFFF).contain(750, 750).write("./output/lenna-contain-750x750.png");
    
    this.clone().rotate(45).write("./output/lenna-rotate-45.png");
    this.clone().rotate(-45, false).write("./output/lenna-rotate-45ccw-noresize.png");
    
    this.clone().fade(0.75).write("./output/lenna-fade.png")
        .mirror(false, true).write("./output/lenna-fade-mirror.png")
        .opaque().write("./output/lenna-opaque.png");
    
    this.clone().resize(Jimp.AUTO, 1024).write("./output/lenna-resize-auto-2014.png");
    this.clone().resize(128, Jimp.AUTO).write("./output/lenna-resize-128-auto.png");

    this.clone().scaleToFit(256, 128).write("./output/lenna-scaleToFit-256-128.png");
});
