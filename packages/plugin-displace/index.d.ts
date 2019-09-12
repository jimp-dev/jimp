import { Jimp, ImageCallback, IllformedPlugin } from '@jimp/core';

interface Displace {
  displace(map: Jimp, offset: number, cb?: ImageCallback): this;
}

export default function(): Displace;
