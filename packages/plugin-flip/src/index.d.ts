import { ImageCallback } from '@jimp/core/src';

interface Flip {
  flip(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
  mirror(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
}

export default function(): Flip;