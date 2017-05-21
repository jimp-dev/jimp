var should = require("should"); // Ensure should to load in browser through browserify.

var shouldAssertion = {}.should.be.constructor.prototype;

exports.hasOwnProp = (obj, key)=> Object.prototype.hasOwnProperty.call(obj, key);

var hashForEach = exports.hashForEach = (hash, func)=> {
    for (var key in hash) if (exports.hasOwnProp(hash, key)) func(key, hash[key]);
}

exports.getTestDir = function () {
    var testRE = /\/[^/]+\.test\.js($|\?.*)/;
    if (typeof document !== 'undefined' && document && document.getElementsByTagName) {
        var scripts = document.getElementsByTagName('script');
        for (var i=0; i<scripts.length; i++) {
            if (scripts[i].src.match(testRE)) {
                return scripts[i].src.replace(testRE, '');
            }
        }
        throw Error('Cant discover the web test directory');
    } else {
        if (typeof __dirname === 'undefined')
            throw Error('Cant discover the env test directory');
        return __dirname;
    }
};

exports.isWeb = function (warn) {
    if (typeof window !== 'undefined' && window.document) {
        console.warn(warn);
        return true;
    } else {
        return false;
    }
};

var sup = "⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠ";

var jgdReadableMatrix = exports.jgdReadableMatrix = function (img) {
    var rMatrix = [], line = [], len = img.data.length;
    for (var i=0; i<len; i++) {
        var pix = img.data[i].toString(16).toUpperCase();
        while (pix.length < 8) pix = "0"+pix;
        line.push(pix.replace(/(..)(..)(..)(.)(.)/, (sel, r, g, b, a1, a2)=> {
            var a = sup[parseInt(a1,16)] + sup[parseInt(a2,16)];
            return r+"-"+g+"-"+b+a
        }));
        if (i > 0 && (i+1)%img.width === 0) {
            rMatrix.push(line.join(" "));
            line = [];
        }
    }
    return rMatrix.join("\n");
}

shouldAssertion.sameJGD = function sameJGD (targetJGD, message) {
    message = message ? " "+message : "";
    var testJGD = this.obj;
    should.exist(testJGD.width, "Width was not defined."+message);
    should.exist(testJGD.height, "Height was not defined."+message);
    testJGD.width.should.be.equal(targetJGD.width, "Width is not the expected."+message);
    testJGD.height.should.be.equal(targetJGD.height, "Height is not the expected."+message);
    var matrixMsg = message || "The pixel matrix is not the expected."
    jgdReadableMatrix(testJGD).should.be.equal(jgdReadableMatrix(targetJGD), matrixMsg);
};

exports.Jimp = require('./jgd-wrapper');

exports.donutJGD = function donutJGD (_, i, X) {
    /* eslint comma-spacing: off */
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
    '▵': 0xFF00007f, // Red half-alpha
    '▸': 0x00FF00ff, // Green
    '▹': 0x00FF007f, // Green half-alpha
    '▾': 0x0000FFff, // Blue
    '▿': 0x0000FF7f, // Blue half-alpha
    '◆': 0xFFFF00ff, // Yellow
    '◇': 0xFFFF007f, // Yellow half-alpha
    '▪': 0x00FFFFff, // Cyan
    '▫': 0x00FFFF7f, // Cyan half-alpha
    '▰': 0xFF00FFff, // Magenta
    '▱': 0xFF00FF7f, // Magenta half-alpha
    ' ': 0x00000000, // Transparent black
    '■': 0x000000ff, // Black
    '0': 0x000000ff, // Black
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
    'F': 0xFFFFFFff, // White
    '□': 0xFFFFFFff  // White
}

function throwUndefinedChar (char) {
    var cList = [];
    hashForEach(colors, (k, c)=> {
        c = c.toString(16);
        while (c.length<8) c = '0'+c;
        cList.push(k +'='+ c);
    });
    throw Error('The char "'+char+'" do not defines a color. ' +
                'This are the valid chars: ' + cList.join(' '));
}

/* Build a JGD object from a list of strings */
exports.mkJGD = function mkJGD () {
    var jgd = { width: 0, height: arguments.length, data: [] };
    for (var y=0; y < jgd.height; y++) {
        var line = arguments[y];
        var w = jgd.width = line.length;
        for (var x=0; x < w; x++) {
            if (typeof colors[line[x]] === 'undefined') {
                throwUndefinedChar(line[x]);
            } else {
                jgd.data[(y*w)+x] = colors[line[x]];
            }
        }
    }
    return jgd;
};

// Helps to debug image data
exports.jgdToStr = function jgdToStr (jgd) {
    var colors2 = {};
    hashForEach(colors, (k, c)=> {
        colors2[c] = k;
    });
    var lines = [];
    var w = jgd.width;
    for (var y=0; y < jgd.height; y++) {
        lines[y] = '';
        for (var x=0; x < w; x++) {
            var k = colors2[jgd.data[y*w+x]] || '?';
            lines[y] += k;
        }
    }
    return lines.map((l)=> "'"+l+"'").join("\n");
}
