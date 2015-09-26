var Jimp = require("../jimp.js");

(function process() {
    new Jimp("lenna.png", function (err, image) {
        var clone = image.clone().scale(0.25);

        image.name = "lenna-rot-118";
        image.rotate2(118, save);
    });
})();

function save(err, image) {
    if (err) throw err;
    image.write("./output/" + image.name + ".png");
    image.write("./output/" + image.name + ".jpg");
}
