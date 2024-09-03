# `@jimp/wasm-png`

A format plugin for Jimp that adds support for PNG images using the [rust crate](https://docs.rs/png/0.11.0/png/).
It also support optimizing the image using [oxipng](https://github.com/shssoichiro/oxipng).

> NOTE: Only works in esm environments.

## Usage

```ts
import { createJimp } from "@jimp/core";
import { defaultPlugins } from "jimp";
import png from "@jimp/wasm-png";

// A custom jimp that supports webp
const Jimp = createJimp({
  formats: [png],
  plugins: defaultPlugins,
});
```
