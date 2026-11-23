<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
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
