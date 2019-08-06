import { ImageCallback } from '@jimp/core/src';

interface Blur {
  blur(r: number, cb?: ImageCallback): this;
}

export default function(): Blur;
