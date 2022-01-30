import { ImageCallback } from '@jimp/core';

interface Sharpen {
  sharpen(factor: number, cb?: ImageCallback<this>): this;
}

export default function(): Sharpen;
