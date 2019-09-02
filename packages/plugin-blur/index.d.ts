import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Blur extends IllformedPlugin {
  blur(r: number, cb?: ImageCallback): this;
}

export default function(): Blur;
