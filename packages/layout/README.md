<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/layout</h1>
  <p>Lay out boxes, text and images like CSS flexbox, and draw them with Jimp.</p>
</div>

For Open Graph cards, social banners and badges. You describe the image as a tree of boxes, text and images, laid out in rows and columns, and `render` measures and wraps the text, positions everything and draws it. It's plain JavaScript with no browser, SVG or WebAssembly step, so it runs in Node.js, browsers, workers and Bun.

`@jimp/layout` isn't part of `jimp`. Install it alongside:

```sh
npm install jimp @jimp/layout
```

Write the image with JSX (no React needed) by setting `"jsx": "react-jsx"` and `"jsxImportSource": "@jimp/layout"` in your `tsconfig.json`:

```tsx
import { Jimp } from "jimp";
import { loadTTF } from "jimp/load-ttf";
import { Box, Text, render } from "@jimp/layout";

const regular = await loadTTF("Inter-Regular.otf");
const bold = await loadTTF("Inter-Bold.otf");

function Tag({ label }: { label: string }) {
  return (
    <Box padding={[10, 22]} radius={999} background="#ffd83a">
      <Text font={bold} fontSize={24} color="#1b1840">
        #{label}
      </Text>
    </Box>
  );
}

const card = await render(
  <Box
    padding={72}
    justify="space-between"
    background={{ type: "linear", angle: 135, stops: ["#1b1840", "#3a2d7a"] }}
    font={regular}
    color="white"
  >
    <Text fontSize={28}>jimp-dev.github.io</Text>
    <Text font={bold} fontSize={72} maxLines={2}>
      Generating Open Graph images with plain JavaScript
    </Text>
    <Box direction="row" wrap gap={12}>
      {["jimp", "layout"].map((label) => (
        <Tag key={label} label={label} />
      ))}
    </Box>
  </Box>,
  { width: 1200, height: 630, Jimp },
);

await card.write("og-card.png");
```

Or skip the compile step and write the tree as plain objects, with the same props:

```ts
const card = await render(
  {
    type: "box",
    padding: 72,
    font: regular,
    color: "white",
    children: [{ type: "text", text: "Hello", font: bold, fontSize: 72 }],
  },
  { width: 1200, height: 630, Jimp },
);
```

- [Open Graph images guide](https://jimp-dev.github.io/jimp/guides/og-images/)
- [render reference](https://jimp-dev.github.io/jimp/methods/render/)
