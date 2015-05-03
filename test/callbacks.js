var Jimp = require("../jimp.js");

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
    "rotate": [90],
    "brightness": [0.75],
    "contrast": [0.75],
    "posterize": [5]
};

for (var op in operations) process(op);

function process(op) {
    new Jimp("lenna.png", function(err, image) {
        var clone = image.clone().scale(0.25);
        
        image.name = "lenna-" + op;
        image[op].apply(this, operations[op].concat(save));
        
        image.name = "lenna-" + op + "-blit";
        image.blit(clone, 0, 0, save);
        
        image.name = "lenna-" + op + "-composite";
        image.composite(clone, 0, 0, save);
    });
}

function save(err, image) {
    if (err) throw err;
    image.write("./output/" + image.name + ".png");
    image.write("./output/" + image.name + ".jpg");
}
