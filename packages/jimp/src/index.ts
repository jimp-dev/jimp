// import { Jimp } from "@jimp/core";

import blit from "@jimp/plugin-blit";
import blur from "@jimp/plugin-blur";
import crop from "@jimp/plugin-crop";
import resize from "@jimp/plugin-resize";

import bmp, { msBmp } from "@jimp/js-bmp";
import gif from "@jimp/js-gif";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import tiff from "@jimp/js-tiff";

import { createJimp } from "@jimp/core";

export const Jimp = createJimp({
  plugins: [blit, blur, crop, resize],
  formats: [bmp, msBmp, gif, jpeg, png, tiff],
});
