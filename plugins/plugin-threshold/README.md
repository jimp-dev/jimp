<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-threshold</h1>
  <p>Lightens an image.</p>
</div>

This is useful as a simplified method for processing scanned drawings, signatures, etc

- [threshold](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#threshold)

## Usage

`threshold` greyscales the image (unless `autoGreyscale: false`), keeps
pixels whose value is below `max` and sets the rest to `replace` (default 255).
With `autoGreyscale: false` the image keeps its colors and each red, green and
blue channel is compared with `max` and replaced on its own.

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

- It uses Rec. 709 luminance. With `autoGreyscale: false` the image should
  already be grey (like OpenCV, which only runs Otsu on single-channel
  images), and it reads the red channel.
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
