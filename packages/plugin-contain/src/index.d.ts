import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Contain extends IllformedPlugin {
  contain(w: number, h: number, cb?: ImageCallback): this;
  contain(w: number, h: number, mode?: string, cb?: ImageCallback): this;
  contain(w: number, h: number, alignBits?: number, cb?: ImageCallback): this;
  contain(
    w: number,
    h: number,
    alignBits?: number,
    mode?: string,
    cb?: ImageCallback
  ): this;
}

export default function(): Contain;
