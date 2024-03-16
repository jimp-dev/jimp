import { Jimp as JimpCustom } from "@jimp/core";

import crop from "@jimp/plugin-crop";

import png from "@jimp/js-png";

export const Jimp = JimpCustom.addFormat(png).plugin(crop);
