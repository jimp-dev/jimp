var Jimp = require("../index.js");

var lenna = new Jimp("lenna.png", function (err, image) {
    this.resize(600, Jimp.AUTO).color([
        { apply: 'hue', params: [ -90 ] },
        { apply: 'lighten', params: [ 50 ] }
    ]).write("./output/lenna-washed-out.jpg");
});

var lenna = new Jimp("lenna.png", function (err, image) {
    this.color([
        { apply: 'lighten', params: [ 75 ] },
        { apply: 'brighten', params: [ 25 ] },
        { apply: 'darken', params: [ 25 ] },
        { apply: 'desaturate', params: [ 25 ] },
        { apply: 'greyscale', params: [ 33 ] },
        { apply: 'spin', params: [ 180 ] },
        { apply: 'hue', params: [ 50 ] },
        { apply: 'red', params: [ 50 ] },
        { apply: 'green', params: [ 50 ] },
        { apply: 'blue', params: [ 50 ] }
    ]).write("./output/lenna-mangled.jpg");
});

//**mix** {color, amount} | Mixes colors by their RGB component values. Amount is opacity of overlaying color
//**tint** {amount}       | Same as applying **mix** with white color
//**shade** {amount}      | Same as applying **mix** with black color
//**xor** {color}         | Treats the two colors as bitfields and applies an XOR operation to the red, green, and blue components
