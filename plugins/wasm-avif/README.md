# `@jimp/wasm-avif`

A format plugin for Jimp that adds support for AVIF images using the [libavif](https://github.com/AOMediaCodec/libavif).

> NOTE: Only works in esm environments.

## Usage

```ts
import { createJimp } from "@jimp/core";
import { defaultPlugins } from "jimp";
import avif from "@jimp/wasm-avif";

// A custom jimp that supports webp
const Jimp = createJimp({
  formats: [avif],
  plugins: defaultPlugins,
});
```
