import { isNodePattern, throwError } from '@jimp/utils';
import * as constants from '../constants';

import * as compositeModes from './composite-modes';

/**
 * Get an image's histogram
 * @return {object} An object with an array of color occurrence counts for each channel (r,g,b)
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
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function normalize(cb) {
    const h = histogram.call(this);

    /**
     * Normalize values
     * @param  {integer} value Pixel channel value.
     * @param  {integer} min   Minimum value for channel
     * @param  {integer} max   Maximum value for channel
     * @return {integer} normalized values
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
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Inverts the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function invert(cb) {
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
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Applies a true Gaussian blur to the image (warning: this is VERY slow)
 * @param {number} r the pixel radius of the blur
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function gaussian(r, cb) {
    // http://blog.ivank.net/fastest-gaussian-blur.html
    if (typeof r !== 'number') {
        return throwError.call(this, 'r must be a number', cb);
    }

    if (r < 1) {
        return throwError.call(this, 'r must be greater than 0', cb);
    }

    const rs = Math.ceil(r * 2.57); // significant radius

    for (let y = 0; y < this.bitmap.height; y++) {
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

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Composites a source image over to this image respecting alpha channels
 * @param {Jimp} src the source Jimp instance
 * @param {number} x the x position to blit the image
 * @param {number} y the y position to blit the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function composite(src, x, y, options = {}, cb) {
    if (typeof options === 'function') {
        cb = options;
        options = {};
    }

    if (!(src instanceof this.constructor)) {
        return throwError.call(this, 'The source must be a Jimp image', cb);
    }

    if (typeof x !== 'number' || typeof y !== 'number') {
        return throwError.call(this, 'x and y must be numbers', cb);
    }

    let { mode, opacitySource, opacityDest } = options;

    if (!mode) {
        mode = constants.BLEND_SOURCE_OVER;
    }

    if (
        typeof opacitySource !== 'number' ||
        opacitySource < 0 ||
        opacitySource > 1
    ) {
        opacitySource = 1.0;
    }

    if (typeof opacityDest !== 'number' || opacityDest < 0 || opacityDest > 1) {
        opacityDest = 1.0;
    }

    const blendmode = compositeModes[mode];

    // round input
    x = Math.round(x);
    y = Math.round(y);

    const baseImage = this;

    if (opacityDest !== 1.0) {
        baseImage.opacity(opacityDest);
    }

    src.scanQuiet(0, 0, src.bitmap.width, src.bitmap.height, function(
        sx,
        sy,
        idx
    ) {
        const dstIdx = baseImage.getPixelIndex(
            x + sx,
            y + sy,
            constants.EDGE_CROP
        );
        const blended = blendmode(
            {
                r: this.bitmap.data[idx + 0] / 255,
                g: this.bitmap.data[idx + 1] / 255,
                b: this.bitmap.data[idx + 2] / 255,
                a: this.bitmap.data[idx + 3] / 255
            },
            {
                r: baseImage.bitmap.data[dstIdx + 0] / 255,
                g: baseImage.bitmap.data[dstIdx + 1] / 255,
                b: baseImage.bitmap.data[dstIdx + 2] / 255,
                a: baseImage.bitmap.data[dstIdx + 3] / 255
            },
            opacitySource
        );

        baseImage.bitmap.data[dstIdx + 0] = this.constructor.limit255(
            blended.r * 255
        );
        baseImage.bitmap.data[dstIdx + 1] = this.constructor.limit255(
            blended.g * 255
        );
        baseImage.bitmap.data[dstIdx + 2] = this.constructor.limit255(
            blended.b * 255
        );
        baseImage.bitmap.data[dstIdx + 3] = this.constructor.limit255(
            blended.a * 255
        );
    });

    if (isNodePattern(cb)) {
        cb.call(this, null, this);
    }

    return this;
}

/**
 * Masks a source image on to this image using average pixel colour. A completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param {Jimp} src the source Jimp instance
 * @param {number} x the horizontal position to blit the image
 * @param {number} y the vertical position to blit the image
 * @param {function(Error, Jimp)} cb (optional) a callback for when complete
 * @returns {Jimp} this for chaining of methods
 */
export function mask(src, x = 0, y = 0, cb) {
    if (!(src instanceof this.constructor)) {
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
        cb.call(this, null, this);
    }

    return this;
}
