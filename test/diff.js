var Jimp = require("../index.js");

var p1 = Jimp.read("The_Commissar_Vanishes_A.jpg");
var p2 = Jimp.read("The_Commissar_Vanishes_B.jpg");

Promise.all([p1, p2]).then(function(images){
    var diff = Jimp.diff(images[0], images[1], 0.5);
    
    if ("number" != typeof diff.percent)
        throw("Percent is not a number");
    
    diff.image.write("./output/diff.png");
}).catch(function (err) {
    console.error(err);
});
