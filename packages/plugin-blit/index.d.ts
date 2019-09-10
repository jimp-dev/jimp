import { Jimp, ImageCallback, IllformedPlugin } from '@jimp/core';

interface Blit {
  blit(src: Jimp, x: number, y: number, cb?: ImageCallback): this;
  blit(
    src: Jimp,
    x: number,
    y: number,
    srcx: number,
    srcy: number,
    srcw: number,
    srch: number,
    cb?: ImageCallback
  ): this;
}

export default function(): Blit;
