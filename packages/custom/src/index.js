import Jimp, { addType, addJimpMethods, addConstants } from '@jimp/core';

export default function configure(configuration) {
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

    if (configuration.types) {
        configuration.types.forEach(addImageType);

        Jimp.decoders = jimpConfig.decoders;
        Jimp.encoders = jimpConfig.encoders;

        addJimpMethods(jimpConfig.class);
        addConstants(jimpConfig.constants);
    }

    return Jimp;
}
