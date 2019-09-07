import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Normalize extends IllformedPlugin {
  normalize(cb ?: ImageCallback): this;
}

export default function(): Normalize;
