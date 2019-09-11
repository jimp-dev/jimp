import { ImageCallback } from '@jimp/core';

interface Blur {
  blur(r: number, cb?: ImageCallback): this;
}

export default function(): Blur;
