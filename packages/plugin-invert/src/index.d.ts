import { IllformedPlugin, ImageCallback } from '@jimp/core/src';

interface Invert extends IllformedPlugin {
  invert(cb?: ImageCallback): this;
}

export default function(): Invert;
