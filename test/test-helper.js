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
    message = message ? " "+message : "";
    var testJGD = this.obj;
    should.exist(testJGD.width, "Width was not defined."+message);
    should.exist(testJGD.height, "Height was not defined."+message);
    testJGD.width.should.be.equal(targetJGD.width, "Width is not the expected."+message);
    testJGD.height.should.be.equal(targetJGD.height, "Height is not the expected."+message);
    var matrixMsg = message ? message : "The pixel matrix is not the expected."
    jgdReadableMatrix(testJGD).should.be.equal(jgdReadableMatrix(targetJGD), matrixMsg);
};

exports.Jimp = require('./jgd-wrapper');

exports.donutJGD = function donutJGD(_, i, X) {
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

var colors = {
    '▴': 0xFF0000ff, // Red
    '▵': 0xFF000080, // Red half-alpha
    '▸': 0x00FF00ff, // Green
    '▹': 0x00FF0080, // Green half-alpha
    '▾': 0x0000FFff, // Blue
    '▿': 0x0000FF80, // Blue half-alpha
    '◆': 0xFFFF00ff, // Yellow
    '◇': 0xFFFF00ff, // Yellow half-alpha
    '▪': 0x00FFFFff, // Cyan
    '▫': 0x00FFFF80, // Cyan half-alpha
    '▰': 0xFF00FFff, // Magenta
    '▱': 0xFF00FF80, // Magenta half-alpha
    ' ': 0x00000000, // Transparent black
    '■': 0x000000ff, // Black
    '1': 0x111111ff,
    '2': 0x222222ff,
    '3': 0x333333ff,
    '▩': 0x404040ff, // Dark gray (1/4 white)
    '4': 0x444444ff,
    '5': 0x555555ff,
    '6': 0x666666ff,
    '7': 0x777777ff,
    '8': 0x888888ff,
    '▦': 0x808080ff, // Half gray (1/2 white)
    '9': 0x999999ff,
    'A': 0xAAAAAAff,
    'B': 0xBBBBBBff,
    '▥': 0xBFBFBFff, // Light gray (3/4 white)
    'C': 0xCCCCCCff,
    'D': 0xDDDDDDff,
    'E': 0xEEEEEEff,
    '□': 0xFFFFFFff, // White
}
/* Build a JGD object from a list of strings */
exports.mkJGD = function mkJGD() {
    var jgd = { width: 0, height: arguments.length, data: [] };
    for (var y=0; y < jgd.height; y++) {
        line = arguments[y];
        var w = jgd.width = line.length;
        for (var x=0; x < w; x++) {
            if (typeof colors[line[x]] === 'undefined') {
                var cList = [];
                for (k in colors) {
                    c = colors[k].toString(16);
                    while (c.length<8) c = '0'+c;
                    cList.push( k +'='+ c );
                }
                throw Error('The char "'+line[x]+'" do not defines a color. ' +
                            'This are the valid chars: ' + cList.join(' '));
            } else {
                jgd.data[(y*w)+x] = colors[line[x]];
            }
        }
    }
    return jgd;
};
