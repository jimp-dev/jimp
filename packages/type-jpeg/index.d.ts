import { DecoderFn, EncoderFn, ImageCallback } from '@jimp/core';

interface JpegClass {
  MIME_JPEG: 'image/jpeg';
  _quality: number;
  quality: (n: number, cb?: ImageCallback<this>) => this;
}

interface Jpeg {
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

  class: JpegClass
}

export default function(): Jpeg;
