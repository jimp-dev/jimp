import Jimp = require('jimp');

export default function (): {
  constants: {
    RESIZE_NEAREST_NEIGHBOR: 'nearestNeighbor',
    RESIZE_BILINEAR: 'bilinearInterpolation',
    RESIZE_BICUBIC: 'bicubicInterpolation',
    RESIZE_HERMITE: 'hermiteInterpolation',
    RESIZE_BEZIER: 'bezierInterpolation'
  },
  class: {
    resize: (w: number, h: number, mode?: string, cb?: (err: Error, jimp: Jimp) => void) => Jimp
  }
}
