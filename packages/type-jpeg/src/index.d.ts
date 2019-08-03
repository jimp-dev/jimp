import Jimp = require('jimp');
import {decode, encode} from 'jpeg-js';

interface Image {
  bitmap: Buffer;
}

interface JpegImage extends Image {
    _quality: number;
    quality: (n: number, cb?: (err: Error, jimp: Jimp) => void) => Jimp;
}

export interface TypeJpeg {
  mime: {
    [key: string]: string[];
  };
  constants: {
    [key: string]: string;
  };
  decoders: {
    [key: string]: (data: Buffer) => {
      height: number,
      width: number,
      data: Buffer
    };
  };
  encoders: {
    [key: string]: (image: JpegImage) => Buffer;
  };
  class: JpegImage;
}
