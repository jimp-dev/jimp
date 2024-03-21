import { Jimp as JimpCustom } from "@jimp/core";

import crop from "@jimp/plugin-crop";
import blit from "@jimp/plugin-blit";

import png from "@jimp/js-png";

export const Jimp = JimpCustom
  // Formats
  .addFormat(png)
  // Plugins
  .plugin(blit)
  .plugin(crop);

const image = new Jimp();

image
  // doesn't work because blit is added first
  .blit({ src: image, x: 0, y: 0 })
  .crop(0, 0, image.bitmap.width, image.bitmap.height)
  .blit({ src: image, x: 0, y: 0 })
  .crop(0, 0, image.bitmap.width, image.bitmap.height);

image
  .crop(0, 0, image.bitmap.width, image.bitmap.height)
  .blit({ src: image, x: 0, y: 0 })
  // doesn't work because becuase of type returned from crop?
  // maybe its the same issue as above?
  .crop(0, 0, image.bitmap.width, image.bitmap.height);
