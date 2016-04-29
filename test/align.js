/**
** Test every align bits combinations in contain and cover methods
 **/

var Jimp = require("../index.js");

var p1 = Jimp.read("align-vertical.png");
var p2 = Jimp.read("align-horizontal.png");

Promise.all([p1, p2]).then(function (images) {
    var vertical = images[0];
    var horizontal = images[1];

    vertical.clone().cover(200, 100).write("./output/cover-align-vertical-default.png");
    horizontal.clone().cover(100, 200).write("./output/cover-align-horizontal-default.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-vertical-top-left.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-horizontal-top-left.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-vertical-top-center.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-horizontal-top-center.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-vertical-top-right.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP).write("./output/cover-align-horizontal-top-right.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-vertical-middle-left.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-horizontal-middle-left.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-vertical-middle-center.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-horizontal-middle-center.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-vertical-middle-right.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/cover-align-horizontal-middle-right.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-vertical-bottom-left.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-horizontal-bottom-left.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-vertical-bottom-center.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-horizontal-bottom-center.png");

    vertical.clone().cover(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-vertical-bottom-right.png");
    horizontal.clone().cover(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/cover-align-horizontal-bottom-right.png");

    vertical.clone().contain(200, 100).write("./output/contain-align-vertical-default.png");
    horizontal.clone().contain(100, 200).write("./output/contain-align-horizontal-default.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-vertical-top-left.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-horizontal-top-left.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-vertical-top-center.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-horizontal-top-center.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-vertical-top-right.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_TOP).write("./output/contain-align-horizontal-top-right.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-vertical-middle-left.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-horizontal-middle-left.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-vertical-middle-center.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-horizontal-middle-center.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-vertical-middle-right.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_MIDDLE).write("./output/contain-align-horizontal-middle-right.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-vertical-bottom-left.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-horizontal-bottom-left.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-vertical-bottom-center.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-horizontal-bottom-center.png");

    vertical.clone().contain(200, 100, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-vertical-bottom-right.png");
    horizontal.clone().contain(100, 200, Jimp.HORIZONTAL_ALIGN_RIGHT | Jimp.VERTICAL_ALIGN_BOTTOM).write("./output/contain-align-horizontal-bottom-right.png");

}).catch(function (err) {
    console.log(err);
});