// TypeScript Version: 3.1
// See the `jimp` package index.d.ts for why the version is not 2.8
import {
  FunctionRet,
  Jimp,
  JimpPlugin,
  JimpType,
  GetIntersectionFromPlugins
} from '@jimp/core';

declare function configure<
  TypesFuncArr extends FunctionRet<JimpType> | undefined = undefined,
  PluginFuncArr extends FunctionRet<JimpPlugin> | undefined = undefined,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    types?: TypesFuncArr;
    plugins?: PluginFuncArr;
  },
  jimpInstance?: JimpInstance
  // Since JimpInstance is required, we want to use the default `Jimp` type
): Exclude<JimpInstance, undefined> &
  GetIntersectionFromPlugins<Exclude<TypesFuncArr | PluginFuncArr, undefined>>;

  export default configure;
