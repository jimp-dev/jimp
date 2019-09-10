import dither from '@jimp/plugin-dither';
import resize from '@jimp/plugin-resize';
import blit from '@jimp/plugin-blit';
import rotate from '@jimp/plugin-rotate';
import color from '@jimp/plugin-color';
import print from '@jimp/plugin-print';
import blur from '@jimp/plugin-blur';
import crop from '@jimp/plugin-crop';
import normalize from '@jimp/plugin-normalize';
import invert from '@jimp/plugin-invert';
import gaussian from '@jimp/plugin-gaussian';
import flip from '@jimp/plugin-flip';
import mask from '@jimp/plugin-mask';
import scale from '@jimp/plugin-scale';
import displace from '@jimp/plugin-displace';
import contain from '@jimp/plugin-contain';
import cover from '@jimp/plugin-cover';

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

/**
 * This is made union and not intersection to avoid issues with
 * `IllformedPlugin` and `WellFormedPlugin` when using typings with Jimp
 * generic
 *
 * In reality, this should be an intersection but our type data isn't
 * clever enough to figure out what's a class and what's not/etc
 */
type Plugins = DitherRet |
  ResizeRet |
  BlitRet |
  RotateRet |
  ColorRet |
  PrintRet |
  BlurRet |
  CropRet |
  NormalizeRet |
  InvertRet |
  GaussianRet |
  FlipRet |
  MaskRet |
  ScaleRet |
  DisplaceRet |
  ContainRet |
  CoverRet;

export default function(): Plugins;
