import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Cover extends IllformedPlugin {
  cover(w: number, h: number, cb?: ImageCallback): this;
  cover(w: number, h: number, alignBits?: number, cb?: ImageCallback): this;
  cover(
    w: number,
    h: number,
    alignBits?: number,
    mode?: string,
    cb?: ImageCallback
  ): this;
}

export default function(): Cover;
