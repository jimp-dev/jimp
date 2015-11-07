var Jimp = require("../index.js");
var FS = require("fs");
var Path = require('path')

Jimp.read("lenna.png").then(function(image){
    var h = image.hash();
    console.log(h);
}).catch(function(err) {
    console.log(err);
});


var files = FS.readdirSync("./phash/misc/");
files.forEach(function (file, i) {
    files[i] = Path.basename(file, Path.extname(file));
});

var total = 0;
var correct = 0;
var false_p = 0;
var false_n = 0;

for (var i = 0; i < files.length; i++) {
    testFile1(files[i], i);
}

function testFile1(file1, ii) {
    for (var i = ii; i < files.length; i++) {
        testFile2(file1, files[i], i, ii);
    }
}

function testFile2(file1, file2, i, ii) {
    var p1 = Jimp.read("./phash/misc/" + file1 + ".bmp");
    var p2 = Jimp.read("./phash/compr/" + file2 + ".jpg");
    Promise.all([p1, p2]).then(function(images){
        var c = Jimp.compare(images[0], images[1]);
        if (c > 0.85) {
            if (file1 != file2) {
                console.log("False positive: ", file1, file2, c);
                false_p++;
            }
        } else {
            if (file1 == file2) {
                console.log("False negative: ", file1, c);
                false_n++;
            } else {
                correct++;
            }
        }
        total++;

        if (i == files.length - 1 && ii == files.length - 1) {
            setTimeout(function(){
                console.log("Correct: " + correct + " " + Math.round(correct/total * 100) + "%");
                console.log("False positives: " + false_p + " " + Math.round(false_p/(total-files.length) * 100) + "%");
                console.log("False negatives: " + false_n + " " + Math.round(false_n/files.length * 100) + "%");
                console.log("Total: " + total + " " + Math.round(total/total * 100) + "%");
            }, 10e3);
        }
    }).catch(function(err){
        console.error("Error:" + err);
    });
}
