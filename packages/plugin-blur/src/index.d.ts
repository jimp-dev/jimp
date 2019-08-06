import { IllformedPlugin, ImageCallback } from '@jimp/core/src';

interface Blur extends IllformedPlugin {
  blur(r: number, cb?: ImageCallback): this;
}

export default function(): Blur;
