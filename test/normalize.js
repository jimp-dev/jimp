var Jimp = require("../index.js");

new Jimp("lenna.png", function (err, image) {
	this.write("./output/lenna-original.png")
        .clone().normalize().quality(80).write("./output/lenna-normalized.png");
});