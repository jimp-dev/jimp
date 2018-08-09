/* eslint-disable no-labels */

import Resize from '../modules/resize';
import Resize2 from '../modules/resize2';

import { isNodePattern, throwError } from '../utils/error-checking';
import * as constants from '../constants';

function rotate90degrees(bitmap, dstBuffer, clockwise) {
    const dstOffsetStep = clockwise ? -4 : 4;
    let dstOffset = clockwise ? dstBuffer.length - 4 : 0;

    let tmp;
    let x;
    let y;
    let srcOffset;

    for (x = 0; x < bitmap.width; x++) {
        for (y = bitmap.height - 1; y >= 0; y--) {
            srcOffset = (bitmap.width * y + x) << 2;
            tmp = bitmap.data.readUInt32BE(srcOffset, true);
            dstBuffer.writeUInt32BE(tmp, dstOffset, true);
            dstOffset += dstOffsetStep;
        }
    }
}

/**
 * Rotates an image clockwise by a number of degrees rounded to the nearest 90 degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 */
function simpleRotate(deg) {
    let steps = Math.round(deg / 90) % 4;
    steps += steps < 0 ? 4 : 0;

    if (steps === 0) return;

    const srcBuffer = this.bitmap.data;
    const len = srcBuffer.length;
    const dstBuffer = Buffer.allocUnsafe(len);

    let tmp;

    if (steps === 2) {
        // Upside-down
        for (let srcOffset = 0; srcOffset < len; srcOffset += 4) {
            tmp = srcBuffer.readUInt32BE(srcOffset, true);
            dstBuffer.writeUInt32BE(tmp, len - srcOffset - 4, true);
        }
    } else {
        // Clockwise or counter-clockwise rotation by 90 degree
        rotate90degrees(this.bitmap, dstBuffer, steps === 1);

        tmp = this.bitmap.width;
        this.bitmap.width = this.bitmap.height;
        this.bitmap.height = tmp;
    }

    this.bitmap.data = dstBuffer;
}

/**
 * Rotates an image clockwise by an arbitrary number of degrees. NB: 'this' must be a Jimp object.
 * @param {number} deg the number of degrees to rotate the image by
 * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
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
 * @param {number} deg the number of degrees to rotate the image by
 * @param {string|boolean} mode (optional) resize mode or a boolean, if false then the width and height of the image will not be changed
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
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
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Flip the image horizontally
 * @param {boolean} horizontal a Boolean, if true the image will be flipped horizontally
 * @param {boolean} vertical a Boolean, if true the image will be flipped vertically
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
function flipFn(horizontal, vertical, cb) {
    if (typeof horizontal !== 'boolean' || typeof vertical !== 'boolean')
        return throwError.call(
            this,
            'horizontal and vertical must be Booleans',
            cb
        );

    if (horizontal && vertical) {
        // shortcut
        return this.rotate(180, true, cb);
    }

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
        cb.call(this, null, this);
    }

    return this;
}

export const flip = flipFn;
export const mirror = flipFn;

/**
 * Resizes the image to a set width and height using a 2-pass bilinear algorithm
 * @param {number} w the width to resize the image to (or Jimp.AUTO)
 * @param {number} h the height to resize the image to (or Jimp.AUTO)
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
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

    if (w < 0 || h < 0) {
        return throwError.call(this, 'w and h must be positive numbers', cb);
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
        cb.call(this, null, this);
    }

    return this;
}

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

/**
 * Uniformly scales the image by a factor.
 * @param {number} f the factor to scale the image by
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function scale(f, mode, cb) {
    if (typeof f !== 'number') {
        return throwError.call(this, 'f must be a number', cb);
    }

    if (f < 0) {
        return throwError.call(this, 'f must be a positive number', cb);
    }

    if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
    }

    const w = this.bitmap.width * f;
    const h = this.bitmap.height * f;
    this.resize(w, h, mode);

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Scale the image to the largest size that fits inside the rectangle that has the given width and height.
 * @param {number} w the width to resize the image to
 * @param {number} h the height to resize the image to
 * @param {string} mode (optional) a scaling method (e.g. Jimp.RESIZE_BEZIER)
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function scaleToFit(w, h, mode, cb) {
    if (typeof w !== 'number' || typeof h !== 'number') {
        return throwError.call(this, 'w and h must be numbers', cb);
    }

    if (typeof mode === 'function' && typeof cb === 'undefined') {
        cb = mode;
        mode = null;
    }

    const f =
        w / h > this.bitmap.width / this.bitmap.height
            ? h / this.bitmap.height
            : w / this.bitmap.width;
    this.scale(f, mode);

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Displaces the image based on the provided displacement map
 * @param {object} map the source Jimp instance
 * @param {number} offset the maximum displacement value
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function displace(map, offset, cb) {
    if (typeof map !== 'object' || map.constructor !== this.constructor) {
        return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof offset !== 'number') {
        return throwError.call(this, 'factor must be a number', cb);
    }

    const source = this.cloneQuiet();
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        let displacement = (map.bitmap.data[idx] / 256) * offset;
        displacement = Math.round(displacement);

        const ids = this.getPixelIndex(x + displacement, y);
        this.bitmap.data[ids] = source.bitmap.data[idx];
        this.bitmap.data[ids + 1] = source.bitmap.data[idx + 1];
        this.bitmap.data[ids + 2] = source.bitmap.data[idx + 2];
    });

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Autocrop same color borders from this image
 * @param {number} tolerance (optional): a percent value of tolerance for pixels color difference (default: 0.0002%)
 * @param {boolean} cropOnlyFrames (optional): flag to crop only real frames: all 4 sides of the image must have some border (default: true)
 * @param {function(Error, Jimp)} cb (optional): a callback for when complete (default: no callback)
 * @returns {Jimp} this for chaining of methods
 */
export function autocrop(...args) {
    const w = this.bitmap.width;
    const h = this.bitmap.height;
    const minPixelsPerSide = 1; // to avoid cropping completely the image, resulting in an invalid 0 sized image

    let cb; // callback
    let tolerance = 0.0002; // percent of color difference tolerance (default value)
    let cropOnlyFrames = true; // flag to force cropping only if the image has a real "frame"
    // i.e. all 4 sides have some border (default value)

    // parse arguments
    for (let a = 0, len = args.length; a < len; a++) {
        if (typeof args[a] === 'number') {
            // tolerance value passed
            tolerance = args[a];
        }

        if (typeof args[a] === 'boolean') {
            // cropOnlyFrames value passed
            cropOnlyFrames = args[a];
        }

        if (typeof args[a] === 'function') {
            // callback value passed
            cb = args[a];
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
    const rgba1 = this.constructor.intToRGBA(colorTarget);

    // for north and east sides
    let northPixelsToCrop = 0;
    let eastPixelsToCrop = 0;
    let southPixelsToCrop = 0;
    let westPixelsToCrop = 0;

    // north side (scan rows from north to south)
    north: for (let y = 0; y < h - minPixelsPerSide; y++) {
        for (let x = 0; x < w; x++) {
            const colorXY = this.getPixelColor(x, y);
            const rgba2 = this.constructor.intToRGBA(colorXY);

            if (this.constructor.colorDiff(rgba1, rgba2) > tolerance) {
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
            const rgba2 = this.constructor.intToRGBA(colorXY);

            if (this.constructor.colorDiff(rgba1, rgba2) > tolerance) {
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
            const rgba2 = this.constructor.intToRGBA(colorXY);

            if (this.constructor.colorDiff(rgba1, rgba2) > tolerance) {
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
            const rgba2 = this.constructor.intToRGBA(colorXY);

            if (this.constructor.colorDiff(rgba1, rgba2) > tolerance) {
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
        cb.call(this, null, this);
    }

    return this;
}
