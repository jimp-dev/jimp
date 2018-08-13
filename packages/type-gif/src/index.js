const GIF = require('omggif');

const MIME_TYPE = 'image/gif';

module.exports = config => {
    config.constants = {
        MIME_GIF: MIME_TYPE
    };

    config.decoders[MIME_TYPE] = data => {
        const gifObj = new GIF.GifReader(data);
        const gifData = Buffer.alloc(gifObj.width * gifObj.height * 4);

        gifObj.decodeAndBlitFrameRGBA(0, gifData);

        return {
            data: gifData,
            width: gifObj.width,
            height: gifObj.height
        };
    };

    return [MIME_TYPE, ['gif']];
};
