import { IllformedPlugin, ImageCallback } from '@jimp/core/src';

interface Normalize extends IllformedPlugin {
  normalize(cb ?: ImageCallback): this;
}

export default function(): Normalize;
