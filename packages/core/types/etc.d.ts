import {Jimp} from './jimp';

export interface Image {
  bitmap: Bitmap;
}

export type DecoderFn = (data: Buffer) => Bitmap;
export type EncoderFn<ImageType extends Image = Image> = (
  image: ImageType
) => Buffer;

export type GenericCallback<T, U = any, TThis = any> = (
  this: TThis,
  err: Error | null,
  value: T
) => U;

export type ImageCallback<U = any> = (
  this: Jimp,
  err: Error | null,
  value: Jimp,
  coords: {
    x: number;
    y: number;
  }
) => U;

type BlendMode = {
  mode: string;
  opacitySource: number;
  opacityDest: number;
};

type ChangeName = 'background' | 'scan' | 'crop';

type ListenableName =
  | 'any'
  | 'initialized'
  | 'before-change'
  | 'changed'
  | 'before-clone'
  | 'cloned'
  | ChangeName;

type ListenerData<T extends ListenableName> = T extends 'any'
  ? any
  : T extends ChangeName
    ? {
        eventName: 'before-change' | 'changed';
        methodName: T;
        [key: string]: any;
      }
    : {
        eventName: T;
        methodName: T extends 'initialized'
          ? 'constructor'
          : T extends 'before-change' | 'changed'
            ? ChangeName
            : T extends 'before-clone' | 'cloned' ? 'clone' : any;
      };

type URLOptions = {
  url: string;
  compression?: boolean;
  headers: {
    [key: string]: any;
  };
};

export interface Bitmap {
  data: Buffer;
  width: number;
  height: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
