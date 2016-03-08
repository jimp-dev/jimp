var Jimp = require("../index.js");

Jimp.read("lenna.png").then(function(image){
    image.clone().resize(256, 256).write("output/lenna-resize-default.png");
    
    image.clone().resize(256, 256, Jimp.RESIZE_NEAREST_NEIGHBOR).write("output/lenna-resize-nearest-neighbour.png");
    image.clone().resize(256, 256, Jimp.RESIZE_BILINEAR).write("output/lenna-resize-bilinear.png");
    image.clone().resize(256, 256, Jimp.RESIZE_BICUBIC).write("output/lenna-resize-bicubic.png");
    image.clone().resize(256, 256, Jimp.RESIZE_HERMITE).write("output/lenna-resize-hermite.png");
    image.clone().resize(256, 256, Jimp.RESIZE_BEZIER).write("output/lenna-resize-bezier.png");
});