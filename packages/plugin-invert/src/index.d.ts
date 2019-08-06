import { ImageCallback } from '@jimp/core/src';

interface Invert {
  invert(cb?: ImageCallback): this;
}

export default function(): Invert;
