import Jimp = require('jimp');

import { ITypePluginReturn, Image, jimpCB } from '../../types/src';

interface PNGImage extends Image {
    _deflateLevel: number,
    _deflateStrategy: number,
    _filterType: number,
    _colorType: number,
    deflateLevel(l: number, cb?: jimpCB): Jimp;
    deflateStrategy(s: number, cb?: jimpCB): Jimp;
    filterType(f: number, cb?: jimpCB): Jimp;
    colorType(s: number, cb?: jimpCB): Jimp;
}

interface TypePngRet extends ITypePluginReturn<PNGImage> {
  hasAlpha: {
    [key: string]: boolean;
  };
  class: PNGImage;
}

export default function(): TypePngRet;
