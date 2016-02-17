var FS = require("fs");
var PNG = require("pngjs").PNG;
var JPEG = require("jpeg-js");
var BMP = require("bmp-js");
var MIME = require("mime");
var tinycolor = require("tinycolor2");
var Resize = require("./resize.js");
var StreamToBuffer = require("stream-to-buffer");
var ReadChunk = require("read-chunk");
var FileType = require("file-type");
var PixelMatch = require("pixelmatch");
var EXIFParser = require("exif-parser");
var ImagePHash = require("./phash.js");
var BigNumber = require('bignumber.js');
var URLRegEx = require("url-regex");
var Request = require('request').defaults({ encoding: null });

// polyfill Promise for Node < 0.12
var Promise = Promise || require('es6-promise').Promise;

// logging methods

var chars = 0;

function log(msg) {
    clear();
    process.stdout.write(msg);
    chars = msg.length;
}

function clear() {
    while (chars-- > 0) {
        process.stdout.write("\b");
    }
}

process.on("exit", clear);

// no operation
function noop(){};

// error checking methods

function isNodePattern(cb) {
    if ("undefined" == typeof cb) return false;
    if ("function" != typeof cb)
        throw new Error("Callback must be a function");
    return true;
}

function throwError(error, cb) {
    if ("string" == typeof error) error = new Error(error);
    if ("function" == typeof cb) return cb.call(this, error);
    else throw error;
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

function Jimp() {
    if ("number" == typeof arguments[0] && "number" == typeof arguments[1]) {
        // create a new image
        var w = arguments[0];
        var h = arguments[1];
        var cb = arguments[2];
        
        if ("number" == typeof arguments[2]) {
            this._background = arguments[2];
            var cb = arguments[3];
        }

        if ("undefined" == typeof cb) cb = noop;
        if ("function" != typeof cb)
            return throwError.call(this, "cb must be a function", cb);

        this.bitmap = {
            data: new Buffer(w * h * 4),
            width: w,
            height: h
        };

        for (var i = 0; i < this.bitmap.data.length; i=i+4) {
            this.bitmap.data.writeUInt32BE(this._background, i);
        }

        cb.call(this, null, this);
    } else if ("object" == typeof arguments[0] && arguments[0].constructor == Jimp) {
        // clone an existing Jimp
        var original = arguments[0];
        var cb = arguments[1];

        if ("undefined" == typeof cb) cb = noop;
        if ("function" != typeof cb)
            return throwError.call(this, "cb must be a function", cb);

        var bitmap = new Buffer(original.bitmap.data.length);
        original.scan(0, 0, original.bitmap.width, original.bitmap.height, function (x, y, idx) {
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
        this._filterType = original._filterType;
        this._rgba = original._rgba;
        this._background = original._background;

        cb.call(this, null, this);
    } else if (URLRegEx({exact: true}).test(arguments[0])) {
        // read from a URL
        var url = arguments[0];
        var cb = arguments[1];
        
        if ("undefined" == typeof cb) cb = noop;
        if ("function" != typeof cb)
            return throwError.call(this, "cb must be a function", cb);
        
        var that = this;
        Request(url, function (err, response, data) {
            if (err) return throwError.call(that, err, cb);
            if ("object" == typeof data && Buffer == data.constructor) {
                var mime = getMIMEFromBuffer(data);
                if ("string" != typeof mime)
                    return throwError.call(that, "Could not find MIME for Buffer <" + url + "> (HTTP: " + response.statusCode + ")", cb);
                parseBitmap.call(that, data, mime, cb);
            } else return throwError.call(that, "Could not load Buffer from URL <" + url + "> (HTTP: " + response.statusCode + ")", cb);
        });
    } else if ("string" == typeof arguments[0]) {
        // read from a path
        var path = arguments[0];
        var cb = arguments[1];
        
        if ("undefined" == typeof cb) cb = noop;
        if ("function" != typeof cb)
            return throwError.call(this, "cb must be a function", cb);

        var that = this;
        getMIMEFromPath(path, function (err, mime) {
            FS.readFile(path, function (err, data) {
                if (err) return throwError.call(that, err, cb);
                parseBitmap.call(that, data, mime, cb);
            });
        });
    } else if ("object" == typeof arguments[0]) {
        // read from a buffer
        var data = arguments[0];
        var mime = getMIMEFromBuffer(data);
        var cb = arguments[1];

        if (Buffer != data.constructor)
            return throwError.call(this, "data must be a Buffer", cb);
        if ("string" != typeof mime)
            return throwError.call(this, "mime must be a string", cb);
        if ("function" != typeof cb)
            return throwError.call(this, "cb must be a function", cb);

        parseBitmap.call(this, data, mime, cb);
    } else {
        return throwError.call(this, "No matching constructor overloading was found. Please see the docs for how to call the Jimp constructor.", cb);
    }
}

/**
 * Read an image from a file or a Buffer
 * @param src the path to the file or a Buffer containing the file data
 * @param cb (optional) a callback function when the file is read
 * @retuns a promise
 */
Jimp.read = function(src, cb) {
    var promise = new Promise(
        function(resolve, reject) {
            cb = cb || function(err, image) {
                if (err) reject(err);
                else resolve(image);
            }
            if ("string" != typeof src && ("object" != typeof src || Buffer != src.constructor))
                return throwError.call(this, "src must be a string or a Buffer", cb);
            var img = new Jimp(src, cb);
        }
    );
    return promise;
}

// MIME type methods

function getMIMEFromBuffer(buffer) {
    if (FileType(buffer)) return FileType(buffer).mime;
    else return "";
}

// gets a MIME type of a file from the path to it
function getMIMEFromPath(path, cb) {
    ReadChunk(path, 0, 262, function (err, buffer) {
        if (err) { cb(null, ""); }
        var fileType = FileType(buffer);
        return cb && cb(null, fileType && fileType.mime || "");
    });
}

//=> {ext: 'png', mime: 'image/png'}

// parses a bitmap from the constructor to the JIMP bitmap property
function parseBitmap(data, mime, cb) {
    var that = this;

    switch (mime.toLowerCase()) {
        case Jimp.MIME_PNG:
            var png = new PNG();
            png.parse(data, function(err, data) {
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
            this.bitmap = JPEG.decode(data);
            exifRotate(this, data); // EXIF data
            return cb.call(this, null, this);

        case Jimp.MIME_BMP:
            this.bitmap = BMP.decode(data);
            return cb.call(this, null, this);

        default:
            return throwError.call(this, "Unsupported MIME type: " + mime, cb);
    }
}

/*
 * Automagically rotates a JPEG image based on its EXIF data
 * @params image a Jimp image
 * @params buffer a buffer array of the raw JPEG data
 * @returns nothing
 */
function exifRotate(image, buffer) {
    var exif = EXIFParser.create(buffer).parse();
    if (!exif || !exif.tags || !exif.tags.Orientation) return;
    switch (exif.tags.Orientation) {
        case 1: // Horizontal (normal)
            // do nothing
            break;
        case 2: // Mirror horizontal
            image.mirror(true, false);
            break;
        case 3: // Rotate 180
            image.rotate(180);
            break;
        case 4: // Mirror vertical
            image.mirror(false, true);
            break;
        case 5: // Mirror horizontal and rotate 270 CW
            image.mirror(true, false).rotate(270);
            break;
        case 6: // Rotate 90 CW
            image.rotate(90);
            break;
        case 7: // Mirror horizontal and rotate 90 CW
            image.mirror(true, false).rotate(90);
            break;
        case 8: // Rotate 270 CW
            image.rotate(270);
            break;
    }
}

// used to auto resizing etc.
Jimp.AUTO = -1;

// supported mime types
Jimp.MIME_PNG = "image/png";
Jimp.MIME_JPEG = "image/jpeg";
Jimp.MIME_BMP = "image/bmp";

// PNG filter types
Jimp.PNG_FILTER_AUTO = -1;
Jimp.PNG_FILTER_NONE = 0;
Jimp.PNG_FILTER_SUB = 1;
Jimp.PNG_FILTER_UP = 2;
Jimp.PNG_FILTER_AVERAGE = 3;
Jimp.PNG_FILTER_PAETH = 4;

// Align modes for cover, contain, bit masks
Jimp.HORIZONTAL_ALIGN_LEFT = 1;
Jimp.HORIZONTAL_ALIGN_CENTER = 2;
Jimp.HORIZONTAL_ALIGN_RIGHT = 4;

Jimp.VERTICAL_ALIGN_TOP = 8;
Jimp.VERTICAL_ALIGN_MIDDLE = 16;
Jimp.VERTICAL_ALIGN_BOTTOM = 32;

// Resize modes for imagejs
Jimp.RESIZE_NEAREST_NEIGHBOR = 'nearestNeighbor';
Jimp.RESIZE_BILINEAR = 'bilinearInterpolation';
Jimp.RESIZE_BICUBIC = 'bicubicInterpolation';
Jimp.RESIZE_HERMITE = 'hermiteInterpolation';
Jimp.RESIZE_BEZIER = 'bezierInterpolation';

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param r the red value (0-255)
 * @param g the green value (0-255)
 * @param b the blue value (0-255)
 * @param a the alpha value (0-255)
 * @param cb (optional) A callback for when complete
 * @returns an single integer colour value
 */
Jimp.rgbaToInt = function(r, g, b, a, cb){
    if ("number" != typeof r || "number" != typeof g || "number" != typeof b || "number" != typeof a)
        return throwError.call(this, "r, g, b and a must be numbers", cb);
    if (r < 0 || r > 255)
        return throwError.call(this, "r must be between 0 and 255", cb);
    if (g < 0 || g > 255)
        throwError.call(this, "g must be between 0 and 255", cb);
    if (b < 0 || b > 255)
        return throwError.call(this, "b must be between 0 and 255", cb);
    if (a < 0 || a > 255)
        return throwError.call(this, "a must be between 0 and 255", cb);
    
    var i = (r * Math.pow(256, 3)) + (g * Math.pow(256, 2)) + (b *  Math.pow(256, 1)) + (a * Math.pow(256, 0));
    
    if (isNodePattern(cb)) return cb.call(this, null, i);
    else return i;
}

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @param cb (optional) A callback for when complete
 * @returns an object with the properties r, g, b and a representing RGBA values
 */
Jimp.intToRGBA = function(i, cb){
    if ("number" != typeof i)
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
Jimp.limit255 = function(n) {
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
    if ("object" != typeof img1 || img1.constructor != Jimp || "object" != typeof img2 || img2.constructor != Jimp)
        return throwError.call(this, "img1 and img2 must be an Jimp images");

    if (img1.bitmap.width != img2.bitmap.width || img1.bitmap.height != img2.bitmap.height) {
        switch (img1.bitmap.width * img1.bitmap.height > img2.bitmap.width * img2.bitmap.height) {
            case true: // img1 is bigger
                img1 = img1.clone().resize(img2.bitmap.width, img2.bitmap.height);
                break;
            default:
                // img2 is bigger (or they are the same in area)
                img2 = img2.clone().resize(img1.bitmap.width, img1.bitmap.height);
                break;
        }
    }
    
    threshold = threshold || 0.1;
    if ("number" != typeof threshold || threshold < 0 || threshold > 1)
        return throwError.call(this, "threshold must be a number between 0 and 1");

    var diff = new Jimp(img1.bitmap.width, img1.bitmap.height, 0xFFFFFFFF);

    var numDiffPixels = PixelMatch(
        img1.bitmap.data,
        img2.bitmap.data,
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
 * Calculates the hammering distance of two images based on their perceptual hash
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
Jimp.prototype._filterType = Jimp.PNG_FILTER_AUTO;

// Whether PNGs will be exported as RGB or RGBA
Jimp.prototype._rgba = true;

// Default colour to use for new pixels
Jimp.prototype._background = 0x00000000;

// Default align factors
Jimp.prototype._align_h = 1;
Jimp.prototype._align_v = 1;

/**
 * Creates a new image that is a clone of this one.
 * @param cb (optional) A callback for when complete
 * @returns the new image
 */
Jimp.prototype.clone = function (cb) {
    var clone = new Jimp(this);

    if (isNodePattern(cb)) return cb.call(clone, null, clone);
    else return clone;
};

/**
 * Sets the quality of the image when saving as JPEG format (default is 100)
 * @param n The quality to use 0-100
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.quality = function (n, cb) {
    if ("number" != typeof n)
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
    if ("number" != typeof l)
        return throwError.call(this, "l must be a number", cb);
    if (l < 0 || l > 9)
        return throwError.call(this, "l must be a number 0 - 9", cb);

    this._deflateLevel = Math.round(l);

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
    if ("number" != typeof f)
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
    if ("boolean" != typeof bool)
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
Jimp.prototype.background = function (hex, cb) {
    if ("number" != typeof hex)
        return throwError.call(this, "hex must be a hexadecimal rgba value", cb);

    this._background = hex;

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};


/**
 * Sets the alignment mode for cover and contain
 * @param bits A bitmask for horizontal and vertical alignment
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.align = function (bits, cb) {
    if ("number" != typeof bits)
        return throwError.call(this, "bits must be a bit mask", cb);
    if (bits < 1 || bits > 36)
        return throwError.call(this, "bits must be a number 1 - 36", cb);
    
    var hbits = ((bits) & ((1<<(3))-1));
    var vbits = bits >> 3;
    
    // check if more flags than one is in the bit sets
    if(!(((hbits != 0) && !(hbits & (hbits - 1))) || ((vbits != 0) && !(vbits & (vbits - 1)))))
        return throwError.call(this, "only use one flag per alignment direction", cb);
    
    this._align_h = (hbits >> 1); // 0, 1, 2
    this._align_v = (vbits >> 1); // 0, 1, 2
    
    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};


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
Jimp.prototype.scan = function (x, y, w, h, f, cb) {
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);
    if ("function" != typeof f)
        return throwError.call(this, "f must be a function", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (var _y = y; _y < (y + h); _y++) {
        for (var _x = x; _x < (x + w); _x++) {
            var idx = (this.bitmap.width * _y + _x) << 2;
            f.call(this, _x, _y, idx);
        }
    }

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Returns the offset of a pixel in the bitmap buffer
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
*/
Jimp.prototype.getPixelIndex = function (x, y, cb) {
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var i = (this.bitmap.width * y + x) << 2;

    // if out of bounds index is -1
    if (x < 0 || x > this.bitmap.width) i = -1;
    if (y < 0 || y > this.bitmap.height) i = -1;

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
    if ("number" != typeof x || "number" != typeof y)
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
    if ("number" != typeof hex || "number" != typeof x || "number" != typeof y)
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
for (var i = 0; i < 65; i++) {
    var l = (i > 1) ? (new BigNumber(Array(64 + 1).join("1"), 2)).toString(i) : NaN;
    maxHashLength.push(l.length);
}

/**
 * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>.
 * @param base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimaal, 16 is hex, 64 is base 64). Defaults to 64.
 * @param (optional) cb a callback for when complete
 * @returns a string representing the hash
 */
Jimp.prototype.hash = function(base, cb){
    base = base || 64;
    if ("function" == typeof base) {
        cb = base;
        base = 64;
    }
    if ("number" != typeof base)
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
Jimp.prototype.crop = function (x, y, w, h, cb) {
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    var bitmap = new Buffer(this.bitmap.data.length);
    var offset = 0;
    this.scan(x, y, w, h, function (x, y, idx) {
        var data = this.bitmap.data.readUInt32BE(idx, true);
        bitmap.writeUInt32BE(data, offset, true);
        offset += 4;
    });

    this.bitmap.data = new Buffer(bitmap);
    this.bitmap.width = w;
    this.bitmap.height = h;

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Autocrop same color borders from this image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.autocrop = function (cb) {
    var w = this.bitmap.width;
    var h = this.bitmap.height;
    var northPixelsToCrop = 0;
    var eastPixelsToCrop = 0;
    var southPixelsToCrop = 0;
    var westPixelsToCrop = 0;
    
    var color = this.getPixelColor(0, 0); // get top left pixel color
    /**
     * All borders must be of the same color as the top left pixel, to be cropped.
     * It should be possible to crop borders each with a different color,
     * but since there are many ways for corners to intersect, it would
     * introduce unnecessary complexity to the algorithm.
     */

    // scan each side for same color borders
    north: // north side (scan rows from north to south)
    for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
            if (this.getPixelColor(x, y) !== color) {
                // this pixel is not the same color as the first one: abort this side scan
                break north;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        northPixelsToCrop++;
    }

    east: // east side (scan columns from east to west)
    for (var x = 0; x < w; x++) {
        for (var y = 0; y < h; y++) {
            if (this.getPixelColor(x, y) !== color) {
                // this pixel is not the same color as the first one: abort this side scan
                break east;
            }
        }
        // this column contains all pixels with the same color: increment this side pixels to crop
        eastPixelsToCrop++;
    }

    south: // south side (scan rows from south to north)
    for (var y = h - 1; y >= 0; y--) {
        for (var x = w - 1; x >= 0; x--) {
            if (this.getPixelColor(x, y) !== color) {
                // this pixel is not the same color as the first one: abort this side scan
                break south;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        southPixelsToCrop++;
    }

    west: // west side (scan columns from west to east)
    for (var x = w - 1; x >= 0; x--) {
        for (var y = h - 1; y >= 0; y--) {
            if (this.getPixelColor(x, y) !== color) {
                // this pixel is not the same color as the first one: abort this side scan
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

    // crop image, if at least one side should be cropped
    if (
        westPixelsToCrop !== 0 ||
        northPixelsToCrop !== 0 ||
        widthOfPixelsToCrop !== w ||
        heightOfPixelsToCrop !== h
    ) {
        this.crop(
            westPixelsToCrop,
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
    if ("object" != typeof src || src.constructor != Jimp)
        return throwError.call(this, "The source must be a Jimp image", cb);
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);

    if ("function" == typeof srcx) {
        cb = srcx;
        srcx = 0;
        srcy = 0;
        srcw = src.bitmap.width;
        srch = src.bitmap.height;
    } else if (typeof srcx == typeof srcy && typeof srcy == typeof srcw && typeof srcw == typeof srch) {
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

    var that = this;
    src.scan(srcx, srcy, srcw, srch, function(sx, sy, idx) {
        var dstIdx = that.getPixelIndex(x+sx-srcx, y+sy-srcy);
        that.bitmap.data[dstIdx] = this.bitmap.data[idx];
        that.bitmap.data[dstIdx+1] = this.bitmap.data[idx+1];
        that.bitmap.data[dstIdx+2] = this.bitmap.data[idx+2];
        that.bitmap.data[dstIdx+3] = this.bitmap.data[idx+3];
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param src the source Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
*/
Jimp.prototype.mask = function (src, x, y, cb) {
    if ("object" != typeof src || src.constructor != Jimp)
        return throwError.call(this, "The source must be a Jimp image", cb);
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var that = this;
    src.scan(0, 0, src.bitmap.width, src.bitmap.height, function(sx, sy, idx) {
        var dstIdx = that.getPixelIndex(x+sx, y+sy);
        var avg = (this.bitmap.data[idx+0] + this.bitmap.data[idx+1] + this.bitmap.data[idx+2]) / 3;
        that.bitmap.data[dstIdx+3] *= avg / 255;
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
    if ("object" != typeof src || src.constructor != Jimp)
        return throwError.call(this, "The source must be a Jimp image", cb);
    if ("number" != typeof x || "number" != typeof y)
        return throwError.call(this, "x and y must be numbers", cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    var that = this;
    src.scan(0, 0, src.bitmap.width, src.bitmap.height, function(sx, sy, idx) {
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
    if ("number" != typeof val)
        return throwError.call(this, "val must be numbers", cb);
    if (val < -1 || val > +1)
        return throwError.call(this, "val must be a number between -1 and +1", cb);

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        if (val < 0.0)  {
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
    if ("number" != typeof val)
        return throwError.call(this, "val must be numbers", cb);
    if (val < -1 || val > +1)
        return throwError.call(this, "val must be a number between -1 and +1", cb);

    function adjust(value) {
        if (val < 0) {
            var x = (value > 127) ? 1 - value / 255 : value / 255;
            if (x < 0) x = 0;
            x = 0.5 * Math.pow (x * 2, 1 + val);
            return (value > 127) ? (1.0 - x) * 255 : x * 255;
        } else {
            var x = (value > 127) ? 1 - value / 255 : value / 255;
            if (x < 0) x = 0;
            x = 0.5 * Math.pow (2 * x, ((val == 1) ? 127 : 1 / (1 - val)));
            return (value > 127) ? (1 - x) * 255 : x * 255;
        }
    }

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
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
    if ("number" != typeof n)
        return throwError.call(this, "n must be numbers", cb);

    if (n < 2) n = 2; // minumum of 2 levels

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = (Math.floor(this.bitmap.data[idx] / 255 * (n - 1)) / (n - 1)) * 255;
        this.bitmap.data[idx+1] = (Math.floor(this.bitmap.data[idx+1] / 255 * (n - 1)) / (n - 1)) * 255;
        this.bitmap.data[idx+2] = (Math.floor(this.bitmap.data[idx+2] / 255 * (n - 1)) / (n - 1)) * 255;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Inverts the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.invert = function (cb) {
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
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
    if ("boolean" != typeof horizontal || "boolean" != typeof vertical)
        return throwError.call(this, "horizontal and vertical must be Booleans", cb);

    var bitmap = new Buffer(this.bitmap.data.length);
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
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
    if ("number" != typeof r)
        return throwError.call(this, "r must be a number", cb);
    if (r < 1)
        return throwError.call(this, "r must be greater than 0", cb);

    var rs = Math.ceil(r * 2.57); // significant radius

    for (var y = 0; y < this.bitmap.height; y++) {
        log("Gaussian: " + Math.round(y / this.bitmap.height * 100) + "%");
        for (var x = 0; x < this.bitmap.width; x++) {
            var red = 0;
            var green = 0;
            var blue = 0;
            var alpha = 0;
            var wsum = 0;
            for (var iy = y - rs; iy < y + rs + 1; iy++) {
                for (var ix = x - rs; ix < x + rs + 1; ix++) {
                    var x1 = Math.min(this.bitmap.width - 1, Math.max(0, ix));
                    var y1 = Math.min(this.bitmap.height - 1, Math.max(0, iy));
                    var dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
                    var wght = Math.exp( -dsq / (2*r*r) ) / (Math.PI*2*r*r);
                    var idx = (y1 * this.bitmap.width + x1) << 2;
                    red += this.bitmap.data[idx] * wght;
                    green += this.bitmap.data[idx+1] * wght;
                    blue += this.bitmap.data[idx+2] * wght;
                    alpha += this.bitmap.data[idx+3] * wght;
                    wsum += wght;
                }
                var idx = (y * this.bitmap.width + x) << 2;
                this.bitmap.data[idx] = Math.round( red / wsum);
                this.bitmap.data[idx+1] = Math.round( green / wsum);
                this.bitmap.data[idx+2] = Math.round( blue / wsum);
                this.bitmap.data[idx+3] = Math.round( alpha / wsum);
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

var mul_table = [1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];

var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];

/**
 * A fast blur algorithm that produces similar effect to a Gausian blur - but MUCH quicker
 * @param r the pixel radius of the blur
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.blur = function (r, cb) {
    if ("number" != typeof r)
        return throwError.call(this, "r must be a number", cb);
    if (r < 1)
        return throwError.call(this, "r must be greater than 0", cb);

    var rsum, gsum, bsum, asum, x, y, i, p, p1, p2, yp, yi, yw, idx, pa;
    var wm = this.bitmap.width - 1;
    var hm = this.bitmap.height - 1;
    var wh = this.bitmap.width * this.bitmap.height;
    var rad1 = r + 1;

    var mul_sum = mul_table[r];
    var shg_sum = shg_table[r];

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

                if (y == 0) {
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

                this.bitmap.data[yi + 3] = pa = (asum * mul_sum) >>> shg_sum;
                if (pa > 255) this.bitmap.data[yi + 3] = 255; // normalise alpha
                if (pa > 0) {
                    pa = 255 / pa;
                    this.bitmap.data[yi] = ((rsum * mul_sum) >>> shg_sum) * pa;
                    this.bitmap.data[yi + 1] = ((gsum * mul_sum) >>> shg_sum) * pa;
                    this.bitmap.data[yi + 2] = ((bsum * mul_sum) >>> shg_sum) * pa;
                } else {
                    this.bitmap.data[yi] = this.bitmap.data[yi + 1] = this.bitmap.data[yi + 2] = 0;
                }
                if (x == 0) {
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
 * Removes colour from the image using ITU Rec 709 luminance values
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.greyscale = function (cb) {
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var grey = parseInt(.2126 * this.bitmap.data[idx] + .7152 * this.bitmap.data[idx+1] + .0722 * this.bitmap.data[idx+2], 10);
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
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
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
    if ("number" != typeof f)
        return throwError.call(this, "f must be a number", cb);
    if (f < 0 || f > 1)
        return throwError.call(this, "f must be a number from 0 to 1", cb);

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
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
    if ("number" != typeof f)
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
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx+3] = 255;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Resizes the image to a set width and height using a 2-pass bilinear algorithm
 * @param w the width to resize the image to (or Jimp.AUTO)
 * @param h the height to resize the image to (or Jimp.AUTO)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.resize = function (w, h, cb) {
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);
    
    if (w == Jimp.AUTO && h == Jimp.AUTO)
        return throwError.call(this, "w and h cannot both the set to auto", cb);

    if (w == Jimp.AUTO) w = this.bitmap.width * (h / this.bitmap.height);
    if (h == Jimp.AUTO) h = this.bitmap.height * (w / this.bitmap.width);
    
    // round inputs
    w = Math.round(w);
    h = Math.round(h);

    var that = this;
    var resize = new Resize(this.bitmap.width, this.bitmap.height, w, h, true, true, function (buffer) {
        that.bitmap.data = new Buffer(buffer);
        that.bitmap.width = w;
        that.bitmap.height = h;
    });
    resize.resize(this.bitmap.data);
    
    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Scale the image so that it fills the given width and height. Some parts of the image may be clipped.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.cover = function (w, h, cb) {
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);

    var f = (w/h > this.bitmap.width/this.bitmap.height) ?
        w/this.bitmap.width : h/this.bitmap.height;
    this.scale(f);
    this.crop(((this.bitmap.width - w) / 2) * this._align_h, ((this.bitmap.height - h) / 2) * this._align_v, w, h);
    
    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Scale the image to the largest size so that its width and height fits inside the given width and height.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.contain = function (w, h, cb) {
    if ("number" != typeof w || "number" != typeof h)
        return throwError.call(this, "w and h must be numbers", cb);

    var f = (w/h > this.bitmap.width/this.bitmap.height) ?
        h/this.bitmap.height : w/this.bitmap.width;
    var c = this.clone().scale(f);
    
    this.resize(w, h);
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data.writeUInt32BE(this._background, idx);
    });
    this.blit(c, ((this.bitmap.width - c.bitmap.width) / 2) * this._align_h, ((this.bitmap.height - c.bitmap.height) / 2) * this._align_v);
    
    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Uniformly scales the image by a factor.
 * @param f the factor to scale the image by
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.scale = function (f, cb) {
    if ("number" != typeof f)
        return throwError.call(this, "f must be a number", cb);
    if (f < 0)
        return throwError.call(this, "f must be a positive number", cb);

    var w = this.bitmap.width * f;
    var h = this.bitmap.height * f;
    this.resize(w, h);

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
};

/**
 * Rotates an image clockwise by a number of degrees rounded to the nearest 90 degrees. NB: 'this' must be a Jimp object.
 * @param deg the number of degress to rotate the image by
 * @returns nothing
 */
function simpleRotate(deg) {
    var i = Math.round(deg / 90) % 4;
    while (i < 0) i += 4;

    while (i > 0) {
        // https://github.com/ekulabuhov/jimp/commit/9a0c7cff88292d88c32a424b11256c76f1e20e46
        var dstBuffer = new Buffer(this.bitmap.data.length);
        var dstOffset = 0;
        for (var x = 0; x < this.bitmap.width; x++) {
            for (var y = this.bitmap.height - 1; y >= 0; y--) {
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
 * @returns nothing
 */
function advancedRotate(deg, resize) {
    var rad = (deg % 360) * Math.PI / 180;
    var cosine = Math.cos(rad);
    var sine = Math.sin(rad);
    
    var w, h; // the final width and height if resize == true

    if (resize == true) {
        // resize the image to it maximum dimention and blit the existing image onto the centre so that when it is rotated the image is kept in bounds

        // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
        w = Math.round(Math.abs(this.bitmap.width * cosine) + Math.abs(this.bitmap.height * sine));
        h = Math.round(Math.abs(this.bitmap.width * sine) + Math.abs(this.bitmap.height * cosine));

        var c = this.clone();
        this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
            this.bitmap.data.writeUInt32BE(this._background, idx);
        });
        
        var max= Math.max(w,h,this.bitmap.width,this.bitmap.height)
        this.resize(max, max);
        
        this.blit(c, this.bitmap.width / 2 - c.bitmap.width / 2, this.bitmap.height / 2 - c.bitmap.height / 2);
    }

    var dstBuffer = new Buffer(this.bitmap.data.length);
    
    function createTranslationFunction(deltaX, deltaY) {
        return function(x, y) {
            return {
                x : (x + deltaX),
                y : (y + deltaY)
            };
        }
    }

    var translate2Cartesian = createTranslationFunction(-(this.bitmap.width / 2), -(this.bitmap.height / 2));
    var translate2Screen = createTranslationFunction(this.bitmap.width / 2, this.bitmap.height / 2);
    
    for (var y = 0; y < this.bitmap.height; y++) {
        for (var x = 0; x < this.bitmap.width; x++) {
            var cartesian = translate2Cartesian(x, this.bitmap.height - y);
            var source = translate2Screen(
                cosine * cartesian.x - sine * cartesian.y,
                cosine * cartesian.y + sine * cartesian.x
            );
            if (source.x >= 0 && source.x < this.bitmap.width
                && source.y >= 0 && source.y < this.bitmap.height) {
                var srcIdx = (this.bitmap.width * (this.bitmap.height - source.y | 0) + source.x | 0) << 2;
                var pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx, true);
                var dstIdx = (this.bitmap.width * y + x) << 2;
                dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
            } else {
                // reset off-image pixels
                var dstIdx = (this.bitmap.width * y + x) << 2;
                dstBuffer.writeUInt32BE(this._background, dstIdx);
            }
        }
    }
    this.bitmap.data = dstBuffer;
    
    if (resize == true) {
        // now crop the image to the final size
        var x = (this.bitmap.width / 2) - (w/2);
        var y = (this.bitmap.height / 2) - (h/2);
        this.crop(x, y, w, h);
    }
};


/**
 * Rotates the image clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
 * @param deg the number of degress to rotate the image by
 * @param (optional) resize a boolean, if false then the width and height of the image will not be changed
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.rotate = function (deg, resize, cb) {
    // enable overloading
    if ("undefined" == typeof resize || resize === null) {
        // e.g. image.resize(120);
        // e.g. image.resize(120, null, cb);
        // e.g. image.resize(120, undefined, cb);
        resize = true;
    }
    if ("function" == typeof resize && "undefined" == typeof cb) {
        // e.g. image.resize(120, cb);
        cb = resize;
        resize = true;
    }
    
    if ("number" != typeof deg)
        return throwError.call(this, "deg must be a number", cb);
    
    if ("boolean" != typeof resize)
        return throwError.call(this, "resize must be a boolean", cb);

    if (deg % 90 == 0 && resize !== false) simpleRotate.call(this, deg, cb);
    else advancedRotate.call(this, deg, resize, cb);
    
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
    if ("string" != typeof mime)
        return throwError.call(this, "mime must be a string", cb);
    if ("function" != typeof cb)
        return throwError.call(this, "cb must be a function", cb);

    switch (mime.toLowerCase()) {
        case Jimp.MIME_PNG:
            var that = this;
            var png = new PNG({
              width: this.bitmap.width,
              height:this.bitmap.height,
              bitDepth: 8,
              deflateLevel: this._deflateLevel,
              filterType: this._filterType,
              colorType: (this._rgba) ? 6 : 2,
              inputHasAlpha: true
            });
            
            if (this._rgba) png.data = new Buffer(this.bitmap.data);
            else png.data = compositeBitmapOverBackground(this).data; // when PNG doesn't support alpha
            
            StreamToBuffer(png.pack(), function (err, buffer) {
                return cb.call(that, null, buffer);
            });
            break;

        case Jimp.MIME_JPEG:
            // composite onto a new image so that the background shows through alpha channels
            var jpeg = JPEG.encode(compositeBitmapOverBackground(this), this._quality);
            return cb.call(this, null, jpeg.data);

        case Jimp.MIME_BMP:
            // composite onto a new image so that the background shows through alpha channels
            var bmp = BMP.encode(compositeBitmapOverBackground(this));
            return cb.call(this, null, bmp.data);

        default:
            return cb.call(this, "Unsupported MIME type: " + mime);
    }

    return this;
};

function compositeBitmapOverBackground(image){
    return (new Jimp(image.bitmap.width, image.bitmap.height, image._background)).composite(image, 0, 0).bitmap;
}

/**
 * Apply a ordered dithering effect and reduce colorspace to 656
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.dither565 = function (cb) {
    var rgb565_matrix = [
      0, 4, 1, 5, 0, 4, 1, 5,
      6, 2, 7, 3, 6, 2, 7, 3,
      1, 5, 0, 4, 1, 5, 0, 4,
      7, 3, 6, 2, 7, 3, 6, 2,
      0, 4, 1, 5, 0, 4, 1, 5,
      6, 2, 7, 3, 6, 2, 7, 3,
      1, 5, 0, 4, 1, 5, 0, 4,
      7, 3, 6, 2, 7, 3, 6, 2
    ];

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var tresshold_id = ((y % 4) * 8) + (x % 4);
        var dither = rgb565_matrix[tresshold_id];
        this.bitmap.data[idx  ] = Math.min(this.bitmap.data[idx]   + dither, 0xff) & 0xF8;
        this.bitmap.data[idx+1] = Math.min(this.bitmap.data[idx+1] + dither, 0xff) & 0xFC;
        this.bitmap.data[idx+2] = Math.min(this.bitmap.data[idx+2] + dither, 0xff) & 0xF8;
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
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var clr = tinycolor({r: this.bitmap.data[idx], g: this.bitmap.data[idx + 1], b: this.bitmap.data[idx + 2]});

        var colorModifier = function (i, amount) {
          c = clr.toRgb();
          c[i] = Math.max(0, Math.min(c[i] + amount, 255));
          return tinycolor(c);
        }

        actions.forEach(function (action) {
            if (action.apply === "mix") {
                clr = tinycolor.mix(clr, action.params[0], action.params[1]);
            } else if (action.apply === "tint") {
              clr = tinycolor.mix(clr, "white", action.params[0]);
            } else if (action.apply === "shade") {
              clr = tinycolor.mix(clr, "black", action.params[0]);
            } else if (action.apply === "xor") {
              var clr2 = tinycolor(action.params[0]).toRgb();
              clr = clr.toRgb();
              clr = tinycolor({ r: clr.r ^ clr2.r, g: clr.g ^ clr2.g, b: clr.b ^ clr2.b});
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
        this.bitmap.data[idx  ] = clr.r;
        this.bitmap.data[idx+1] = clr.g;
        this.bitmap.data[idx+2] = clr.b;
    });

    if (isNodePattern(cb)) return cb.call(this, null, this);
    else return this;
}

/**
 * Writes the image to a file
 * @param path a path to the destination file (either PNG or JPEG)
 * @param (optional) cb a function to call when the image is saved to disk
 * @returns this for chaining of methods
 */
Jimp.prototype.write = function (path, cb) {
    if ("string" != typeof path)
        return throwError.call(this, "path must be a string", cb);
    if ("undefined" == typeof cb) cb = function () {};
    if ("function" != typeof cb)
        return throwError.call(this, "cb must be a function", cb);

    var that = this;
    var mime = MIME.lookup(path);

    this.getBuffer(mime, function(err, buffer) {
        if (err) return throwError.call(that, err, cb);
        var stream = FS.createWriteStream(path);
        stream.on("open", function(fh) {
            stream.write(buffer);
            stream.end();
        }).on("error", function(err) {
            return throwError.call(that, err, cb);
        });
        stream.on("finish", function(fh) {
            return cb.call(that, null, that);
        });
    });

    return this;
};

module.exports = Jimp;
