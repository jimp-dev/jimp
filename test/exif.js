var Jimp = require("../index.js");

Promise.all([
    Jimp.read("./exif-orientation/Landscape_1.jpg"),
    Jimp.read("./exif-orientation/Landscape_2.jpg"),
    Jimp.read("./exif-orientation/Landscape_3.jpg"),
    Jimp.read("./exif-orientation/Landscape_4.jpg"),
    Jimp.read("./exif-orientation/Landscape_5.jpg"),
    Jimp.read("./exif-orientation/Landscape_6.jpg"),
    Jimp.read("./exif-orientation/Landscape_7.jpg"),
    Jimp.read("./exif-orientation/Landscape_8.jpg"),
    Jimp.read("./exif-orientation/Portrait_1.jpg"),
    Jimp.read("./exif-orientation/Portrait_2.jpg"),
    Jimp.read("./exif-orientation/Portrait_3.jpg"),
    Jimp.read("./exif-orientation/Portrait_4.jpg"),
    Jimp.read("./exif-orientation/Portrait_5.jpg"),
    Jimp.read("./exif-orientation/Portrait_6.jpg"),
    Jimp.read("./exif-orientation/Portrait_7.jpg"),
    Jimp.read("./exif-orientation/Portrait_8.jpg")
]).then(function(images){
    for (var i = 0; i < images.length; i++) {
        images[i].write("./output/exif-" + i + ".png");
    }
}).catch(function (err) {
    console.error(err);
});