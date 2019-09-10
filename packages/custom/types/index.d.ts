// TypeScript Version: 3.1
// See the `jimp` package index.d.ts for why the version is not 2.8
import {
  FunctionRet,
  GetIntersectionAddons,
  Jimp,
  JimpPlugin,
  JimpType
} from '@jimp/core';

export default function configure<
  TypesFuncArr extends FunctionRet<JimpType>,
  PluginFuncArr extends FunctionRet<JimpPlugin>,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    types?: TypesFuncArr;
    plugins?: PluginFuncArr;
  },
  jimpInstance?: JimpInstance
  // Since JimpInstance is required, we want to use the default `Jimp` type
): Exclude<JimpInstance, undefined> &
  GetIntersectionAddons<TypesFuncArr, PluginFuncArr>;
