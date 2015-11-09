var Jimp = require("../index.js");

var p1 = Jimp.read("The_Commissar_Vanishes_A.jpg");
var p2 = Jimp.read("The_Commissar_Vanishes_B.jpg");

Promise.all([p1, p2]).then(function(images){
    var diff = Jimp.diff(images[0], images[1]);
    
    // PixelMatch
//    console.log("PixelMatch: " + diff.percent)
    if ("number" != typeof diff.percent)
        console.error("Percent is not a number");
    
    diff.image.write("./output/diff.png");
    
    // pHash
    var hash_a = images[0].hash();
    var hash_b = images[1].hash(2, function(err, hash){
        return hash;
    });
    
//    var white = new Jimp(256, 256, 0xFFFFFFFF);
//    console.log("W: " + white.hash(2));
//    var black = new Jimp(256, 256, 0x000000FF);
//    console.log("B: " + black.hash(2));
    
//    console.log("A: " + hash_a);
//    console.log("B: " + hash_b);
    if ("string" != typeof hash_a)
        console.error("Hash is not a number");
    
    var distance = Jimp.distance(images[0], images[1]);
//    console.log("pHash: " + distance);
    if ("number" != typeof distance)
        console.error("Distance is not a number");
    
}).catch(function (err) {
    console.error(err);
});
