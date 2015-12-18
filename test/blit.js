var Jimp = require("../index.js");

var p1 = Jimp.read("lenna.png");
var p2 = Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");

Promise.all([p1, p2]).then(function (images) {
    var lenna = images[0];
    var bucket = images[1].scale(0.5);
    
    lenna.clone().blit(bucket, 0, 0).write("./output/blit1.png");
    lenna.clone().blit(bucket, 50, 50, 50, 50, 128, 128).write("./output/blit2.png");
    lenna.clone().blit(bucket, 0, 0, 50, 50, 128, 128).write("./output/blit3.png");
}).catch(function (err) {
    console.log(err);
});
