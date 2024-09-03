# `@jimp/wasm-jpeg`

A format plugin for Jimp that adds support for JPEG images using [mozjpeg](https://github.com/mozilla/mozjpeg).

> NOTE: Only works in esm environments.

## Usage

```ts
import { createJimp } from "@jimp/core";
import { defaultPlugins } from "jimp";
import jpeg from "@jimp/wasm-jpeg";

// A custom jimp that supports webp
const Jimp = createJimp({
  formats: [jpeg],
  plugins: defaultPlugins,
});
```
