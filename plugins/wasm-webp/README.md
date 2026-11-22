# `@jimp/wasm-webp`

A format plugin for Jimp that adds support for WebP images.

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-webp
```

```ts
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import webp from "@jimp/wasm-webp";

// A custom jimp that supports webp
const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});
```

## Bundler Setup

Using this plugin in the browser with Vite 7 or earlier needs some extra config.
See the [Vite section of the WASM plugins guide](https://jimp-dev.github.io/jimp/guides/webp/#vite).
