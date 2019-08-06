import dither from '@jimp/plugin-dither/src';
import resize from '@jimp/plugin-resize/src';
import blit from '@jimp/plugin-blit/src';
import rotate from '@jimp/plugin-rotate/src';
import color from '@jimp/plugin-color/src';
import print from '@jimp/plugin-print/src';
import blur from '@jimp/plugin-blur/src';
import crop from '@jimp/plugin-crop/src';
import normalize from '@jimp/plugin-normalize/src';
import invert from '@jimp/plugin-invert/src';
import gaussian from '@jimp/plugin-gaussian/src';
import flip from '@jimp/plugin-flip/src';
import mask from '@jimp/plugin-mask/src';
import scale from '@jimp/plugin-scale/src';
import displace from '@jimp/plugin-displace/src';
import contain from '@jimp/plugin-contain/src';
import cover from '@jimp/plugin-cover/src';

type DitherRet = ReturnType<typeof dither>
type ResizeRet = ReturnType<typeof resize>
type BlitRet = ReturnType<typeof blit>
type RotateRet = ReturnType<typeof rotate>
type ColorRet = ReturnType<typeof color>
type PrintRet = ReturnType<typeof print>
type BlurRet = ReturnType<typeof blur>
type CropRet = ReturnType<typeof crop>
type NormalizeRet = ReturnType<typeof normalize>
type InvertRet = ReturnType<typeof invert>
type GaussianRet = ReturnType<typeof gaussian>
type FlipRet = ReturnType<typeof flip>
type MaskRet = ReturnType<typeof mask>
type ScaleRet = ReturnType<typeof scale>
type DisplaceRet = ReturnType<typeof displace>
type ContainRet = ReturnType<typeof contain>
type CoverRet = ReturnType<typeof cover>

type Plugins = DitherRet &
  ResizeRet &
  BlitRet &
  RotateRet &
  ColorRet &
  PrintRet &
  BlurRet &
  CropRet &
  NormalizeRet &
  InvertRet &
  GaussianRet &
  FlipRet &
  MaskRet &
  ScaleRet &
  DisplaceRet &
  ContainRet &
  CoverRet;

export default function(jimpEvChange: any): Plugins;
