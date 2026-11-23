<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-rotate</h1>
  <p>Rotate an image.</p>
</div>

Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.

The rotation takes the nearest pixel, which keeps hard edges. Pass a `ResizeStrategy` as `mode` to interpolate the pixels instead, for smooth edges and lines:

```ts
import { Jimp, ResizeStrategy } from "jimp";

const image = await Jimp.read("test/image.png");

image.rotate({ deg: 30, mode: ResizeStrategy.BILINEAR });
```

- [rotate](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#rotate)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
