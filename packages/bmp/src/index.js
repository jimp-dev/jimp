const BMP = require('bmp-js');
const { scan } = require('@jimp/utils');

function toAGBR(image) {
    return scan(image, 0, 0, image.bitmap.width, image.bitmap.height, function(
        x,
        y,
        index
    ) {
        const red = this.bitmap.data[index + 0];
        const green = this.bitmap.data[index + 1];
        const blue = this.bitmap.data[index + 2];
        const alpha = this.bitmap.data[index + 3];

        this.bitmap.data[index + 0] = alpha;
        this.bitmap.data[index + 1] = blue;
        this.bitmap.data[index + 2] = green;
        this.bitmap.data[index + 3] = red;
    }).bitmap;
}

function fromAGBR(bitmap) {
    return scan({ bitmap }, 0, 0, bitmap.width, bitmap.height, function(
        x,
        y,
        index
    ) {
        const alpha = this.bitmap.data[index + 0];
        const blue = this.bitmap.data[index + 1];
        const green = this.bitmap.data[index + 2];
        const red = this.bitmap.data[index + 3];

        this.bitmap.data[index + 0] = red;
        this.bitmap.data[index + 1] = green;
        this.bitmap.data[index + 2] = blue;
        this.bitmap.data[index + 3] = bitmap.is_with_alpha ? alpha : 0xff;
    }).bitmap;
}

module.exports = config => {
    config.decoders['image/bmp'] = data => fromAGBR(BMP.decode(data));
    config.encoders['image/bmp'] = image => BMP.encode(toAGBR(image)).data;
};
