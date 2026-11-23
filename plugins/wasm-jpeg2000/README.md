# `@jimp/wasm-jpeg2000`

A format plugin for Jimp that adds support for JPEG 2000 images using [OpenJPEG](https://github.com/uclouvain/openjpeg), as compiled to WebAssembly by [`@cornerstonejs/codec-openjpeg`](https://www.npmjs.com/package/@cornerstonejs/codec-openjpeg).

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-jpeg2000
```

```ts
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import jpeg2000, { j2c, jpx } from "@jimp/wasm-jpeg2000";

// A custom jimp that supports JPEG 2000
const Jimp = createJimp({
  formats: [...defaultFormats, jpeg2000, j2c, jpx],
  plugins: defaultPlugins,
});

const image = await Jimp.read("passport-photo.jp2");
const thumbnail = await Jimp.read("huge-scan.jp2", {
  // Decode at 1/8th of the size, without decoding the full image
  "image/jp2": { reduce: 3 },
});

await image.write("lossless.jp2");
await image.write("smaller.jp2", { compressionRatio: 20 });
```

Each export adds one MIME type. Add the ones you need:

| Export     | MIME type   | Files      | Read | Write |
| ---------- | ----------- | ---------- | ---- | ----- |
| `jpeg2000` | `image/jp2` | .jp2       | ✓    | ✓     |
| `j2c`      | `image/j2c` | .j2c, .j2k | ✓    | ✓     |
| `jpx`      | `image/jpx` | .jpx, .jpf | ✓    |       |

`write` picks the format from the file extension, which isn't known for .j2c and .j2k, so use `getBuffer("image/j2c")` for codestreams.

### Supported images

- Grayscale and RGB, including YCbCr with 4:2:0 or 4:2:2 chroma subsampling
- 1 to 16 bits per sample, signed or unsigned, scaled to 8 bits
- An ICC profile in a JP2 or JPX is read into `image.iccProfile`

Images with alpha (2 or 4 components) or more components aren't supported, and throw an error.
Writing always uses 8-bit RGB without alpha: transparent pixels are composited onto `image.background`, and images in another colour space (like Display P3) are converted to sRGB.

### Options

Decode options, passed to `Jimp.read` under the MIME type:

| Option              | Default | Description                                                                          |
| ------------------- | ------- | ------------------------------------------------------------------------------------ |
| `reduce`            | `0`     | Decode at a lower resolution: each step halves the width and height                  |
| `layers`            | `0`     | Decode only the first quality layers, for a lower quality preview. `0` decodes all   |
| `maxResolutionInMP` | `100`   | Reject images larger than this many megapixels (after `reduce`) before decoding them |

Encode options, passed to `write` or `getBuffer`:

| Option             | Default | Description                                                                                |
| ------------------ | ------- | ------------------------------------------------------------------------------------------ |
| `compressionRatio` | `1`     | Target size as a ratio of the uncompressed RGB pixels, e.g. `20` for 20:1. `1` is lossless |
| `decompositions`   | `5`     | Wavelet levels, which decoders can `reduce` by. Limited to what the image's size allows    |

## Bundler Setup

The plugin loads its wasm with `new URL("./openjpegwasm.wasm", import.meta.url)`, which Vite and webpack 5 emit as an asset.

The codec's JavaScript only uses Node's `fs` and `path` in Node, but webpack 5 tries to bundle them, so turn them off:

```js
// webpack.config.js
export default {
  resolve: { fallback: { fs: false, path: false } },
};
```

Vite 7 and earlier pre-bundle the plugin away from its wasm in the dev server, which fails with `Failed to load the JPEG 2000 codec's wasm`.
Exclude it from pre-bundling, and include its CommonJS dependencies instead:

```js
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ["@jimp/wasm-jpeg2000"],
    include: [
      "@jimp/wasm-jpeg2000 > @cornerstonejs/codec-openjpeg/wasmjs",
      "@jimp/wasm-jpeg2000 > buffer",
    ],
  },
};
```

For bundlers that don't handle `new URL` (like esbuild), serve `@cornerstonejs/codec-openjpeg/dist/openjpegwasm.wasm` yourself, then compile it and pass it in:

```ts
const codec = await WebAssembly.compileStreaming(
  fetch("/assets/openjpegwasm.wasm"),
);
const Jimp = createJimp({
  formats: [...defaultFormats, () => jpeg2000({ wasm: { codec } })],
});
```

## License

The browser build includes OpenJPEG's wasm, which is under the BSD 2-Clause License. See [OPENJPEG-LICENSE](./OPENJPEG-LICENSE).
