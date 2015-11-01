var Jimp = require("../index.js");

Jimp.read("lenna.png", function (err, lenna) {
    if (err) throw err;
    lenna.getBuffer(Jimp.MIME_PNG, function(err, data){
        Jimp.read(data).then(function(lenna2){
            lenna2.invert().write("./output/lenna-invert2.png"); // invert
        }).catch(function(err) {
            console.log(err);
        });
    });
});

Jimp.read("lenna.png").then(function (lenna) {
    lenna.invert().write("./output/lenna-invert.png"); // invert
}).catch(function (err) {
    console.log(err);
});

var image = new Jimp(256, 256, 0xFFFFFFFF);
image.write("./output/white.png");