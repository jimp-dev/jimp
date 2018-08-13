import { throwError, isNodePattern } from '@jimp/utils';

export default function pluginBlit(config, event) {
    /**
     * Crops the image at a given point to a give size
     * @param {number} x the x coordinate to crop form
     * @param {number} y the y coordinate to crop form
     * @param w the width of the crop region
     * @param h the height of the crop region
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    event('crop', function(x, y, w, h, cb) {
        if (typeof x !== 'number' || typeof y !== 'number')
            return throwError.call(this, 'x and y must be numbers', cb);
        if (typeof w !== 'number' || typeof h !== 'number')
            return throwError.call(this, 'w and h must be numbers', cb);

        // round input
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);

        if (x === 0 && w === this.bitmap.width) {
            // shortcut
            const start = (w * y + x) << 2;
            const end = (start + h * w) << (2 + 1);

            this.bitmap.data = this.bitmap.data.slice(start, end);
        } else {
            const bitmap = Buffer.allocUnsafe(w * h * 4);
            let offset = 0;

            this.scanQuiet(x, y, w, h, function(x, y, idx) {
                const data = this.bitmap.data.readUInt32BE(idx, true);
                bitmap.writeUInt32BE(data, offset, true);
                offset += 4;
            });

            this.bitmap.data = bitmap;
        }

        this.bitmap.width = w;
        this.bitmap.height = h;

        if (isNodePattern(cb)) {
            cb.call(this, null, this);
        }

        return this;
    });
}
