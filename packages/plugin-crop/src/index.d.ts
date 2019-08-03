interface Crop {
  crop(x: number, y: number, w: number, h: number, cb?: ImageCallback): this;
  cropQuiet(
    x: number,
    y: number,
    w: number,
    h: number,
    cb?: ImageCallback
  ): this;
  
  autocrop(tolerance?: number, cb?: ImageCallback): this;
  autocrop(cropOnlyFrames?: boolean, cb?: ImageCallback): this;
  autocrop(
    tolerance?: number,
    cropOnlyFrames?: boolean,
    cb?: ImageCallback
  ): this;
  autocrop(
    options: {
      tolerance?: number;
      cropOnlyFrames?: boolean;
      cropSymmetric?: boolean;
      leaveBorder?: number;
    },
    cb?: ImageCallback
  ): this;
}
