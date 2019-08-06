import { Jimp, ImageCallback } from '@jimp/core/src';

interface Displace {
  displace(map: Jimp, offset: number, cb?: ImageCallback): this;
}

export default function(): Displace;
