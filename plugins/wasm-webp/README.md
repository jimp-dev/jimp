# `@jimp/wasm-webp`

A format plugin for Jimp that adds support for WebP images.

> NOTE: Only works in esm environments.

## Usage

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
