import { ImageCallback } from '@jimp/core/src';

interface Normalize {
  normalize(cb ?: ImageCallback): this;
}

export default function(): Normalize;
