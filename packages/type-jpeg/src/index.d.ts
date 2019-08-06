import { Jimp, DecoderFn, EncoderFn, ImageCallback } from '@jimp/core/src';

interface Jpeg<This = Jimp> {
  mime: { 'image/jpeg': string[] },

  constants: {
    'image/jpeg': string
  }

  encoders: {
    'image/jpeg': EncoderFn
  }

  decoders: {
    'image/jpeg': DecoderFn
  }

  class: {
    MIME_JPEG: 'image/jpeg';
    _quality: number;
    quality: (n: number, cb?: ImageCallback) => This;
  }
}

export default function(): Jpeg;
