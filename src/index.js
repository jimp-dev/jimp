/* global TARGET */
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

import * as text from './functions/text';
import * as shape from './functions/shape';
import * as color from './functions/color';
import * as effects from './functions/effects';
import { log, clear } from './utils/log';
import parseBitmap from './utils/parse-bitmap';
import { isNodePattern, throwError } from './utils/error-checking';
import * as constants from './constants';

const sourceMaps =
    TARGET === 'development'
        ? require('source-map-support')
        : { install: () => {} };

const isDef = v => typeof v !== 'undefined' && v !== null;

BigNumber.set({
    ALPHABET: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
});

// an array storing the maximum string length of hashes at various bases
const maxHashLength = [];

for (let i = 0; i < 65; i++) {
    const l =
        i > 1 ? new BigNumber(new Array(64 + 1).join('1'), 2).toString(i) : NaN;
    maxHashLength.push(l.length);
}

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

const emptyBitmap = {
    data: null,
    width: null,
    height: null
};

function compositeBitmapOverBackground(image) {
    return new Jimp(
        image.bitmap.width,
        image.bitmap.height,
        image._background
    ).composite(image, 0, 0).bitmap;
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
        sourceMaps.install();

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

    /**
     * Returns the original MIME of the image (default: "image/png")
     * @returns the MIME as a string
     */
    getMIME() {
        const mime = this._originalMime || Jimp.MIME_PNG;

        return mime;
    }

    /**
     * Returns the appropriate file extension for the original MIME of the image (default: "png")
     * @returns the file extension as a string
     */
    getExtension() {
        const mime = this.getMIME();

        return MIME.getExtension(mime);
    }

    /**
     * Writes the image to a file
     * @param path a path to the destination file (either PNG or JPEG)
     * @param (optional) cb a function to call when the image is saved to disk
     * @returns this for chaining of methods
     */
    write(path, cb) {
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
    }

    /**
     * Sets the deflate level used when saving as PNG format (default is 9)
     * @param l Deflate level to use 0-9. 0 is no compression. 9 (default) is maximum compression.
     * @param (optional) cb a callback for when complete
     * @returns this for chaining of methods
     */
    deflateLevel(l, cb) {
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
    }

    /**
     * Sets the deflate strategy used when saving as PNG format (default is 3)
     * @param s Deflate strategy to use 0-3.
     * @param (optional) cb a callback for when complete
     * @returns this for chaining of methods
     */
    deflateStrategy(s, cb) {
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
    }

    /**
     * Sets the filter type used when saving as PNG format (default is automatic filters)
     * @param f The quality to use -1-4.
     * @param (optional) cb a callback for when complete
     * @returns this for chaining of methods
     */
    filterType(f, cb) {
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
    }

    /**
     * Sets the type of the image (RGB or RGBA) when saving as PNG format (default is RGBA)
     * @param bool A Boolean, true to use RGBA or false to use RGB
     * @param (optional) cb a callback for when complete
     * @returns this for chaining of methods
     */
    rgba(bool, cb) {
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
    }

    /**
     * Sets the quality of the image when saving as JPEG format (default is 100)
     * @param n The quality to use 0-100
     * @param (optional) cb a callback for when complete
     * @returns this for chaining of methods
     */
    quality(n, cb) {
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
    }

    /**
     * Converts the image to a base 64 string
     * @param mime the mime type of the image data to be created
     * @param cb a Node-style function to call with the buffer as the second argument
     * @returns this for chaining of methods
     */
    getBase64(mime, cb) {
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
    }

    /**
     * Generates a perceptual hash of the image <https://en.wikipedia.org/wiki/Perceptual_hashing>.
     * @param base (optional) a number between 2 and 64 representing the base for the hash (e.g. 2 is binary, 10 is decimaal, 16 is hex, 64 is base 64). Defaults to 64.
     * @param (optional) cb a callback for when complete
     * @returns a string representing the hash
     */
    hash(base, cb) {
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
    }

    /**
     * Converts the image to a buffer
     * @param mime the mime type of the image buffer to be created
     * @param cb a Node-style function to call with the buffer as the second argument
     * @returns this for chaining of methods
     */
    getBuffer(mime, cb) {
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
                return cb.call(this, null, buffer);
            }

            case Jimp.MIME_JPEG: {
                // composite onto a new image so that the background shows through alpha channels
                const jpeg = JPEG.encode(
                    compositeBitmapOverBackground(this),
                    this._quality
                );
                return cb.call(this, null, jpeg.data);
            }

            case Jimp.MIME_BMP:
            case Jimp.MIME_X_MS_BMP: {
                // composite onto a new image so that the background shows through alpha channels
                const bmp = BMP.encode(compositeBitmapOverBackground(this));
                return cb.call(this, null, bmp.data);
            }

            case Jimp.MIME_TIFF: {
                const c = compositeBitmapOverBackground(this);
                const tiff = UTIF.encodeImage(c.data, c.width, c.height);
                return cb.call(this, null, Buffer.from(tiff));
            }

            default:
                return cb.call(this, 'Unsupported MIME type: ' + mime);
        }
    }

    /**
     * Returns the offset of a pixel in the bitmap buffer
     * @param x the x coordinate
     * @param y the y coordinate
     * @param (optional) edgeHandling define how to sum pixels from outside the border
     * @param (optional) cb a callback for when complete
     * @returns the index of the pixel or -1 if not found
     */
    getPixelIndex(x, y, edgeHandling, cb) {
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
    }

    /**
     * Returns the hex colour value of a pixel
     * @param x the x coordinate
     * @param y the y coordinate
     * @param (optional) cb a callback for when complete
     * @returns the color of the pixel
     */
    getPixelColor(x, y, cb) {
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
    getPixelColour = this.getPixelColor;

    /**
     * Returns the hex colour value of a pixel
     * @param x the x coordinate
     * @param y the y coordinate
     * @param (optional) cb a callback for when complete
     * @returns the index of the pixel or -1 if not found
     */
    setPixelColor(hex, x, y, cb) {
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
    setPixelColour = this.setPixelColor;
}

Object.entries(constants).map(([name, value]) => (Jimp[name] = value));

Object.entries({ ...color, ...shape, ...text, ...effects }).map(
    ([name, value]) => (Jimp.prototype[name] = value)
);

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
 * Compute color difference
 * 0 means no difference, 1 means maximum difference.
 * @param rgba1:    first color to compare.
 * @param rgba2:    second color to compare.
 * Both parameters must be an color object {r:val, g:val, b:val, a:val}
 * Where `a` is optional and `val` is an integer between 0 and 255.
 * @returns float between 0 and 1.
 */
Jimp.colorDiff = function(rgba1, rgba2) {
    const pow = n => Math.pow(n, 2);
    const { max } = Math;
    const maxVal = 255 * 255 * 3;

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

function loadPages(dir, pages) {
    const newPages = pages.map(page => {
        return Jimp.read(dir + '/' + page);
    });

    return Promise.all(newPages);
}

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
 * Simplify jimpEvMethod call for the common `change` evName.
 */
function jimpEvChange(methodName, method) {
    jimpEvMethod(methodName, 'change', method);
}

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