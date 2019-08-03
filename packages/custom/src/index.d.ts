import Jimp, { Bitmap } from 'jimp';

export interface Image {
  bitmap: Bitmap;
}

interface NoClassContantPlugin {
  class: never;
  contants: never;
  [classFunc: string]: Function
}

interface ClassConstantPlugin<ImageType extends Image = Image> {
  mime: {
    [MIME_TYPE: string]: string[];
  };
  hasAlpha?: {
    [MIME_SPECIAL: string]: boolean;
  };
  constants?: {
    // Contants to assign to the Jimp instance
    [MIME_SPECIAL: string]: any;
  };
  decoders?: {
    [MIME_TYPE: string]: (data: Buffer) => Bitmap;
  };
  encoders?: {
    // Jimp Image
    [MIME_TYPE: string]: (image: ImageType) => Buffer;
  };
  // Extend the Jimp class with the following constants, etc
  class?: any;
}

export type JimpType<T extends Image = Image> = ClassConstantPlugin<T>;

export type JimpPlugin = ClassConstantPlugin | NoClassContantPlugin;

export default function configure(configuration: {
  types?: JimpType[],
  plugins?: JimpPlugin[]
}, jimpInstance?: Jimp): Jimp;
