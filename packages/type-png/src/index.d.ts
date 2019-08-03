import Jimp = require('jimp');

interface Image {
  bitmap: Buffer;
}

type jimpCB = (err: Error, jimp: Jimp) => void;

interface PNGImage extends Image {
    _deflateLevel: number,
    _deflateStrategy: number,
    _filterType: number,
    _colorType: number,
    deflateLevel(l: number, cb?: jimpCB): Jimp;
    deflateStrategy(s: number, cb?: jimpCB): Jimp;
    filterType(f: number, cb?: jimpCB): Jimp;
    colorType(s: number, cb?: jimpCB): Jimp;
}

export interface TypeJpeg {
  mime: {
    [key: string]: string[];
  };
  constants: {
    [key: string]: string | number;
  };
  hasAlpha: {
    [key: string]: boolean;
  };
  decoders: {
    [key: string]: (
      data: Buffer
    ) => {
      height: number;
      width: number;
      data: Buffer;
    };
  };
  encoders: {
    [key: string]: (image: Buffer) => Buffer;
  };
  class: PNGImage;
}
