// TypeScript Version: 3.1
// See the `jimp` package index.d.ts for why the version is not 2.8
import {
  FunctionRet,
  Jimp,
  JimpPlugin,
  JimpType,
  GetIntersectionFromPlugins,
  ImageCallback, 
  URLOptions, 
  Bitmap
} from '@jimp/core';

interface JimpConstructors {
  new(path: string, cb?: ImageCallback): this;
  new(urlOptions: URLOptions, cb?: ImageCallback): this;
  new(image: Jimp, cb?: ImageCallback): this;
  new(data: Buffer, cb?: ImageCallback): this;
  new(data: Bitmap, cb?: ImageCallback): this;
  new(w: number, h: number, cb?: ImageCallback): this;
  new(
    w: number,
    h: number,
    background?: number | string,
    cb?: ImageCallback
  ): this;
  // For custom constructors when using Jimp.appendConstructorOption
  new(...args: any[]): this; 
}

type JimpInstance<
  TypesFuncArr extends FunctionRet<JimpType> | undefined,
  PluginFuncArr extends FunctionRet<JimpPlugin> | undefined,
  J extends Jimp
> = Exclude<J, undefined> &
  GetIntersectionFromPlugins<Exclude<TypesFuncArr | PluginFuncArr, undefined>> &
  JimpConstructors;

declare function configure<
  TypesFuncArr extends FunctionRet<JimpType> | undefined = undefined,
  PluginFuncArr extends FunctionRet<JimpPlugin> | undefined = undefined,
  J extends Jimp = Jimp
>(
  configuration: {
    types?: TypesFuncArr;
    plugins?: PluginFuncArr;
  },
  jimpInstance?: J
  // Since JimpInstance is required, we want to use the default `Jimp` type
): JimpInstance<TypesFuncArr, PluginFuncArr, J>;

export default configure;
