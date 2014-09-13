var FS = require("fs");
var PNG = require("pngjs").PNG;
var JPEG = require("jpeg-js");
var MIME = require("mime");
var Resize = require("./resize.js");

var MIME_PNG = "image/png";
var MIME_JPEG = "image/jpeg";

/**
 * Jimp constructor
 * @param path a path to a JPEG or PNG file
 * @param (optional) cb a function to call when the image is parsed to a bitmap
 */
function Jimp(path, cb) {
    if ("string" != typeof path)
        throw new Error("path must be a string");
    if ("undefined" == typeof cb) cb = function () {};
    if ("function" != typeof cb)
        throw new Error("cb must be a function");
    
    var _this = this;
    var mime = MIME.lookup(path);

    switch (mime) {
        case MIME_PNG:
            var png = new PNG();
            var reader = FS.createReadStream(path);
            reader.pipe(png).on("parsed", function() {
                _this.bitmap.data = new Buffer(this.data);
                _this.bitmap.width = this.width;
                _this.bitmap.height = this.height;
                cb.call(_this);
            });
            break;
        case MIME_JPEG:
            FS.readFile(path, function (err, data) {
                if (err) throw err;
                _this.bitmap = JPEG.decode(data);
                cb.call(_this);
            });
            break;
        default:
            throw new Error("Unsupported MIME type: " + mime);
    }
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

/**
 * Sets the quality of the image when saving as JPEG format
 * @param n The quality to use 0-100
 * @returns this for chaining of methods
 */
Jimp.prototype.quality = function (n) {
    if ("number" != typeof n)
        throw new Error("n must be a number");
    if (n < 0 || n > 100)
        throw new Error("n must be a number 0 - 100");
    this._quality = n;
    return this;
};

/**
 * Scanes through a region of the bitmap, calling a function for each pixel.
 * @param x the x coordinate to begin the scan at
 * @param y the y coordiante to begin the scan at
 * @param w the width of the scan region
 * @param h the height of the scan region
 * @param cb a function to call on even pixel; the (x, y) position of the pixel
 * and the index of the pixel in the bitmap buffer are passed to the function
 * @returns this for chaining of methods
 */
Jimp.prototype.scan = function (x, y, w, h, cb) {
    if ("number" != typeof x || "number" != typeof y)
        throw new Error("x and y must be numbers");
    if ("number" != typeof w || "number" != typeof h)
        throw new Error("w and h must be numbers");
    if ("function" != typeof cb)
        throw new Error("cb must be a function");
    
    for (var _y = y; _y < (y + h); _y++) {
        for (var _x = x; _x < (x + w); _x++) {
            var idx = (this.bitmap.width * _y + _x) << 2;
            cb.call(this, _x, _y, idx);
        }
    }
    
    return this;
};

/**
 * Crops the image at a given point to a give size
 * @param x the x coordinate to crop form
 * @param y the y coordiante to crop form
 * @param w the width of the crop region
 * @param h the height of the crop region
 * @returns this for chaining of methods
 */
Jimp.prototype.crop = function (x, y, w, h) {
    if ("number" != typeof x || "number" != typeof y)
        throw new Error("x and y must be numbers");
    if ("number" != typeof w || "number" != typeof h)
        throw new Error("w and h must be numbers");

    var bitmap = [];
    this.scan(x, y, w, h, function (x, y, idx) {
        bitmap = bitmap.concat([
            this.bitmap.data[idx],
            this.bitmap.data[idx+1],
            this.bitmap.data[idx+2],
            this.bitmap.data[idx+3]
        ]);
    });
    
    this.bitmap.data = new Buffer(bitmap);
    this.bitmap.width = w;
    this.bitmap.height = h;
    
    return this;
};

/**
 * Inverts the image
 * @returns this for chaining of methods
 */
Jimp.prototype.invert = function () {
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        this.bitmap.data[idx] = 255 - this.bitmap.data[idx];
        this.bitmap.data[idx+1] = 255 - this.bitmap.data[idx+1];
        this.bitmap.data[idx+2] = 255 - this.bitmap.data[idx+2];
    });
    
    return this;
};

/**
 * Removes colour from the image
 * @returns this for chaining of methods
 */
Jimp.prototype.greyscale = function () {
    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var grey = (this.bitmap.data[idx] + this.bitmap.data[idx+1] + this.bitmap.data[idx+2] ) / 3;
        this.bitmap.data[idx] = grey;
        this.bitmap.data[idx+1] = grey;
        this.bitmap.data[idx+2] = grey;
    });
    
    return this;
};

/**
 * Applies a sepia tone to the image
 * @returns this for chaining of methods
 */
Jimp.prototype.sepia = function () {
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
    
    return this;
}

/**
 * Multiplies the opacity of each pizel by a factor between 0 and 1
 * @returns this for chaining of methods
 */
Jimp.prototype.opacity = function (f) {
    if ("number" != typeof f)
        throw new Error("f must be a number");
    if (f < 0 || f > 1)
        throw new Error("f must be a number from 0 to 1");

    this.scan(0, 0, this.bitmap.width, this.bitmap.height, function (x, y, idx) {
        var v = this.bitmap.data[idx+3] * f;
        this.bitmap.data[idx+3] = v;
    });
    
    return this;
};

/**
 * Resizes the image to a set width and height using a 2-pass bilinear algorithm
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @returns this for chaining of methods
 */
Jimp.prototype.resize = function (w, h) {
    if ("number" != typeof w || "number" != typeof h)
        throw new Error("w and h must be numbers");
    var _this = this;
    var resize = new Resize(this.bitmap.width, this.bitmap.height, w, h, true, true, function (buffer) {
        _this.bitmap.data = new Buffer(buffer);
        _this.bitmap.width = w;
        _this.bitmap.height = h;
    });
    resize.resize(this.bitmap.data);
    
    return this;
};

/**
 * Uniformly scales the image by a factor.
 * @param f the factor to scale the image by
 * @returns this for chaining of methods
 */
Jimp.prototype.scale = function (f) {
    if ("number" != typeof f)
        throw new Error("f must be a number");
    if (f < 0)
        throw new Error("f must be a positive number");
    
    var w = this.bitmap.width * f;
    var h = this.bitmap.height * f;
    this.resize(w, h);
    return this;
};

/**
 * Writes the image to a file
 * @param path a path to the destination file (either PNG or JPEG)
 * @param (optional) cb a function to call when the image is saved to disk
 * @returns this for chaining of methods
 */
Jimp.prototype.write = function (path, cb) {
    if ("string" != typeof path)
        throw new Error("path must be a string");
    if ("undefined" == typeof cb) cb = function () {};
    if ("function" != typeof cb)
        throw new Error("cb must be a function");

    var _this = this;
    var mime = MIME.lookup(path);
    
    switch (mime) {
        case MIME_PNG:
            var png = new PNG();
            png.data = new Buffer(this.bitmap.data);
            png.width = this.bitmap.width;
            png.height = this.bitmap.height;
            png.pack().pipe(FS.createWriteStream(path), {end: false});
            png.on("end", function () {
                cb.call(_this);
            });
            break;
        case MIME_JPEG:
            var jpeg = JPEG.encode(_this.bitmap, _this._quality);
            var stream = FS.createWriteStream(path);
            stream.write(jpeg.data);
            stream.end();
            cb.call(_this);
            break;
        default:
            throw new Error("Unsupported MIME type: " + mime);
    }
    
    return this;
};

module.exports = Jimp;
