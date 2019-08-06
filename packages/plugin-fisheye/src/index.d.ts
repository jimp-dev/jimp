import { ImageCallback } from '@jimp/core';

interface Fisheye {
  fishEye(opts?: { r: number }, cb?: ImageCallback): this;
  fishEye(cb?: ImageCallback): this;
}

export default function(): Fisheye;
