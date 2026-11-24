<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-shadow</h1>
  <p>Creates a shadow on an image.</p>
</div>

This plugin isn't included in `jimp`. Add it to a [custom Jimp](https://jimp-dev.github.io/jimp/guides/custom-jimp/):

```sh
npm install jimp @jimp/core @jimp/plugin-shadow
```

```ts
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import * as shadow from "@jimp/plugin-shadow";

const Jimp = createJimp({
  formats: defaultFormats,
  plugins: [...defaultPlugins, shadow.methods],
});

const image = await Jimp.read("test/image.png");

image.shadow({ opacity: 0.7, size: 1.1, blur: 5, x: -25, y: 25 });
```

The shadow has the shape of the image's opaque pixels, and the image keeps its size, so a shadow that falls past its edges is cut off. For a CSS-style box shadow that grows the image to fit, use `boxShadow` from [`@jimp/plugin-border`](../plugin-border), which is included in `jimp`.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
