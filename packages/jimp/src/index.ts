// import { Jimp } from "@jimp/core";

import crop from "@jimp/plugin-crop";
import blit from "@jimp/plugin-blit";

import png from "@jimp/js-png";

import { createJimp } from "@jimp/core";

export const Jimp = createJimp({
  plugins: [blit, crop],
  formats: [png],
});
