var Jimp = require("../index.js");
var fs = require('fs');
var assert = require('assert');

new Jimp("panoramic.jpg", function (err, image) {
    this.write('./tmp/images/panoramic-out.jpg');
    assert.equal(fs.existsSync('./tmp/images/panoramic-out.jpg'), true);
    this.write('panoramic-out.jpg');
    assert.equal(fs.existsSync('panoramic-out.jpg'), true);
});
