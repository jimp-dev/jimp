# `@jimp/wasm-svg`

A format plugin for Jimp that reads SVG images, rendering them to pixels with [resvg](https://github.com/linebender/resvg), as compiled to WebAssembly by [`@resvg/resvg-wasm`](https://www.npmjs.com/package/@resvg/resvg-wasm).

It only reads SVG. Writing an image as SVG would need a raster to vector conversion, so `getBuffer("image/svg+xml")` and `write("image.svg")` throw.

> NOTE: Only works in esm environments.

## Usage

```sh
npm install jimp @jimp/core @jimp/wasm-svg
```

```ts
import { createJimp } from "@jimp/core";
import { defaultFormats, defaultPlugins } from "jimp";
import svg from "@jimp/wasm-svg";

// A custom jimp that reads SVG
const Jimp = createJimp({
  formats: [...defaultFormats, svg],
  plugins: defaultPlugins,
});

// At the size the SVG sets
const logo = await Jimp.read("logo.svg");
// 512 pixels wide, keeping the aspect ratio
const icon = await Jimp.read("logo.svg", {
  "image/svg+xml": { width: 512 },
});

await icon.write("icon.png");
```

SVG data is recognised by its content, so buffers, files, URLs and data URLs all work: it starts with `<svg`, after an optional BOM, XML declaration, comments and doctype in the first 16 KB.

The image is in sRGB, like SVG colours, and has an alpha channel: what the SVG doesn't paint is transparent.

### Options

Decode options, passed to `Jimp.read` under the MIME type:

| Option              | Default          | Description                                                                                                       |
| ------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `width`             | the SVG's width  | Width in pixels. The height keeps the aspect ratio                                                                |
| `height`            | the SVG's height | Height in pixels. The width keeps the aspect ratio. With `width` too, the image fits inside both                  |
| `scale`             | `1`              | A multiple of the SVG's size, e.g. `2` for twice the width and height. Can't be combined with `width` or `height` |
| `background`        | transparent      | A CSS colour or `0xRRGGBBAA` number to fill the image with behind the SVG                                         |
| `fonts`             | `[]`             | Font files (TTF, OTF, TTC or WOFF2, as `Uint8Array`s or Buffers) to draw `<text>` with. See [Text](#text)         |
| `defaultFontFamily` |                  | The family for text without a `font-family`, and for the generic `serif`, `sans-serif` and `monospace` families   |
| `maxResolutionInMP` | `100`            | Reject SVGs that would render larger than this many megapixels, before allocating their pixels                    |
| `resolveImage`      |                  | Loads the http(s) images an SVG links to. Off by default, see [Security](#security)                               |

The SVG's size comes from its `width` and `height`, or its `viewBox` when it has neither. An SVG with neither is 100×100.

```ts
const image = await Jimp.read(svgBuffer, {
  "image/svg+xml": { scale: 2, background: "white" },
});
```

### Text

The plugin has no access to the system's fonts, in Node or in browsers, so **`<text>` isn't drawn unless you pass fonts**. SVGs made for display usually convert text to paths, so this only matters for SVGs that keep it as text.

```ts
import { readFile } from "node:fs/promises";

const image = await Jimp.read("chart.svg", {
  "image/svg+xml": {
    fonts: [await readFile("fonts/Inter-Regular.ttf")],
    defaultFontFamily: "Inter",
  },
});
```

Text in a family none of the fonts have falls back to a font that has its characters. WOFF (version 1) fonts aren't supported.

No font ships with the plugin: any one font would only match some SVGs' text, cover some scripts, and add hundreds of KB to every install.

## Security

Rendering an SVG you don't trust is safe by default:

- **Nothing is fetched or read from disk.** resvg's wasm has no network or file system access. `<image>` elements linking to URLs or files aren't drawn, and neither are external stylesheets (`@import`), `<use>` references to other files or fonts from `@font-face`. Images in `data:` URLs are drawn.
- **Large outputs are rejected before rendering.** `maxResolutionInMP` checks the size to render at before any pixels are allocated, so an SVG with `width="100000"` fails with `SVG dimensions 100000x100000 exceed the maximum resolution of 100 megapixels`. Use `width`, `height` or `scale` to render it smaller.
- **Parsing is bounded.** resvg rejects entity expansion loops ("billion laughs"), external entities and SVGs that expand to too many elements through `<use>`.

What it doesn't limit is the time a complex SVG (deep filters, huge paths) takes to render, or the size of images embedded as `data:` URLs, which are decoded at full size. To bound those, render untrusted SVGs in a worker you can terminate. WebAssembly memory also never shrinks: after rendering a 100 megapixel SVG, the process keeps about 1.2 GB, so lower `maxResolutionInMP` if that matters.

### Loading linked images

`resolveImage` is called with each http(s) URL of an `<image>` element. Return the image's bytes (PNG, JPEG or GIF) to draw it, or nothing to skip it:

```ts
const image = await Jimp.read(svgBuffer, {
  "image/svg+xml": {
    resolveImage: async (href) => {
      // Without this check, an SVG can make your server request any URL,
      // including ones on your internal network
      if (!href.startsWith("https://cdn.example.com/")) return;

      const response = await fetch(href);
      return new Uint8Array(await response.arrayBuffer());
    },
  },
});
```

Only use it for SVGs you trust, or check each URL first as above. Linked files on disk aren't passed to it.

## Bundler Setup

The plugin loads its wasm (2.5 MB, 0.95 MB gzipped) with `new URL("./resvg.wasm", import.meta.url)` the first time it renders, which Vite and webpack 5 emit as an asset without any configuration.

Vite 7 and earlier pre-bundle the plugin away from its wasm in the dev server, which fails with `Failed to load resvg's wasm`.
Exclude it from pre-bundling, and include its CommonJS dependency instead:

```js
// vite.config.js
export default {
  optimizeDeps: {
    exclude: ["@jimp/wasm-svg"],
    include: ["@jimp/wasm-svg > buffer"],
  },
};
```

For bundlers that don't handle `new URL` (like esbuild), serve `@resvg/resvg-wasm/index_bg.wasm` yourself, then compile it and pass it in:

```ts
const resvg = await WebAssembly.compileStreaming(fetch("/assets/resvg.wasm"));
const Jimp = createJimp({
  formats: [...defaultFormats, () => svg({ wasm: { resvg } })],
});
```

resvg is initialized once per page or process, so pass the same module to every instance. If your app already initializes `@resvg/resvg-wasm` itself, the plugin uses that instance.

## License

This package is MIT licensed. It uses `@resvg/resvg-wasm`, which is under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/), and its browser build includes resvg's wasm, unchanged. See [RESVG-LICENSE](./RESVG-LICENSE). Its source is at [github.com/thx/resvg-js](https://github.com/thx/resvg-js) and [github.com/linebender/resvg](https://github.com/linebender/resvg).
