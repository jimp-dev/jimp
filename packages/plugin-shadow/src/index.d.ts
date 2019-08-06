import { ImageCallback } from '@jimp/core/src';

interface Shadow {
  shadow(options?: {
    size?: number,
    opacity?: number,
    x?: number,
    y?: number
  },
  cb?: ImageCallback): this;
  shadow(cb?: ImageCallback): this;
}

export default function(): Shadow;
