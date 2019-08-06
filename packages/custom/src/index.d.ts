import { Jimp, JimpPlugin, JimpType } from '@jimp/core/src';

export default function configure<T extends JimpType, P extends JimpPlugin>(configuration: {
  types?: T[],
  plugins?: P[]
}, jimpInstance?: Jimp): Jimp<T, P>;
