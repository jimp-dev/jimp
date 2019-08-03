import Jimp = require('jimp');



export interface ITypePluginReturn {
  mime: {
    [key: string]: string[];
  };
  constants: {
    [key: string]: string;
  };
  decoders: {
    [key: string]: (
      image: {
        width: number;
        height: number;
        data: Buffer;
      }
    ) => Buffer;
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
