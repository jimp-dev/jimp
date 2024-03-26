// import { Jimp } from "@jimp/core";

import bmp, { msBmp } from "@jimp/js-bmp";
import gif from "@jimp/js-gif";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import tiff from "@jimp/js-tiff";

import blit from "@jimp/plugin-blit";
import blur from "@jimp/plugin-blur";
import circle from "@jimp/plugin-circle";
import color from "@jimp/plugin-color";
import contain from "@jimp/plugin-contain";
import cover from "@jimp/plugin-cover";
import crop from "@jimp/plugin-crop";
import displace from "@jimp/plugin-displace";
import dither from "@jimp/plugin-dither";
import fisheye from "@jimp/plugin-fisheye";
import hash from "@jimp/plugin-hash";
import mask from "@jimp/plugin-mask";
import print from "@jimp/plugin-print";
import resize from "@jimp/plugin-resize";
import rotate from "@jimp/plugin-rotate";
import threshold from "@jimp/plugin-threshold";

import { createJimp } from "@jimp/core";

export const Jimp = createJimp({
  formats: [bmp, msBmp, gif, jpeg, png, tiff],
  plugins: [
    blit,
    blur,
    circle,
    color,
    contain,
    cover,
    crop,
    displace,
    dither,
    fisheye,
    hash,
    mask,
    print,
    resize,
    rotate,
    threshold,
  ],
});

export { PNGColorType, PNGFilterType } from "@jimp/js-png";
export { AUTO, HorizontalAlign, VerticalAlign, BlendMode } from "@jimp/core";
export { loadFont } from "@jimp/plugin-print/load-font";
export { diff } from "@jimp/diff";
export {
  intToRGBA,
  rgbaToInt,
  colorDiff,
  limit255,
  cssColorToHex,
} from "@jimp/utils";
