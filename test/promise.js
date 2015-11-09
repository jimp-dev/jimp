var Jimp = require("../index.js");

var p1 = Jimp.read("lenna.png");
var p2 = Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");

Promise.all([p1, p2]).then(function (images) {
    images[0].getBuffer(Jimp.MIME_PNG, function(err, data){
        Jimp.read(data).then(function(lenna){
            lenna.invert().write("./output/lenna-buffer.jpg"); // save buffer
        }).catch(function(err) {
            console.log(err);
        });
    });
    images[1].write("./output/test-from-url.png");
}).catch(function (err) {
    console.log(err);
});

var image = new Jimp(256, 256, 0xFFFFFFFF);
image.write("./output/white.png");
