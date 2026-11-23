<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-contain</h1>
  <p>Contain an image within a height and width.</p>
</div>

- [contain](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#contain)

`align` places the image along each axis. It takes `HorizontalAlign` and `VerticalAlign` flags, or `{ x, y }` fractions from 0 (left/top) to 1 (right/bottom), like CSS `object-position` percentages. An axis without a flag or fraction is centered, and fractions outside 0-1 are clamped:

```ts
import { Jimp, HorizontalAlign, VerticalAlign } from "jimp";

image.contain({
  w: 150,
  h: 100,
  align: HorizontalAlign.LEFT | VerticalAlign.TOP,
});

// object-fit: contain; object-position: center 20%;
image.contain({ w: 150, h: 100, align: { x: 0.5, y: 0.2 } });
```

Takes the same `mode` and `premultiplyAlpha` options as [resize](https://github.com/jimp-dev/jimp/tree/main/plugins/plugin-resize#keeping-the-colour-of-transparent-pixels). With `premultiplyAlpha: false` the image is copied into the letter box as it is, rather than drawn over the background, so transparent pixels keep their colour.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
