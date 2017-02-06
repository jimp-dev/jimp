var should = require("should"); // Ensure should to load in browser through browserify.

var shouldAssertion = {}.should.be.constructor.prototype;
//var shouldAssertion = should.constructor.prototype;

var sup = "⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠ";

function jgdReadableMatrix(img) {
    var rMatrix = [], line = [], len = img.data.length;
    for (var i=0; i<len; i++) {
        var pix = img.data[i].toString(16).toUpperCase();
        while (pix.length < 8) pix = "0"+pix;
        line.push(pix.replace(/(..)(..)(..)(.)(.)/, (sel, r, g, b, a1, a2)=> {
            var a = sup[parseInt(a1,16)] + sup[parseInt(a2,16)];
            return r+"-"+g+"-"+b+a
        }));
        if (i>0 && (i+1)%img.width==0) {
            rMatrix.push(line.join(" "));
            line = [];
        }
    }
    return rMatrix.join("\n");
}

shouldAssertion.sameJGD = function sameJGD(targetJGD, message) {
    if (!message) message = "";
    var testJGD = this.obj;
    testJGD.width.should.be.equal(targetJGD.width, "Width is not the expected."+message);
    testJGD.height.should.be.equal(targetJGD.height, "Height is not the expected."+message);
    var matrixMsg = message ? message : "The pixel matrix is not the expected."
    jgdReadableMatrix(testJGD).should.be.equal(jgdReadableMatrix(targetJGD), matrixMsg);
};

exports.Jimp = (typeof(window)!=="undefined" && window.Jimp)
               ? window.Jimp
               : require("..");

exports.donutJGD = function donutJGD() {
    var { 0:_, 1:i, 2:X } = arguments;
    return {
        width: 10,
        height: 10,
        data: [
            _,_,_,_,_,_,_,_,_,_,
            _,_,_,i,X,X,i,_,_,_,
            _,_,X,X,X,X,X,X,_,_,
            _,i,X,X,i,i,X,X,i,_,
            _,X,X,i,_,_,i,X,X,_,
            _,X,X,i,_,_,i,X,X,_,
            _,i,X,X,i,i,X,X,i,_,
            _,_,X,X,X,X,X,X,_,_,
            _,_,_,i,X,X,i,_,_,_,
            _,_,_,_,_,_,_,_,_,_
        ]
    };
}

