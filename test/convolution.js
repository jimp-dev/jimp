var Jimp = require("../index.js");

var lenna = new Jimp("lenna.png", function (err, image) {
    this.convolute([
      [-2,-1, 0],
      [-1, 1, 1],
      [ 0, 1, 2]
    ]).write("./output/lenna-convolution.jpg");
});
