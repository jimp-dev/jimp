import { ImageCallback } from '@jimp/core';

interface Invert {
  invert(cb?: ImageCallback): this;
}

export default function(): Invert;
