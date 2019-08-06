import { Jimp as JimpType } from '@jimp/core/src';
import typeFn from '@jimp/types/src';
import pluginFn from '@jimp/plugins/src';

type Types = ReturnType<typeof typeFn>;
type Plugins = ReturnType<typeof pluginFn>;

declare const Jimp: JimpType<Types, Plugins>;
export default Jimp;
