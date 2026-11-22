<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/js-png</h1>
  <p>Default Jimp png encoder/decoder.</p>
</div>

## Encoding options

Pass PNG options to `getBuffer`, `getBase64` or `write`:

```js
import { Jimp, JimpMime, PNGColorType, PNGFilterType } from "jimp";

const image = await Jimp.read("test.png");

const buffer = await image.getBuffer(JimpMime.png, {
  deflateLevel: 6,
  filterType: PNGFilterType.NONE,
  colorType: PNGColorType.COLOR,
});
```

- `deflateLevel` - the deflate level used when saving (default is 9)
- `deflateStrategy` - the deflate strategy used when saving (default is 3)
- `filterType` - a [`PNGFilterType`](https://jimp-dev.github.io/jimp/api/jimp/enumerations/pngfiltertype/) (default is `PNGFilterType.AUTO`)
- `colorType` - a [`PNGColorType`](https://jimp-dev.github.io/jimp/api/jimp/enumerations/pngcolortype/) (default is `PNGColorType.COLOR_ALPHA`)
