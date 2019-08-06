import { IllformedPlugin, ImageCallback, Jimp } from '@jimp/core/src';

interface Mask extends IllformedPlugin {
  mask(src: Jimp, x: number, y: number, cb?: ImageCallback): this;
}

export default function(): Mask;
