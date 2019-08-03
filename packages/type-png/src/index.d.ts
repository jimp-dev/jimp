import Jimp, {ImageCallback, ITypePluginReturn, Image} from 'jimp';

interface PNGImage extends Image {
    _deflateLevel: number,
    _deflateStrategy: number,
    _filterType: number,
    _colorType: number,
    deflateLevel(l: number, cb?: ImageCallback): Jimp;
    deflateStrategy(s: number, cb?: ImageCallback): Jimp;
    filterType(f: number, cb?: ImageCallback): Jimp;
    colorType(s: number, cb?: ImageCallback): Jimp;
}

interface TypePngRet extends ITypePluginReturn<PNGImage> {
  hasAlpha: {
    [key: string]: boolean;
  };
  class: PNGImage;
}

export default function(): TypePngRet;
