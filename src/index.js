/* eslint-disable no-labels */

import FS from 'fs';
import Path from 'path';
import EventEmitter from 'events';

import { PNG } from 'pngjs';
import JPEG from 'jpeg-js';
import BMP from 'bmp-js';
import GIF from 'omggif';
import UTIF from 'utif';
import MIME from 'mime';
import BigNumber from 'bignumber.js';
import bMFont from 'load-bmfont';
import MkDirP from 'mkdirp';
import pixelMatch from 'pixelmatch';

import ImagePHash from './modules/phash';
import request from './request';

import * as shape from './functions/shape';
import * as color from './functions/color';
import { log, clear } from './utils/log';
import parseBitmap from './utils/parse-bitmap';
import { isNodePattern, throwError } from './utils/error-checking';
import * as constants from './constants';

if (
    process.env.BABEL_ENV === 'development' &&
    process.env.ENVIRONMENT !== 'BROWSER'
) {
    require('source-map-support').install();
}

const isDef = v => typeof v !== 'undefined' && v !== null;

BigNumber.set({
    ALPHABET: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
});

process.on('exit', clear);

// no operation
function noop() {}

// error checking methods

function isArrayBuffer(test) {
    return (
        Object.prototype.toString
            .call(test)
            .toLowerCase()
            .indexOf('arraybuffer') > -1
    );
}

// Prepare a Buffer object from the arrayBuffer. Necessary in the browser > node conversion,
// But this function is not useful when running in node directly
function bufferFromArrayBuffer(arrayBuffer) {
    const buffer = Buffer.alloc(arrayBuffer.byteLength);
    const view = new Uint8Array(arrayBuffer);

    for (let i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }

    return buffer;
}

function loadBufferFromPath(src, cb) {
    if (
        FS &&
        typeof FS.readFile === 'function' &&
        !src.match(/^(http|ftp)s?:\/\/./)
    ) {
        FS.readFile(src, cb);
    } else {
        request(src, (err, response, data) => {
            if (err) {
                return cb(err);
            }

            if (typeof data === 'object' && Buffer.isBuffer(data)) {
                return cb(null, data);
            }

            const msg =
                'Could not load Buffer from <' +
                src +
                '> ' +
                '(HTTP: ' +
                response.statusCode +
                ')';

            return new Error(msg);
        });
    }
}

/**
 * Simplify jimpEvMethod call for the common `change` evName.
 */
function jimpEvChange(methodName, method) {
    jimpEvMethod(methodName, 'change', method);
}

const emptyBitmap = {
    data: null,
    width: null,
    height: null
};

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
    // An object representing a bitmap in memory, comprising:
    //  - data: a buffer of the bitmap data
    //  - width: the width of the image in pixels
    //  - height: the height of the image in pixels
    bitmap = emptyBitmap;

    // The quality to be used when saving JPEG images
    _quality = 100;
    _deflateLevel = 9;
    _deflateStrategy = 3;
    _filterType = Jimp.PNG_FILTER_AUTO;

    // Whether PNGs will be exported as RGB or RGBA
    _rgba = true;

    // Default colour to use for new pixels
    _background = 0x00000000;

    // Default MIME is PNG
    _originalMime = Jimp.MIME_PNG;

    // Exif data for the image
    _exif = null;

    constructor() {
        super();

        const jimpInstance = this;
        let cb = noop;

        if (isArrayBuffer(arguments[0])) {
            arguments[0] = bufferFromArrayBuffer(arguments[0]);
        }

        function finish(err) {
            const evData = err || {};
            evData.methodName = 'constructor';

            setTimeout(() => {
                // run on next tick.
                if (err) {
                    jimpInstance.emitError('constructor', err);
                } else {
                    jimpInstance.emitMulti('constructor', 'initialized');
                }

                cb.call(jimpInstance, ...arguments);
            }, 1);
        }
        if (
            typeof arguments[0] === 'number' &&
            typeof arguments[1] === 'number'
        ) {
            // create a new image
            const w = arguments[0];
            const h = arguments[1];
            cb = arguments[2];

            if (typeof arguments[2] === 'number') {
                this._background = arguments[2];
                cb = arguments[3];
            }

            if (typeof cb === 'undefined') {
                cb = noop;
            }

            if (typeof cb !== 'function') {
                return throwError.call(this, 'cb must be a function', finish);
            }

            this.bitmap = {
                data: Buffer.alloc(w * h * 4),
                width: w,
                height: h
            };

            for (let i = 0; i < this.bitmap.data.length; i += 4) {
                this.bitmap.data.writeUInt32BE(this._background, i);
            }

            finish(null, this);
        } else if (arguments[0] instanceof Jimp) {
            // clone an existing Jimp
            const original = arguments[0];
            cb = arguments[1];

            if (typeof cb === 'undefined') {
                cb = noop;
            }

            if (typeof cb !== 'function') {
                return throwError.call(this, 'cb must be a function', finish);
            }

            const bitmap = Buffer.alloc(original.bitmap.data.length);
            original.scanQuiet(
                0,
                0,
                original.bitmap.width,
                original.bitmap.height,
                (x, y, idx) => {
                    const data = original.bitmap.data.readUInt32BE(idx);
                    bitmap.writeUInt32BE(data, idx);
                }
            );

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
            this._originalMime = original._originalMime;

            finish(null, this);
        } else if (typeof arguments[0] === 'string') {
            // read from a path
            const path = arguments[0];
            cb = arguments[1];

            if (typeof cb === 'undefined') {
                cb = noop;
            }

            if (typeof cb !== 'function') {
                return throwError.call(this, 'cb must be a function', finish);
            }

            loadBufferFromPath(path, (err, data) => {
                if (err) {
                    return throwError.call(this, err, finish);
                }

                parseBitmap.call(this, data, path, finish);
            });
        } else if (
            typeof arguments[0] === 'object' &&
            Buffer.isBuffer(arguments[0])
        ) {
            // read from a buffer
            const data = arguments[0];
            cb = arguments[1];

            if (typeof cb !== 'function') {
                return throwError.call(this, 'cb must be a function', finish);
            }

            parseBitmap.call(this, data, null, finish);
        } else {
            // Allow client libs to add new ways to build a Jimp object.
            // Extra constructors must be added by `Jimp.appendConstructorOption()`
            cb = arguments[arguments.length - 1];

            if (typeof cb !== 'function') {
                cb = arguments[arguments.length - 2]; // TODO: try to solve the args after cb problem.

                if (typeof cb !== 'function') {
                    cb = noop;
                }
            }

            const extraConstructor = Jimp.__extraConstructors.find(c =>
                c.test(...arguments)
            );

            if (extraConstructor) {
                new Promise((resolve, reject) =>
                    extraConstructor.run.call(
                        this,
                        resolve,
                        reject,
                        ...arguments
                    )
                )
                    .then(() => finish(null, this))
                    .catch(finish);
            } else {
                return throwError.call(
                    this,
                    'No matching constructor overloading was found. ' +
                        'Please see the docs for how to call the Jimp constructor.',
                    finish
                );
            }
        }
    }

    /**
     * Emit for multiple listeners
     */
    emitMulti(methodName, eventName, data = {}) {
        data = Object.assign(data, { methodName, eventName });
        this.emit('any', data);

        if (methodName) {
            this.emit(methodName, data);
        }

        this.emit(eventName, data);
    }

    emitError(methodName, err) {
        this.emitMulti(methodName, 'error', err);
    }

    /* Nicely format Jimp object when sent to the console e.g. console.log(imgage) */
    inspect() {
        return (
            '<Jimp ' +
            (this.bitmap === emptyBitmap
                ? 'pending...'
                : this.bitmap.width + 'x' + this.bitmap.height) +
            '>'
        );
    }

    // Nicely format Jimp object when converted to a string
    toString() {
        return '[object Jimp]';
    }
}

Object.entries(constants).map(([name, value]) => (Jimp[name] = value));

Object.entries({ ...color, ...shape }).map(
    ([name, value]) => (Jimp.prototype[name] = value)
);

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
function jimpEvMethod(methodName, evName, method) {
    const evNameBefore = 'before-' + evName;
    const evNameAfter = evName.replace(/e$/, '') + 'ed';

    Jimp.prototype[methodName] = function() {
        let wrapedCb;
        const cb = arguments[method.length - 1];
        const jimpInstance = this;

        if (typeof cb === 'function') {
            wrapedCb = function(err, data) {
                if (err) {
                    jimpInstance.emitError(methodName, err);
                } else {
                    jimpInstance.emitMulti(methodName, evNameAfter, {
                        [methodName]: data
                    });
                }
                cb.apply(this, arguments);
            };
            arguments[arguments.length - 1] = wrapedCb;
        } else {
            wrapedCb = false;
        }

        this.emitMulti(methodName, evNameBefore);

        let result;

        try {
            result = method.apply(this, arguments);

            if (!wrapedCb) {
                this.emitMulti(methodName, evNameAfter, {
                    [methodName]: result
                });
            }
        } catch (err) {
            err.methodName = methodName;
            this.emitError(methodName, err);
        }

        return result;
    };

    Jimp.prototype[methodName + 'Quiet'] = method;
}

Jimp.__extraConstructors = [];

/**
 * Allow client libs to add new ways to build a Jimp object.
 * @param name identify the extra constructor.
 * @param test a function that returns true when it accepts the arguments passed to the main constructor.
 * @param runner where the magic happens.
 */
Jimp.appendConstructorOption = function(name, test, run) {
    Jimp.__extraConstructors.push({ name, test, run });
};

/**
 * Read an image from a file or a Buffer
 * @param src the path to the file or a Buffer containing the file data
 * @retuns a promise
 */
Jimp.read = function(src) {
    return new Promise((resolve, reject) => {
        new Jimp(src, (err, image) => {
            if (err) reject(err);
            else resolve(image);
        });
    });
};

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param r the red value (0-255)
 * @param g the green value (0-255)
 * @param b the blue value (0-255)
 * @param a the alpha value (0-255)
 * @param cb (optional) A callback for when complete
 * @returns an single integer colour value
 */
Jimp.rgbaToInt = function(r, g, b, a, cb) {
    if (
        typeof r !== 'number' ||
        typeof g !== 'number' ||
        typeof b !== 'number' ||
        typeof a !== 'number'
    ) {
        return throwError.call(this, 'r, g, b and a must be numbers', cb);
    }

    if (r < 0 || r > 255) {
        return throwError.call(this, 'r must be between 0 and 255', cb);
    }

    if (g < 0 || g > 255) {
        throwError.call(this, 'g must be between 0 and 255', cb);
    }

    if (b < 0 || b > 255) {
        return throwError.call(this, 'b must be between 0 and 255', cb);
    }

    if (a < 0 || a > 255) {
        return throwError.call(this, 'a must be between 0 and 255', cb);
    }

    r = Math.round(r);
    b = Math.round(b);
    g = Math.round(g);
    a = Math.round(a);

    const i =
        r * Math.pow(256, 3) +
        g * Math.pow(256, 2) +
        b * Math.pow(256, 1) +
        a * Math.pow(256, 0);

    if (isNodePattern(cb)) {
        return cb.call(this, null, i);
    }

    return i;
};

/**
 * A static helper method that converts RGBA values to a single integer value
 * @param i a single integer value representing an RGBA colour (e.g. 0xFF0000FF for red)
 * @param cb (optional) A callback for when complete
 * @returns an object with the properties r, g, b and a representing RGBA values
 */
Jimp.intToRGBA = function(i, cb) {
    if (typeof i !== 'number') {
        return throwError.call(this, 'i must be a number', cb);
    }

    const rgba = {};

    rgba.r = Math.floor(i / Math.pow(256, 3));
    rgba.g = Math.floor((i - rgba.r * Math.pow(256, 3)) / Math.pow(256, 2));
    rgba.b = Math.floor(
        (i - rgba.r * Math.pow(256, 3) - rgba.g * Math.pow(256, 2)) /
            Math.pow(256, 1)
    );
    rgba.a = Math.floor(
        (i -
            rgba.r * Math.pow(256, 3) -
            rgba.g * Math.pow(256, 2) -
            rgba.b * Math.pow(256, 1)) /
            Math.pow(256, 0)
    );

    if (isNodePattern(cb)) {
        return cb.call(this, null, rgba);
    }

    return rgba;
};

/**
 * Limits a number to between 0 or 255
 * @param n a number
 * @returns the number limited to between 0 or 255
 */
Jimp.limit255 = function(n) {
    n = Math.max(n, 0);
    n = Math.min(n, 255);

    return n;
};

/**
 * Diffs two images and returns
 * @param img1 a Jimp image to compare
 * @param img2 a Jimp image to compare
 * @param (optional) threshold a number, 0 to 1, the smaller the value the more sensitive the comparison (default: 0.1)
 * @returns an object { percent: percent similar, diff: a Jimp image highlighting differences }
 */
Jimp.diff = function(img1, img2, threshold) {
    if (!(img1 instanceof Jimp) || !(img2 instanceof Jimp))
        return throwError.call(this, 'img1 and img2 must be an Jimp images');

    const bmp1 = img1.bitmap;
    const bmp2 = img2.bitmap;

    if (bmp1.width !== bmp2.width || bmp1.height !== bmp2.height) {
        if (bmp1.width * bmp1.height > bmp2.width * bmp2.height) {
            // img1 is bigger
            img1 = img1.cloneQuiet().resize(bmp2.width, bmp2.height);
        } else {
            // img2 is bigger (or they are the same in area)
            img2 = img2.cloneQuiet().resize(bmp1.width, bmp1.height);
        }
    }

    threshold = isDef(threshold) ? threshold : 0.1;

    if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
        return throwError.call(
            this,
            'threshold must be a number between 0 and 1'
        );
    }

    const diff = new Jimp(bmp1.width, bmp1.height, 0xffffffff);

    const numDiffPixels = pixelMatch(
        bmp1.data,
        bmp2.data,
        diff.bitmap.data,
        diff.bitmap.width,
        diff.bitmap.height,
        { threshold }
    );

    return {
        percent: numDiffPixels / (diff.bitmap.width * diff.bitmap.height),
        image: diff
    };
};

/**
 * Calculates the hamming distance of two images based on their perceptual hash
 * @param img1 a Jimp image to compare
 * @param img2 a Jimp image to compare
 * @returns a number ranging from 0 to 1, 0 means they are believed to be identical
 */
Jimp.distance = function(img1, img2) {
    const phash = new ImagePHash();
    const hash1 = phash.getHash(img1);
    const hash2 = phash.getHash(img2);

    return phash.distance(hash1, hash2);
};

/**
 * Creates a new image that is a clone of this one.
 * @param cb (optional) A callback for when complete
 * @returns the new image
 */
jimpEvMethod('clone', 'clone', function(cb) {
    const clone = new Jimp(this);

    if (isNodePattern(cb)) {
        return cb.call(clone, null, clone);
    }

    return clone;
});

/**
 * Sets the quality of the image when saving as JPEG format (default is 100)
 * @param n The quality to use 0-100
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.quality = function(n, cb) {
    if (typeof n !== 'number') {
        return throwError.call(this, 'n must be a number', cb);
    }

    if (n < 0 || n > 100) {
        return throwError.call(this, 'n must be a number 0 - 100', cb);
    }

    this._quality = Math.round(n);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Sets the deflate level used when saving as PNG format (default is 9)
 * @param l Deflate level to use 0-9. 0 is no compression. 9 (default) is maximum compression.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.deflateLevel = function(l, cb) {
    if (typeof l !== 'number') {
        return throwError.call(this, 'l must be a number', cb);
    }

    if (l < 0 || l > 9) {
        return throwError.call(this, 'l must be a number 0 - 9', cb);
    }

    this._deflateLevel = Math.round(l);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Sets the deflate strategy used when saving as PNG format (default is 3)
 * @param s Deflate strategy to use 0-3.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.deflateStrategy = function(s, cb) {
    if (typeof s !== 'number') {
        return throwError.call(this, 's must be a number', cb);
    }

    if (s < 0 || s > 3) {
        return throwError.call(this, 's must be a number 0 - 3', cb);
    }

    this._deflateStrategy = Math.round(s);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Sets the filter type used when saving as PNG format (default is automatic filters)
 * @param f The quality to use -1-4.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.filterType = function(f, cb) {
    if (typeof f !== 'number') {
        return throwError.call(this, 'n must be a number', cb);
    }

    if (f < -1 || f > 4) {
        return throwError.call(
            this,
            'n must be -1 (auto) or a number 0 - 4',
            cb
        );
    }

    this._filterType = Math.round(f);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param bool A Boolean, true to use RGBA or false to use RGB
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.rgba = function(bool, cb) {
    if (typeof bool !== 'boolean') {
        return throwError.call(
            this,
            'bool must be a boolean, true for RGBA or false for RGB',
            cb
        );
    }

    this._rgba = bool;

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
 * @param b A Boolean, true to use RGBA or false to use RGB
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
jimpEvChange('background', function(hex, cb) {
    if (typeof hex !== 'number') {
        return throwError.call(
            this,
            'hex must be a hexadecimal rgba value',
            cb
        );
    }

    this._background = hex;

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
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
jimpEvChange('scan', function(x, y, w, h, f, cb) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    if (typeof w !== 'number' || typeof h !== 'number') {
        return throwError.call(this, 'w and h must be numbers', cb);
    }

    if (typeof f !== 'function') {
        return throwError.call(this, 'f must be a function', cb);
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    for (let _y = y; _y < y + h; _y++) {
        for (let _x = x; _x < x + w; _x++) {
            const idx = (this.bitmap.width * _y + _x) << 2;
            f.call(this, _x, _y, idx);
        }
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
});

/**
 * Returns the original MIME of the image (default: "image/png")
 * @returns the MIME as a string
 */
Jimp.prototype.getMIME = function() {
    const mime = this._originalMime || Jimp.MIME_PNG;

    return mime;
};

/**
 * Returns the appropriate file extension for the original MIME of the image (default: "png")
 * @returns the file extension as a string
 */
Jimp.prototype.getExtension = function() {
    const mime = this.getMIME();

    return MIME.getExtension(mime);
};

/**
 * Returns the offset of a pixel in the bitmap buffer
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
 */
Jimp.prototype.getPixelIndex = function(x, y, edgeHandling, cb) {
    let xi;
    let yi;

    if (typeof edgeHandling === 'function' && typeof cb === 'undefined') {
        cb = edgeHandling;
        edgeHandling = null;
    }

    if (!edgeHandling) {
        edgeHandling = Jimp.EDGE_EXTEND;
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);
    xi = x;
    yi = y;

    if (edgeHandling === Jimp.EDGE_EXTEND) {
        if (x < 0) xi = 0;
        if (x >= this.bitmap.width) xi = this.bitmap.width - 1;
        if (y < 0) yi = 0;
        if (y >= this.bitmap.height) yi = this.bitmap.height - 1;
    }

    if (edgeHandling === Jimp.EDGE_WRAP) {
        if (x < 0) {
            xi = this.bitmap.width + x;
        }

        if (x >= this.bitmap.width) {
            xi = x % this.bitmap.width;
        }

        if (y < 0) {
            xi = this.bitmap.height + y;
        }

        if (y >= this.bitmap.height) {
            yi = y % this.bitmap.height;
        }
    }

    let i = (this.bitmap.width * yi + xi) << 2;

    // if out of bounds index is -1
    if (xi < 0 || xi >= this.bitmap.width) {
        i = -1;
    }

    if (yi < 0 || yi >= this.bitmap.height) {
        i = -1;
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, i);
    }

    return i;
};

/**
 * Returns the hex colour value of a pixel
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) cb a callback for when complete
 * @returns the color of the pixel
 */
function getPixelColor(x, y, cb) {
    if (typeof x !== 'number' || typeof y !== 'number')
        return throwError.call(this, 'x and y must be numbers', cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const idx = this.getPixelIndex(x, y);
    const hex = this.bitmap.data.readUInt32BE(idx);

    if (isNodePattern(cb)) {
        return cb.call(this, null, hex);
    }

    return hex;
}

Jimp.prototype.getPixelColor = getPixelColor;
Jimp.prototype.getPixelColour = getPixelColor;

/**
 * Returns the hex colour value of a pixel
 * @param x the x coordinate
 * @param y the y coordinate
 * @param (optional) cb a callback for when complete
 * @returns the index of the pixel or -1 if not found
 */
function setPixelColor(hex, x, y, cb) {
    if (
        typeof hex !== 'number' ||
        typeof x !== 'number' ||
        typeof y !== 'number'
    )
        return throwError.call(this, 'hex, x and y must be numbers', cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const idx = this.getPixelIndex(x, y);
    this.bitmap.data.writeUInt32BE(hex, idx);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

Jimp.prototype.setPixelColour = setPixelColor;
Jimp.prototype.setPixelColor = setPixelColor;

// an array storing the maximum string length of hashes at various bases
const maxHashLength = [];

for (let i = 0; i < 65; i++) {
    const l =
        i > 1 ? new BigNumber(new Array(64 + 1).join('1'), 2).toString(i) : NaN;
    maxHashLength.push(l.length);
}

/**
 * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>.
 * @param base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimaal, 16 is hex, 64 is base 64). Defaults to 64.
 * @param (optional) cb a callback for when complete
 * @returns a string representing the hash
 */
Jimp.prototype.hash = function(base, cb) {
    base = base || 64;

    if (typeof base === 'function') {
        cb = base;
        base = 64;
    }

    if (typeof base !== 'number') {
        return throwError.call(this, 'base must be a number', cb);
    }

    if (base < 2 || base > 64) {
        return throwError.call(
            this,
            'base must be a number between 2 and 64',
            cb
        );
    }

    let hash = new ImagePHash().getHash(this);
    hash = new BigNumber(hash, 2).toString(base);

    while (hash.length < maxHashLength[base]) {
        hash = '0' + hash; // pad out with leading zeros
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, hash);
    }

    return hash;
};

/**
 * Crops the image at a given point to a give size
 * @param x the x coordinate to crop form
 * @param y the y coordiante to crop form
 * @param w the width of the crop region
 * @param h the height of the crop region
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
jimpEvChange('crop', function(x, y, w, h, cb) {
    if (typeof x !== 'number' || typeof y !== 'number')
        return throwError.call(this, 'x and y must be numbers', cb);
    if (typeof w !== 'number' || typeof h !== 'number')
        return throwError.call(this, 'w and h must be numbers', cb);

    // round input
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);

    const bitmap = Buffer.alloc(this.bitmap.data.length);
    let offset = 0;

    this.scanQuiet(x, y, w, h, function(x, y, idx) {
        const data = this.bitmap.data.readUInt32BE(idx);
        bitmap.writeUInt32BE(data, offset);
        offset += 4;
    });

    this.bitmap.data = Buffer.from(bitmap);
    this.bitmap.width = w;
    this.bitmap.height = h;

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
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
Jimp.colorDiff = (function() {
    const pow = n => Math.pow(n, 2);
    const { max } = Math;
    const maxVal = 255 * 255 * 3;

    return function(rgba1, rgba2) {
        if (rgba1.a !== 0 && !rgba1.a) {
            rgba1.a = 255;
        }

        if (rgba2.a !== 0 && !rgba2.a) {
            rgba2.a = 255;
        }

        return (
            (max(
                pow(rgba1.r - rgba2.r),
                pow(rgba1.r - rgba2.r - rgba1.a + rgba2.a)
            ) +
                max(
                    pow(rgba1.g - rgba2.g),
                    pow(rgba1.g - rgba2.g - rgba1.a + rgba2.a)
                ) +
                max(
                    pow(rgba1.b - rgba2.b),
                    pow(rgba1.b - rgba2.b - rgba1.a + rgba2.a)
                )) /
            maxVal
        );
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
Jimp.prototype.autocrop = function() {
    const w = this.bitmap.width;
    const h = this.bitmap.height;
    const minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image

    let cb; // callback
    let tolerance = 0.0002; // percent of color difference tolerance (default value)
    let cropOnlyFrames = true; // flag to force cropping only if the image has a real "frame"
    // i.e. all 4 sides have some border (default value)

    // parse arguments
    for (let a = 0, len = arguments.length; a < len; a++) {
        if (typeof arguments[a] === 'number') {
            // tolerance value passed
            tolerance = arguments[a];
        }

        if (typeof arguments[a] === 'boolean') {
            // cropOnlyFrames value passed
            cropOnlyFrames = arguments[a];
        }

        if (typeof arguments[a] === 'function') {
            // callback value passed
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
    const colorTarget = this.getPixelColor(0, 0); // top left pixel color is the target color
    const rgba1 = Jimp.intToRGBA(colorTarget);

    // for north and east sides
    let northPixelsToCrop = 0;
    let eastPixelsToCrop = 0;
    let southPixelsToCrop = 0;
    let westPixelsToCrop = 0;

    // north side (scan rows from north to south)
    north: for (let y = 0; y < h - minPixelsPerSide; y++) {
        for (let x = 0; x < w; x++) {
            const colorXY = this.getPixelColor(x, y);
            const rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break north;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        northPixelsToCrop++;
    }

    // east side (scan columns from east to west)
    east: for (let x = 0; x < w - minPixelsPerSide; x++) {
        for (let y = 0 + northPixelsToCrop; y < h; y++) {
            const colorXY = this.getPixelColor(x, y);
            const rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break east;
            }
        }
        // this column contains all pixels with the same color: increment this side pixels to crop
        eastPixelsToCrop++;
    }

    // south side (scan rows from south to north)
    south: for (let y = h - 1; y >= northPixelsToCrop + minPixelsPerSide; y--) {
        for (let x = w - eastPixelsToCrop - 1; x >= 0; x--) {
            const colorXY = this.getPixelColor(x, y);
            const rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break south;
            }
        }
        // this row contains all pixels with the same color: increment this side pixels to crop
        southPixelsToCrop++;
    }

    // west side (scan columns from west to east)
    west: for (
        let x = w - 1;
        x >= 0 + eastPixelsToCrop + minPixelsPerSide;
        x--
    ) {
        for (let y = h - 1; y >= 0 + northPixelsToCrop; y--) {
            const colorXY = this.getPixelColor(x, y);
            const rgba2 = Jimp.intToRGBA(colorXY);

            if (Jimp.colorDiff(rgba1, rgba2) > tolerance) {
                // this pixel is too distant from the first one: abort this side scan
                break west;
            }
        }
        // this column contains all pixels with the same color: increment this side pixels to crop
        westPixelsToCrop++;
    }

    // safety checks
    const widthOfPixelsToCrop = w - (westPixelsToCrop + eastPixelsToCrop);
    // widthOfPixelsToCrop >= 0 ? widthOfPixelsToCrop : 0;
    const heightOfPixelsToCrop = h - (southPixelsToCrop + northPixelsToCrop);
    // heightOfPixelsToCrop >= 0 ? heightOfPixelsToCrop : 0;

    // decide if a crop is needed
    let doCrop = false;

    if (cropOnlyFrames) {
        // crop image if all sides should be cropped
        doCrop =
            eastPixelsToCrop !== 0 &&
            northPixelsToCrop !== 0 &&
            westPixelsToCrop !== 0 &&
            southPixelsToCrop !== 0;
    } else {
        // crop image if at least one side should be cropped
        doCrop =
            eastPixelsToCrop !== 0 ||
            northPixelsToCrop !== 0 ||
            westPixelsToCrop !== 0 ||
            southPixelsToCrop !== 0;
    }

    if (doCrop) {
        // do the real crop
        this.crop(
            eastPixelsToCrop,
            northPixelsToCrop,
            widthOfPixelsToCrop,
            heightOfPixelsToCrop
        );
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
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
Jimp.prototype.blit = function(src, x, y, srcx, srcy, srcw, srch, cb) {
    if (!(src instanceof Jimp)) {
        return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    if (typeof srcx === 'function') {
        cb = srcx;
        srcx = 0;
        srcy = 0;
        srcw = src.bitmap.width;
        srch = src.bitmap.height;
    } else if (
        typeof srcx === typeof srcy &&
        typeof srcy === typeof srcw &&
        typeof srcw === typeof srch
    ) {
        srcx = srcx || 0;
        srcy = srcy || 0;
        srcw = srcw || src.bitmap.width;
        srch = srch || src.bitmap.height;
    } else {
        return throwError.call(
            this,
            'srcx, srcy, srcw, srch must be numbers',
            cb
        );
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    // round input
    srcx = Math.round(srcx);
    srcy = Math.round(srcy);
    srcw = Math.round(srcw);
    srch = Math.round(srch);

    const maxw = this.bitmap.width;
    const maxh = this.bitmap.height;
    const baseImage = this;

    src.scanQuiet(srcx, srcy, srcw, srch, function(sx, sy, idx) {
        if (
            x + sx >= 0 &&
            y + sy >= 0 &&
            maxw - x - sx > 0 &&
            maxh - y - sy > 0
        ) {
            const dstIdx = baseImage.getPixelIndex(
                x + sx - srcx,
                y + sy - srcy
            );
            baseImage.bitmap.data[dstIdx] = this.bitmap.data[idx];
            baseImage.bitmap.data[dstIdx + 1] = this.bitmap.data[idx + 1];
            baseImage.bitmap.data[dstIdx + 2] = this.bitmap.data[idx + 2];
            baseImage.bitmap.data[dstIdx + 3] = this.bitmap.data[idx + 3];
        }
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param src the source Jimp instance
 * @param x the horizontal position to blit the image
 * @param y the vertical position to blit the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.mask = function(src, x = 0, y = 0, cb) {
    if (!(src instanceof Jimp)) {
        return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const w = this.bitmap.width;
    const h = this.bitmap.height;
    const baseImage = this;

    src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function(
        sx,
        sy,
        idx
    ) {
        const destX = x + sx;
        const destY = y + sy;

        if (destX >= 0 && destY >= 0 && destX < w && destY < h) {
            const dstIdx = baseImage.getPixelIndex(destX, destY);
            const { data } = this.bitmap;
            const avg = (data[idx + 0] + data[idx + 1] + data[idx + 2]) / 3;

            baseImage.bitmap.data[dstIdx + 3] *= avg / 255;
        }
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Composites a source image over to this image respecting alpha channels
 * @param src the source Jimp instance
 * @param x the x position to blit the image
 * @param y the y position to blit the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.composite = function(src, x, y, cb) {
    if (!(src instanceof Jimp)) {
        return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const baseImage = this;

    src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function(
        sx,
        sy,
        idx
    ) {
        // http://stackoverflow.com/questions/7438263/alpha-compositing-algorithm-blend-modes
        const dstIdx = baseImage.getPixelIndex(x + sx, y + sy);

        const fg = {
            r: this.bitmap.data[idx + 0] / 255,
            g: this.bitmap.data[idx + 1] / 255,
            b: this.bitmap.data[idx + 2] / 255,
            a: this.bitmap.data[idx + 3] / 255
        };

        const bg = {
            r: baseImage.bitmap.data[dstIdx + 0] / 255,
            g: baseImage.bitmap.data[dstIdx + 1] / 255,
            b: baseImage.bitmap.data[dstIdx + 2] / 255,
            a: baseImage.bitmap.data[dstIdx + 3] / 255
        };

        const a = bg.a + fg.a - bg.a * fg.a;

        const r = (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a;
        const g = (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a;
        const b = (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a;

        baseImage.bitmap.data[dstIdx + 0] = Jimp.limit255(r * 255);
        baseImage.bitmap.data[dstIdx + 1] = Jimp.limit255(g * 255);
        baseImage.bitmap.data[dstIdx + 2] = Jimp.limit255(b * 255);
        baseImage.bitmap.data[dstIdx + 3] = Jimp.limit255(a * 255);
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Get an image's histogram
 * @return {object} An object with an array of color occurence counts for each channel (r,g,b)
 */
function histogram() {
    const histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0)
    };

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        index
    ) {
        histogram.r[this.bitmap.data[index + 0]]++;
        histogram.g[this.bitmap.data[index + 1]]++;
        histogram.b[this.bitmap.data[index + 2]]++;
    });

    return histogram;
}

/**
 * Normalizes the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.normalize = function(cb) {
    const h = histogram.call(this);

    /**
     * Normalize values
     * @param  {integer} value Pixel channel value.
     * @param  {integer} min   Minimum value for channel
     * @param  {integer} max   Maximum value for channel
     * @return {integer}
     */
    const normalize = function(value, min, max) {
        return ((value - min) * 255) / (max - min);
    };

    const getBounds = function(histogramChannel) {
        return [
            histogramChannel.findIndex(value => value > 0),
            255 -
                histogramChannel
                    .slice()
                    .reverse()
                    .findIndex(value => value > 0)
        ];
    };

    // store bounds (minimum and maximum values)
    const bounds = {
        r: getBounds(h.r),
        g: getBounds(h.g),
        b: getBounds(h.b)
    };

    // apply value transformations
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        this.bitmap.data[idx + 0] = normalize(r, bounds.r[0], bounds.r[1]);
        this.bitmap.data[idx + 1] = normalize(g, bounds.g[0], bounds.g[1]);
        this.bitmap.data[idx + 2] = normalize(b, bounds.b[0], bounds.b[1]);
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Inverts the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.invert = function(cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        this.bitmap.data[idx] = 255 - this.bitmap.data[idx];
        this.bitmap.data[idx + 1] = 255 - this.bitmap.data[idx + 1];
        this.bitmap.data[idx + 2] = 255 - this.bitmap.data[idx + 2];
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Applies a true Gaussian blur to the image (warning: this is VERY slow)
 * @param r the pixel radius of the blur
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.gaussian = function(r, cb) {
    // http://blog.ivank.net/fastest-gaussian-blur.html
    if (typeof r !== 'number') {
        return throwError.call(this, 'r must be a number', cb);
    }

    if (r < 1) {
        return throwError.call(this, 'r must be greater than 0', cb);
    }

    const rs = Math.ceil(r * 2.57); // significant radius

    for (let y = 0; y < this.bitmap.height; y++) {
        log('Gaussian: ' + Math.round((y / this.bitmap.height) * 100) + '%');

        for (let x = 0; x < this.bitmap.width; x++) {
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            let wsum = 0;

            for (let iy = y - rs; iy < y + rs + 1; iy++) {
                for (let ix = x - rs; ix < x + rs + 1; ix++) {
                    const x1 = Math.min(this.bitmap.width - 1, Math.max(0, ix));
                    const y1 = Math.min(
                        this.bitmap.height - 1,
                        Math.max(0, iy)
                    );
                    const dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
                    const wght =
                        Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
                    const idx = (y1 * this.bitmap.width + x1) << 2;

                    red += this.bitmap.data[idx] * wght;
                    green += this.bitmap.data[idx + 1] * wght;
                    blue += this.bitmap.data[idx + 2] * wght;
                    alpha += this.bitmap.data[idx + 3] * wght;
                    wsum += wght;
                }

                const idx = (y * this.bitmap.width + x) << 2;

                this.bitmap.data[idx] = Math.round(red / wsum);
                this.bitmap.data[idx + 1] = Math.round(green / wsum);
                this.bitmap.data[idx + 2] = Math.round(blue / wsum);
                this.bitmap.data[idx + 3] = Math.round(alpha / wsum);
            }
        }
    }

    clear(); // clear the log

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
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

/**
 * Converts the image to a buffer
 * @param mime the mime type of the image buffer to be created
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
 */
Jimp.prototype.getBuffer = function(mime, cb) {
    if (mime === Jimp.AUTO) {
        // allow auto MIME detection
        mime = this.getMIME();
    }

    if (typeof mime !== 'string') {
        return throwError.call(this, 'mime must be a string', cb);
    }

    if (typeof cb !== 'function') {
        return throwError.call(this, 'cb must be a function', cb);
    }

    switch (mime.toLowerCase()) {
        case Jimp.MIME_PNG: {
            const png = new PNG({
                width: this.bitmap.width,
                height: this.bitmap.height,
                bitDepth: 8,
                deflateLevel: this._deflateLevel,
                deflateStrategy: this._deflateStrategy,
                filterType: this._filterType,
                colorType: this._rgba ? 6 : 2,
                inputHasAlpha: true
            });

            if (this._rgba) {
                png.data = Buffer.from(this.bitmap.data);
            } else {
                // when PNG doesn't support alpha
                png.data = compositeBitmapOverBackground(this).data;
            }

            const buffer = PNG.sync.write(png);
            cb.call(this, null, buffer);
            break;
        }

        case Jimp.MIME_JPEG: {
            // composite onto a new image so that the background shows through alpha channels
            const jpeg = JPEG.encode(
                compositeBitmapOverBackground(this),
                this._quality
            );
            cb.call(this, null, jpeg.data);
            break;
        }

        case Jimp.MIME_BMP:
        case Jimp.MIME_X_MS_BMP: {
            // composite onto a new image so that the background shows through alpha channels
            const bmp = BMP.encode(compositeBitmapOverBackground(this));
            cb.call(this, null, bmp.data);
            break;
        }

        case Jimp.MIME_TIFF: {
            const c = compositeBitmapOverBackground(this);
            const tiff = UTIF.encodeImage(c.data, c.width, c.height);
            cb.call(this, null, Buffer.from(tiff));
            break;
        }

        default:
            cb.call(this, 'Unsupported MIME type: ' + mime);
            break;
    }

    return this;
};

function compositeBitmapOverBackground(image) {
    return new Jimp(
        image.bitmap.width,
        image.bitmap.height,
        image._background
    ).composite(image, 0, 0).bitmap;
}

/**
 * Converts the image to a base 64 string
 * @param mime the mime type of the image data to be created
 * @param cb a Node-style function to call with the buffer as the second argument
 * @returns this for chaining of methods
 */
Jimp.prototype.getBase64 = function(mime, cb) {
    if (mime === Jimp.AUTO) {
        // allow auto MIME detection
        mime = this.getMIME();
    }

    if (typeof mime !== 'string') {
        return throwError.call(this, 'mime must be a string', cb);
    }
    if (typeof cb !== 'function') {
        return throwError.call(this, 'cb must be a function', cb);
    }

    this.getBuffer(mime, function(err, data) {
        if (err) {
            return throwError.call(this, err, cb);
        }

        const src = 'data:' + mime + ';base64,' + data.toString('base64');
        return cb.call(this, null, src);
    });

    return this;
};

/**
 * Apply a ordered dithering effect
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
Jimp.prototype.dither565 = function(cb) {
    const rgb565Matrix = [
        1,
        9,
        3,
        11,
        13,
        5,
        15,
        7,
        4,
        12,
        2,
        10,
        16,
        8,
        14,
        6
    ];
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        const tressholdId = ((y & 3) << 2) + (x % 4);
        const dither = rgb565Matrix[tressholdId];
        this.bitmap.data[idx] = Math.min(this.bitmap.data[idx] + dither, 0xff);
        this.bitmap.data[idx + 1] = Math.min(
            this.bitmap.data[idx + 1] + dither,
            0xff
        );
        this.bitmap.data[idx + 2] = Math.min(
            this.bitmap.data[idx + 2] + dither,
            0xff
        );
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

// alternative reference
Jimp.prototype.dither16 = Jimp.prototype.dither565;

/**
 * Loads a bitmap font from a file
 * @param file the file path of a .fnt file
 * @param (optional) cb a function to call when the font is loaded
 * @returns a promise
 */
Jimp.loadFont = function(file, cb) {
    if (typeof file !== 'string')
        return throwError.call(this, 'file must be a string', cb);

    return new Promise((resolve, reject) => {
        cb =
            cb ||
            function(err, font) {
                if (err) reject(err);
                else resolve(font);
            };

        bMFont(file, (err, font) => {
            const chars = {};
            const kernings = {};

            if (err) return throwError.call(this, err, cb);

            for (let i = 0; i < font.chars.length; i++) {
                chars[String.fromCharCode(font.chars[i].id)] = font.chars[i];
            }

            for (let i = 0; i < font.kernings.length; i++) {
                const firstString = String.fromCharCode(font.kernings[i].first);
                kernings[firstString] = kernings[firstString] || {};
                kernings[firstString][
                    String.fromCharCode(font.kernings[i].second)
                ] =
                    font.kernings[i].amount;
            }

            loadPages(Path.dirname(file), font.pages).then(pages => {
                cb(null, {
                    chars,
                    kernings,
                    pages,
                    common: font.common,
                    info: font.info
                });
            });
        });
    });
};

function loadPages(dir, pages) {
    const newPages = pages.map(page => {
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
Jimp.prototype.print = function(font, x, y, text, maxWidth, maxHeight, cb) {
    if (typeof maxWidth === 'function' && typeof cb === 'undefined') {
        cb = maxWidth;
        maxWidth = Infinity;
    }

    if (typeof maxWidth === 'undefined') {
        maxWidth = Infinity;
    }

    if (typeof maxHeight === 'function' && typeof cb === 'undefined') {
        cb = maxHeight;
        maxWidth = Infinity;
    }

    if (typeof maxHeight === 'undefined') {
        maxHeight = Infinity;
    }

    if (typeof font !== 'object') {
        return throwError.call(this, 'font must be a Jimp loadFont', cb);
    }

    if (
        typeof x !== 'number' ||
        typeof y !== 'number' ||
        typeof maxWidth !== 'number'
    ) {
        return throwError.call(this, 'x, y and maxWidth must be numbers', cb);
    }

    if (typeof text !== 'string' && typeof text !== 'object') {
        return throwError.call(this, 'text must be a string or an object', cb);
    }

    if (typeof maxWidth !== 'number') {
        return throwError.call(this, 'maxWidth must be a number', cb);
    }

    if (typeof maxHeight !== 'number') {
        return throwError.call(this, 'maxHeight must be a number', cb);
    }

    let alignmentX;
    let alignmentY;

    if (typeof text === 'object') {
        alignmentX = text.alignmentX || Jimp.HORIZONTAL_ALIGN_LEFT;
        alignmentY = text.alignmentY || Jimp.VERTICAL_ALIGN_TOP;
        ({ text } = text);
    } else {
        alignmentX = Jimp.HORIZONTAL_ALIGN_LEFT;
        alignmentY = Jimp.VERTICAL_ALIGN_TOP;
    }

    if (maxHeight !== Infinity && alignmentY === Jimp.VERTICAL_ALIGN_BOTTOM) {
        y = maxHeight - measureTextHeight(font, text, maxWidth);
    } else if (
        maxHeight !== Infinity &&
        alignmentY === Jimp.VERTICAL_ALIGN_MIDDLE
    ) {
        y = maxHeight / 2 - measureTextHeight(font, text, maxWidth) / 2;
    }

    const words = text.split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = measureText(font, testLine);

        if (testWidth > maxWidth && n > 0) {
            this.print(
                font,
                x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX),
                y,
                line
            );
            line = words[n] + ' ';
            y += font.common.lineHeight;
        } else {
            line = testLine;
        }
    }
    printText.call(
        this,
        font,
        x + xOffsetBasedOnAlignment(font, line, maxWidth, alignmentX),
        y,
        line
    );

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

function xOffsetBasedOnAlignment(font, line, maxWidth, alignment) {
    if (alignment === Jimp.HORIZONTAL_ALIGN_LEFT) {
        return 0;
    }

    if (alignment === Jimp.HORIZONTAL_ALIGN_CENTER) {
        return (maxWidth - measureText(font, line)) / 2;
    }

    return maxWidth - measureText(font, line);
}

function printText(font, x, y, text) {
    for (let i = 0; i < text.length; i++) {
        if (font.chars[text[i]]) {
            drawCharacter(this, font, x, y, font.chars[text[i]]);
            x +=
                (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]]
                    ? font.kernings[text[i]][text[i + 1]]
                    : 0) + (font.chars[text[i]].xadvance || 0);
        }
    }
}

function drawCharacter(image, font, x, y, char) {
    if (char.width > 0 && char.height > 0) {
        const imageChar = font.pages[char.page]
            .cloneQuiet()
            .crop(char.x, char.y, char.width, char.height);
        return image.composite(imageChar, x + char.xoffset, y + char.yoffset);
    }

    return image;
}

function measureText(font, text) {
    let x = 0;

    for (let i = 0; i < text.length; i++) {
        if (font.chars[text[i]]) {
            x +=
                font.chars[text[i]].xoffset +
                (font.kernings[text[i]] && font.kernings[text[i]][text[i + 1]]
                    ? font.kernings[text[i]][text[i + 1]]
                    : 0) +
                (font.chars[text[i]].xadvance || 0);
        }
    }

    return x;
}

function measureTextHeight(font, text, maxWidth) {
    const words = text.split(' ');
    let line = '';
    let textTotalHeight = font.common.lineHeight;

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const testWidth = measureText(font, testLine);

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
Jimp.prototype.write = function(path, cb) {
    if (!FS || !FS.createWriteStream) {
        throw new Error(
            'Cant access the filesystem. You can use the getBase64 method.'
        );
    }

    if (typeof path !== 'string') {
        return throwError.call(this, 'path must be a string', cb);
    }

    if (typeof cb === 'undefined') {
        cb = noop;
    }

    if (typeof cb !== 'function') {
        return throwError.call(this, 'cb must be a function', cb);
    }

    const mime = MIME.getType(path);
    const pathObj = Path.parse(path);

    if (pathObj.dir) {
        MkDirP.sync(pathObj.dir);
    }

    this.getBuffer(mime, (err, buffer) => {
        if (err) {
            return throwError.call(this, err, cb);
        }

        const stream = FS.createWriteStream(path);

        stream
            .on('open', () => {
                stream.write(buffer);
                stream.end();
            })
            .on('error', err => {
                return throwError.call(this, err, cb);
            });
        stream.on('finish', () => {
            return cb.call(this, null, this);
        });
    });

    return this;
};

if (process.env.ENVIRONMENT === 'BROWSER') {
    // For use in a web browser or web worker
    /* global self */
    let gl;

    if (typeof window !== 'undefined' && typeof window === 'object') {
        gl = window;
    }

    if (typeof self !== 'undefined' && typeof self === 'object') {
        gl = self;
    }

    gl.Jimp = Jimp;
    gl.Buffer = Buffer;
}

export default Jimp;
