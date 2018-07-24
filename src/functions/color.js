import { isNodePattern, throwError } from '../utils/error-checking';

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
