<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>Jimp</h1>
  <p>JavaScript Image Manipulation Program</p>
</div>

An image processing library for Node and the browser written entirely in JavaScript, with zero native dependencies.

[Read the full docs.](https://jimp-dev.github.io/jimp/)

## Installation

```bash
npm install jimp
```

## Usage

`jimp` uses named exports. ESM:

```js
import { Jimp } from "jimp";

// open a file called "test.png"
const image = await Jimp.read("test.png");

image.resize({ w: 256, h: 256 }); // resize

await image.write("test-small.jpg"); // save
```

CommonJS:

```js
const { Jimp } = require("jimp");

async function main() {
  const image = await Jimp.read("test.png");

  image.resize({ w: 256 });

  await image.write("test-small.png");
}

main();
```

Most methods take an options object rather than positional arguments:

```js
image.crop({ x: 10, y: 10, w: 100, h: 100 });
image.flip({ horizontal: true, vertical: false });
```

Encoding options are passed when you get or write the image:

```js
import { Jimp, JimpMime } from "jimp";

const buffer = await image.getBuffer(JimpMime.jpeg, { quality: 80 });
await image.write("test.jpg", { quality: 80 });
```

### Printing text

Load a font with `loadFont`. The bundled fonts are named exports of `jimp/fonts`:

```js
import { Jimp, loadFont } from "jimp";
import { SANS_32_BLACK } from "jimp/fonts";

const image = new Jimp({ width: 256, height: 256, color: 0xffffffff });
const font = await loadFont(SANS_32_BLACK);

image.print({ font, x: 10, y: 10, text: "Hello world!" });
```

## Supported formats

`jimp` includes these format plugins:

- [`@jimp/js-bmp`](https://www.npmjs.com/package/@jimp/js-bmp)
- [`@jimp/js-gif`](https://www.npmjs.com/package/@jimp/js-gif)
- [`@jimp/js-jpeg`](https://www.npmjs.com/package/@jimp/js-jpeg)
- [`@jimp/js-png`](https://www.npmjs.com/package/@jimp/js-png)
- [`@jimp/js-tiff`](https://www.npmjs.com/package/@jimp/js-tiff)

The optional WASM plugins add AVIF and WebP, or swap in WASM codecs for JPEG and PNG. They aren't dependencies of `jimp` and only work in ESM. Install the ones you need and add them to a [custom Jimp](https://jimp-dev.github.io/jimp/guides/custom-jimp/), as shown in the [WASM plugins guide](https://jimp-dev.github.io/jimp/guides/webp/).

- [`@jimp/wasm-avif`](https://www.npmjs.com/package/@jimp/wasm-avif)
- [`@jimp/wasm-jpeg`](https://www.npmjs.com/package/@jimp/wasm-jpeg)
- [`@jimp/wasm-png`](https://www.npmjs.com/package/@jimp/wasm-png)
- [`@jimp/wasm-webp`](https://www.npmjs.com/package/@jimp/wasm-webp)

## Migrating from v0

v1 replaced the default export, positional arguments, `Jimp.FONT_*` and `Jimp.MIME_*`.
See the [migration guide](https://jimp-dev.github.io/jimp/guides/migrate-to-v1/).
