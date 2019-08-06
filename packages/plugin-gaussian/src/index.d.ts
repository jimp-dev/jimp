import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Gaussian extends IllformedPlugin {
  gaussian(r: number, cb?: ImageCallback): this;
}

export default function(): Gaussian;
