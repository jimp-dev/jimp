import { ImageCallback } from '@jimp/core/src';

interface Rotate {
  rotate(deg: number, cb?: ImageCallback): this;
  rotate(deg: number, mode: string | boolean, cb?: ImageCallback): this;
}

export default function(): Rotate;
