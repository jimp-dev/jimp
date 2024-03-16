import { Jimp as JimpCustom } from "@jimp/core";
import png from "@jimp/js-png";

export const Jimp = JimpCustom.addFormat(png);
