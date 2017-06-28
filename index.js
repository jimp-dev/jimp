var FS = require("fs");
var PNG = require("pngjs").PNG;
var JPEG = require("jpeg-js");
var BMP = require("bmp-js");
var GIF = require("./omggif.js");
var MIME = require("mime");
var TinyColor = require("tinycolor2");
var Resize = require("./resize.js");
var Resize2 = require("./resize2.js");
var StreamToBuffer = require("stream-to-buffer");
var FileType = require("file-type");
var PixelMatch = require("pixelmatch");
var EXIFParser = require("exif-parser");
var ImagePHash = require("./phash.js");
var BigNumber = require('bignumber.js');
var BMFont = require("load-bmfont");
var Path = require("path");
var MkDirP = require("mkdirp");
var Request = require("./src/request");
var EventEmitter = require('events');

// polyfill Promise for Node < 0.12
var Promise = global.Promise || require('es6-promise').Promise;

var isDef = (v)=> typeof v !== "undefined" && v !== null;

// logging methods

var chars = 0;

function log (msg) {
    clear();
    if (typeof process !== 'undefined' && process && process.stdout)
        process.stdout.write(msg);
    else if (typeof console !== 'undefined' && console)
        console.log('Jimp', msg);
    chars = msg.length;
}

function clear () {
    if (process && process.stdout)
        while (chars-- > 0)
            process.stdout.write("\b");
}

process.on("exit", clear);

// no operation
function noop () {}

// error checking methods

function isNodePattern (cb) {
    if (typeof cb === "undefined") return false;
    if (typeof cb !== "function")
        throw new Error("Callback must be a function");
    return true;
}

function throwError (error, cb) {
    if (typeof error === "string") error = new Error(error);
    if (typeof cb === "function") return cb.call(this, error);
    else throw error;
}

function isArrayBuffer (test) {
    return Object.prototype.toString.call(test).toLowerCase().indexOf("arraybuffer") > -1;
}

// Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
// But this function is not useful when running in node directly
function bufferFromArrayBuffer (arrayBuffer) {
    var buffer = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

function loadBufferFromPath (src, cb) {
    if (FS && typeof FS.readFile === "function" && !src.match(/^(http|ftp)s?:\/\/./)) {
        FS.readFile(src, cb);
    } else {
        Request(src, function (err, response, data) {
            if (err) return cb(err);
            if (typeof data === "object" && Buffer.isBuffer(data)) {
                return cb(null, data);
            } else {
                let msg = "Could not load Buffer from <" + src + "> " +
                          "(HTTP: " + response.statusCode + ")";
                return Error(msg);
            }
        });
    }
}

/**
 * Helper to create Jimp methods that emit events before and after its execution.
 * @param methodName   The name to be appended to Jimp prototype.
 * @param evName       The event name to be called.
 *                     It will be prefixed by `before-` and emited when on method call.
 *                     It will be appended by `ed` and emited after the method run.
 * @param method       A function implementing the method itself.
 * It will also create a quiet version that will not emit events, to not
 * mess the user code with many `changed` event calls. You can call with
 * `methodName + "Quiet"`.
 *
 * The emited event comes with a object parameter to the listener with the
 * `methodName` as one attribute.
 */
function JimpEvMethod (methodName, evName, method) {
    var evNameBefore = "before-"+evName;
    var evNameAfter = evName.replace(/e$/, "") + "ed";
    Jimp.prototype[methodName] = function () {
        var wrapedCb, cb = arguments[method.length-1];
        var that = this;
        if (typeof cb === "function") {
            wrapedCb = function (err, data) {
                if (err) {
                    that.emitError(methodName, err);
                } else {
                    that.emitMulti(methodName, evNameAfter, {[methodName]: data});
                }
                cb.apply(this, arguments);
            };
            arguments[arguments.length-1] = wrapedCb;
        } else {
            wrapedCb = false;
        }
        this.emitMulti(methodName, evNameBefore);
        try {
            var result = method.apply(this, arguments);
            if (!wrapedCb) this.emitMulti(methodName, evNameAfter, {[methodName]: result});
        } catch (err) {
            err.methodName = methodName;
            this.emitError(methodName, err);
        }
        return result;
    }
    Jimp.prototype[methodName+"Quiet"] = method;
}

/**
 * Simplify JimpEvMethod call for the common `change` evName.
 */
function JimpEvChange (methodName, method) {
    JimpEvMethod(methodName, "change", method);
}

/**
 * Jimp constructor (from a file)
 * @param path a path to the image
 * @param (optional) cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from another Jimp image)
 * @param image a Jimp image to clone
 * @param cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (from a Buffer)
 * @param data a Buffer containing the image data
 * @param cb a function to call when the image is parsed to a bitmap
 */

/**
 * Jimp constructor (to generate a new image)
 * @param w the width of the image
 * @param h the height of the image
 * @param (optional) cb a function to call when the image is parsed to a bitmap
 */

class Jimp extends EventEmitter {
    constructor () {
        super();
        var cb = noop;
        var that = this;
        if (isArrayBuffer(arguments[0]))
            arguments[0] = bufferFromArrayBuffer(arguments[0]);
        function finish (err, ...args) {
            var evData = err || {};
            evData.methodName = "constructor";
            setTimeout(()=> { // run on next tick.
                if (err) that.emitError("constructor", err);
                else that.emitMulti("constructor", "initialized");
                cb.call(that, ...arguments);
            }, 1);
        }
        if (typeof arguments[0] === "number" && typeof arguments[1] === "number") {
            // create a new image
            var w = arguments[0];
            var h = arguments[1];
            cb = arguments[2];

            if (typeof arguments[2] === "number") {
                this._background = arguments[2];
                cb = arguments[3];
            }

            if (typeof cb === "undefined") cb = noop;
            if (typeof cb !== "function")
                return throwError.call(this, "cb must be a function", finish);

            this.bitmap = {
                data: new Buffer(w * h * 4),
                width: w,
                height: h
            };

            for (let i = 0; i < this.bitmap.data.length; i+=4) {
                this.bitmap.data.writeUInt32BE(this._background, i);
            }

            finish(null, this);
        } else if (arguments[0] instanceof Jimp) {
            // clone an existing Jimp
            var original = arguments[0];
            cb = arguments[1];

            if (typeof cb === "undefined") cb = noop;
            if (typeof cb !== "function")
                return throwError.call(this, "cb must be a function", finish);

            var bitmap = new Buffer(original.bitmap.data.length);
            original.scanQuiet(0, 0, original.bitmap.width, original.bitmap.height, function (x, y, idx) {
                var data = original.bitmap.data.readUInt32BE(idx, true);
                bitmap.writeUInt32BE(data, idx, true);
            });

            this.bitmap = {
                data: bitmap,
                width: original.bitmap.width,
                height: original.bitmap.height
            };

            this._quality = original._quality;
            this._deflateLevel = original._deflateLevel;
            this._deflateStrategy = original._deflateStrategy;
            this._filterType = original._filterType;
            this._rgba = original._rgba;
            this._background = original._background;

            finish(null, this);
        } else if (typeof arguments[0] === "string") {
            // read from a path
            var path = arguments[0];
            cb = arguments[1];

            if (typeof cb === "undefined") cb = noop;
            if (typeof cb !== "function")
                return throwError.call(this, "cb must be a function", finish);

            loadBufferFromPath(path, function (err, data) {
                if (err) return throwError.call(that, err, finish);
                parseBitmap.call(that, data, path, finish);
            });
        } else if (typeof arguments[0] === "object" && Buffer.isBuffer(arguments[0])) {
            // read from a buffer
            var data = arguments[0];
            cb = arguments[1];

            if (typeof cb !== "function")
                return throwError.call(this, "cb must be a function", finish);

            parseBitmap.call(this, data, null, finish);
        } else {
            // Allow client libs to add new ways to build a Jimp object.
            // Extra constructors must be added by `Jimp.appendConstructorOption()`

            cb = arguments[arguments.length-1];
            if (typeof cb !== "function") {
                cb = arguments[arguments.length-2]; // TODO: try to solve the args after cb problem.
                if (typeof cb !== "function") cb = function () {};
            }
            var extraConstructor = Jimp.__extraConstructors.find((c)=> c.test(...arguments));
            if (extraConstructor)
                new Promise(
                    (resolve, reject)=> extraConstructor.run.call(this, resolve, reject, ...arguments)
                )
                .then(()=> finish(null, this))
                .catch(finish);
            else return throwError.call(this,
                "No matching constructor overloading was found. " +
                "Please see the docs for how to call the Jimp constructor.", finish
            );
        }
    }
}

Jimp.__extraConstructors = [];

/**
 * Allow client libs to add new ways to build a Jimp object.
 * @param name identify the extra constructor.
 * @param test a function that returns true when it accepts the arguments passed to the main constructor.
 * @param runner where the magic happens.
 */
Jimp.appendConstructorOption = function (name, test, runner) {
    Jimp.__extraConstructors.push({ name: name, test: test, run: runner });
}

/**
 * Emit for multiple listeners
 */
Jimp.prototype.emitMulti = function emitMulti (methodName, eventName, data={}) {
    data = Object.assign(data, {methodName, eventName});
    this.emit("any", data);
    if (methodName) this.emit(methodName, data);
    this.emit(eventName, data);
};

Jimp.prototype.emitError = function emitError (methodName, err) {
    this.emitMulti(methodName, "error", err);
};

/**
 * Read an image from a file or a Buffer
 * @param src the path to the file or a Buffer containing the file data
 * @retuns a promise
 */
Jimp.read = function (src) {
    return new Promise(function (resolve, reject) {
        new Jimp(src, (err, image)=> {
            if (err) reject(err);
            else resolve(image);
        });
    });
}

// MIME type methods

function getMIMEFromBuffer (buffer, path) {
    var fileTypeFromBuffer = FileType(buffer);
    if (fileTypeFromBuffer) {
        // If FileType returns something for buffer, then return the mime given
        return fileTypeFromBuffer.mime;
    } else if (path) {
        // If a path is supplied, and FileType yields no results, then retry with MIME
        // Path can be either a file path or a url
        return MIME.lookup(path)
    } else {
        return null;
    }
}

// gets image data from a GIF buffer
function getBitmapFromGIF (data) {
    var gifObj = new GIF.GifReader(data);
    var gifData = new Buffer(gifObj.width * gifObj.height * 4);

    gifObj.decodeAndBlitFrameRGBA(0, gifData);
    return {
        data: gifData,
        width: gifObj.width,
        height: gifObj.height
    };
}

// parses a bitmap from the constructor to the JIMP bitmap property
function parseBitmap (data, path, cb) {
    var that = this;
    var mime = getMIMEFromBuffer(data, path);
    if (typeof mime !== "string")
        return cb(Error("Could not find MIME for Buffer <" + path + ">"));

    this._originalMime = mime.toLowerCase();

    switch (this.getMIME()) {
        case Jimp.MIME_PNG:
            var png = new PNG();
            png.parse(data, function (err, data) {
                if (err) return throwError.call(that, err, cb);
                that.bitmap = {
                    data: new Buffer(data.data),
                    width: data.width,
                    height: data.height
                };
                return cb.call(that, null, that);
            });
            break;

        case Jimp.MIME_JPEG:
            try {
                this.bitmap = JPEG.decode(data);
                try {
                    this._exif = EXIFParser.create(data).parse();
                    exifRotate(this); // EXIF data
                } catch (err) {
                    /* meh */
                }
                return cb.call(this, null, this);
            } catch (err) {
                return cb.call(this, err, this);
            }

        case Jimp.MIME_BMP:
        case Jimp.MIME_X_MS_BMP:
            this.bitmap = BMP.decode(data);
            return cb.call(this, null, this);

        case Jimp.MIME_GIF:
            this.bitmap = getBitmapFromGIF(data);
            return cb.call(this, null, this);

        default:
            return throwError.call(this, "Unsupported MIME type: " + mime, cb);
    }
}

/*
 * Automagically rotates an image based on its EXIF data (if present)
 * @param img a Jimp object
*/
function exifRotate (img) {
    var exif = img._exif;
    if (exif && exif.tags && exif.tags.Orientation) {
        switch (img._exif.tags.Orientation) {
            case 1: // Horizontal (normal)
                // do nothing
                break;
            case 2: // Mirror horizontal
                img.mirror(true, false);
                break;
            case 3: // Rotate 180
                img.rotate(180, false);
                break;
            case 4: // Mirror vertical
                img.mirror(false, true);
                break;
            case 5: // Mirror horizontal and rotate 270 CW
                img.rotate(-90, false).mirror(true, false);
                break;
            case 6: // Rotate 90 CW
                img.rotate(-90, false);
                break;
            case 7: // Mirror horizontal and rotate 90 CW
                img.rotate(90, false).mirror(true, false);
                break;
            case 8: // Rotate 270 CW
                img.rotate(-270, false);
                break;
        }
    }

    return img;
}

// used to auto resizing etc.
Jimp.AUTO = -1;

// supported mime types
Jimp.MIME_PNG = "image/png";
Jimp.MIME_JPEG = "image/jpeg";
Jimp.MIME_JGD = "image/jgd";
Jimp.MIME_BMP = "image/bmp";
Jimp.MIME_X_MS_BMP = "image/x-ms-bmp";
Jimp.MIME_GIF = "image/gif";

// PNG filter types
Jimp.PNG_FILTER_AUTO = -1;
Jimp.PNG_FILTER_NONE = 0;
Jimp.PNG_FILTER_SUB = 1;
Jimp.PNG_FILTER_UP = 2;
Jimp.PNG_FILTER_AVERAGE = 3;
Jimp.PNG_FILTER_PAETH = 4;

Jimp.RESIZE_NEAREST_NEIGHBOR = 'nearestNeighbor';
Jimp.RESIZE_BILINEAR = 'bilinearInterpolation';
Jimp.RESIZE_BICUBIC = 'bicubicInterpolation';
Jimp.RESIZE_HERMITE = 'hermiteInterpolation';
Jimp.RESIZE_BEZIER = 'bezierInterpolation';

// Align modes for cover, contain, bit masks
Jimp.HORIZONTAL_ALIGN_LEFT = 1;
Jimp.HORIZONTAL_ALIGN_CENTER = 2;
Jimp.HORIZONTAL_ALIGN_RIGHT = 4;

Jimp.VERTICAL_ALIGN_TOP = 8;
Jimp.VERTICAL_ALIGN_MIDDLE = 16;
Jimp.VERTICAL_ALIGN_BOTTOM = 32;

// Discover Jimp directory in any environment. (also in fucking karma)
function getJimpDir () {
    try {
        throw new Error();
    } catch (err) {
        var callLine = err.stack.split(/\n/).filter(function (l) {
            return l.match(/getJimpDir/);
        })[0];
        var reWebKit = /.*\(([^?]+\/)[^/]+\).*/;
        var reMoz = /.*@([^?]+\/).*/;
        if (reWebKit.test(callLine)) return callLine.replace(reWebKit, '$1');
        else if (reMoz.test(callLine)) return callLine.replace(reMoz, '$1');
        else return `${__dirname}/`;
    }
}
Jimp.dirName = getJimpDir();

// Font locations
Jimp.FONT_SANS_8_BLACK   = Jimp.dirName + "fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt";
Jimp.FONT_SANS_16_BLACK  = Jimp.dirName + "fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt";
Jimp.FONT_SANS_32_BLACK  = Jimp.dirName + "fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt";
Jimp.FONT_SANS_64_BLACK  = Jimp.dirName + "fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt";
Jimp.FONT_SANS_128_BLACK = Jimp.dirName + "fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt";

Jimp.FONT_SANS_8_WHITE   = Jimp.dirName + "fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt";
Jimp.FONT_SANS_16_WHITE  = Jimp.dirName + "fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt";
Jimp.FONT_SANS_32_WHITE  = Jimp.dirName + "fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt";
Jimp.FONT_SANS_64_WHITE  = Jimp.dirName + "fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt";
Jimp.FONT_SANS_128_WHITE = Jimp.dirName + "fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt";

// Edge Handling
Jimp.EDGE_EXTEND = 1;
Jimp.EDGE_WRAP = 2;
Jimp.EDGE_CROP = 3;

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param r the red value (0-255)
 * @param g the green value (0-255)
 * @param b the blue value (0-255)
 * @param a the alpha value (0-255)
 * @param cb (optional) A callback for when complete
 * @returns an single integer colour value
 */
Jimp.rgbaToInt = function (r, g, b, a, cb) {
    if (typeof r !== "number" || typeof g !== "number" || typeof b !== "number" || typeof a !== "number")
        return throwError.call(this, "r, g, b and a must be numbers", cb);
    if (r < 0 || r > 255)
        return throwError.call(this, "r must be between 0 and 255", cb);
    if (g < 0 || g > 255)
        throwError.call(this, "g must be between 0 and 255", cb);
    if (b < 0 || b > 255)
        return throwError.call(this, "b must be between 0 and 255", cb);
    if (a < 0 || a > 255)
        return throwError.call(this, "a must be between 0 and 255", cb);

    r = Math.round(r);
    b = Math.round(b);
    g = Math.round(g);
    a = Math.round(a);

    var i = (r * Math.pow(256, 3)) + (g * Math.pow(256, 2)) + (b * Math.pow(256, 1)) + (a * Math.pow(256, 0));

    if (isNodePattern(cb)) return cb.call(this, null, i);
    else return i;
}

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @param cb (optional) A callback for when complete
 * @returns an object with the properties r, g, b and a representing RGBA values
 */
Jimp.intToRGBA = function (i, cb) {
    if (typeof i !== "number")
        return throwError.call(this, "i must be a number", cb);

    var rgba = {}
    rgba.r = Math.floor(i / Math.pow(256, 3));
    rgba.g = Math.floor((i - (rgba.r * Math.pow(256, 3))) / Math.pow(256, 2));
    rgba.b = Math.floor((i - (rgba.r * Math.pow(256, 3)) - (rgba.g * Math.pow(256, 2))) / Math.pow(256, 1));
    rgba.a = Math.floor((i - (rgba.r * Math.pow(256, 3)) - (rgba.g * Math.pow(256, 2)) - (rgba.b * Math.pow(256, 1))) / Math.pow(256, 0));

    if (isNodePattern(cb)) return cb.call(this, null, rgba);
    else return rgba;
}

/**
 * Limits a number to between 0 or 255
 * @param n a number
 * @returns the number limited to between 0 or 255
 */
Jimp.limit255 = function (n) {
    n = Math.max(n, 0);
    n = Math.min(n, 255);
    return n;
}

/**
 * Diffs two images and returns
 * @param img1 a Jimp image to compare
 * @param img2 a Jimp image to compare
 * @param (optional) threshold a number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 * @returns an object { percent: percent similar, diff: a Jimp image highlighting differences }
 */
Jimp.diff = function (img1, img2, threshold) {
    if (!(img1 instanceof Jimp) || !(img2 instanceof Jimp))
        return throwError.call(this, "img1 and img2 must be an Jimp images");

    var bmp1 = img1.bitmap;
    var bmp2 = img2.bitmap;

    if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
        if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
            // img1 is bigger
            img1 = img1.cloneQuiet().resize(bmp2.width, bmp2.height);
        } else {
            // img2 is bigger (or they are the same in area)
            img2 = img2.cloneQuiet().resize(bmp1.width, bmp1.height);
        }
    }

    threshold = threshold || 0.1;
    if (typeof threshold !== "number" || threshold < 0 || threshold > 1)
        return throwError.call(this, "threshold must be a number between 0 and 1");

    var diff = new Jimp(bmp1.width, bmp1.height, 0xFFFFFFFF);

    var numDiffPixels = PixelMatch(
        bmp1.data,
        bmp2.data,
        diff.bitmap.data,
        diff.bitmap.width,
        diff.bitmap.height,
        {threshold: threshold}
    );

    return {
        percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
        image: diff
    };
}

/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param img1 a Jimp image to compare
 * @param img2 a Jimp image to compare
 * @returns a number ranging from 0 to 1, 0 means they are believed to be identical
 */
Jimp.distance = function (img1, img2) {
    var phash = new ImagePHash();
    var hash1 = phash.getHash(img1);
    var hash2 = phash.getHash(img2);
    return phash.distance(hash1, hash2);
}

// An object representing a bitmap in memory, comprising:
//  - data: a buffer of the bitmap data
//  - width: the width of the image in pixels
//  - height: the height of the image in pixels
Jimp.prototype.bitmap = {
    data: null,
    width: null,
    height: null
};

// The quality to be used when saving JPEG images
Jimp.prototype._quality = 100;
Jimp.prototype._deflateLevel = 9;
Jimp.prototype._deflateStrategy = 3;
Jimp.prototype._filterType = Jimp.PNG_FILTER_AUTO;

// Whether PNGs will be exported as RGB or RGBA
Jimp.prototype._rgba = true;

// Default colour to use for new pixels
Jimp.prototype._background = 0x00000000;

// Default MIME is PNG
Jimp.prototype._originalMime = Jimp.MIME_PNG;

// Exif data for the image
Jimp.prototype._exif = null;

/**
 * Creates a new image that is a clone of this one.
 * @param cb (optional) A callback for when complete
 * @returns the new image
 */
JimpEvMethod("clone", "clone", function (cb) {
    var clone = new Jimp(this);

    if (isNodePattern(cb)) return cb.call(clone, null, clone);
    else return clone;
});

/**
 * Sets the quality of the image when saving as JPEG format (default is 100)
 * @param n The quality to use 0-100
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.quality = function (n, cb) {
    if (typeof n !== "number")
        return throwError.call(this, "n must be a number", cb);
    if (n < 0 || n > 100)
        return throwError.call(this, "n must be a number 0 - 100", cb);

    this._quality = Math.round(n);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Sets the deflate level used when saving as PNG format (default is 9)
 * @param l Deflate level to use 0-9. 0 is no compression. 9 (default) is maximum compression.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.deflateLevel = function (l, cb) {
    if (typeof l !== "number")
        return throwError.call(this, "l must be a number", cb);
    if (l < 0 || l > 9)
        return throwError.call(this, "l must be a number 0 - 9", cb);

    this._deflateLevel = Math.round(l);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Sets the deflate strategy used when saving as PNG format (default is 3)
 * @param s Deflate strategy to use 0-3.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.deflateStrategy = function (s, cb) {
    if (typeof s !== "number")
        return throwError.call(this, "s must be a number", cb);
    if (s < 0 || s > 3)
        return throwError.call(this, "s must be a number 0 - 3", cb);

    this._deflateStrategy = Math.round(s);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Sets the filter type used when saving as PNG format (default is automatic filters)
 * @param f The quality to use -1-4.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.filterType = function (f, cb) {
    if (typeof f !== "number")
        return throwError.call(this, "n must be a number", cb);
    if (f < -1 || f > 4)
        return throwError.call(this, "n must be -1 (auto) or a number 0 - 4", cb);

    this._filterType = Math.round(f);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param bool A Boolean, true to use RGBA or false to use RGB
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.rgba = function (bool, cb) {
    if (typeof bool !== "boolean")
        return throwError.call(this, "bool must be a boolean, true for RGBA or false for RGB", cb);

    this._rgba = bool;

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param b A Boolean, true to use RGBA or false to use RGB
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
JimpEvChange("background", function background (hex, cb) {
    if (typeof hex !== "number")
        return throwError.call(this, "hex must be a hexadecimal rgba value", cb);

    this._background = hex;

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
});

/**
 * Scanes through a region of the bitmap, calling a function for each pixel.
 * @param x the x coordinate to begin the scan at
 * @param y the y coordiante to begin the scan at
 * @param w the width of the scan region
 * @param h the height of the scan region
 * @param f a function to call on even pixel; the (x, y) position of the pixel
 * and the index of the pixel in the bitmap buffer are passed to the function
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
JimpEvChange("scan", function scan (x, y, w, h, f, cb) {
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);
    if (typeof f !== "function")
        return throwError.call(this, "f must be a function", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (let _y = y; _y < (y + h); _y++) {
        for (let _x = x; _x < (x + w); _x++) {
            var idx = (this.bitmap.width * _y + _x) << 2;
            f.call(this, _x, _y, idx);
        }
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
});

/**
 * Returns the original MIME of the image (default: "image/png")
 * @returns the MIME as a string
*/
Jimp.prototype.getMIME = function () {
    var mime = this._originalMime || Jimp.MIME_PNG;
    return mime;
}

/**
 * Returns the appropriate file extension for the original MIME of the image (default: "png")
 * @returns the file extension as a string
*/
Jimp.prototype.getExtension = function () {
    var mime = this.getMIME();
    return MIME.extension(mime);
}

/**
 * Returns the offset of a pixel in the bitmap buffer
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
*/
Jimp.prototype.getPixelIndex = function (x, y, edgeHandling, cb) {
    var xi, yi;
    if (typeof edgeHandling === "function" && typeof cb === "undefined") {
        cb = edgeHandling;
        edgeHandling = null;
    }
    if (!edgeHandling) edgeHandling = Jimp.EDGE_EXTEND;
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    xi = x = Math.round(x);
    yi = y = Math.round(y);

    if (edgeHandling === Jimp.EDGE_EXTEND) {
        if (x<0) xi = 0;
        if (x>=this.bitmap.width) xi = this.bitmap.width - 1;
        if (y<0) yi = 0;
        if (y>=this.bitmap.height) yi = this.bitmap.height - 1;
    }

    if (edgeHandling === Jimp.EDGE_WRAP) {
        if (x<0) xi = this.bitmap.width + x;
        if (x>=this.bitmap.width) xi = x % this.bitmap.width;
        if (y<0) xi = this.bitmap.height + y;
        if (y>=this.bitmap.height) yi = y % this.bitmap.height;
    }

    var i = (this.bitmap.width * yi + xi) << 2;

    // if out of bounds index is -1
    if (xi < 0 || xi >= this.bitmap.width) i = -1;
    if (yi < 0 || yi >= this.bitmap.height) i = -1;

    if (isNodePattern(cb)) return cb.call(this, null, i);
    else return i;
};

/**
 * Returns the hex colour value of a pixel
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
*/
Jimp.prototype.getPixelColor = Jimp.prototype.getPixelColour = function (x, y, cb) {
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var idx = this.getPixelIndex(x, y);
    var hex = this.bitmap.data.readUInt32BE(idx);

    if (isNodePattern(cb)) return cb.call(this, null, hex);
    else return hex;
};

/**
 * Returns the hex colour value of a pixel
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
*/
Jimp.prototype.setPixelColor = Jimp.prototype.setPixelColour = function (hex, x, y, cb) {
    if (typeof hex !== "number" || typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "hex, x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var idx = this.getPixelIndex(x, y);
    this.bitmap.data.writeUInt32BE(hex, idx, true);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

// an array storing the maximum string length of hashes at various bases
var maxHashLength = [];
for (let i = 0; i < 65; i++) {
    var l = (i > 1) ? (new BigNumber(Array(64 + 1).join("1"), 2)).toString(i) : NaN;
    maxHashLength.push(l.length);
}

/**
 * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>.
 * @param base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimaal, 16 is hex, 64 is base 64). Defaults to 64.
 * @param (optional) cb a callback for when complete
 * @returns a string representing the hash
 */
Jimp.prototype.hash = function (base, cb) {
    base = base || 64;
    if (typeof base === "function") {
        cb = base;
        base = 64;
    }
    if (typeof base !== "number")
        return throwError.call(this, "base must be a number", cb);
    if (base < 2 || base > 64)
        return throwError.call(this, "base must be a number between 2 and 64", cb);

    var hash = (new ImagePHash()).getHash(this);
    hash = (new BigNumber(hash, 2)).toString(base);

    while (hash.length < maxHashLength[base]) {
        hash = "0" + hash; // pad out with leading zeros
    }

    if (isNodePattern(cb)) return cb.call(this, null, hash);
    else return hash;
}

/**
 * Crops the image at a given point to a give size
 * @param x the x coordinate to crop form
 * @param y the y coordiante to crop form
 * @param w the width of the crop region
 * @param h the height of the crop region
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
JimpEvChange("crop", function crop (x, y, w, h, cb) {
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    var bitmap = new Buffer(this.bitmap.data.length);
    var offset = 0;
    this.scanQuiet(x, y, w, h, function (x, y, idx) {
        var data = this.bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, offset, true);
        offset += 4;
    });

    this.bitmap.data = new Buffer(bitmap);
    this.bitmap.width = w;
    this.bitmap.height = h;

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
});

/**
 * Compute color difference
 * 0 means no difference, 1 means maximum difference.
 * @param rgba1:    first color to compare.
 * @param rgba2:    second color to compare.
 * Both parameters must be an color object {r:val, g:val, b:val, a:val}
 * Where `a` is optional and `val` is an integer between 0 and 255.
 * @returns float between 0 and 1.
 */
Jimp.colorDiff = (function () {
    var pow = (n)=> Math.pow(n, 2);
    var max = Math.max;
    var maxVal = (255 * 255 * 3);

    return function colorDiff (rgba1, rgba2) {
        if (rgba1.a!==0 && !rgba1.a) rgba1.a = 255;
        if (rgba2.a!==0 && !rgba2.a) rgba2.a = 255;
        return (
            max(pow(rgba1.r - rgba2.r), pow(rgba1.r - rgba2.r - rgba1.a + rgba2.a)) +
            max(pow(rgba1.g - rgba2.g), pow(rgba1.g - rgba2.g - rgba1.a + rgba2.a)) +
            max(pow(rgba1.b - rgba2.b), pow(rgba1.b - rgba2.b - rgba1.a + rgba2.a))
        ) / maxVal;
    };
})();

/**
 * Autocrop same color borders from this image
 * @param (optional) tolerance:      a percent value of tolerance for
 *                                   pixels color difference (default: 0.0002%)
 * @param (optional) cropOnlyFrames: flag to crop only real frames:
 *                                   all 4 sides of the image must have some border (default: true)
 * @param (optional) cb:             a callback for when complete (default: no callback)
 * @returns this                     for chaining of methods
 */
Jimp.prototype.autocrop = function () {
    var w = this.bitmap.width;
    var h = this.bitmap.height;
    var minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image
    var cb; // callback
    var tolerance = 0.0002; // percent of color difference tolerance (default value)
    var cropOnlyFrames = true; // flag to force cropping only if the image has a real "frame"
                               // i.e. all 4 sides have some border (default value)

    // parse arguments
    for (let a = 0, len = arguments.length; a < len; a++) {
        if (typeof arguments[a] === "number") { // tolerance value passed
            tolerance = arguments[a];
        }
        if (typeof arguments[a] === "boolean") { // cropOnlyFrames value passed
            cropOnlyFrames = arguments[a];
        }
        if (typeof arguments[a] === "function") { // callback value passed
            cb = arguments[a];
        }
    }

    /**
     * All borders must be of the same color as the top left pixel, to be cropped.
     * It should be possible to crop borders each with a different color,
     * but since there are many ways for corners to intersect, it would
     * introduce unnecessary complexity to the algorithm.
     */

    // scan each side for same color borders
    var colorTarget = this.getPixelColor(0, 0); // top left pixel color is the target color
                                                // for north and east sides
    var northPixelsToCrop = 0;
    var eastPixelsToCrop = 0;
    var southPixelsToCrop = 0;
    var westPixelsToCrop = 0;

    var rgba1 = Jimp.intToRGBA(colorTarget);

    north: // north side (scan rows from north to south)
    for (let y = 0; y < h - minPixelsPerSide; y++) {
        for (let x = 0; x < w; x++) {
            let colorXY = this.getPixelColor(x, y);
            let rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break north;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        northPixelsToCrop++;
    }

    east: // east side (scan columns from east to west)
    for (let x = 0; x < w - minPixelsPerSide; x++) {
        for (let y = 0 + northPixelsToCrop; y < h; y++) {
            let colorXY = this.getPixelColor(x, y);
            let rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break east;
            }
        }
        // this column contains all pixels with the same color: increment this side pixels to crop
        eastPixelsToCrop++;
    }

    south: // south side (scan rows from south to north)
    for (let y = h - 1; y >= northPixelsToCrop + minPixelsPerSide; y--) {
        for (let x = w - eastPixelsToCrop - 1; x >= 0; x--) {
            let colorXY = this.getPixelColor(x, y);
            let rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break south;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        southPixelsToCrop++;
    }

    west: // west side (scan columns from west to east)
    for (let x = w - 1; x >= 0 + eastPixelsToCrop + minPixelsPerSide; x--) {
        for (let y = h - 1; y >= 0 + northPixelsToCrop; y--) {
            let colorXY = this.getPixelColor(x, y);
            let rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break west;
            }
        }
        // this column contains all pixels with the same color: increment this side pixels to crop
        westPixelsToCrop++;
    }

    // safety checks
    var widthOfPixelsToCrop = w - (westPixelsToCrop + eastPixelsToCrop);
    widthOfPixelsToCrop >= 0 ? widthOfPixelsToCrop : 0;
    var heightOfPixelsToCrop = h - (southPixelsToCrop + northPixelsToCrop);
    heightOfPixelsToCrop >= 0 ? heightOfPixelsToCrop : 0;

    // decide if a crop is needed
    var doCrop = false;
    if (cropOnlyFrames) { // crop image if all sides should be cropped
        doCrop = (
            eastPixelsToCrop !== 0 &&
            northPixelsToCrop !== 0 &&
            westPixelsToCrop !== 0 &&
            southPixelsToCrop !== 0
        );
    } else { // crop image if at least one side should be cropped
        doCrop = (
            eastPixelsToCrop !== 0 ||
            northPixelsToCrop !== 0 ||
            westPixelsToCrop !== 0 ||
            southPixelsToCrop !== 0
        );
    }

    if (doCrop) { // do the real crop
        this.crop(
            eastPixelsToCrop,
            northPixelsToCrop,
            widthOfPixelsToCrop,
            heightOfPixelsToCrop
       );
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Blits a source image on to this image
 * @param src the source Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param srcx (optional) the x position from which to crop the source image
 * @param srcy (optional) the y position from which to crop the source image
 * @param srcw (optional) the width to which to crop the source image
 * @param srch (optional) the height to which to crop the source image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
*/
Jimp.prototype.blit = function (src, x, y, srcx, srcy, srcw, srch, cb) {
    if (!(src instanceof Jimp))
        return throwError.call(this, "The source must be a Jimp image", cb);
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);

    if (typeof srcx === "function") {
        cb = srcx;
        srcx = 0;
        srcy = 0;
        srcw = src.bitmap.width;
        srch = src.bitmap.height;
    } else if (typeof srcx === typeof srcy && typeof srcy === typeof srcw && typeof srcw === typeof srch) {
        srcx = srcx || 0;
        srcy = srcy || 0;
        srcw = srcw || src.bitmap.width;
        srch = srch || src.bitmap.height;
    } else {
        return throwError.call(this, "srcx, srcy, srcw, srch must be numbers", cb);
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    // round input
    srcx = Math.round(srcx);
    srcy = Math.round(srcy);
    srcw = Math.round(srcw);
    srch = Math.round(srch);

    var maxw = this.bitmap.width;
    var maxh = this.bitmap.height;
    var that = this;
    src.scanQuiet(srcx, srcy, srcw, srch, function (sx, sy, idx) {
        if (x+sx >= 0 && y+sy >= 0 && maxw-x-sx > 0 && maxh-y-sy > 0) {
            var dstIdx = that.getPixelIndex(x+sx-srcx, y+sy-srcy);
            that.bitmap.data[dstIdx] = this.bitmap.data[idx];
            that.bitmap.data[dstIdx+1] = this.bitmap.data[idx+1];
            that.bitmap.data[dstIdx+2] = this.bitmap.data[idx+2];
            that.bitmap.data[dstIdx+3] = this.bitmap.data[idx+3];
        }
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param src the source Jimp instance
 * @param x the horizontal position to blit the image
 * @param y the vertical position to blit the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
*/
Jimp.prototype.mask = function (src, x, y, cb) {
    if (!x) x = 0;
    if (!y) y = 0;
    if (!(src instanceof Jimp))
        return throwError.call(this, "The source must be a Jimp image", cb);
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var w = this.bitmap.width;
    var h = this.bitmap.height;
    var that = this;
    src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function (sx, sy, idx) {
        let destX = x+sx;
        let destY = y+sy;
        if (destX >=0 && destY >=0 && destX < w && destY < h) {
            let dstIdx = that.getPixelIndex(destX, destY);
            let data = this.bitmap.data;
            let avg = (data[idx+0] + data[idx+1] + data[idx+2]) / 3;
            that.bitmap.data[dstIdx+3] *= avg / 255;
        }
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Composites a source image over to this image respecting alpha channels
 * @param src the source Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
*/
Jimp.prototype.composite = function (src, x, y, cb) {
    if (!(src instanceof Jimp))
        return throwError.call(this, "The source must be a Jimp image", cb);
    if (typeof x !== "number" || typeof y !== "number")
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var that = this;
    src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function (sx, sy, idx) {
        // http://stackoverflow.com/questions/7438263/alpha-compositing-algorithm-blend-modes
        var dstIdx = that.getPixelIndex(x+sx, y+sy);

        var fg = {
            r: this.bitmap.data[idx + 0] / 255,
            g: this.bitmap.data[idx + 1] / 255,
            b: this.bitmap.data[idx + 2] / 255,
            a: this.bitmap.data[idx + 3] / 255
        }

        var bg = {
            r: that.bitmap.data[dstIdx + 0] / 255,
            g: that.bitmap.data[dstIdx + 1] / 255,
            b: that.bitmap.data[dstIdx + 2] / 255,
            a: that.bitmap.data[dstIdx + 3] / 255
        }

        var a = bg.a + fg.a - bg.a * fg.a;

        var r = ((fg.r * fg.a) + (bg.r * bg.a) * (1 - fg.a)) / a;
        var g = ((fg.g * fg.a) + (bg.g * bg.a) * (1 - fg.a)) / a;
        var b = ((fg.b * fg.a) + (bg.b * bg.a) * (1 - fg.a)) / a;

        that.bitmap.data[dstIdx + 0] = Jimp.limit255(r * 255);
        that.bitmap.data[dstIdx + 1] = Jimp.limit255(g * 255);
        that.bitmap.data[dstIdx + 2] = Jimp.limit255(b * 255);
        that.bitmap.data[dstIdx + 3] = Jimp.limit255(a * 255);
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Adjusts the brightness of the image
 * @param val the amount to adjust the brightness, a number between -1 and +1
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.brightness = function (val, cb) {
    if (typeof val !== "number")
        return throwError.call(this, "val must be numbers", cb);
    if (val < -1 || val > +1)
        return throwError.call(this, "val must be a number between -1 and +1", cb);

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        if (val < 0.0) {
            this.bitmap.data[idx] = this.bitmap.data[idx] * (1 + val);
            this.bitmap.data[idx+1] = this.bitmap.data[idx+1] * (1 + val);
            this.bitmap.data[idx+2] = this.bitmap.data[idx+2] * (1 + val);
        } else {
            this.bitmap.data[idx] = this.bitmap.data[idx] + ((255 - this.bitmap.data[idx]) * val);
            this.bitmap.data[idx+1] = this.bitmap.data[idx+1] + ((255 - this.bitmap.data[idx+1]) * val);
            this.bitmap.data[idx+2] = this.bitmap.data[idx+2] + ((255 - this.bitmap.data[idx+2]) * val);
        }
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Adjusts the contrast of the image
 * val the amount to adjust the contrast, a number between -1 and +1
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.contrast = function (val, cb) {
    if (typeof val !== "number")
        return throwError.call(this, "val must be numbers", cb);
    if (val < -1 || val > +1)
        return throwError.call(this, "val must be a number between -1 and +1", cb);

    function adjust (value) {
        var x;
        if (val < 0) {
            x = (value > 127) ? 1 - value / 255 : value / 255;
            if (x < 0) x = 0;
            x = 0.5 * Math.pow(x * 2, 1 + val);
            return (value > 127) ? (1.0 - x) * 255 : x * 255;
        } else {
            x = (value > 127) ? 1 - value / 255 : value / 255;
            if (x < 0) x = 0;
            x = 0.5 * Math.pow(2 * x, ((val === 1) ? 127 : 1 / (1 - val)));
            return (value > 127) ? (1 - x) * 255 : x * 255;
        }
    }

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = adjust(this.bitmap.data[idx]);
        this.bitmap.data[idx+1] = adjust(this.bitmap.data[idx+1]);
        this.bitmap.data[idx+2] = adjust(this.bitmap.data[idx+2]);
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Apply a posterize effect
 * val the amount to adjust the contrast, minimum threshold is two
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.posterize = function (n, cb) {
    if (typeof n !== "number")
        return throwError.call(this, "n must be numbers", cb);

    if (n < 2) n = 2; // minumum of 2 levels

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = (Math.floor(this.bitmap.data[idx] / 255 * (n - 1)) / (n - 1)) * 255;
        this.bitmap.data[idx+1] = (Math.floor(this.bitmap.data[idx+1] / 255 * (n - 1)) / (n - 1)) * 255;
        this.bitmap.data[idx+2] = (Math.floor(this.bitmap.data[idx+2] / 255 * (n - 1)) / (n - 1)) * 255;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Get an image's histogram
 * @return {object} An object with an array of color occurence counts for each channel (r,g,b)
 */
function histogram () {
    var histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0)
    };

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, index) {
        histogram.r[this.bitmap.data[index+0]]++;
        histogram.g[this.bitmap.data[index+1]]++;
        histogram.b[this.bitmap.data[index+2]]++;
    });

    return histogram;
}

/**
 * Normalizes the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.normalize = function (cb) {
    var h = histogram.call(this);

    /**
     * Normalize values
     * @param  {integer} value Pixel channel value.
     * @param  {integer} min   Minimum value for channel
     * @param  {integer} max   Maximum value for channel
     * @return {integer}
     */
    var normalize = function (value, min, max) {
        return (value - min) * 255 / (max - min);
    };

    var getBounds = function (histogramChannel) {
        return [
            histogramChannel.findIndex(function (value) {
                return value > 0;
            }),
            255 - histogramChannel.slice().reverse().findIndex(function (value) {
                return value > 0;
            })
        ];
    };

    // store bounds (minimum and maximum values)
    var bounds = {
        r: getBounds(h.r),
        g: getBounds(h.g),
        b: getBounds(h.b)
    };

    // apply value transformations
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var r = this.bitmap.data[idx + 0];
        var g = this.bitmap.data[idx + 1];
        var b = this.bitmap.data[idx + 2];

        this.bitmap.data[idx + 0] = normalize(r, bounds.r[0], bounds.r[1]);
        this.bitmap.data[idx + 1] = normalize(g, bounds.g[0], bounds.g[1]);
        this.bitmap.data[idx + 2] = normalize(b, bounds.b[0], bounds.b[1]);
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

/**
 * Inverts the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.invert = function (cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = 255 - this.bitmap.data[idx];
        this.bitmap.data[idx+1] = 255 - this.bitmap.data[idx+1];
        this.bitmap.data[idx+2] = 255 - this.bitmap.data[idx+2];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Flip the image horizontally
 * @param horizontal a Boolean, if true the image will be flipped horizontally
 * @param vertical a Boolean, if true the image will be flipped vertically
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.mirror = Jimp.prototype.flip = function (horizontal, vertical, cb) {
    if (typeof horizontal !== "boolean" || typeof vertical !== "boolean")
        return throwError.call(this, "horizontal and vertical must be Booleans", cb);

    var bitmap = new Buffer(this.bitmap.data.length);
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var _x = (horizontal) ? (this.bitmap.width - 1 - x) : x;
        var _y = (vertical) ? (this.bitmap.height - 1 - y) : y;
        var _idx = (this.bitmap.width * _y + _x) << 2;

        var data = this.bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, _idx, true);
    });

    this.bitmap.data = new Buffer(bitmap);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Applies a true Gaussian blur to the image (warning: this is VERY slow)
 * @param r the pixel radius of the blur
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.gaussian = function (r, cb) {
    // http://blog.ivank.net/fastest-gaussian-blur.html
    if (typeof r !== "number")
        return throwError.call(this, "r must be a number", cb);
    if (r < 1)
        return throwError.call(this, "r must be greater than 0", cb);

    var rs = Math.ceil(r * 2.57); // significant radius

    for (let y = 0; y < this.bitmap.height; y++) {
        log("Gaussian: " + Math.round(y / this.bitmap.height * 100) + "%");
        for (let x = 0; x < this.bitmap.width; x++) {
            var red = 0;
            var green = 0;
            var blue = 0;
            var alpha = 0;
            var wsum = 0;
            for (let iy = y - rs; iy < y + rs + 1; iy++) {
                for (let ix = x - rs; ix < x + rs + 1; ix++) {
                    let x1 = Math.min(this.bitmap.width - 1, Math.max(0, ix));
                    let y1 = Math.min(this.bitmap.height - 1, Math.max(0, iy));
                    let dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
                    let wght = Math.exp(-dsq / (2*r*r)) / (Math.PI*2*r*r);
                    let idx = (y1 * this.bitmap.width + x1) << 2;
                    red += this.bitmap.data[idx] * wght;
                    green += this.bitmap.data[idx+1] * wght;
                    blue += this.bitmap.data[idx+2] * wght;
                    alpha += this.bitmap.data[idx+3] * wght;
                    wsum += wght;
                }
                let idx = (y * this.bitmap.width + x) << 2;
                this.bitmap.data[idx] = Math.round(red / wsum);
                this.bitmap.data[idx+1] = Math.round(green / wsum);
                this.bitmap.data[idx+2] = Math.round(blue / wsum);
                this.bitmap.data[idx+3] = Math.round(alpha / wsum);
            }
        }
    }

    clear(); // clear the log

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

var mulTable = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];

var shgTable = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];

/**
 * A fast blur algorithm that produces similar effect to a Gausian blur - but MUCH quicker
 * @param r the pixel radius of the blur
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.blur = function (r, cb) {
    if (typeof r !== "number")
        return throwError.call(this, "r must be a number", cb);
    if (r < 1)
        return throwError.call(this, "r must be greater than 0", cb);

    var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw, pa;
    var wm = this.bitmap.width - 1;
    var hm = this.bitmap.height - 1;
    // var wh = this.bitmap.width * this.bitmap.height;
    var rad1 = r + 1;

    var mulSum = mulTable[r];
    var shgSum = shgTable[r];

    var red = [];
    var green = [];
    var blue = [];
    var alpha = [];

    var vmin = [];
    var vmax = [];

    var iterations = 2;
    while (iterations-- > 0) {
        yw = yi = 0;

        for (y = 0; y < this.bitmap.height; y++) {
            rsum = this.bitmap.data[yw] * rad1;
            gsum = this.bitmap.data[yw + 1] * rad1;
            bsum = this.bitmap.data[yw + 2] * rad1;
            asum = this.bitmap.data[yw + 3] * rad1;

            for (i = 1; i <= r; i++) {
                p = yw + (((i > wm ? wm : i)) << 2);
                rsum += this.bitmap.data[p++];
                gsum += this.bitmap.data[p++];
                bsum += this.bitmap.data[p++];
                asum += this.bitmap.data[p];
            }

            for (x = 0; x < this.bitmap.width; x++) {
                red[yi] = rsum;
                green[yi] = gsum;
                blue[yi] = bsum;
                alpha[yi] = asum;

                if (y === 0) {
                    vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
                    vmax[x] = ((p = x - r) > 0 ? p << 2 : 0);
                }

                p1 = yw + vmin[x];
                p2 = yw + vmax[x];

                rsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                gsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                bsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                asum += this.bitmap.data[p1] - this.bitmap.data[p2];

                yi++;
            }
            yw += (this.bitmap.width << 2);
        }

        for (x = 0; x < this.bitmap.width; x++) {
            yp = x;
            rsum = red[yp] * rad1;
            gsum = green[yp] * rad1;
            bsum = blue[yp] * rad1;
            asum = alpha[yp] * rad1;

            for (i = 1; i <= r; i++) {
                yp += (i > hm ? 0 : this.bitmap.width);
                rsum += red[yp];
                gsum += green[yp];
                bsum += blue[yp];
                asum += alpha[yp];
            }

            yi = x << 2;
            for (y = 0; y < this.bitmap.height; y++) {
                this.bitmap.data[yi + 3] = pa = (asum * mulSum) >>> shgSum;
                if (pa > 255) this.bitmap.data[yi + 3] = 255; // normalise alpha
                if (pa > 0) {
                    pa = 255 / pa;
                    this.bitmap.data[yi] = ((rsum * mulSum) >>> shgSum) * pa;
                    this.bitmap.data[yi + 1] = ((gsum * mulSum) >>> shgSum) * pa;
                    this.bitmap.data[yi + 2] = ((bsum * mulSum) >>> shgSum) * pa;
                } else {
                    this.bitmap.data[yi] = this.bitmap.data[yi + 1] = this.bitmap.data[yi + 2] = 0;
                }
                if (x === 0) {
                    vmin[y] = ((p = y + rad1) < hm ? p : hm) * this.bitmap.width;
                    vmax[y] = ((p = y - r) > 0 ? p * this.bitmap.width : 0);
                }

                p1 = x + vmin[y];
                p2 = x + vmax[y];

                rsum += red[p1] - red[p2];
                gsum += green[p1] - green[p2];
                bsum += blue[p1] - blue[p2];
                asum += alpha[p1] - alpha[p2];

                yi += this.bitmap.width << 2;
            }
        }
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Adds each element of the image to its local neighbors, weighted by the kernel
 * @param kernel a matrix to weight the neighbors sum
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.convolution = function (kernel, edgeHandling, cb) {
    if (typeof edgeHandling === "function" && typeof cb === "undefined") {
        cb = edgeHandling;
        edgeHandling = null;
    }
    if (!edgeHandling) edgeHandling = Jimp.EDGE_EXTEND;
    var newData = new Buffer(this.bitmap.data);
    var weight, rSum, gSum, bSum, ri, gi, bi, xi, yi, idxi;
    var kRows = kernel.length;
    var kCols = kernel[0].length;
    var rowEnd = Math.floor(kRows/2);
    var colEnd = Math.floor(kCols/2);
    var rowIni = -rowEnd;
    var colIni = -colEnd;
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        rSum = gSum = bSum = 0;
        for (let row=rowIni; row<=rowEnd; row++) {
            for (let col=colIni; col<=colEnd; col++) {
                xi = x + col;
                yi = y + row;
                weight = kernel[row+rowEnd][col+colEnd];
                idxi = this.getPixelIndex(xi, yi, edgeHandling);
                if (idxi === -1) ri = gi = bi = 0;
                else {
                    ri = this.bitmap.data[idxi+0];
                    gi = this.bitmap.data[idxi+1];
                    bi = this.bitmap.data[idxi+2];
                }
                rSum += weight * ri;
                gSum += weight * gi;
                bSum += weight * bi;
            }
        }
        if (rSum < 0) rSum = 0;
        if (gSum < 0) gSum = 0;
        if (bSum < 0) bSum = 0;
        if (rSum > 255) rSum = 255;
        if (gSum > 255) gSum = 255;
        if (bSum > 255) bSum = 255;
        newData[idx+0] = rSum;
        newData[idx+1] = gSum;
        newData[idx+2] = bSum;
    });
    this.bitmap.data = newData;
    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

/**
 * Removes colour from the image using ITU Rec 709 luminance values
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.greyscale = function (cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var grey = parseInt(0.2126 * this.bitmap.data[idx] + 0.7152 * this.bitmap.data[idx+1] + 0.0722 * this.bitmap.data[idx+2], 10);
        this.bitmap.data[idx] = grey;
        this.bitmap.data[idx+1] = grey;
        this.bitmap.data[idx+2] = grey;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

// Alias of greyscale for our American friends
Jimp.prototype.grayscale = Jimp.prototype.greyscale;

/**
 * Applies a sepia tone to the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.sepia = function (cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var red = this.bitmap.data[idx];
        var green = this.bitmap.data[idx+1];
        var blue = this.bitmap.data[idx+2];

        red = (red * 0.393) + (green * 0.769) + (blue * 0.189);
        green = (red * 0.349) + (green * 0.686) + (blue * 0.168);
        blue = (red * 0.272) + (green * 0.534) + (blue * 0.131);
        this.bitmap.data[idx] = (red < 255) ? red : 255;
        this.bitmap.data[idx+1] = (green < 255) ? green : 255;
        this.bitmap.data[idx+2] = (blue < 255) ? blue : 255;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Multiplies the opacity of each pixel by a factor between 0 and 1
 * @param f A number, the factor by wich to multiply the opacity of each pixel
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.opacity = function (f, cb) {
    if (typeof f !== "number")
        return throwError.call(this, "f must be a number", cb);
    if (f < 0 || f > 1)
        return throwError.call(this, "f must be a number from 0 to 1", cb);

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var v = this.bitmap.data[idx+3] * f;
        this.bitmap.data[idx+3] = v;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Fades each pixel by a factor between 0 and 1
 * @param f A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.fade = function (f, cb) {
    if (typeof f !== "number")
        return throwError.call(this, "f must be a number", cb);
    if (f < 0 || f > 1)
        return throwError.call(this, "f must be a number from 0 to 1", cb);

    // this method is an alternative to opacity (which may be deprecated)
    this.opacity(1 - f);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Set the alpha channel on every pixel to fully opaque
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.opaque = function (cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx+3] = 255;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Resizes the image to a set width and height using a 2-pass bilinear algorithm
 * @param w the width to resize the image to (or Jimp.AUTO)
 * @param h the height to resize the image to (or Jimp.AUTO)
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.resize = function (w, h, mode, cb) {
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);

    if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
    }

    if (w === Jimp.AUTO && h === Jimp.AUTO)
        return throwError.call(this, "w and h cannot both the set to auto", cb);

    if (w === Jimp.AUTO) w = this.bitmap.width * (h / this.bitmap.height);
    if (h === Jimp.AUTO) h = this.bitmap.height * (w / this.bitmap.width);

    // round inputs
    w = Math.round(w);
    h = Math.round(h);

    if (typeof Resize2[mode] === "function") {
        var dst = {
            data: new Buffer(w * h * 4),
            width: w,
            height: h
        };
        Resize2[mode](this.bitmap, dst);
        this.bitmap = dst;
    } else {
        var that = this;
        var resize = new Resize(this.bitmap.width, this.bitmap.height, w, h, true, true, function (buffer) {
            that.bitmap.data = new Buffer(buffer);
            that.bitmap.width = w;
            that.bitmap.height = h;
        });
        resize.resize(this.bitmap.data);
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) alignBits A bitmask for horizontal and vertical alignment
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.cover = function (w, h, alignBits, mode, cb) {
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);

    if (alignBits && typeof alignBits === "function" && typeof cb === "undefined") {
        cb = alignBits;
        alignBits = null;
        mode = null;
    } else if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
    }

    alignBits = alignBits || (Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
    var hbits = ((alignBits) & ((1<<(3))-1));
    var vbits = alignBits >> 3;

    // check if more flags than one is in the bit sets
    if (!(
        ((hbits !== 0) && !(hbits & (hbits - 1))) ||
        ((vbits !== 0) && !(vbits & (vbits - 1)))
    ))
        return throwError.call(this, "only use one flag per alignment direction", cb);

    var alignH = (hbits >> 1); // 0, 1, 2
    var alignV = (vbits >> 1); // 0, 1, 2

    var f = (w/h > this.bitmap.width/this.bitmap.height)
        ? w/this.bitmap.width : h/this.bitmap.height;
    this.scale(f, mode);
    this.crop(((this.bitmap.width - w) / 2) * alignH, ((this.bitmap.height - h) / 2) * alignV, w, h);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) alignBits A bitmask for horizontal and vertical alignment
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.contain = function (w, h, alignBits, mode, cb) {
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);

    // permit any sort of optional parameters combination
    if (typeof alignBits === "string") {
        if (typeof mode === "function" && typeof cb === "undefined") cb = mode;
        mode = alignBits;
        alignBits = null;
    }
    if (typeof alignBits === "function") {
        if (typeof cb === "undefined") cb = alignBits;
        mode = null;
        alignBits = null;
    }
    if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
    }

    alignBits = alignBits || (Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
    var hbits = ((alignBits) & ((1<<(3))-1));
    var vbits = alignBits >> 3;

    // check if more flags than one is in the bit sets
    if (!(
        ((hbits !== 0) && !(hbits & (hbits - 1))) ||
        ((vbits !== 0) && !(vbits & (vbits - 1)))
    ))
        return throwError.call(this, "only use one flag per alignment direction", cb);

    var alignH = (hbits >> 1); // 0, 1, 2
    var alignV = (vbits >> 1); // 0, 1, 2

    var f = (w/h > this.bitmap.width/this.bitmap.height)
        ? h/this.bitmap.height : w/this.bitmap.width;
    var c = this.cloneQuiet().scale(f, mode);

    this.resize(w, h, mode);
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data.writeUInt32BE(this._background, idx);
    });
    this.blit(c, ((this.bitmap.width - c.bitmap.width) / 2) * alignH, ((this.bitmap.height - c.bitmap.height) / 2) * alignV);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Uniformly scales the image by a factor.
 * @param f the factor to scale the image by
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.scale = function (f, mode, cb) {
    if (typeof f !== "number")
        return throwError.call(this, "f must be a number", cb);
    if (f < 0)
        return throwError.call(this, "f must be a positive number", cb);

    if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
    }

    var w = this.bitmap.width * f;
    var h = this.bitmap.height * f;
    this.resize(w, h, mode);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.scaleToFit = function (w, h, mode, cb) {
    if (typeof w !== "number" || typeof h !== "number")
        return throwError.call(this, "w and h must be numbers", cb);

    if (typeof mode === "function" && typeof cb === "undefined") {
        cb = mode;
        mode = null;
    }

    var f = (w/h > this.bitmap.width/this.bitmap.height)
        ? h/this.bitmap.height : w/this.bitmap.width;
    this.scale(f, mode);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Pixelates the image or a region
 * @param size the size of the pixels
 * @param (optional) x the x position of the region to pixelate
 * @param (optional) y the y position of the region to pixelate
 * @param (optional) w the width of the region to pixelate
 * @param (optional) h the height of the region to pixelate
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.pixelate = function (size, x, y, w, h, cb) {

    if (typeof x === "function") {
        cb = x;
        x = y = w = h = null;
    } else {
        if (typeof size !== "number")
            return throwError.call(this, "size must be a number", cb);
        if (isDef(x) && typeof x !== "number")
            return throwError.call(this, "x must be a number", cb);
        if (isDef(y) && typeof y !== "number")
            return throwError.call(this, "y must be a number", cb);
        if (isDef(w) && typeof w !== "number")
            return throwError.call(this, "w must be a number", cb);
        if (isDef(h) && typeof h !== "number")
            return throwError.call(this, "h must be a number", cb);
    }
    let kernel = [
        [1 / 16, 2 / 16, 1 / 16],
        [2 / 16, 4 / 16, 2 / 16],
        [1 / 16, 2 / 16, 1 / 16]
    ];

    x = x || 0;
    y = y || 0;
    w = isDef(w) ? x : this.bitmap.width - x;
    h = isDef(h) ? h : this.bitmap.height - y;

    var source = this.cloneQuiet();
    this.scanQuiet(x, y, w, h, function (xx, yx, idx) {

        xx = size * Math.floor(xx / size);
        yx = size * Math.floor(yx / size);

        var value = applyKernel(source, kernel, xx, yx);

        this.bitmap.data[idx] = value[0];
        this.bitmap.data[idx + 1] = value[1];
        this.bitmap.data[idx + 2] = value[2];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

/**
 * Applies a convolution kernel to the image or a region
 * @param kernel the convolution kernel
 * @param (optional) x the x position of the region to apply convolution to
 * @param (optional) y the y position of the region to apply convolution to
 * @param (optional) w the width of the region to apply convolution to
 * @param (optional) h the height of the region to apply convolution to
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.convolute = function (kernel, x, y, w, h, cb) {
    if (!Array.isArray(kernel))
        return throwError.call(this, "the kernel must be an array", cb);

    if (typeof x === "function") {
        cb = x;
        x = y = w = h = null;
    } else {
        if (isDef(x) && typeof x !== "number")
            return throwError.call(this, "x must be a number", cb);
        if (isDef(y) && typeof y !== "number")
            return throwError.call(this, "y must be a number", cb);
        if (isDef(w) && typeof w !== "number")
            return throwError.call(this, "w must be a number", cb);
        if (isDef(h) && typeof h !== "number")
            return throwError.call(this, "h must be a number", cb);
    }

    let ksize = (kernel.length - 1) / 2;

    x = isDef(x) ? x : ksize;
    y = isDef(y) ? y : ksize;
    w = isDef(w) ? w : this.bitmap.width - x;
    h = isDef(h) ? h : this.bitmap.height - y;

    var source = this.cloneQuiet();
    this.scanQuiet(x, y, w, h, function (xx, yx, idx) {
        var value = applyKernel(source, kernel, xx, yx);

        this.bitmap.data[idx] = value[0];
        this.bitmap.data[idx + 1] = value[1];
        this.bitmap.data[idx + 2] = value[2];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

function applyKernel (im, kernel, x, y) {
    let value = [0, 0, 0];
    let size = (kernel.length - 1) / 2;

    for (var kx = 0; kx < kernel.length; kx += 1) {
        for (var ky = 0; ky < kernel[kx].length; ky += 1) {
            var idx = im.getPixelIndex(x + kx - size, y + ky - size);
            value[0] += im.bitmap.data[idx] * kernel[kx][ky];
            value[1] += im.bitmap.data[idx + 1] * kernel[kx][ky];
            value[2] += im.bitmap.data[idx + 2] * kernel[kx][ky];
        }
    }
    return value;
}

/**
 * Rotates an image clockwise by a number of degrees rounded to the nearest 90 degrees. NB: 'this' must be a Jimp object.
 * @param deg the number of degress to rotate the image by
 * @returns nothing
 */
function simpleRotate (deg) {
    var i = Math.round(deg / 90) % 4;
    while (i < 0) i += 4;

    while (i > 0) {
        // https://github.com/ekulabuhov/jimp/commit/9a0c7cff88292d88c32a424b11256c76f1e20e46
        var dstBuffer = new Buffer(this.bitmap.data.length);
        var dstOffset = 0;
        for (let x = this.bitmap.width-1; x >= 0; x--) {
            for (let y = 0; y < this.bitmap.height; y++) {
                var srcOffset = (this.bitmap.width * y + x) << 2;
                var data = this.bitmap.data.readUInt32BE(srcOffset, true);
                dstBuffer.writeUInt32BE(data, dstOffset, true);
                dstOffset += 4;
            }
        }

        this.bitmap.data = new Buffer(dstBuffer);

        var tmp = this.bitmap.width;
        this.bitmap.width = this.bitmap.height;
        this.bitmap.height = tmp;

        i--;
    }
}

/**
 * Rotates an image clockwise by an arbitary number of degrees. NB: 'this' must be a Jimp object.
 * @param deg the number of degress to rotate the image by
 * @param (optional) mode resize mode or a boolean, if false then the width and height of the image will not be changed
 * @returns nothing
 */
function advancedRotate (deg, mode) {
    deg %= 360;
    var rad = deg * Math.PI / 180;
    var cosine = Math.cos(rad);
    var sine = Math.sin(rad);

    // the final width and height will change if resize == true
    var w = this.bitmap.width;
    var h = this.bitmap.height;

    if (mode === true || typeof mode === "string") {
        // resize the image to it maximum dimension and blit the existing image
        // onto the center so that when it is rotated the image is kept in bounds

        // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
        // Plus 1 border pixel to ensure to show all rotated result for some cases.
        w = Math.ceil(Math.abs(this.bitmap.width * cosine) + Math.abs(this.bitmap.height * sine)) + 1;
        h = Math.ceil(Math.abs(this.bitmap.width * sine) + Math.abs(this.bitmap.height * cosine)) + 1;
        // Ensure destination to have even size to a better result.
        if (w%2 !== 0) w++;
        if (h%2 !== 0) h++;

        var c = this.cloneQuiet();
        this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
            this.bitmap.data.writeUInt32BE(this._background, idx);
        });

        var max = Math.max(w, h, this.bitmap.width, this.bitmap.height);
        this.resize(max, max, mode);

        this.blit(c, this.bitmap.width / 2 - c.bitmap.width / 2, this.bitmap.height / 2 - c.bitmap.height / 2);
    }

    var bW = this.bitmap.width;
    var bH = this.bitmap.height;
    var dstBuffer = new Buffer(this.bitmap.data.length);

    function createTranslationFunction (deltaX, deltaY) {
        return function (x, y) {
            return {
                x: (x + deltaX),
                y: (y + deltaY)
            };
        }
    }

    var translate2Cartesian = createTranslationFunction(-(bW / 2), -(bH / 2));
    var translate2Screen = createTranslationFunction(bW / 2 + 0.5, bH / 2 + 0.5);

    for (let y = 1; y <= bH; y++) {
        for (let x = 1; x <= bW; x++) {
            var cartesian = translate2Cartesian(x, y);
            var source = translate2Screen(
                cosine * cartesian.x - sine * cartesian.y,
                cosine * cartesian.y + sine * cartesian.x
            );
            var dstIdx = (bW * (y-1) + x-1) << 2;
            if (source.x >= 0 && source.x < bW &&
                source.y >= 0 && source.y < bH) {
                var srcIdx = (bW * (source.y | 0) + source.x | 0) << 2;
                var pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx, true);
                dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
            } else {
                // reset off-image pixels
                dstBuffer.writeUInt32BE(this._background, dstIdx);
            }
        }
    }
    this.bitmap.data = dstBuffer;

    if (mode === true || typeof mode === "string") {
        // now crop the image to the final size
        var x = (bW / 2) - (w/2);
        var y = (bH / 2) - (h/2);
        this.crop(x, y, w, h);
    }

}

/**
 * Rotates the image clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
 * @param deg the number of degress to rotate the image by
 * @param (optional) mode resize mode or a boolean, if false then the width and height of the image will not be changed
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.rotate = function (deg, mode, cb) {
    // enable overloading
    if (typeof mode === "undefined" || mode === null) {
        // e.g. image.resize(120);
        // e.g. image.resize(120, null, cb);
        // e.g. image.resize(120, undefined, cb);
        mode = true;
    }
    if (typeof mode === "function" && typeof cb === "undefined") {
        // e.g. image.resize(120, cb);
        cb = mode;
        mode = true;
    }

    if (typeof deg !== "number")
        return throwError.call(this, "deg must be a number", cb);

    if (typeof mode !== "boolean" && typeof mode !== "string")
        return throwError.call(this, "mode must be a boolean or a string", cb);

    if (deg % 90 === 0 && Boolean(mode) === false)
        simpleRotate.call(this, deg, cb);
    else
        advancedRotate.call(this, deg, mode, cb);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Displaces the image based on the provided displacement map
 * @param map the source Jimp instance
 * @param offset the maximum displacement value
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.displace = function (map, offset, cb) {
    if (typeof map !== "object" || map.constructor !== Jimp)
        return throwError.call(this, "The source must be a Jimp image", cb);
    if (typeof offset !== "number")
        return throwError.call(this, "factor must be a number", cb);

    var source = this.cloneQuiet();
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {

        var displacement = map.bitmap.data[idx] / 256 * offset;
        displacement = Math.round(displacement);

        var ids = this.getPixelIndex(x + displacement, y);
        this.bitmap.data[ids] = source.bitmap.data[idx];
        this.bitmap.data[ids + 1] = source.bitmap.data[idx + 1];
        this.bitmap.data[ids + 2] = source.bitmap.data[idx + 2];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Converts the image to a buffer
 * @param mime the mime type of the image buffer to be created
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
 */
Jimp.prototype.getBuffer = function (mime, cb) {
    if (mime === Jimp.AUTO) { // allow auto MIME detection
        mime = this.getMIME();
    }

    if (typeof mime !== "string")
        return throwError.call(this, "mime must be a string", cb);
    if (typeof cb !== "function")
        return throwError.call(this, "cb must be a function", cb);

    switch (mime.toLowerCase()) {
        case Jimp.MIME_PNG:
            var that = this;
            var png = new PNG({
                width: this.bitmap.width,
                height: this.bitmap.height,
                bitDepth: 8,
                deflateLevel: this._deflateLevel,
                deflateStrategy: this._deflateStrategy,
                filterType: this._filterType,
                colorType: (this._rgba) ? 6 : 2,
                inputHasAlpha: true
            });

            if (this._rgba) png.data = new Buffer(this.bitmap.data);
            else png.data = compositeBitmapOverBackground(this).data; // when PNG doesn't support alpha

            StreamToBuffer(png.pack(), function (err, buffer) {
                if (err) return throwError.call(this, err, cb);
                return cb.call(that, null, buffer);
            });
            break;

        case Jimp.MIME_JPEG:
            // composite onto a new image so that the background shows through alpha channels
            var jpeg = JPEG.encode(compositeBitmapOverBackground(this), this._quality);
            return cb.call(this, null, jpeg.data);

        case Jimp.MIME_BMP:
        case Jimp.MIME_X_MS_BMP:
            // composite onto a new image so that the background shows through alpha channels
            var bmp = BMP.encode(compositeBitmapOverBackground(this));
            return cb.call(this, null, bmp.data);

        default:
            return cb.call(this, "Unsupported MIME type: " + mime);
    }

    return this;
};

function compositeBitmapOverBackground (image) {
    return (new Jimp(image.bitmap.width, image.bitmap.height, image._background)).composite(image, 0, 0).bitmap;
}

/**
 * Converts the image to a base 64 string
 * @param mime the mime type of the image data to be created
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
 */
Jimp.prototype.getBase64 = function (mime, cb) {
    if (mime === Jimp.AUTO) { // allow auto MIME detection
        mime = this.getMIME();
    }

    if (typeof mime !== "string")
        return throwError.call(this, "mime must be a string", cb);
    if (typeof cb !== "function")
        return throwError.call(this, "cb must be a function", cb);

    this.getBuffer(mime, function (err, data) {
        if (err) return throwError.call(this, err, cb);
        var src = "data:" + mime + ";base64," + data.toString("base64");
        return cb.call(this, null, src);
    });

    return this;
};

/**
 * Apply a ordered dithering effect
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.dither565 = function (cb) {
    var rgb565Matrix = [
        1, 9, 3, 11,
        13, 5, 15, 7,
        4, 12, 2, 10,
        16, 8, 14, 6
    ];
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var tressholdId = ((y & 3) << 2) + (x % 4);
        var dither = rgb565Matrix[tressholdId];
        this.bitmap.data[idx]   = Math.min(this.bitmap.data[idx]   + dither, 0xff);
        this.bitmap.data[idx+1] = Math.min(this.bitmap.data[idx+1] + dither, 0xff);
        this.bitmap.data[idx+2] = Math.min(this.bitmap.data[idx+2] + dither, 0xff);
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

// alternative reference
Jimp.prototype.dither16 = Jimp.prototype.dither565;

/**
 * Apply multiple color modification rules
 * @param actions list of color modification rules, in following format: { apply: '<rule-name>', params: [ <rule-parameters> ]  }
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.color = Jimp.prototype.colour = function (actions, cb) {
    if (!actions || !Array.isArray(actions))
        return throwError.call(this, "actions must be an array", cb);

    var originalScope = this;
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var clr = TinyColor({r: this.bitmap.data[idx], g: this.bitmap.data[idx + 1], b: this.bitmap.data[idx + 2]});

        var colorModifier = function (i, amount) {
            let c = clr.toRgb();
            c[i] = Math.max(0, Math.min(c[i] + amount, 255));
            return TinyColor(c);
        }

        actions.forEach(function (action) {
            if (action.apply === "mix") {
                clr = TinyColor.mix(clr, action.params[0], action.params[1]);
            } else if (action.apply === "tint") {
                clr = TinyColor.mix(clr, "white", action.params[0]);
            } else if (action.apply === "shade") {
                clr = TinyColor.mix(clr, "black", action.params[0]);
            } else if (action.apply === "xor") {
                var clr2 = TinyColor(action.params[0]).toRgb();
                clr = clr.toRgb();
                clr = TinyColor({
                    r: clr.r ^ clr2.r,
                    g: clr.g ^ clr2.g,
                    b: clr.b ^ clr2.b
                });
            } else if (action.apply === "red") {
                clr = colorModifier("r", action.params[0]);
            } else if (action.apply === "green") {
                clr = colorModifier("g", action.params[0]);
            } else if (action.apply === "blue") {
                clr = colorModifier("b", action.params[0]);
            } else {
                if (action.apply === "hue") {
                    action.apply = "spin";
                }

                var fn = clr[action.apply];
                if (!fn) {
                    return throwError.call(originalScope, "action " + action.apply + " not supported", cb);
                }
                clr = fn.apply(clr, action.params);
            }
        });

        clr = clr.toRgb();
        this.bitmap.data[idx]   = clr.r;
        this.bitmap.data[idx+1] = clr.g;
        this.bitmap.data[idx+2] = clr.b;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

/**
 * Loads a bitmap font from a file
 * @param file the file path of a .fnt file
 * @param (optional) cb a function to call when the font is loaded
 * @returns a promise
 */
Jimp.loadFont = function (file, cb) {
    if (typeof file !== "string")
        return throwError.call(this, "file must be a string", cb);

    var that = this;

    return new Promise(function (resolve, reject) {
        cb = cb || function (err, font) {
            if (err) reject(err);
            else resolve(font);
        }

        BMFont(file, function (err, font) {
            var chars = {};
            var kernings = {};

            if (err) return throwError.call(that, err, cb);

            for (let i = 0; i < font.chars.length; i++) {
                chars[String.fromCharCode(font.chars[i].id)] = font.chars[i];
            }

            for (let i = 0; i < font.kernings.length; i++) {
                var firstString = String.fromCharCode(font.kernings[i].first);
                kernings[firstString] = kernings[firstString] || {};
                kernings[firstString][String.fromCharCode(font.kernings[i].second)] = font.kernings[i].amount;
            }

            loadPages(Path.dirname(file), font.pages).then(function (pages) {
                cb(null, {
                    chars: chars,
                    kernings: kernings,
                    pages: pages,
                    common: font.common,
                    info: font.info
                });
            });
        });
    });
};

function loadPages (dir, pages) {
    var newPages = pages.map(function (page) {
        return Jimp.read(dir + '/' + page);
    });

    return Promise.all(newPages);
}

/**
 * Draws a text on a image on a given boundary
 * @param font a bitmap font loaded from `Jimp.loadFont` command
 * @param x the x position to start drawing the text
 * @param y the y position to start drawing the text
 * @param text the text to draw (string or object with `text`, `alignmentX`, and/or `alignmentY`)
 * @param maxWidth (optional) the boundary width to draw in
 * @param maxHeight (optional) the boundary height to draw in
 * @param (optional) cb a function to call when the text is written
 * @returns this for chaining of methods
 */
Jimp.prototype.print = function (font, x, y, text, maxWidth, maxHeight, cb) {
    if (typeof maxWidth === "function" && typeof cb === "undefined") {
        cb = maxWidth;
        maxWidth = Infinity;
    }
    if (typeof maxWidth === "undefined") {
        maxWidth = Infinity;
    }
    if (typeof maxHeight === "function" && typeof cb === "undefined") {
        cb = maxHeight;
        maxWidth = Infinity;
    }
    if (typeof maxHeight === "undefined") {
        maxHeight = Infinity;
    }

    if (typeof font !== "object")
        return throwError.call(this, "font must be a Jimp loadFont", cb);
    if (typeof x !== "number" || typeof y !== "number" || typeof maxWidth !== "number")
        return throwError.call(this, "x, y and maxWidth must be numbers", cb);
    if (typeof text !== "string" && typeof text !== "object")
        return throwError.call(this, "text must be a string or an object", cb);
    if (typeof maxWidth !== "number")
        return throwError.call(this, "maxWidth must be a number", cb);
    if (typeof maxHeight !== "number")
        return throwError.call(this, "maxHeight must be a number", cb);

    var that = this;

    var alignmentX;
    var alignmentY;
    if (typeof text === "object") {
        alignmentX = text.alignmentX || Jimp.HORIZONTAL_ALIGN_LEFT;
        alignmentY = text.alignmentY || Jimp.VERTICAL_ALIGN_TOP;
        text = text.text;
    } else {
        alignmentX = Jimp.HORIZONTAL_ALIGN_LEFT;
        alignmentY = Jimp.VERTICAL_ALIGN_TOP;
    }

    if (maxHeight !== Infinity && alignmentY === Jimp.VERTICAL_ALIGN_BOTTOM) {
        y = maxHeight - measureTextHeight(font, text, maxWidth);
    } else if (maxHeight !== Infinity && alignmentY === Jimp.VERTICAL_ALIGN_MIDDLE) {
        y = (maxHeight / 2) - (measureTextHeight(font, text, maxWidth) / 2);
    }

    var words = text.split(' ');
    var line = '';

    for (let n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var testWidth = measureText(font, testLine);
        if (testWidth > maxWidth && n > 0) {
            that = that.print(font, x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX), y, line);
            line = words[n] + ' ';
            y += font.common.lineHeight;
        } else {
            line = testLine;
        }
    }
    printText.call(this, font, x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX), y, line);

    if (isNodePattern(cb)) return cb.call(this, null, that);
    else return that;
};

function xOffsetBasedOnAlignment (font, line, maxWidth, alignment) {
    if (alignment === Jimp.HORIZONTAL_ALIGN_LEFT) {
        return 0;
    }

    if (alignment === Jimp.HORIZONTAL_ALIGN_CENTER) {
        return (maxWidth - measureText(font, line)) / 2;
    }

    return maxWidth - measureText(font, line);
}

function printText (font, x, y, text) {
    for (let i = 0; i < text.length; i++) {
        if (font.chars[text[i]]) {
            drawCharacter(this, font, x, y, font.chars[text[i]]);
            x += (font.kernings[text[i]] && font.kernings[text[i]][text[i+1]] ? font.kernings[text[i]][text[i+1]] : 0) + (font.chars[text[i]].xadvance || 0);
        }
    }
}

function drawCharacter (image, font, x, y, char) {
    if (char.width > 0 && char.height > 0) {
        var imageChar = font.pages[char.page].cloneQuiet().crop(char.x, char.y, char.width, char.height);
        return image.composite(imageChar, x + char.xoffset, y + char.yoffset);
    }
    return image;
}

function measureText (font, text) {
    var x = 0;
    for (let i = 0; i < text.length; i++) {
        if (font.chars[text[i]]) {
            x += font.chars[text[i]].xoffset +
            (font.kernings[text[i]] && font.kernings[text[i]][text[i+1]]
                ? font.kernings[text[i]][text[i+1]] : 0) +
            (font.chars[text[i]].xadvance || 0);
        }
    }

    return x;
}

function measureTextHeight (font, text, maxWidth) {
    var words = text.split(' ');
    var line = '';
    var textTotalHeight = font.common.lineHeight;

    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let testWidth = measureText(font, testLine);

        if (testWidth > maxWidth && n > 0) {
            textTotalHeight += font.common.lineHeight;
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }

    return textTotalHeight;
}

/**
 * Writes the image to a file
 * @param path a path to the destination file (either PNG or JPEG)
 * @param (optional) cb a function to call when the image is saved to disk
 * @returns this for chaining of methods
 */
Jimp.prototype.write = function (path, cb) {
    if (!FS || !FS.createWriteStream) {
        throw Error('Cant access the filesystem. You can use the getBase64 method.');
    }
    if (typeof path !== "string")
        return throwError.call(this, "path must be a string", cb);
    if (typeof cb === "undefined") cb = function () {};
    if (typeof cb !== "function")
        return throwError.call(this, "cb must be a function", cb);

    var that = this;
    var mime = MIME.lookup(path);

    var pathObj = Path.parse(path);
    if (pathObj.dir) MkDirP.sync(pathObj.dir);

    this.getBuffer(mime, function (err, buffer) {
        if (err) return throwError.call(that, err, cb);
        var stream = FS.createWriteStream(path);
        stream.on("open", function () {
            stream.write(buffer);
            stream.end();
        }).on("error", function (err) {
            return throwError.call(that, err, cb);
        });
        stream.on("finish", function () {
            return cb.call(that, null, that);
        });
    });

    return this;
};

/* Nicely format Jimp object when sent to the console e.g. console.log(imgage) */
Jimp.prototype.inspect = function () {
    return '<Jimp ' +
        (this.bitmap === Jimp.prototype.bitmap ? 'pending...'
            : this.bitmap.width + 'x' + this.bitmap.height) +
        '>';
};

// Nicely format Jimp object when converted to a string
Jimp.prototype.toString = function () {
    return '[object Jimp]';
};

if (process.env.ENVIRONMENT === "BROWSER") {
    // For use in a web browser or web worker
    /* global self */
    var gl;
    if (typeof window !== "undefined" && typeof window === "object") gl = window;
    if (typeof self !== "undefined" && typeof self === "object") gl = self;

    gl.Jimp = Jimp;
    gl.Buffer = Buffer;
}

module.exports = Jimp;
