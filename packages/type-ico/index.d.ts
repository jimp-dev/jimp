import { DecoderFn, EncoderFn, ImageCallback } from '@jimp/core';

interface IcoClass {
  _icoLayers: any[];
  icoLayers: (layers: any[], cb?: ImageCallback<this>) => this;
}

interface Ico {
  mime: { 'image/x-icon': string[] },

  constants: {
    MIME_ICO: 'image/x-icon';
  }

  encoders: {
    'image/x-icon': EncoderFn
  }

  decoders: {
    'image/x-icon': DecoderFn
  }

  class: IcoClass
}

export default function(): Ico;
