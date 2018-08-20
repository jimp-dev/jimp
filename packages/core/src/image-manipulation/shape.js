import { isNodePattern, throwError } from '@jimp/utils';
import * as constants from '../constants';

/**
 * Scale the image so the given width and height keeping the aspect ratio. Some parts of the image may be clipped.
 * @param {number} w the width to resize the image to
 * @param {number} h the height to resize the image to
 * @param {number} alignBits (optional) A bitmask for horizontal and vertical alignment
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
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
        alignBits ||
        constants.HORIZONTAL_ALIGN_CENTER | constants.VERTICAL_ALIGN_MIDDLE;
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
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Scale the image to the given width and height keeping the aspect ratio. Some parts of the image may be letter boxed.
 * @param {number} w the width to resize the image to
 * @param {number} h the height to resize the image to
 * @param {number} alignBits (optional) A bitmask for horizontal and vertical alignment
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function contain(w, h, alignBits, mode, cb) {
    if (typeof w !== 'number' || typeof h !== 'number') {
        return throwError.call(this, 'w and h must be numbers', cb);
    }

    // permit any sort of optional parameters combination
    if (typeof alignBits === 'string') {
        if (typeof mode === 'function' && typeof cb === 'undefined') cb = mode;
        mode = alignBits;
        alignBits = null;
    }

    if (typeof alignBits === 'function') {
        if (typeof cb === 'undefined') cb = alignBits;
        mode = null;
        alignBits = null;
    }

    if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
    }

    alignBits =
        alignBits ||
        constants.HORIZONTAL_ALIGN_CENTER | constants.VERTICAL_ALIGN_MIDDLE;
    const hbits = alignBits & ((1 << 3) - 1);
    const vbits = alignBits >> 3;

    // check if more flags than one is in the bit sets
    if (
        !(
            (hbits !== 0 && !(hbits & (hbits - 1))) ||
            (vbits !== 0 && !(vbits & (vbits - 1)))
        )
    ) {
        return throwError.call(
            this,
            'only use one flag per alignment direction',
            cb
        );
    }

    const alignH = hbits >> 1; // 0, 1, 2
    const alignV = vbits >> 1; // 0, 1, 2

    const f =
        w / h > this.bitmap.width / this.bitmap.height
            ? h / this.bitmap.height
            : w / this.bitmap.width;
    const c = this.cloneQuiet().scale(f, mode);

    this.resize(w, h, mode);
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        this.bitmap.data.writeUInt32BE(this._background, idx);
    });
    this.blit(
        c,
        ((this.bitmap.width - c.bitmap.width) / 2) * alignH,
        ((this.bitmap.height - c.bitmap.height) / 2) * alignV
    );

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}
