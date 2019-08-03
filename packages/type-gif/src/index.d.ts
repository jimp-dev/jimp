import Jimp = require('jimp');

export interface TypeJpeg {
  mime: {
    [key: string]: string[];
  };
  constants: {
    [key: string]: string;
  };
  decoders: {
    [key: string]: (
      image: Buffer
    ) => {
      data: Buffer;
      width: number;
      height: number;
    };
  };
}
