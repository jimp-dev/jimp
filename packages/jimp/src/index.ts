// import { Jimp } from "@jimp/core";

import blit from "@jimp/plugin-blit";
import blur from "@jimp/plugin-blur";
import color from "@jimp/plugin-color";
import crop from "@jimp/plugin-crop";
import hash from "@jimp/plugin-hash";
import resize from "@jimp/plugin-resize";
import threshold from "@jimp/plugin-threshold";

import bmp, { msBmp } from "@jimp/js-bmp";
import gif from "@jimp/js-gif";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import tiff from "@jimp/js-tiff";

import { createJimp } from "@jimp/core";

export const Jimp = createJimp({
  formats: [bmp, msBmp, gif, jpeg, png, tiff],
  plugins: [blit, blur, color, crop, hash, resize, threshold],
});
