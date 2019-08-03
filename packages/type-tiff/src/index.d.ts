import Jimp = require('jimp');

export interface TypeTiff {
  mime: {
    [key: string]: string[];
  };
  constants: {
    [key: string]: string;
  };
  decoders: {
    [key: string]: (
      data: Buffer
    ) => {
      data: Buffer;
      width: number;
      height: number;
    };
  };

  encoders: {
    [key: string]: (
      image: {
        bitmap: {
          width: number;
          height: number;
          data: Buffer;
        };
      }
    ) => Buffer;
  };
}
