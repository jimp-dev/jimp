const { PNG } = require('pngjs');

module.exports = config => {
    config.decoders['image/png'] = PNG.sync.read;
    config.encoders['image/png'] = data => {
        const png = new PNG({
            data: data.bitmap.data,
            width: data.bitmap.width,
            height: data.bitmap.height,
            bitDepth: 8,
            deflateLevel: data._deflateLevel,
            deflateStrategy: data._deflateStrategy,
            filterType: data._filterType,
            colorType: data._rgba ? 6 : 2,
            inputHasAlpha: true
        });

        return PNG.sync.write(png);
    };
};
