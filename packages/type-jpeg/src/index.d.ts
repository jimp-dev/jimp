import Jimp = require('jimp');
import { ITypePluginReturn, Image} from '../../types/src';


interface JpegImage extends Image {
    _quality: number;
    quality: (n: number, cb?: (err: Error, jimp: Jimp) => void) => Jimp;
}

interface TypeJpegRet extends ITypePluginReturn<JpegImage> {
  class: JpegImage;
}

export default function(): TypeJpegRet;
