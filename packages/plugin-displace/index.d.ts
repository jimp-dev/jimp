import { Jimp, ImageCallback, IllformedPlugin } from '@jimp/core';

interface Displace extends IllformedPlugin {
  displace(map: Jimp, offset: number, cb?: ImageCallback): this;
}

export default function(): Displace;
