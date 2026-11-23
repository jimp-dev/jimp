<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/js-bmp</h1>
  <p>Default Jimp bmp encoder/decoder.</p>
</div>

BMPs are written as uncompressed 24-bit images by default. Pass `bitPP` to write 16-bit (5 bits per channel) or 32-bit BMPs instead:

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

await image.write("out.bmp", { bitPP: 16 });
const buffer = await image.getBuffer("image/bmp", { bitPP: 32 });
```

1, 4 and 8-bit BMPs, which need a palette, aren't supported yet ([#633](https://github.com/jimp-dev/jimp/issues/633)).
