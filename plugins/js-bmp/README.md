<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
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

### 1, 4 and 8-bit BMPs

`bitPP: 1`, `4` and `8` write each pixel as an index into a palette of up to 2, 16 or 256 colours. Without a `palette` option:

- If the image has few enough colours, those colours are the palette, so nothing is lost.
- Otherwise a 1-bit BMP is black and white: pixels whose Rec. 709 luminance is over half are white.
- Otherwise a 4 or 8-bit BMP gets a palette of the image's most important colours, from [image-q](https://github.com/ibezkrovnyi/image-quantization)'s Wu quantizer. Each pixel is the nearest palette colour, without dithering.

To dither, reduce the image's colours before writing it. The image then has few enough colours to be written exactly:

```ts
// 1-bit, black and white
image.dither({ type: "floyd-steinberg" });
await image.write("out.bmp", { bitPP: 1 });

// 4-bit, 16 colours
image.quantize({ colors: 16 });
await image.write("out.bmp", { bitPP: 4 });
```

Pass `palette` to choose the colours yourself, as RGBA hex numbers or CSS colours. Each pixel is written as the nearest palette colour, and alpha is ignored:

```ts
await image.write("out.bmp", { bitPP: 1, palette: ["white", "black"] });
await image.write("out.bmp", {
  bitPP: 4,
  palette: [0x000000ff, 0xff0000ff, 0x00ff00ff, 0x0000ffff],
});
```
