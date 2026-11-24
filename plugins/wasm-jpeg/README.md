<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/wasm-jpeg</h1>
</div>

A format plugin for Jimp that adds support for JPEG images using [mozjpeg](https://github.com/mozilla/mozjpeg).

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-jpeg
```

```ts
import { createJimp } from "@jimp/core";
import { defaultPlugins } from "jimp";
import jpeg from "@jimp/wasm-jpeg";

// A custom jimp that uses the wasm jpeg codec
const Jimp = createJimp({
  formats: [jpeg],
  plugins: defaultPlugins,
});
```

## Bundler Setup

Using this plugin in the browser with Vite 7 or earlier needs some extra config.
See the [Vite section of the WASM plugins guide](https://jimp-dev.github.io/jimp/guides/webp/#vite).
