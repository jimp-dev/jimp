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
  JimpConstructors
} from '@jimp/core';
import typeFn from '@jimp/types';
import pluginFn from '@jimp/plugins';

type Types = ReturnType<typeof typeFn>;
type Plugins = ReturnType<typeof pluginFn>;

export { Bitmap, RGB, RGBA };

export { FontChar, FontInfo, FontCommon, Font } from '@jimp/plugin-print';

type IntersectedPluginTypes = UnionToIntersection<
  GetPluginVal<Types> | GetPluginVal<Plugins>
>;

type Jimp = InstanceType<JimpType> & IntersectedPluginTypes;

declare const Jimp: JimpConstructors & Jimp;

export default Jimp;
