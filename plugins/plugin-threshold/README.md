<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-threshold</h1>
  <p>Lightens an image.</p>
</div>

This is useful as a simplified method for processing scanned drawings, signatures, etc

- [threshold](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#threshold)

## Usage

`threshold` greyscales the image (unless `autoGreyscale: false`), keeps
pixels whose value is below `max` and sets the rest to `replace` (default 255).

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("scan.png");

image.threshold({ max: 150 });
```

### Choosing `max` automatically

Pass `max: "otsu"` to pick `max` from the image with
[Otsu's method](https://en.wikipedia.org/wiki/Otsu%27s_method), which finds
the split between dark and light pixels that best separates the two groups.

```ts
image.threshold({ max: "otsu" });
```

To see or reuse the level it picks, call `otsuThreshold`. It takes the same
`autoGreyscale` option and returns a number you can pass as `max`:

```ts
import { Jimp, otsuThreshold } from "jimp";

const level = otsuThreshold(image);

image.threshold({ max: level });
```

How the level is computed:

- It uses the same values `threshold` compares: Rec. 709 luminance, or the
  red channel when `autoGreyscale` is `false`.
- Each pixel counts in proportion to its alpha. Fully transparent pixels are
  ignored, and a pixel at alpha 128 counts about half as much as an opaque
  one.
- The level is one more than the value scikit-image's `threshold_otsu` and
  OpenCV's `THRESH_OTSU` report, because those return the highest dark value
  while `threshold` keeps pixels strictly below `max`.
- If there aren't two different values to separate (a uniform image, or one
  with no visible pixels), it returns 255, so `threshold` keeps every pixel
  below 255 unchanged.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
