import { Jimp, ImageCallback } from '@jimp/core';

interface Resize<This = Jimp> {
  constants: {
    // resize methods
    RESIZE_NEAREST_NEIGHBOR: 'nearestNeighbor';
    RESIZE_BILINEAR: 'bilinearInterpolation';
    RESIZE_BICUBIC: 'bicubicInterpolation';
    RESIZE_HERMITE: 'hermiteInterpolation';
    RESIZE_BEZIER: 'bezierInterpolation';
  }

  class: {
    resize(w: number, h: number, cb?: ImageCallback): This;
    resize(w: number, h: number, mode?: string, cb?: ImageCallback): This;
  }
}

export default function(): Resize;
