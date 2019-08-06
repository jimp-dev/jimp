import { DecoderFn } from '@jimp/core/src';

interface Gif {
  mime: {
    'image/gif': string[]
  }

  constants: {
    MIME_GIF: 'image/gif';
  }

  decoders: {
    'image/gif': DecoderFn
  }
}

export default function(): Gif;
