import { ImageCallback } from '@jimp/core';

interface Sharpen {
  sharpen(mix: number, cb?: ImageCallback<this>): this;
}

export default function(): Sharpen;
