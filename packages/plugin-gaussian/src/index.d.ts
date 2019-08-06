import { ImageCallback } from '@jimp/core/src';

interface Gaussian {
  gaussian(r: number, cb?: ImageCallback): this;
}

export default function(): Gaussian;
