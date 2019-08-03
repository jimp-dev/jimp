import { ImageCallback } from 'jimp';
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
