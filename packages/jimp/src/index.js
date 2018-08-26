import configure from '@jimp/custom';

import jpeg from '@jimp/jpeg';
import png from '@jimp/png';
import bmp from '@jimp/bmp';
import tiff from '@jimp/tiff';
import gif from '@jimp/gif';

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

export default configure({
  types: [jpeg, png, bmp, tiff, gif],
  plugins: [
    dither,
    resize,
    blit,
    rotate,
    color,
    print,
    blur,
    crop,
    normalize,
    invert,
    gaussian,
    mask,
    flip,
    scale,
    displace,
    contain,
    cover
  ]
});
