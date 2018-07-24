import { isNodePattern, throwError } from '../utils/error-checking';
import { mulTable, shgTable } from './blur-tables';

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
 * A fast blur algorithm that produces similar effect to a Gausian blur - but MUCH quicker
 * @param r the pixel radius of the blur
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export function blur(r, cb) {
    if (typeof r !== 'number')
        return throwError.call(this, 'r must be a number', cb);
    if (r < 1) return throwError.call(this, 'r must be greater than 0', cb);

    let rsum;
    let gsum;
    let bsum;
    let asum;
    let x;
    let y;
    let i;
    let p;
    let p1;
    let p2;
    let yp;
    let yi;
    let yw;
    let pa;

    const wm = this.bitmap.width - 1;
    const hm = this.bitmap.height - 1;
    // const wh = this.bitmap.width * this.bitmap.height;
    const rad1 = r + 1;

    const mulSum = mulTable[r];
    const shgSum = shgTable[r];

    const red = [];
    const green = [];
    const blue = [];
    const alpha = [];

    const vmin = [];
    const vmax = [];

    let iterations = 2;

    while (iterations-- > 0) {
        yi = 0;
        yw = 0;

        for (y = 0; y < this.bitmap.height; y++) {
            rsum = this.bitmap.data[yw] * rad1;
            gsum = this.bitmap.data[yw + 1] * rad1;
            bsum = this.bitmap.data[yw + 2] * rad1;
            asum = this.bitmap.data[yw + 3] * rad1;

            for (i = 1; i <= r; i++) {
                p = yw + ((i > wm ? wm : i) << 2);
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
                    vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
                }

                p1 = yw + vmin[x];
                p2 = yw + vmax[x];

                rsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                gsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                bsum += this.bitmap.data[p1++] - this.bitmap.data[p2++];
                asum += this.bitmap.data[p1] - this.bitmap.data[p2];

                yi++;
            }
            yw += this.bitmap.width << 2;
        }

        for (x = 0; x < this.bitmap.width; x++) {
            yp = x;
            rsum = red[yp] * rad1;
            gsum = green[yp] * rad1;
            bsum = blue[yp] * rad1;
            asum = alpha[yp] * rad1;

            for (i = 1; i <= r; i++) {
                yp += i > hm ? 0 : this.bitmap.width;
                rsum += red[yp];
                gsum += green[yp];
                bsum += blue[yp];
                asum += alpha[yp];
            }

            yi = x << 2;

            for (y = 0; y < this.bitmap.height; y++) {
                pa = (asum * mulSum) >>> shgSum;
                this.bitmap.data[yi + 3] = pa;

                // normalise alpha
                if (pa > 255) {
                    this.bitmap.data[yi + 3] = 255;
                }

                if (pa > 0) {
                    pa = 255 / pa;
                    this.bitmap.data[yi] = ((rsum * mulSum) >>> shgSum) * pa;
                    this.bitmap.data[yi + 1] =
                        ((gsum * mulSum) >>> shgSum) * pa;
                    this.bitmap.data[yi + 2] =
                        ((bsum * mulSum) >>> shgSum) * pa;
                } else {
                    this.bitmap.data[yi + 2] = 0;
                    this.bitmap.data[yi + 1] = 0;
                    this.bitmap.data[yi] = 0;
                }

                if (x === 0) {
                    vmin[y] =
                        ((p = y + rad1) < hm ? p : hm) * this.bitmap.width;
                    vmax[y] = (p = y - r) > 0 ? p * this.bitmap.width : 0;
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
        edgeHandling = Jimp.EDGE_EXTEND;
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
