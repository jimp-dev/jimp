var Jimp = require("../index.js");

new Jimp("panoramic.jpg", function (err, image) {
    this.scale(0.1);
    for (var r = 0; r <= 360; r += 10) {
        this.clone().rotate(r).write("./output/panoramic" + "-" + r + ".jpg");
    }
});
