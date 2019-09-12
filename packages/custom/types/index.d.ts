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
  PluginFuncArr extends FunctionRet<JimpPlugin>,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    plugins: PluginFuncArr;
  },
  jimpInstance?: JimpInstance
): Exclude<JimpInstance, undefined> &
  GetIntersectionFromPlugins<PluginFuncArr>;

declare function configure<
  TypesFuncArr extends FunctionRet<JimpType>,
  JimpInstance extends Jimp = Jimp
>(
  configuration: {
    types: TypesFuncArr;
  },
  jimpInstance?: JimpInstance
): Exclude<JimpInstance, undefined> &
  GetIntersectionFromPlugins<TypesFuncArr>;

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
  GetIntersectionFromPlugins<TypesFuncArr> &
  GetIntersectionFromPlugins<PluginFuncArr>;

  export default configure;
