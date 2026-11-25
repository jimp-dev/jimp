/**
 * @module jimp
 */

// import { Jimp } from "@jimp/core";

import bmp, { msBmp } from "@jimp/js-bmp";
import gif from "@jimp/js-gif";
import ico, { msIcon } from "@jimp/js-ico";
import jpeg from "@jimp/js-jpeg";
import png from "@jimp/js-png";
import tiff from "@jimp/js-tiff";

import * as blit from "@jimp/plugin-blit";
import * as blur from "@jimp/plugin-blur";
import * as border from "@jimp/plugin-border";
import * as circle from "@jimp/plugin-circle";
import * as color from "@jimp/plugin-color";
import * as contain from "@jimp/plugin-contain";
import * as cover from "@jimp/plugin-cover";
import * as crop from "@jimp/plugin-crop";
import * as displace from "@jimp/plugin-displace";
import * as dither from "@jimp/plugin-dither";
import * as draw from "@jimp/plugin-draw";
import * as fisheye from "@jimp/plugin-fisheye";
import * as flip from "@jimp/plugin-flip";
import * as hash from "@jimp/plugin-hash";
import * as lut from "@jimp/plugin-lut";
import * as mask from "@jimp/plugin-mask";
import * as morphology from "@jimp/plugin-morphology";
import * as print from "@jimp/plugin-print";
import * as resize from "@jimp/plugin-resize";
import * as rotate from "@jimp/plugin-rotate";
import * as threshold from "@jimp/plugin-threshold";
import * as quantize from "@jimp/plugin-quantize";

import { createJimp, type JimpEdit as CoreJimpEdit } from "@jimp/core";

export const defaultPlugins = [
  blit.methods,
  blur.methods,
  border.methods,
  circle.methods,
  color.methods,
  contain.methods,
  cover.methods,
  crop.methods,
  displace.methods,
  dither.methods,
  draw.methods,
  fisheye.methods,
  flip.methods,
  hash.methods,
  lut.methods,
  mask.methods,
  morphology.methods,
  print.methods,
  resize.methods,
  rotate.methods,
  threshold.methods,
  quantize.methods,
];

export const defaultFormats = [bmp, msBmp, gif, ico, msIcon, jpeg, png, tiff];

/** Convenience object for getting the MIME types of the default formats */
export const JimpMime = {
  bmp: bmp().mime,
  gif: gif().mime,
  ico: ico().mime,
  jpeg: jpeg().mime,
  png: png().mime,
  tiff: tiff().mime,
};

// TODO: This doesn't document the constructor of the class
/**
 * @class
 *
 * A `Jimp` class enables you to:class
 *
 * - Read an image into a "bit map" (a collection of pixels)
 * - Modify the bit map through methods that change the pixels
 * - Write the bit map back to an image buffer
 *
 * @example
 *
 * #### Basic
 *
 * You can use the Jimp class to make empty images.
 * This is useful for when you want to create an image that composed of other images on top of a background.
 *
 * ```ts
 * import { Jimp } from "jimp";
 *
 * const image = new Jimp({ width: 256, height: 256, color: 0xffffffff });
 * const image2 = new Jimp({ width: 100, height: 100, color: 0xff0000ff });
 *
 * image.composite(image2, 50, 50);
 * ```
 *
 * #### Node
 *
 * You can use jimp in Node.js.
 * For example you can read an image from a file and resize it and
 * then write it back to a file.
 *
 * ```ts
 * import { Jimp } from "jimp";
 * import { promises as fs } from "fs";
 *
 * const image = await Jimp.read("test/image.png");
 *
 * image.resize({ w: 256, h: 100 });
 * image.greyscale();
 *
 * await image.write('test/output.png');
 * ```
 *
 * #### Browser
 *
 * You can use jimp in the browser by reading files from URLs
 *
 * ```ts
 * import { Jimp } from "jimp";
 *
 * const image = await Jimp.read("https://upload.wikimedia.org/wikipedia/commons/0/01/Bot-Test.jpg");
 *
 * image.resize({ w: 256, h: 100 });
 * image.greyscale();
 *
 * const canvas = document.createElement("canvas");
 *
 * canvas.width = image.bitmap.width;
 * canvas.height = image.bitmap.height;
 *
 * const ctx = canvas.getContext("2d");
 * const imageData = new ImageData(
 *   new Uint8ClampedArray(image.bitmap.data),
 *   image.bitmap.width,
 *   image.bitmap.height
 * );
 *
 * ctx.putImageData(imageData, 0, 0);
 *
 * document.body.appendChild(canvas);
 * ```
 */
export const Jimp = createJimp({
  formats: defaultFormats,
  plugins: defaultPlugins,
});

export type JimpInstance = InstanceType<typeof Jimp>;

/** One edit for `image.apply`, e.g. `["resize", { w: 100 }]` */
export type JimpEdit = CoreJimpEdit<JimpInstance>;

export { ColorActionName } from "@jimp/plugin-color";
export type {
  ColorAction,
  HueAction,
  MixAction,
  RedAction,
  XorAction,
  BlueAction,
  SpinAction,
  TintAction,
  GreenAction,
  ShadeAction,
  DarkenAction,
  LightenAction,
  BrightenAction,
  SaturateAction,
  GrayscaleAction,
  DesaturateAction,
  GradientMapOptions,
} from "@jimp/plugin-color";
export type { CircleOptions } from "@jimp/plugin-circle";
export type {
  BorderOptions,
  BoxShadowOptions,
  CornerRadius,
  RoundCornersOptions,
} from "@jimp/plugin-border";
export type { AutocropOptions, CropOptions } from "@jimp/plugin-crop";
export type { DitherOptions, DitherPalette } from "@jimp/plugin-dither";
export type {
  Color,
  DrawEllipseOptions,
  DrawLineOptions,
  DrawPathOptions,
  DrawPolygonOptions,
  DrawRectOptions,
  FillRule,
  FloodFillOptions,
  GradientStop,
  GradientStops,
  LinearGradient,
  LineCap,
  LineJoin,
  Paint,
  PathCommand,
  RadialGradient,
} from "@jimp/plugin-draw";
export { ResizeStrategy } from "@jimp/plugin-resize";
export type {
  ScaleOptions,
  ResizeOptions,
  ScaleToFitOptions,
} from "@jimp/plugin-resize";
export type {
  ThresholdOptions,
  OtsuThresholdOptions,
} from "@jimp/plugin-threshold";
export { otsuThreshold } from "@jimp/plugin-threshold";
export { distance, compareHashes, decodeBlurhash } from "@jimp/plugin-hash";
export type {
  BlurhashOptions,
  DecodeBlurhashOptions,
  PHashOptions,
} from "@jimp/plugin-hash";
export {
  parseCubeLut,
  type Lut,
  type ColorGradeOptions,
} from "@jimp/plugin-lut";
export type { JPEGOptions } from "@jimp/js-jpeg";
export { PNGColorType, PNGFilterType } from "@jimp/js-png";
export { BmpCompression } from "@jimp/js-bmp";
export type { EncodeOptions } from "@jimp/js-bmp";
export { HorizontalAlign, VerticalAlign, BlendMode } from "@jimp/core";
export type {
  RawImageData,
  JimpConstructorOptions,
  JimpSimpleConstructorOptions,
  ColorSpaceName,
  ReadOptions,
  ReadFramesOptions,
  JimpFrame,
  JimpFrames,
  FrameInput,
} from "@jimp/core";
export type { EncodeGifFramesOptions } from "@jimp/js-gif";
export { Edge } from "@jimp/types";
export type { Bitmap, RGBAColor, RGBColor } from "@jimp/types";
export { loadFont } from "@jimp/plugin-print/load-font";
export { measureText, measureTextHeight } from "@jimp/plugin-print";
// loadTTF is in "jimp/load-ttf", so the font parser is only bundled when it's used
export type {
  PrintFontOptions,
  VectorFont,
  VectorTextLayoutOptions,
  VectorTextOptions,
} from "@jimp/plugin-print";
export { diff } from "@jimp/diff";
export type { DiffOptions, DiffColor } from "@jimp/diff";
export {
  intToRGBA,
  rgbaToInt,
  colorDiff,
  limit255,
  cssColorToHex,
} from "@jimp/utils";
export type { FlipOptions } from "@jimp/plugin-flip";
export type { FisheyeOptions } from "@jimp/plugin-fisheye";
export type { MorphologyOptions } from "@jimp/plugin-morphology";
export type { AffineOptions, SkewOptions } from "@jimp/plugin-rotate";
export type { DisplaceOptions } from "@jimp/plugin-displace";
export type { CoverOptions } from "@jimp/plugin-cover";
export type { ContainOptions } from "@jimp/plugin-contain";
