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
- `colorType` - a [`PNGColorType`](https://jimp-dev.github.io/jimp/api/jimp/enumerations/pngcolortype/) (default is picked from the image, see below)

### Default colour type

Without `colorType`, Jimp writes the smallest colour type that keeps every pixel exactly:

| Image                              | Colour type                    |
| ---------------------------------- | ------------------------------ |
| Every pixel opaque and grey        | `PNGColorType.GRAYSCALE`       |
| Every pixel opaque                 | `PNGColorType.COLOR`           |
| Every pixel grey, some transparent | `PNGColorType.GRAYSCALE_ALPHA` |
| Anything else                      | `PNGColorType.COLOR_ALPHA`     |

A pixel is grey when its red, green and blue values are equal. Pass `colorType` to always write a particular type.

### Removing the alpha channel

To write a PNG without an alpha channel (`image.rgba(false)` in Jimp v0), set `colorType` to `PNGColorType.COLOR`:

```js
const buffer = await image.getBuffer(JimpMime.png, {
  colorType: PNGColorType.COLOR,
});
```

Transparent pixels are blended onto a white background. `inputHasAlpha: false` still works but is deprecated. Use `colorType` instead.
