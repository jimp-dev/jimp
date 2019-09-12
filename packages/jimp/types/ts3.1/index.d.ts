/**
 * While there is nothing in these typings that prevent it from running in TS 2.8 even,
 * due to the complexity of the typings anything lower than TS 3.1 will only see
 * Jimp as `any`. In order to test the strict versions of these types in our typing
 * test suite, the version has been bumped to 3.1
 */

import {
  Jimp as JimpType,
  Bitmap,
  RGB,
  RGBA,
  UnionToIntersection,
  GetPluginVal,
  ImageCallback,
  URLOptions
} from "@jimp/core";
import typeFn from '@jimp/types';
import pluginFn from '@jimp/plugins';

type Types = ReturnType<typeof typeFn>;
type Plugins = ReturnType<typeof pluginFn>;

export { Bitmap, RGB, RGBA };

export { FontChar, FontInfo, FontCommon, Font } from '@jimp/plugin-print';

type Jimp = InstanceType<typeof JimpType> & UnionToIntersection<GetPluginVal<Types> | GetPluginVal<Plugins>>;

// This adds these constructors to `Jimp`
declare const Jimp: {
  // Have to copy constructors from Jimp, unfortunately to fix constructor errors
  new(path: string, cb?: ImageCallback): Jimp;
  new(urlOptions: URLOptions, cb?: ImageCallback): Jimp;
  new(image: Jimp, cb?: ImageCallback): Jimp;
  new(data: Buffer, cb?: ImageCallback): Jimp;
  new(data: Bitmap, cb?: ImageCallback): Jimp;
  new(w: number, h: number, cb?: ImageCallback): Jimp;
  new(
    w: number,
    h: number,
    background?: number | string,
    cb?: ImageCallback
  ): Jimp;
  // For custom constructors when using Jimp.appendConstructorOption
  new(...args: any[]): Jimp;
} & Jimp;

export default Jimp;
