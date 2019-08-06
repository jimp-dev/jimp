import { ImageCallback, Jimp } from '@jimp/core/src';

interface Mask {
  mask(src: Jimp, x: number, y: number, cb?: ImageCallback): this;
}

export default function(): Mask;