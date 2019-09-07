import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Flip extends IllformedPlugin {
  flip(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
  mirror(horizontal: boolean, vertical: boolean, cb?: ImageCallback): this;
}

export default function(): Flip;
