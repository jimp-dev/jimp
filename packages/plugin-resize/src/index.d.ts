interface Resize {
  // resize methods
  RESIZE_NEAREST_NEIGHBOR: 'nearestNeighbor';
  RESIZE_BILINEAR: 'bilinearInterpolation';
  RESIZE_BICUBIC: 'bicubicInterpolation';
  RESIZE_HERMITE: 'hermiteInterpolation';
  RESIZE_BEZIER: 'bezierInterpolation';

  resize(w: number, h: number, cb?: ImageCallback): this;
  resize(w: number, h: number, mode?: string, cb?: ImageCallback): this;
}
