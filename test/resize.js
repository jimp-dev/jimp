var Jimp = require("../index.js");

var hamburg;

hamburg = new Jimp("hamburg.jpg", function (err, image)
{
    for (var i = 0; i < Jimp.allResizeModes.length; i++)
    {
        var m = Jimp.allResizeModes[i];
        this.clone().resizeMode(m).resize(1000, Jimp.AUTO).write("./output/hamburg-" + m + "-out.jpg");
    }
});
