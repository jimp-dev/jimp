<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/js-png</h1>
  <p>Default Jimp png encoder/decoder.</p>
</div>

The PNG codec is [`@jimp/pngjs`](../../packages/pngjs), Jimp's fork of
[pngjs](https://github.com/pngjs/pngjs). It works in browsers without Node.js
polyfills.

## Reading

`Jimp.read` decodes every kind of PNG to 8 bits per channel. For an animated
PNG (APNG) it reads the image viewers without APNG support show. Use
`Jimp.readFrames` for every frame:

```js
const { frames, loop } = await Jimp.readFrames("animation.png");
```

Each frame is the whole image at that point of the animation, with its
`delay` in milliseconds. `loop` is how many times the animation repeats after
it first plays: 0 for forever, `null` to play once.

Pass `checkCRC: false` to read files with wrong chunk checksums:

```js
const image = await Jimp.read(buffer, { "image/png": { checkCRC: false } });
```

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
- `filterType` - a [`PNGFilterType`](https://jimp-dev.github.io/jimp/api/jimp/enumerations/pngfiltertype/) (default is `PNGFilterType.AUTO`, or `PNGFilterType.NONE` for palette and 1, 2 and 4-bit images)
- `colorType` - a [`PNGColorType`](https://jimp-dev.github.io/jimp/api/jimp/enumerations/pngcolortype/) (default is picked from the image, see below)
- `bitDepth` - 1, 2, 4, 8 or 16 (default is picked from the image)

### Default colour type

Without `colorType`, Jimp writes the smallest colour type that keeps every pixel exactly:

| Image                              | Colour type                                     |
| ---------------------------------- | ----------------------------------------------- |
| Every pixel opaque and grey        | `PNGColorType.GRAYSCALE`, at 1, 2, 4 or 8 bits  |
| 256 colours or fewer               | `PNGColorType.PALETTE`, at 1, 2, 4 or 8 bits    |
| Every pixel opaque                 | `PNGColorType.COLOR`                            |
| Every pixel grey, some transparent | `PNGColorType.GRAYSCALE_ALPHA`                  |
| Anything else                      | `PNGColorType.COLOR_ALPHA`                      |

A pixel is grey when its red, green and blue values are equal. Grey images are written with fewer than 8 bits when every level is one that bit depth stores exactly, e.g. only black and white for 1 bit. Pass `colorType` to always write a particular type.

### Removing the alpha channel

To write a PNG without an alpha channel (`image.rgba(false)` in Jimp v0), set `colorType` to `PNGColorType.COLOR`:

```js
const buffer = await image.getBuffer(JimpMime.png, {
  colorType: PNGColorType.COLOR,
});
```

Transparent pixels are blended onto a white background. `inputHasAlpha: false` still works but is deprecated. Use `colorType` instead.
