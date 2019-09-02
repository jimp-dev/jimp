import { IllformedPlugin, ImageCallback } from '@jimp/core';

interface Scale extends IllformedPlugin {
  scale(f: number, cb?: ImageCallback): this;
  scale(f: number, mode?: string, cb?: ImageCallback): this;
  scaleToFit(w: number, h: number, cb?: ImageCallback): this;
  scaleToFit(w: number, h: number, mode?: string, cb?: ImageCallback): this;
}

export default function(): Scale;
