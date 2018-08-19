import Jimp, {
    addType,
    addJimpMethods,
    addConstants,
    jimpEvChange
} from '@jimp/core';

export default function configure(configuration) {
    const jimpConfig = {
        hasAlpha: {},
        encoders: {},
        decoders: {},
        class: {},
        constants: {}
    };

    function addToConfig(newConfig) {
        Object.entries(newConfig).forEach(([key, value]) => {
            jimpConfig[key] = {
                ...jimpConfig[key],
                ...value
            };
        });
    }

    // Can't pass injust a string for browser tests for some reason
    function requireIfNeeded(module) {
        if (typeof module === 'string') {
            return require(module);
        }

        return module;
    }

    function addImageType(typeModule) {
        const type = requireIfNeeded(typeModule)();
        addType(...type.mime);
        delete type.mime;
        addToConfig(type);
    }

    function addPlugin(pluginModule) {
        const plugin = requireIfNeeded(pluginModule)(jimpEvChange) || {};
        addToConfig(plugin);
    }

    if (configuration.types) {
        configuration.types.forEach(addImageType);

        Jimp.decoders = jimpConfig.decoders;
        Jimp.encoders = jimpConfig.encoders;
        Jimp.hasAlpha = jimpConfig.hasAlpha;
    }

    if (configuration.plugins) {
        configuration.plugins.forEach(addPlugin);
    }

    addJimpMethods(jimpConfig.class);
    addConstants(jimpConfig.constants);

    return Jimp;
}
