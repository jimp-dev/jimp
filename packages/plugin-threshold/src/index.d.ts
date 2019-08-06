import { ImageCallback } from '@jimp/core/src';

interface Threshold {
  threshold(opts: {
    max: number,
    replace?: number,
    autoGreyscale?: boolean
  }, cb?: ImageCallback): this;
}

export default function (): Threshold;
