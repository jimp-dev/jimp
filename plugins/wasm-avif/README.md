<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/wasm-avif</h1>
</div>

A format plugin for Jimp that adds support for AVIF images using the [libavif](https://github.com/AOMediaCodec/libavif).

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-avif
```

```ts
import { createJimp } from "@jimp/core";
import { defaultPlugins } from "jimp";
import avif from "@jimp/wasm-avif";

// A custom jimp that supports avif
const Jimp = createJimp({
  formats: [avif],
  plugins: defaultPlugins,
});
```

## Bundler Setup

Using this plugin in the browser with Vite 7 or earlier needs some extra config.
See the [Vite section of the WASM plugins guide](https://jimp-dev.github.io/jimp/guides/webp/#vite).
