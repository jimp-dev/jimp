import configure from '@jimp/custom';

export default configure({
    types: ['@jimp/jpeg', '@jimp/png', '@jimp/bmp', '@jimp/tiff', '@jimp/gif'],
    plugins: [
        '@jimp/plugin-dither',
        '@jimp/plugin-resize',
        '@jimp/plugin-blit',
        '@jimp/plugin-rotate',
        '@jimp/plugin-color',
        '@jimp/plugin-print',
        '@jimp/plugin-blur',
        '@jimp/plugin-crop'
    ]
});
