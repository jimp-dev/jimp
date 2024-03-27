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
import flip from "@jimp/plugin-flip";
import hash from "@jimp/plugin-hash";
import mask from "@jimp/plugin-mask";
import print from "@jimp/plugin-print";
import resize from "@jimp/plugin-resize";
import rotate from "@jimp/plugin-rotate";
import threshold from "@jimp/plugin-threshold";

import { createJimp } from "@jimp/core";

/**
 * @class
 * A `Jimp` class enables you to:
 *
 * - Read an image into a "bit map" (a collection of pixels)
 * - Modify the bit map through methods that change the pixels
 * - Write the bit map back to an image buffer
 *
 * @example
 *
 * #### Node
 *
 * You can use jimp in Node.js.
 * For example you can read an image from a file and resize it and
 * then write it back to a file.
 *
 * ```ts
 * import { Jimp, AutoSize } from "jimp";
 * import { promises as fs } from "fs";
 *
 * const image = await Jimp.read("test/image.png");
 *
 * image.resize(256, 100);
 * image.greyscale();
 *
 * const output = await image.getBuffer("test/image.png");
 * await fs.writeFile("test/output.png", output);
 * ```
 */
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
    flip,
    hash,
    mask,
    print,
    resize,
    rotate,
    threshold,
  ],
});

export { AutoSize, ResizeStrategy } from "@jimp/plugin-resize";
export { distance, compareHashes } from "@jimp/plugin-hash";
export { PNGColorType, PNGFilterType } from "@jimp/js-png";
export { HorizontalAlign, VerticalAlign, BlendMode } from "@jimp/core";
export { loadFont } from "@jimp/plugin-print/load-font";
export { diff } from "@jimp/diff";
export {
  intToRGBA,
  rgbaToInt,
  colorDiff,
  limit255,
  cssColorToHex,
} from "@jimp/utils";
