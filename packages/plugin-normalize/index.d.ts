import { ImageCallback } from '@jimp/core';

interface Normalize {
  normalize(cb ?: ImageCallback): this;
}

export default function(): Normalize;
