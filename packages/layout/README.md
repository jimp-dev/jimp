<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/layout</h1>
  <p>Lay out boxes, text and images like CSS flexbox, and draw them with Jimp.</p>
</div>

For Open Graph cards, social banners and badges. You describe the image as a tree of boxes, text and images, laid out in rows and columns, and `render` measures and wraps the text, positions everything and draws it. It's plain JavaScript with no browser, SVG or WebAssembly step, so it runs in Node.js, browsers, workers, Deno and Bun.

`@jimp/layout` isn't part of `jimp`. Install it alongside:

```sh
npm install jimp @jimp/layout
```

```ts
import { Jimp } from "jimp";
import { loadTTF } from "jimp/load-ttf";
import { render } from "@jimp/layout";

const regular = await loadTTF("Inter-Regular.otf");
const bold = await loadTTF("Inter-Bold.otf");

const card = await render(
  {
    type: "box",
    padding: 72,
    justify: "space-between",
    background: { type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] },
    font: regular,
    color: "white",
    children: [
      { type: "text", text: "jimp-dev.github.io", fontSize: 28 },
      {
        type: "text",
        text: "Generating Open Graph images with plain JavaScript",
        font: bold,
        fontSize: 72,
        maxLines: 2,
      },
      {
        type: "box",
        direction: "row",
        gap: 12,
        children: ["jimp", "layout"].map((tag) => ({
          type: "box",
          padding: [10, 22],
          radius: 999,
          background: "#ffd83a",
          shadow: { y: 6, blur: 12, color: "rgba(0, 0, 0, 0.35)" },
          children: [
            { type: "text", text: `#${tag}`, fontSize: 24, color: "#1b1840" },
          ],
        })),
      },
    ],
  },
  { width: 1200, height: 630, Jimp },
);

await card.write("og-card.png");
```

Or write the tree with JSX: set `"jsxImportSource": "@jimp/layout"` and use the `Box`, `Text` and `Image` components.

- [Open Graph images guide](https://jimp-dev.github.io/jimp/guides/og-images/)
- [render reference](https://jimp-dev.github.io/jimp/methods/render/)
