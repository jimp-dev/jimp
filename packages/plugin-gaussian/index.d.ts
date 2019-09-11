import { ImageCallback } from '@jimp/core';

interface Gaussian {
  gaussian(r: number, cb?: ImageCallback): this;
}

export default function(): Gaussian;
