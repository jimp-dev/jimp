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
    "rotate": [90]
};

for (var op in operations) process(op);

function process(op) {
    new Jimp("lenna.png", function(err, image) {
        image.name = "lenna-" + op;
        image[op].apply(this, operations[op].concat(save));
    });
}

// TODO: blit example

function save(err, image) {
    if (err) throw err;
    image.write("./output/" + image.name + ".png");
    image.write("./output/" + image.name + ".jpg");
}
