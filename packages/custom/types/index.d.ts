// TypeScript Version: 3.1
// See the `jimp` package index.d.ts for why the version is not 2.8
import {
  FunctionRet,
  GetIntersectionAddons,
  Jimp,
  JimpPlugin,
  JimpType,
  GetIntersectionPlugins
} from '@jimp/core';

declare function configure<
  PluginFuncArr extends FunctionRet<JimpPlugin>,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    plugins: PluginFuncArr;
  },
  jimpInstance?: JimpInstance
  // Since JimpInstance is required, we want to use the default `Jimp` type
): Exclude<JimpInstance, undefined> &
  GetIntersectionPlugins<JimpPlugin, PluginFuncArr>;


declare function configure<
  TypesFuncArr extends FunctionRet<JimpType>,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    types: TypesFuncArr;
  },
  jimpInstance?: JimpInstance
  // Since JimpInstance is required, we want to use the default `Jimp` type
): Exclude<JimpInstance, undefined> &
  GetIntersectionPlugins<JimpType, TypesFuncArr>;

declare function configure<
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

  export default configure;
