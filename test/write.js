var Jimp = require("../index.js");
var fs = require('fs');
var assert = require('assert');

new Jimp("panoramic.jpg", function (err, image) {
    this.write('./output/subdir/panoramic.jpg');
    assert.equal(fs.existsSync('./output/subdir/panoramic.jpg'), true);
});
