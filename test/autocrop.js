var Jimp = require("../index.js");

var imageBase = "peace.png";
var imageTransparent = "peace-transparent.png";
var imageWithOneColorBorder = "peace-with-border.png";
var imageWithManyColorsBorder = "peace-with-different-borders.png";

new Jimp(imageWithOneColorBorder, function (err, image) {
	if (err) {
  	  	return console.error("Error reading image", imageWithOneColorBorder, ":", err);
   	}
    this.autocrop();
    this.write("./output/" + imageWithOneColorBorder, function() {

        var p1 = Jimp.read(imageBase);
        var p2 = Jimp.read("./output/" + imageWithOneColorBorder);
    
        Promise.all([p1, p2]).then(function(images) {
    
            // compare image and imageWithOneColorBorder after autocrop for() equality
            var distance = Jimp.distance(images[0], images[1]);
            if (distance !== 0) {
                console.error("imageWithOneColorBorder after autocrop() differs by imageBase!");
            }
        }).catch(function (err) {
            console.error('t1:', err);
        });
    });
});

new Jimp(imageTransparent, function (err, image) {
    if (err) {
        return console.error("Error reading image", imageTransparent, ":", err);
    }
    this.autocrop();
    this.write("./output/" + imageTransparent, function() {

        var p1 = Jimp.read(imageBase);
        var p2 = Jimp.read("./output/" + imageTransparent);
    
        Promise.all([p1, p2]).then(function(images) {
    
            // compare image and imageTransparent after autocrop for() inequality
            var distance = Jimp.distance(images[0], images[1]);
            if (distance === 0) {
                console.error("imageTransparent after autocrop() does not differ from imageBase!");
            }
        }).catch(function (err) {
            console.error(err);
        });
    });
});
return;

new Jimp(imageWithManyColorsBorder, function (err, image) {
	if (err) {
		return console.error("Error reading image", imageWithManyColorsBorder, ":", err);
	}
    this.autocrop();
    this.write("./output/" + imageWithManyColorsBorder, function() {

        var p1 = Jimp.read(imageBase);
        var p2 = Jimp.read("./output/" + imageWithManyColorsBorder);
    
        Promise.all([p1, p2]).then(function(images) {
    
            // compare image and imageWithManyColorsBorder after autocrop for() inequality
            var distance = Jimp.distance(images[0], images[1]);
            if (distance === 0) {
                console.error("imageWithManyColorsBorder after autocrop() does not differ from imageBase!");
            }
        }).catch(function (err) {
            console.error(err);
        });
    });
});
