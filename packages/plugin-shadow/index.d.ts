import { ImageCallback } from '@jimp/core';

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
