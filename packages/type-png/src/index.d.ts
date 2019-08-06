import { Jimp, DecoderFn, EncoderFn, ImageCallback } from '@jimp/core';

interface PNG<This = Jimp> {

  mime: { 'image/png': string[] },

  hasAlpha: { 'image/png': true },

  decoders: {
    'image/png': DecoderFn
  }
  encoders: {
    'image/png': EncoderFn
  }

  class: {
    _deflateLevel: number,
    _deflateStrategy: number,
    _filterType: number,
    _colorType: number,
    deflateLevel(l: number, cb?: ImageCallback): This;
    deflateStrategy(s: number, cb?: ImageCallback): This;
    filterType(f: number, cb?: ImageCallback): This;
    colorType(s: number, cb?: ImageCallback): This;
  }
  constants: {
    MIME_PNG: 'image/png';
    // PNG filter types
    PNG_FILTER_AUTO: -1;
    PNG_FILTER_NONE: 0;
    PNG_FILTER_SUB: 1;
    PNG_FILTER_UP: 2;
    PNG_FILTER_AVERAGE: 3;
    PNG_FILTER_PATH: 4;
  }
}

export default function(): PNG;
