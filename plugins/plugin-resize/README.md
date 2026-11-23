<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-resize</h1>
  <p>Resize an image.</p>
</div>

Resizes the image to a set width and height. By default it uses a 2-pass bilinear algorithm; pass a `ResizeStrategy` as `mode` to pick another.

- [resize](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#resize)
- [scale](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#scale)
- [scaleToFit](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#scaletofit)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.

## Resize strategies

```ts
import { Jimp, ResizeStrategy } from "jimp";

const image = await Jimp.read("test/image.png");

image.resize({ w: 300, mode: ResizeStrategy.LANCZOS });
```

| Strategy           | Notes                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| `NEAREST_NEIGHBOR` | Fastest. Blocky, no smoothing.                                                                       |
| `BILINEAR`         | Smooth, but aliases when shrinking a lot.                                                            |
| `BICUBIC`          | Sharper than bilinear.                                                                               |
| `HERMITE`          | Cubic Hermite interpolation.                                                                         |
| `BEZIER`           | Cubic Bézier interpolation.                                                                          |
| `LANCZOS`          | Lanczos3. Sharpest, for photos. Same as Pillow `LANCZOS` and ImageMagick `-filter Lanczos`.          |
| `LANCZOS2`         | Lanczos with a smaller window: a little softer, less ringing.                                        |
| `MITCHELL`         | Mitchell–Netravali (B = C = 1/3). Smooth, almost no ringing. Same as ImageMagick `-filter Mitchell`. |

`LANCZOS`, `LANCZOS2` and `MITCHELL` are convolution filters. When shrinking, they widen to cover every source pixel, so fine detail doesn't alias. They premultiply alpha, so transparent pixels don't darken the edges of what they surround. Their results match ImageMagick's to within ±1. Like Pillow, they leave a side whose size doesn't change as it is. ImageMagick still filters it, which slightly blurs that side with `MITCHELL`. Pillow rounds to 8 bits between its row and column passes, so its results can differ more next to hard edges.

They take about as long as `BICUBIC`, or less (median of 7 runs on random RGBA data, Node 24, Apple M5):

| Resize                | `BICUBIC` | `LANCZOS` | `LANCZOS2` | `MITCHELL` |
| --------------------- | --------- | --------- | ---------- | ---------- |
| 2000×1500 → 500×375   | 286 ms    | 94 ms     | 69 ms      | 82 ms      |
| 2000×1500 → 1500×1125 | 155 ms    | 166 ms    | 160 ms     | 152 ms     |
| 500×375 → 2000×1500   | 419 ms    | 212 ms    | 193 ms     | 171 ms     |

## Keeping the colour of transparent pixels

By default resizing treats alpha as opacity: colour is weighted by alpha (premultiplied), so transparent pixels don't darken the edges of what they surround. Pixels that end up fully transparent have no colour left and come out as transparent black.

That's right for ordinary images, but not when alpha holds other data, like a game texture whose alpha is an emissive or self-illumination mask, or one that packs another channel into it. Pass `premultiplyAlpha: false` to resample every channel, alpha included, on its own:

```ts
image.resize({ w: 256, premultiplyAlpha: false });
```

The colour comes out as if the image were opaque and the alpha comes out exactly as it does by default, so transparent pixels keep their colour. Opaque images give the same result either way. `scale`, `scaleToFit`, `cover` and `contain` take the option too. `NEAREST_NEIGHBOR` copies pixels, so it keeps their colour either way. The name and meaning match `premultiplyAlpha` in the web platform's `createImageBitmap`.
