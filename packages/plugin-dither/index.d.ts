import { ImageCallback } from '@jimp/core';

interface Dither {
  dither565(cb?: ImageCallback): this;
  dither16(cb?: ImageCallback): this;
}

export default function(): Dither;
