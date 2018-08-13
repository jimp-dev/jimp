// used to auto resizing etc.
export const AUTO = -1;

// Align modes for cover, contain, bit masks
export const HORIZONTAL_ALIGN_LEFT = 1;
export const HORIZONTAL_ALIGN_CENTER = 2;
export const HORIZONTAL_ALIGN_RIGHT = 4;

export const VERTICAL_ALIGN_TOP = 8;
export const VERTICAL_ALIGN_MIDDLE = 16;
export const VERTICAL_ALIGN_BOTTOM = 32;

// blend modes
export const BLEND_SOURCE_OVER = 'srcOver';
export const BLEND_DESTINATION_OVER = 'dstOver';
export const BLEND_MULTIPLY = 'multiply';
export const BLEND_SCREEN = 'screen';
export const BLEND_OVERLAY = 'overlay';
export const BLEND_DARKEN = 'darken';
export const BLEND_LIGHTEN = 'lighten';
export const BLEND_HARDLIGHT = 'hardLight';
export const BLEND_DIFFERENCE = 'difference';
export const BLEND_EXCLUSION = 'exclusion';

// Discover Jimp directory in any environment. (also in fucking karma)
function getJimpDir() {
    if (process.env.BABEL_ENV === 'test' && process.env.ENV === 'browser') {
        return 'http://localhost:9876/base/test/';
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
