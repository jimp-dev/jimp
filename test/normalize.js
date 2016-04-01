var Jimp = require("../index.js");

new Jimp("lenna.png", function (err, image) {
	this.normalize().quality(80);

	var p2 = Jimp.read("./normalize/lenna-normalized.jpg", function(error, baseImage) {
		var distance = Jimp.distance(image, baseImage);
		var difference = Jimp.diff(image, baseImage);

		if (distance > 0.15 && difference.percent > 0.15) {
			console.error("Error: Normalized image doesn't match expected image.");
		}
	});
});
