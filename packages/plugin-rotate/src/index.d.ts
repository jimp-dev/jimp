import { IllformedPlugin, ImageCallback } from '@jimp/core/src';

interface Rotate extends IllformedPlugin {
  rotate(deg: number, cb?: ImageCallback): this;
  rotate(deg: number, mode: string | boolean, cb?: ImageCallback): this;
}

export default function(): Rotate;
