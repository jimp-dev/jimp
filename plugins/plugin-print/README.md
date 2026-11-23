<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-print</h1>
  <p>Print text onto an image.</p>
</div>

Load a font with `loadFont`. The bundled fonts are named exports of `jimp/fonts`:

```js
import { Jimp, loadFont } from "jimp";
import { SANS_32_BLACK } from "jimp/fonts";

const image = new Jimp({ width: 256, height: 256, color: 0xffffffff });
const font = await loadFont(SANS_32_BLACK);

image.print({ font, x: 10, y: 10, text: "Hello world!" });
```

- [print](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#print)
- [loadFont](https://jimp-dev.github.io/jimp/api/jimp/functions/loadfont/)
