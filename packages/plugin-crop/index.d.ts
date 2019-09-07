import { Jimp, ImageCallback } from '@jimp/core';

interface Crop<This = Jimp> {
  class: {
    crop(x: number, y: number, w: number, h: number, cb?: ImageCallback): This;
    cropQuiet(
      x: number,
      y: number,
      w: number,
      h: number,
      cb?: ImageCallback
    ): This;

    autocrop(tolerance?: number, cb?: ImageCallback): This;
    autocrop(cropOnlyFrames?: boolean, cb?: ImageCallback): This;
    autocrop(
      tolerance?: number,
      cropOnlyFrames?: boolean,
      cb?: ImageCallback
    ): This;
    autocrop(
      options: {
        tolerance?: number;
        cropOnlyFrames?: boolean;
        cropSymmetric?: boolean;
        leaveBorder?: number;
      },
      cb?: ImageCallback
    ): This;
  }
}

export default function(): Crop;
