import tinyColor from 'tinycolor2';

import isDef from '../utils/is-def';
import { isNodePattern, throwError } from '../utils/error-checking';
import * as constants from '../constants';

/**
 * Adjusts the brightness of the image
 * @param val the amount to adjust the brightness, a number between -1 and +1
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function brightness(val, cb) {
    if (typeof val !== 'number') {
        return throwError.call(this, 'val must be numbers', cb);
    }

    if (val < -1 || val > +1) {
        return throwError.call(
            this,
            'val must be a number between -1 and +1',
            cb
        );
    }

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        if (val < 0.0) {
            this.bitmap.data[idx] = this.bitmap.data[idx] * (1 + val);
            this.bitmap.data[idx + 1] = this.bitmap.data[idx + 1] * (1 + val);
            this.bitmap.data[idx + 2] = this.bitmap.data[idx + 2] * (1 + val);
        } else {
            this.bitmap.data[idx] =
                this.bitmap.data[idx] + (255 - this.bitmap.data[idx]) * val;
            this.bitmap.data[idx + 1] =
                this.bitmap.data[idx + 1] +
                (255 - this.bitmap.data[idx + 1]) * val;
            this.bitmap.data[idx + 2] =
                this.bitmap.data[idx + 2] +
                (255 - this.bitmap.data[idx + 2]) * val;
        }
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Adjusts the contrast of the image
 * val the amount to adjust the contrast, a number between -1 and +1
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function contrast(val, cb) {
    if (typeof val !== 'number') {
        return throwError.call(this, 'val must be numbers', cb);
    }

    if (val < -1 || val > +1) {
        return throwError.call(
            this,
            'val must be a number between -1 and +1',
            cb
        );
    }

    function adjust(value) {
        let x;

        if (val < 0) {
            x = value > 127 ? 1 - value / 255 : value / 255;

            if (x < 0) {
                x = 0;
            }

            x = 0.5 * Math.pow(x * 2, 1 + val);

            return value > 127 ? (1.0 - x) * 255 : x * 255;
        }

        x = value > 127 ? 1 - value / 255 : value / 255;

        if (x < 0) {
            x = 0;
        }

        x = 0.5 * Math.pow(2 * x, val === 1 ? 127 : 1 / (1 - val));

        return value > 127 ? (1 - x) * 255 : x * 255;
    }

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        this.bitmap.data[idx] = adjust(this.bitmap.data[idx]);
        this.bitmap.data[idx + 1] = adjust(this.bitmap.data[idx + 1]);
        this.bitmap.data[idx + 2] = adjust(this.bitmap.data[idx + 2]);
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Apply a posterize effect
 * val the amount to adjust the contrast, minimum threshold is two
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function posterize(n, cb) {
    if (typeof n !== 'number') {
        return throwError.call(this, 'n must be numbers', cb);
    }

    if (n < 2) {
        n = 2;
    } // minumum of 2 levels

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        this.bitmap.data[idx] =
            (Math.floor((this.bitmap.data[idx] / 255) * (n - 1)) / (n - 1)) *
            255;
        this.bitmap.data[idx + 1] =
            (Math.floor((this.bitmap.data[idx + 1] / 255) * (n - 1)) /
                (n - 1)) *
            255;
        this.bitmap.data[idx + 2] =
            (Math.floor((this.bitmap.data[idx + 2] / 255) * (n - 1)) /
                (n - 1)) *
            255;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Removes colour from the image using ITU Rec 709 luminance values
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function greyscale(cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        const grey = parseInt(
            0.2126 * this.bitmap.data[idx] +
                0.7152 * this.bitmap.data[idx + 1] +
                0.0722 * this.bitmap.data[idx + 2],
            10
        );

        this.bitmap.data[idx] = grey;
        this.bitmap.data[idx + 1] = grey;
        this.bitmap.data[idx + 2] = grey;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

// Alias of greyscale for our American friends
export const grayscale = greyscale;

/**
 * Multiplies the opacity of each pixel by a factor between 0 and 1
 * @param f A number, the factor by wich to multiply the opacity of each pixel
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export const opacity = function(f, cb) {
    if (typeof f !== 'number')
        return throwError.call(this, 'f must be a number', cb);
    if (f < 0 || f > 1)
        return throwError.call(this, 'f must be a number from 0 to 1', cb);

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        const v = this.bitmap.data[idx + 3] * f;
        this.bitmap.data[idx + 3] = v;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
};

/**
 * Applies a sepia tone to the image
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function sepia(cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        let red = this.bitmap.data[idx];
        let green = this.bitmap.data[idx + 1];
        let blue = this.bitmap.data[idx + 2];

        red = red * 0.393 + green * 0.769 + blue * 0.189;
        green = red * 0.349 + green * 0.686 + blue * 0.168;
        blue = red * 0.272 + green * 0.534 + blue * 0.131;

        this.bitmap.data[idx] = red < 255 ? red : 255;
        this.bitmap.data[idx + 1] = green < 255 ? green : 255;
        this.bitmap.data[idx + 2] = blue < 255 ? blue : 255;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Fades each pixel by a factor between 0 and 1
 * @param f A number from 0 to 1. 0 will haven no effect. 1 will turn the image completely transparent.
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function fade(f, cb) {
    if (typeof f !== 'number') {
        return throwError.call(this, 'f must be a number', cb);
    }

    if (f < 0 || f > 1) {
        return throwError.call(this, 'f must be a number from 0 to 1', cb);
    }

    // this method is an alternative to opacity (which may be deprecated)
    this.opacity(1 - f);

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Adds each element of the image to its local neighbors, weighted by the kernel
 * @param kernel a matrix to weight the neighbors sum
 * @param (optional) edgeHandling define how to sum pixels from outside the border
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function convolution(kernel, edgeHandling, cb) {
    if (typeof edgeHandling === 'function' && typeof cb === 'undefined') {
        cb = edgeHandling;
        edgeHandling = null;
    }

    if (!edgeHandling) {
        edgeHandling = constants.EDGE_EXTEND;
    }

    const newData = Buffer.from(this.bitmap.data);
    const kRows = kernel.length;
    const kCols = kernel[0].length;
    const rowEnd = Math.floor(kRows / 2);
    const colEnd = Math.floor(kCols / 2);
    const rowIni = -rowEnd;
    const colIni = -colEnd;

    let weight;
    let rSum;
    let gSum;
    let bSum;
    let ri;
    let gi;
    let bi;
    let xi;
    let yi;
    let idxi;

    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        bSum = 0;
        gSum = 0;
        rSum = 0;

        for (let row = rowIni; row <= rowEnd; row++) {
            for (let col = colIni; col <= colEnd; col++) {
                xi = x + col;
                yi = y + row;
                weight = kernel[row + rowEnd][col + colEnd];
                idxi = this.getPixelIndex(xi, yi, edgeHandling);

                if (idxi === -1) {
                    bi = 0;
                    gi = 0;
                    ri = 0;
                } else {
                    ri = this.bitmap.data[idxi + 0];
                    gi = this.bitmap.data[idxi + 1];
                    bi = this.bitmap.data[idxi + 2];
                }

                rSum += weight * ri;
                gSum += weight * gi;
                bSum += weight * bi;
            }
        }

        if (rSum < 0) {
            rSum = 0;
        }

        if (gSum < 0) {
            gSum = 0;
        }

        if (bSum < 0) {
            bSum = 0;
        }

        if (rSum > 255) {
            rSum = 255;
        }

        if (gSum > 255) {
            gSum = 255;
        }

        if (bSum > 255) {
            bSum = 255;
        }

        newData[idx + 0] = rSum;
        newData[idx + 1] = gSum;
        newData[idx + 2] = bSum;
    });

    this.bitmap.data = newData;

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Set the alpha channel on every pixel to fully opaque
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function opaque(cb) {
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        this.bitmap.data[idx + 3] = 255;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

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
export function pixelate(size, x, y, w, h, cb) {
    if (typeof x === 'function') {
        cb = x;
        h = null;
        w = null;
        y = null;
        x = null;
    } else {
        if (typeof size !== 'number') {
            return throwError.call(this, 'size must be a number', cb);
        }

        if (isDef(x) && typeof x !== 'number') {
            return throwError.call(this, 'x must be a number', cb);
        }

        if (isDef(y) && typeof y !== 'number') {
            return throwError.call(this, 'y must be a number', cb);
        }

        if (isDef(w) && typeof w !== 'number') {
            return throwError.call(this, 'w must be a number', cb);
        }

        if (isDef(h) && typeof h !== 'number') {
            return throwError.call(this, 'h must be a number', cb);
        }
    }

    const kernel = [
        [1 / 16, 2 / 16, 1 / 16],
        [2 / 16, 4 / 16, 2 / 16],
        [1 / 16, 2 / 16, 1 / 16]
    ];

    x = x || 0;
    y = y || 0;
    w = isDef(w) ? x : this.bitmap.width - x;
    h = isDef(h) ? h : this.bitmap.height - y;

    const source = this.cloneQuiet();

    this.scanQuiet(x, y, w, h, function(xx, yx, idx) {
        xx = size * Math.floor(xx / size);
        yx = size * Math.floor(yx / size);

        const value = applyKernel(source, kernel, xx, yx);

        this.bitmap.data[idx] = value[0];
        this.bitmap.data[idx + 1] = value[1];
        this.bitmap.data[idx + 2] = value[2];
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

function applyKernel(im, kernel, x, y) {
    const value = [0, 0, 0];
    const size = (kernel.length - 1) / 2;

    for (let kx = 0; kx < kernel.length; kx += 1) {
        for (let ky = 0; ky < kernel[kx].length; ky += 1) {
            const idx = im.getPixelIndex(x + kx - size, y + ky - size);

            value[0] += im.bitmap.data[idx] * kernel[kx][ky];
            value[1] += im.bitmap.data[idx + 1] * kernel[kx][ky];
            value[2] += im.bitmap.data[idx + 2] * kernel[kx][ky];
        }
    }
    return value;
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
export function convolute(kernel, x, y, w, h, cb) {
    if (!Array.isArray(kernel))
        return throwError.call(this, 'the kernel must be an array', cb);

    if (typeof x === 'function') {
        cb = x;
        x = null;
        y = null;
        w = null;
        h = null;
    } else {
        if (isDef(x) && typeof x !== 'number') {
            return throwError.call(this, 'x must be a number', cb);
        }

        if (isDef(y) && typeof y !== 'number') {
            return throwError.call(this, 'y must be a number', cb);
        }

        if (isDef(w) && typeof w !== 'number') {
            return throwError.call(this, 'w must be a number', cb);
        }

        if (isDef(h) && typeof h !== 'number') {
            return throwError.call(this, 'h must be a number', cb);
        }
    }

    const ksize = (kernel.length - 1) / 2;

    x = isDef(x) ? x : ksize;
    y = isDef(y) ? y : ksize;
    w = isDef(w) ? w : this.bitmap.width - x;
    h = isDef(h) ? h : this.bitmap.height - y;

    const source = this.cloneQuiet();

    this.scanQuiet(x, y, w, h, function(xx, yx, idx) {
        const value = applyKernel(source, kernel, xx, yx);

        this.bitmap.data[idx] = value[0];
        this.bitmap.data[idx + 1] = value[1];
        this.bitmap.data[idx + 2] = value[2];
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

/**
 * Apply multiple color modification rules
 * @param actions list of color modification rules, in following format: { apply: '<rule-name>', params: [ <rule-parameters> ]  }
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
function colorFn(actions, cb) {
    if (!actions || !Array.isArray(actions)) {
        return throwError.call(this, 'actions must be an array', cb);
    }

    const originalScope = this;
    this.scanQuiet(0, 0, this.bitmap.width, this.bitmap.height, function(
        x,
        y,
        idx
    ) {
        let clr = tinyColor({
            r: this.bitmap.data[idx],
            g: this.bitmap.data[idx + 1],
            b: this.bitmap.data[idx + 2]
        });

        const colorModifier = function(i, amount) {
            const c = clr.toRgb();
            c[i] = Math.max(0, Math.min(c[i] + amount, 255));
            return tinyColor(c);
        };

        actions.forEach(action => {
            if (action.apply === 'mix') {
                clr = tinyColor.mix(clr, action.params[0], action.params[1]);
            } else if (action.apply === 'tint') {
                clr = tinyColor.mix(clr, 'white', action.params[0]);
            } else if (action.apply === 'shade') {
                clr = tinyColor.mix(clr, 'black', action.params[0]);
            } else if (action.apply === 'xor') {
                const clr2 = tinyColor(action.params[0]).toRgb();
                clr = clr.toRgb();
                clr = tinyColor({
                    r: clr.r ^ clr2.r,
                    g: clr.g ^ clr2.g,
                    b: clr.b ^ clr2.b
                });
            } else if (action.apply === 'red') {
                clr = colorModifier('r', action.params[0]);
            } else if (action.apply === 'green') {
                clr = colorModifier('g', action.params[0]);
            } else if (action.apply === 'blue') {
                clr = colorModifier('b', action.params[0]);
            } else {
                if (action.apply === 'hue') {
                    action.apply = 'spin';
                }

                const fn = clr[action.apply];

                if (!fn) {
                    return throwError.call(
                        originalScope,
                        'action ' + action.apply + ' not supported',
                        cb
                    );
                }

                clr = fn.apply(clr, action.params);
            }
        });

        clr = clr.toRgb();
        this.bitmap.data[idx] = clr.r;
        this.bitmap.data[idx + 1] = clr.g;
        this.bitmap.data[idx + 2] = clr.b;
    });

    if (isNodePattern(cb)) {
        return cb.call(this, null, this);
    }

    return this;
}

export const color = colorFn;
export const colour = colorFn;
