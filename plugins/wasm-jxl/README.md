# `@jimp/wasm-jxl`

A format plugin for Jimp that adds support for JPEG XL images using [libjxl](https://github.com/libjxl/libjxl), as compiled to WebAssembly by [`@jsquash/jxl`](https://www.npmjs.com/package/@jsquash/jxl).

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-jxl
```

```ts
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import jxl from "@jimp/wasm-jxl";

// A custom jimp that supports JPEG XL
const Jimp = createJimp({
  formats: [...defaultFormats, jxl],
  plugins: defaultPlugins,
});

const image = await Jimp.read("photo.jxl");

await image.write("visually-lossless.jxl");
await image.write("lossless.jxl", { lossless: true });
await image.write("smaller.jxl", { quality: 75, effort: 9 });
```

### Supported images

- Reads bare codestreams and files in the JPEG XL container, including recompressed JPEGs
- Grayscale and RGB, with or without alpha, at any bit depth, decoded to 8-bit RGBA
- Other colour spaces, like Display P3 or an embedded ICC profile, are converted to sRGB when decoding
- Animations decode their first frame

HDR images (with the PQ or HLG transfer function) throw an error: the codec would convert them to 8-bit sRGB without tone mapping, so they'd come out much too dark.

Writing always uses 8-bit sRGB with alpha, as a bare codestream. Images in another colour space (like Display P3) are converted to sRGB first.

Lossless files keep every pixel exactly. But the codec decodes in floating point and converts to sRGB, which can put a few colour samples 1 off (alpha is exact). Other decoders, like `djxl` and browsers, read the exact pixels.

### Options

Encode options, passed to `write` or `getBuffer`:

| Option              | Default | Description                                                                                |
| ------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `quality`           | `90`    | 0 to 100. `90` (the `cjxl` default) is visually lossless, and `100` is lossless            |
| `lossless`          | `false` | Keep every pixel, including alpha, exactly. `quality` is ignored                           |
| `effort`            | `7`     | 1 (fastest) to 9 (slowest, smallest files)                                                 |
| `progressive`       | `false` | Let a partially downloaded file show at a lower quality first. Makes files a little larger |
| `lossyModular`      | `false` | Use the modular mode for lossy images too. Can be better for graphics, worse for photos    |
| `epf`               | `-1`    | Edge-preserving filter strength for lossy images, 0 (off) to 3. `-1` picks one             |
| `decodingSpeedTier` | `0`     | 0 to 4: higher makes lossy images faster to decode, and larger                             |
| `photonNoiseIso`    | `0`     | Add synthetic film grain to lossy images, like a photo taken at this ISO                   |

Numbers outside of their range are clamped. With lossy encoding alpha is compressed too, but fully transparent and opaque pixels stay that way at the default quality.

Decode options, passed to `Jimp.read` under the MIME type:

| Option              | Default | Description                                                         |
| ------------------- | ------- | ------------------------------------------------------------------- |
| `maxResolutionInMP` | `100`   | Reject images larger than this many megapixels before decoding them |

The codec has at most 2 GB of memory, which is enough for about 40 megapixels lossless, or 60 lossy. Larger images throw `Failed to decode the WxH JPEG XL image: the codec ran out of memory`.

```ts
const image = await Jimp.read("upload.jxl", {
  "image/jxl": { maxResolutionInMP: 24 },
});
```

## Bundler Setup

Vite 8 and webpack 5 need no config. Vite 7 and earlier do:

```js
// vite.config.js
export default {
  // @jsquash/jxl loads its wasm relative to its own files, which
  // pre-bundling breaks in the dev server
  optimizeDeps: { exclude: ["@jsquash/jxl"] },
  // Its multi-threaded encoder runs in a worker that `vite build` can't
  // bundle in the default iife format
  worker: { format: "es" },
};
```

See the [Vite section of the WASM plugins guide](https://jimp-dev.github.io/jimp/guides/webp/#vite).

In the browser, pages that are [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/API/Window/crossOriginIsolated) encode with the codec's multi-threaded build.

For runtimes where the codecs can't load their own wasm, like Cloudflare Workers, compile `@jsquash/jxl/codec/dec/jxl_dec.wasm` and `@jsquash/jxl/codec/enc/jxl_enc.wasm` and pass them in:

```ts
import decoder from "@jsquash/jxl/codec/dec/jxl_dec.wasm";
import encoder from "@jsquash/jxl/codec/enc/jxl_enc.wasm";

const Jimp = createJimp({
  formats: [...defaultFormats, () => jxl({ wasm: { decoder, encoder } })],
});
```
