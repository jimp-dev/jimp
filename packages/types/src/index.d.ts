import jpeg from '@jimp/jpeg/src';
import png from '@jimp/png/src';
import bmp from '@jimp/bmp/src';
import tiff from '@jimp/tiff/src';
import gif from '@jimp/gif/src';

type JpegRet = ReturnType<typeof jpeg>
type PngRet = ReturnType<typeof png>
type BmpRet = ReturnType<typeof bmp>
type TiffRet = ReturnType<typeof tiff>
type GifRet = ReturnType<typeof gif>

type Types = JpegRet &
  PngRet &
  BmpRet &
  TiffRet &
  GifRet

export default function(): Types;
