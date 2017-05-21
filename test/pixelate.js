var Jimp = require("../index.js");

var lenna = new Jimp("lenna.png", function (err, image) {
  this.clone().pixelate(20, function(){
    this.write("./output/lenna-pixelate.jpg");
  });
  this.clone().pixelate(20, 100, 100, 312, 312).write("./output/lenna-pixelate-region.jpg");
});
