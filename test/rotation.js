var Jimp = require("../jimp.js");

new Jimp("lenna.png", function (err, image) {
    var clone1 = image.clone();
    clone1.name = "lenna-rot-118";
    clone1.rotate(118, save);

    var clone2 = image.clone();
    clone2.name = "lenna-rot-noresize-118";
    clone2.rotate(118, false, save);
});

function save(err, image) {
    if (err) throw err;
    image.write("./output/" + image.name + ".png");
    image.write("./output/" + image.name + ".jpg");
}
