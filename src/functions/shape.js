import Resize from '../modules/resize';
import Resize2 from '../modules/resize2';

import { isNodePattern, throwError } from '../utils/error-checking';
import * as constants from '../constants';

/**
 * Rotates an image clockwise by a number of degrees rounded to the nearest 90 degrees. NB: 'this' must be a Jimp object.
 * @param deg the number of degress to rotate the image by
 * @returns nothing
 */
function simpleRotate(deg) {
    let i = Math.round(deg / 90) % 4;
    while (i < 0) i += 4;

    while (i > 0) {
        // https://github.com/ekulabuhov/jimp/commit/9a0c7cff88292d88c32a424b11256c76f1e20e46
        const dstBuffer = Buffer.alloc(this.bitmap.data.length);
        let dstOffset = 0;

        for (let x = this.bitmap.width - 1; x >= 0; x--) {
            for (let y = 0; y < this.bitmap.height; y++) {
                const srcOffset = (this.bitmap.width * y + x) << 2;
                const data = this.bitmap.data.readUInt32BE(srcOffset);
                dstBuffer.writeUInt32BE(data, dstOffset);
                dstOffset += 4;
            }
        }

        this.bitmap.data = Buffer.from(dstBuffer);

        const tmp = this.bitmap.width;
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
function advancedRotate(deg, mode) {
    deg %= 360;
    const rad = (deg * Math.PI) / 180;
    const cosine = Math.cos(rad);
    const sine = Math.sin(rad);

    // the final width and height will change if resize == true
    let w = this.bitmap.width;
    let h = this.bitmap.height;

    if (mode === true || typeof mode === 'string') {
        // resize the image to it maximum dimension and blit the existing image
        // onto the center so that when it is rotated the image is kept in bounds

        // http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
        // Plus 1 border pixel to ensure to show all rotated result for some cases.
        w =
            Math.ceil(
                Math.abs(this.bitmap.width * cosine) +
                    Math.abs(this.bitmap.height * sine)
            ) + 1;
        h =
            Math.ceil(
                Math.abs(this.bitmap.width * sine) +
                    Math.abs(this.bitmap.height * cosine)
            ) + 1;
        // Ensure destination to have even size to a better result.
        if (w % 2 !== 0) {
            w++;
        }

        if (h % 2 !== 0) {
            h++;
        }

        const c = this.cloneQuiet();
        this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
            x,
            y,
            idx
        ) {
            this.bitmap.data.writeUInt32BE(this._background, idx);
        });

        const max = Math.max(w, h, this.bitmap.width, this.bitmap.height);
        this.resize(max, max, mode);

        this.blit(
            c,
            this.bitmap.width / 2 - c.bitmap.width / 2,
            this.bitmap.height / 2 - c.bitmap.height / 2
        );
    }

    const bW = this.bitmap.width;
    const bH = this.bitmap.height;
    const dstBuffer = Buffer.alloc(this.bitmap.data.length);

    function createTranslationFunction(deltaX, deltaY) {
        return function(x, y) {
            return {
                x: x + deltaX,
                y: y + deltaY
            };
        };
    }

    const translate2Cartesian = createTranslationFunction(-(bW / 2), -(bH / 2));
    const translate2Screen = createTranslationFunction(
        bW / 2 + 0.5,
        bH / 2 + 0.5
    );

    for (let y = 1; y <= bH; y++) {
        for (let x = 1; x <= bW; x++) {
            const cartesian = translate2Cartesian(x, y);
            const source = translate2Screen(
                cosine * cartesian.x - sine * cartesian.y,
                cosine * cartesian.y + sine * cartesian.x
            );
            const dstIdx = (bW * (y - 1) + x - 1) << 2;

            if (
                source.x >= 0 &&
                source.x < bW &&
                source.y >= 0 &&
                source.y < bH
            ) {
                const srcIdx = ((bW * (source.y | 0) + source.x) | 0) << 2;
                const pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx);
                dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
            } else {
                // reset off-image pixels
                dstBuffer.writeUInt32BE(this._background, dstIdx);
            }
        }
    }
    this.bitmap.data = dstBuffer;

    if (mode === true || typeof mode === 'string') {
        // now crop the image to the final size
        const x = bW / 2 - w / 2;
        const y = bH / 2 - h / 2;
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
export function rotate(deg, mode, cb) {
    // enable overloading
    if (typeof mode === 'undefined' || mode === null) {
        // e.g. image.resize(120);
        // e.g. image.resize(120, null, cb);
        // e.g. image.resize(120, undefined, cb);
        mode = true;
    }

    if (typeof mode === 'function' && typeof cb === 'undefined') {
        // e.g. image.resize(120, cb);
        cb = mode;
        mode = true;
    }

    if (typeof deg !== 'number') {
        return throwError.call(this, 'deg must be a number', cb);
    }

    if (typeof mode !== 'boolean' && typeof mode !== 'string') {
        return throwError.call(this, 'mode must be a boolean or a string', cb);
    }

    if (deg % 90 === 0 && Boolean(mode) === false) {
        simpleRotate.call(this, deg, cb);
    } else {
        advancedRotate.call(this, deg, mode, cb);
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Flip the image horizontally
 * @param horizontal a Boolean, if true the image will be flipped horizontally
 * @param vertical a Boolean, if true the image will be flipped vertically
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
function flipFn(horizontal, vertical, cb) {
    if (typeof horizontal !== 'boolean' || typeof vertical !== 'boolean')
        return throwError.call(
            this,
            'horizontal and vertical must be Booleans',
            cb
        );

    const bitmap = Buffer.alloc(this.bitmap.data.length);
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        const _x = horizontal ? this.bitmap.width - 1 - x : x;
        const _y = vertical ? this.bitmap.height - 1 - y : y;
        const _idx = (this.bitmap.width * _y + _x) << 2;
        const data = this.bitmap.data.readUInt32BE(idx);

        bitmap.writeUInt32BE(data, _idx);
    });

    this.bitmap.data = Buffer.from(bitmap);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

export const flip = flipFn;
export const mirror = flipFn;

/**
 * Resizes the image to a set width and height using a 2-pass bilinear algorithm
 * @param w the width to resize the image to (or Jimp.AUTO)
 * @param h the height to resize the image to (or Jimp.AUTO)
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function resize(w, h, mode, cb) {
    if (typeof w !== 'number' || typeof h !== 'number') {
        return throwError.call(this, 'w and h must be numbers', cb);
    }

    if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
    }

    if (w === constants.AUTO && h === constants.AUTO) {
        return throwError.call(this, 'w and h cannot both be set to auto', cb);
    }

    if (w === constants.AUTO) {
        w = this.bitmap.width * (h / this.bitmap.height);
    }

    if (h === constants.AUTO) {
        h = this.bitmap.height * (w / this.bitmap.width);
    }

    // round inputs
    w = Math.round(w);
    h = Math.round(h);

    if (typeof Resize2[mode] === 'function') {
        const dst = {
            data: Buffer.alloc(w * h * 4),
            width: w,
            height: h
        };
        Resize2[mode](this.bitmap, dst);
        this.bitmap = dst;
    } else {
        const image = this;
        const resize = new Resize(
            this.bitmap.width,
            this.bitmap.height,
            w,
            h,
            true,
            true,
            buffer => {
                image.bitmap.data = Buffer.from(buffer);
                image.bitmap.width = w;
                image.bitmap.height = h;
            }
        );
        resize.resize(this.bitmap.data);
    }

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
 * @param w the width to resize the image to
 * @param h the height to resize the image to
 * @param (optional) alignBits A bitmask for horizontal and vertical alignment
 * @param (optional) mode a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function cover(w, h, alignBits, mode, cb) {
    if (typeof w !== 'number' || typeof h !== 'number') {
        return throwError.call(this, 'w and h must be numbers', cb);
    }

    if (
        alignBits &&
        typeof alignBits === 'function' &&
        typeof cb === 'undefined'
    ) {
        cb = alignBits;
        alignBits = null;
        mode = null;
    } else if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
    }

    alignBits =
        alignBits || this.HORIZONTAL_ALIGN_CENTER | this.VERTICAL_ALIGN_MIDDLE;
    const hbits = alignBits & ((1 << 3) - 1);
    const vbits = alignBits >> 3;

    // check if more flags than one is in the bit sets
    if (
        !(
            (hbits !== 0 && !(hbits & (hbits - 1))) ||
            (vbits !== 0 && !(vbits & (vbits - 1)))
        )
    )
        return throwError.call(
            this,
            'only use one flag per alignment direction',
            cb
        );

    const alignH = hbits >> 1; // 0, 1, 2
    const alignV = vbits >> 1; // 0, 1, 2

    const f =
        w / h > this.bitmap.width / this.bitmap.height
            ? w / this.bitmap.width
            : h / this.bitmap.height;
    this.scale(f, mode);
    this.crop(
        ((this.bitmap.width - w) / 2) * alignH,
        ((this.bitmap.height - h) / 2) * alignV,
        w,
        h
    );

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}
