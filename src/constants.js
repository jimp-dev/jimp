// used to auto resizing etc.
export const AUTO = -1;

// supported mime types
export const MIME_PNG = 'image/png';
export const MIME_TIFF = 'image/tiff';
export const MIME_JPEG = 'image/jpeg';
export const MIME_JGD = 'image/jgd';
export const MIME_BMP = 'image/bmp';
export const MIME_X_MS_BMP = 'image/x-ms-bmp';
export const MIME_GIF = 'image/gif';

// PNG filter types
export const PNG_FILTER_AUTO = -1;
export const PNG_FILTER_NONE = 0;
export const PNG_FILTER_SUB = 1;
export const PNG_FILTER_UP = 2;
export const PNG_FILTER_AVERAGE = 3;
export const PNG_FILTER_PAETH = 4;

export const RESIZE_NEAREST_NEIGHBOR = 'nearestNeighbor';
export const RESIZE_BILINEAR = 'bilinearInterpolation';
export const RESIZE_BICUBIC = 'bicubicInterpolation';
export const RESIZE_HERMITE = 'hermiteInterpolation';
export const RESIZE_BEZIER = 'bezierInterpolation';

// Align modes for cover, contain, bit masks
export const HORIZONTAL_ALIGN_LEFT = 1;
export const HORIZONTAL_ALIGN_CENTER = 2;
export const HORIZONTAL_ALIGN_RIGHT = 4;

export const VERTICAL_ALIGN_TOP = 8;
export const VERTICAL_ALIGN_MIDDLE = 16;
export const VERTICAL_ALIGN_BOTTOM = 32;

// Discover Jimp directory in any environment. (also in fucking karma)
// This function is a little crazy. IDK if its needed when jimp is used as a lib
function getJimpDir() {
    const err = new Error();
    const callLine = err.stack
        .split(/\n/)
        .filter(l => l.match(/getJimpDir/))[0];
    const reWebKit = /.*\(([^?]+\/)[^/]+\).*/;
    const reMoz = /.*@([^?]+\/).*/;

    if (process.env.BABEL_ENV === 'test' && process.env.ENV === 'browser') {
        return 'http://localhost:9877/base/test/';
    }

    if (reWebKit.test(callLine)) {
        return callLine.replace(reWebKit, '$1');
    }

    if (reMoz.test(callLine)) {
        return callLine.replace(reMoz, '$1');
    }

    return `${__dirname}/`;
}

export const dirName = getJimpDir();

// Font locations
export const FONT_SANS_8_BLACK =
    dirName + '../fonts/open-sans/open-sans-8-black/open-sans-8-black.fnt';
export const FONT_SANS_10_BLACK =
    dirName + '../fonts/open-sans/open-sans-10-black/open-sans-10-black.fnt';
export const FONT_SANS_12_BLACK =
    dirName + '../fonts/open-sans/open-sans-12-black/open-sans-12-black.fnt';
export const FONT_SANS_14_BLACK =
    dirName + '../fonts/open-sans/open-sans-14-black/open-sans-14-black.fnt';
export const FONT_SANS_16_BLACK =
    dirName + '../fonts/open-sans/open-sans-16-black/open-sans-16-black.fnt';
export const FONT_SANS_32_BLACK =
    dirName + '../fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt';
export const FONT_SANS_64_BLACK =
    dirName + '../fonts/open-sans/open-sans-64-black/open-sans-64-black.fnt';
export const FONT_SANS_128_BLACK =
    dirName + '../fonts/open-sans/open-sans-128-black/open-sans-128-black.fnt';

export const FONT_SANS_8_WHITE =
    dirName + '../fonts/open-sans/open-sans-8-white/open-sans-8-white.fnt';
export const FONT_SANS_16_WHITE =
    dirName + '../fonts/open-sans/open-sans-16-white/open-sans-16-white.fnt';
export const FONT_SANS_32_WHITE =
    dirName + '../fonts/open-sans/open-sans-32-white/open-sans-32-white.fnt';
export const FONT_SANS_64_WHITE =
    dirName + '../fonts/open-sans/open-sans-64-white/open-sans-64-white.fnt';
export const FONT_SANS_128_WHITE =
    dirName + '../fonts/open-sans/open-sans-128-white/open-sans-128-white.fnt';

// Edge Handling
export const EDGE_EXTEND = 1;
export const EDGE_WRAP = 2;
export const EDGE_CROP = 3;
