import { Jimp as JimpCustom } from "@jimp/core";

import crop from "@jimp/plugin-crop";
import blit from "@jimp/plugin-blit";

import png from "@jimp/js-png";

export const Jimp = JimpCustom
  // .addFormat(png)
  .plugin(blit)
  .plugin(crop);

const image = new Jimp();

image
  .blit({ src: image, x: 0, y: 0 })
  .crop(0, 0, image.bitmap.width, image.bitmap.height)
  .blit({ src: image, x: 0, y: 0 })
  .crop(0, 0, image.bitmap.width, image.bitmap.height);

image
  .crop(0, 0, image.bitmap.width, image.bitmap.height)
  .blit({ src: image, x: 0, y: 0 })
  .crop(0, 0, image.bitmap.width, image.bitmap.height);
