import { IllformedPlugin, ImageCallback } from '@jimp/core/src';

interface Dither extends IllformedPlugin {
  dither565(cb?: ImageCallback): this;
  dither16(cb?: ImageCallback): this;
}

export default function(): Dither;
