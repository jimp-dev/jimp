import { Jimp, JimpPlugin, JimpType } from '@jimp/core';

export default function configure<Type extends JimpType,
  Plugin extends JimpPlugin,
  JimpInst extends Jimp = Jimp>(configuration: {
  types?: JimpType[],
  plugins?: Plugin[]
}, jimpInstance?: JimpInst): JimpInst & Jimp<JimpType, Plugin>;
