const JPEG = require('jpeg-js');

module.exports = config => {
    config.decoders = {
        'image/jpeg': JPEG.decode
    };

    config.encoders = {
        'image/jpeg': JPEG.encode
    };
};
