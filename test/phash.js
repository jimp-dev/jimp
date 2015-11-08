var Jimp = require("../index.js");
var FS = require("fs");
var Path = require('path')

Jimp.read("lenna.png").then(function(image){
    var h = image.hash();
    // console.log(h);
}).catch(function(err) {
    console.log(err);
});


var files = FS.readdirSync("./samples/original/");
files.forEach(function (file, i) {
    files[i] = Path.basename(file, Path.extname(file));
});

var total = 0;
var correct = 0;
var false_p = 0;
var false_n = 0;

var c1 = 0;
var c2 = 0;
function nextFile(){
    console.log(c1, c2);
    testFile(files[c1], files[c2]);
}
nextFile();

//var c = 0;
//function modify(file){
//    Jimp.read("./samples/original/" + file + ".jpg").then(function(image){
//        var scale = (Math.round(Math.random() * 4) + 1) / 5;
//        image.quality(60).resize(640, Jimp.AUTO);
//        image.write("./samples/png/" + file + ".png", function(){
//            image.write("./samples/jpeg/" + file + ".jpg", function(){
//                console.log(++c);
//                if (files.length > 0) modify(files.pop());
//            });
//        });
//    }).catch(function(err){
//        console.log(err);
//    });
//}
//modify(files.pop());

function testFile(file1, file2) {
    var p1 = Jimp.read("./samples/jpeg/" + file1 + ".jpg");
    var p2 = Jimp.read("./samples/png/" + file2 + ".png");

    Promise.all([p1, p2]).then(function(images){
        var c = Jimp.distance(images[0], images[1]);
        var diff = Jimp.diff(images[0], images[1].clone().resize(images[0].bitmap.width, images[0].bitmap.height)).percent;
        if (c < 0.15 || diff < 0.15) {
            if (file1 != file2) {
                console.log("False positive: ", file1, file2, c, diff);
                false_p++;
            } else {
                correct++;
            }
        } else {
            if (file1 == file2) {
                console.log("False negative: ", file1, c, diff);
                false_n++;
            } else {
                correct++;
            }
        }
        
        total++;

        c1++;
        if (c1 > files.length -1) {
            c1 = 0;
            c2++;
        }

        if (c2 > files.length -1) {
            console.log("Correct: " + correct + " " + Math.round(correct/total * 100) + "%");
            console.log("False positives: " + false_p + " " + Math.round(false_p/(total-files.length) * 100) + "%");
            console.log("False negatives: " + false_n + " " + Math.round(false_n/files.length * 100) + "%");
            console.log("Total: " + total + " " + Math.round(total/total * 100) + "%");
        } else {
            nextFile();
        }
    }).catch(function(err){
        console.error("Error:" + err);
    });
}
