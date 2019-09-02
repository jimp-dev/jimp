import {
  Jimp,
  JimpPlugin,
  JimpType,
  TypeFunction,
  PluginFunction
} from '@jimp/core';

export default function configure<Type extends JimpType,
  Plugin extends JimpPlugin,
  JimpInst extends Jimp = Jimp>(configuration: {
  types?: TypeFunction[],
  plugins?: PluginFunction[]
}, jimpInstance?: JimpInst): JimpInst & Jimp<JimpType, Plugin>;
