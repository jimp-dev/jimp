const JPEG = require('jpeg-js');
const { throwError, isNodePattern } = require('@jimp/utils');

const MIME_TYPE = 'image/jpeg';

module.exports = config => {
    config.constants.MIME_JPEG = MIME_TYPE;

    config.decoders[MIME_TYPE] = JPEG.decode;
    config.encoders[MIME_TYPE] = image =>
        JPEG.encode(image.bitmap, image._quality).data;

    // The quality to be used when saving JPEG images
    config.class._quality = 100;

    /**
     * Sets the quality of the image when saving as JPEG format (default is 100)
     * @param {number} n The quality to use 0-100
     * @param {function(Error, Jimp)} cb (optional) a callback for when complete
     * @returns {Jimp} this for chaining of methods
     */
    config.class.quality = function(n, cb) {
        if (typeof n !== 'number') {
            return throwError.call(this, 'n must be a number', cb);
        }

        if (n < 0 || n > 100) {
            return throwError.call(this, 'n must be a number 0 - 100', cb);
        }

        this._quality = Math.round(n);

        if (isNodePattern(cb)) {
            cb.call(this, null, this);
        }

        return this;
    };

    return [MIME_TYPE, ['jpeg', 'jpg', 'jpe']];
};
