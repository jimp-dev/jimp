import { Jimp as JimpCustom } from "@jimp/core";

import crop from "@jimp/plugin-crop";
import blit from "@jimp/plugin-blit";

import png from "@jimp/js-png";

export const Jimp = JimpCustom.addFormat(png).plugin(blit).plugin(crop);
