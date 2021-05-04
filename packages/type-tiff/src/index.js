import UTIF from 'utif';

const MIME_TYPE = 'image/tiff';

export default () => ({
  mime: { [MIME_TYPE]: ['tiff', 'tif'] },

  constants: {
    MIME_TIFF: MIME_TYPE
  },

  decoders: {
    [MIME_TYPE]: data => {
      const ifds = UTIF.decode(data);
      UTIF.decodeImages(data, ifds);

      const img = ifds.reduce(
        (img, pg) => {
          const rgba = UTIF.toRGBA8(pg);
          return {
            data: Buffer.concat([img.data, Buffer.from(rgba)]),
            width: img.width > pg.t256[0] ? img.width : pg.t256[0],
            height: img.height + pg.t257[0]
          };
        },
        {
          data: Buffer.alloc(0),
          width: 0,
          height: 0
        }
      );
      return img;
    }
  },

  encoders: {
    [MIME_TYPE]: image => {
      const tiff = UTIF.encodeImage(
        image.bitmap.data,
        image.bitmap.width,
        image.bitmap.height
      );

      return Buffer.from(tiff);
    }
  }
});
