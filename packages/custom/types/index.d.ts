// TypeScript Version: 3.1
// See the `jimp` package index.d.ts for why the version is not 2.8
import {
  FunctionRet,
  Jimp,
  JimpPlugin,
  JimpType,
  GetIntersectionFromPlugins,
  JimpConstructors
} from '@jimp/core';

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
