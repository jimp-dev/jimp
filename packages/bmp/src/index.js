const BMP = require('bmp-js');

module.exports = config => {
    config.decoders['image/bmp'] = BMP.decode;
    config.encoders['image/bmp'] = BMP.encode;
};
