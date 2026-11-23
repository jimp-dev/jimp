<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/js-ico</h1>
  <p>Default Jimp ico encoder/decoder.</p>
</div>

Reads ICO and CUR files, and writes ICO files (`image/x-icon`, also available as `image/vnd.microsoft.icon`). It's one of the default formats of `jimp`.

## Reading

An ICO file holds several images, usually the same icon at different sizes. Each image is a PNG, or a BMP with a 1 bit transparency mask. Jimp decodes the largest image, and of images the same size, the one with the most bits per pixel.

Pick another image by its position in the file with `index`, or by `size`: the smallest image whose longest side is at least that big, or the largest image if they're all smaller.

```ts
import { Jimp } from "jimp";

const largest = await Jimp.read("favicon.ico");
const small = await Jimp.read("favicon.ico", { "image/x-icon": { size: 16 } });
const first = await Jimp.read("favicon.ico", { "image/x-icon": { index: 0 } });
```

`readIcoEntries` lists the images, to read all of them:

```ts
import { Jimp } from "jimp";
import { readIcoEntries } from "@jimp/js-ico";
import { readFile } from "node:fs/promises";

const buffer = await readFile("favicon.ico");

// [{ index: 0, width: 16, height: 16, bitDepth: 32, format: "bmp" }, ...]
const entries = readIcoEntries(buffer);
const images = await Promise.all(
  entries.map(({ index }) => Jimp.read(buffer, { "image/x-icon": { index } })),
);
```

## Writing

Jimp writes the image as a PNG inside the ICO. Images larger than 256x256, the largest size an ICO can describe, are scaled down to fit. Pass `sizes` to write an image for each size instead, each scaled to fit in a square of that size:

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("logo.png");

await image.write("favicon.ico", { sizes: [16, 32, 48, 256] });
const buffer = await image.getBuffer("image/x-icon");
```

The aspect ratio is kept, so make the image square first (e.g. with `cover` or `contain`) to get square icons.

## Using it with a custom Jimp

```ts
import { createJimp } from "@jimp/core";
import png from "@jimp/js-png";
import ico from "@jimp/js-ico";

const Jimp = createJimp({ formats: [png, ico] });
```
