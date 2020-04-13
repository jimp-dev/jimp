import { Jimp, ImageCallback } from '@jimp/core';

interface Blit {
  blit(src: Jimp, x: number, y: number, cb?: ImageCallback<this>): this;
  blit(
    src: Jimp,
    x: number,
    y: number,
    srcx: number,
    srcy: number,
    srcw: number,
    srch: number,
    cb?: ImageCallback<this>
  ): this;
  __internal__blit(
    src: Jimp,
    x: number,
    y: number,
    srcx: number,
    srcy: number,
    srcw: number,
    srch: number,
  ): void;
}

export default function(): Blit;
