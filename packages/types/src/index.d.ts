import Jimp = require('jimp');

export type jimpCB = (err: Error, jimp: Jimp) => void;

export interface Image {
  bitmap: {
    width: number;
    height: number;
    data: Buffer;
  };
}


export interface ITypePluginReturn<ImageType extends Image = Image> extends Plugin<ImageType> {
  mime: {
    [key: string]: string[];
  };
  decoders: {
    [key: string]: (data: Buffer) => ImageType;
  };
  encoders: {
    [key: string]: (image: ImageType) => Buffer;
  };
}

export default function(): ITypePluginReturn;
