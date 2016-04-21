var Jimp = require("../index.js");

var operations = {
    "crop": [128, 192, 256, 128],
    "invert": [],
    "flip": [true, false],
    "gaussian": [5],
    "blur": [5],
    "greyscale": [],
    "sepia": [],
    "opacity": [0.5],
    "resize": [64, 64],
    "scale": [0.5],
    "rotate": [-45, false],
    "brightness": [0.75],
    "contrast": [0.75],
    "posterize": [5],
    "dither565": [],
    "background": [0xFF000000],
    "cover": [250, 125],
    "contain": [250, 125],
    "opaque": [],
    "mirror": [false, true],
    "fade": [0.75],
    "scaleToFit": [256, 128]
};

for (var op in operations) process(op);

function process(op) {
    new Jimp("lenna.png", function(err, image) {
        var clone = image.clone().scale(0.25);
        
        var args = ((operations[op].length > 0) ? "-" + operations[op].join("-") : "")
        image.name = "lenna-" + op + args;
        image[op].apply(this, operations[op].concat(save));
        
        image.name = "lenna-" + op + args + "-blit";
        image.blit(clone, 0, 0, save);
        
        image.name = "lenna-" + op + args + "-composite";
        image.composite(clone, 0, 0, save);
    });
}

var mask = new Jimp("mask.png", function(err, image) {
    var lenna = new Jimp("lenna.png", function(err, image) {
        lenna.name = "lenna-mask";
        lenna.mask(mask, 0, 0, save)
    });
});

function save(err, image) {
    if (err) throw err;
    image.write("./output/" + image.name + ".png");
    image.rgba(false).write("./output/" + image.name + "-noalpha.png");
    image.write("./output/" + image.name + ".jpg");
    image.write("./output/" + image.name + ".bmp");
}
