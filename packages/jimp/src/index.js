import Jimp, { addType, addJimpMethods, addConstants } from '@jimp/core';

const jimpConfig = {
    encoders: {},
    decoders: {},
    class: {},
    constants: {}
};

function addImageType(type) {
    const [mime, extensions] = require(type)(jimpConfig);
    addType(mime, extensions);
}

addImageType('@jimp/jpeg');
addImageType('@jimp/png');
addImageType('@jimp/bmp');
addImageType('@jimp/tiff');
addImageType('@jimp/gif');

Jimp.decoders = jimpConfig.decoders;
Jimp.encoders = jimpConfig.encoders;

addJimpMethods(jimpConfig.class);
addConstants(jimpConfig.constants);

export default Jimp;
