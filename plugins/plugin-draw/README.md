<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-draw</h1>
  <p>Draw lines, shapes, paths and gradients, and flood fill.</p>
</div>

Antialiased vector drawing, like a small canvas. The plugin is included in `jimp`.

- [drawLine](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#drawline)
- [drawRect](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#drawrect)
- [drawEllipse](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#drawellipse)
- [drawPolygon](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#drawpolygon)
- [drawPath](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#drawpath)
- [floodFill](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#floodfill)

```ts
import { Jimp } from "jimp";

const image = new Jimp({ width: 300, height: 200, color: "white" });

image
  .drawRect({ x: 20, y: 20, w: 120, h: 80, radius: 12, fill: "#a8dadc" })
  .drawEllipse({
    cx: 220,
    cy: 60,
    rx: 40,
    ry: 40,
    stroke: "#1d3557",
    strokeWidth: 4,
  })
  .drawLine({
    x1: 20,
    y1: 150,
    x2: 280,
    y2: 180,
    color: "#e63946",
    width: 6,
    cap: "round",
  })
  .drawPath({ path: "M 150 190 Q 200 110 250 190 Z", fill: "gold" });
```

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.

## How drawing works

- Coordinates are in pixels from the top left, and can be fractions. Pixel (x, y) covers the square from (x, y) to (x + 1, y + 1).
- Edges are antialiased by how much of each pixel the shape covers, so a rectangle on whole pixels has crisp edges.
- Shapes are drawn over the image with source-over compositing, the same as `composite`: a color's alpha, and how much of a pixel is covered, set how much of the pixel below shows through.
- Anything outside the image is clipped. Coordinates outside the image are fine and never throw.
- Strokes are centered on the outline, like SVG and canvas. A 1 pixel line on whole pixel coordinates covers half of two rows, so it looks blurry: add 0.5 to the coordinates to cover one row.
- Shapes with a `fill` and a `stroke` are filled first and stroked on top. With neither, they're filled black.
- Numbers that aren't finite (`NaN`, `Infinity`) and invalid colors throw.

## Colors and gradients

Anywhere a color goes (`color`, `fill`, `stroke`) you can use:

- a hex number, `0xRRGGBBAA`
- a CSS color, like `"red"`, `"#ff000080"` or `"rgba(255, 0, 0, 0.5)"`. It's converted to the image's colour space, and an invalid one throws, e.g. `Invalid color "notacolor"`.
- an object of pixel values from 0 to 255, `{ r, g, b, a }`. `a` defaults to 255.
- a gradient. Its coordinates are in image pixels, like canvas, not relative to the shape.

```ts
// Along the line from (x1, y1) to (x2, y2)
image.drawRect({
  x: 0,
  y: 0,
  w: 300,
  h: 200,
  fill: {
    type: "linear",
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 200,
    stops: [
      { offset: 0, color: "#a8dadc" },
      { offset: 1, color: "#f1faee" },
    ],
  },
});

// From the center (cx, cy) out to radius r
image.drawEllipse({
  cx: 150,
  cy: 100,
  rx: 50,
  ry: 50,
  fill: {
    type: "radial",
    cx: 150,
    cy: 100,
    r: 50,
    stops: [
      { offset: 0, color: "#ffd166" },
      { offset: 1, color: "rgba(255, 209, 102, 0)" },
    ],
  },
});
```

Stop offsets go from 0 to 1, and before the first stop and after the last the gradient is that stop's color. Two stops at the same offset make a hard edge. Colors are blended with premultiplied alpha, like CSS, so fading to transparent doesn't go grey.

## Shapes

| Method        | Options                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `drawLine`    | `x1`, `y1`, `x2`, `y2`, `color`, `width` (default 1), `cap`                                         |
| `drawRect`    | `x`, `y`, `w`, `h`, `radius` (a number or `{ topLeft, topRight, bottomRight, bottomLeft }`), `join` |
| `drawEllipse` | `cx`, `cy`, `rx`, `ry` (the same for a circle)                                                      |
| `drawPolygon` | `points` (`[x, y]` pairs or `{ x, y }` objects), `closed` (default true), `cap`, `join`, `fillRule` |
| `drawPath`    | `path` (SVG path data or a list of commands), `cap`, `join`, `fillRule`                             |

All but `drawLine` also take `fill`, `stroke` and `strokeWidth` (default 1). The stroke styles are the same as SVG's:

- `cap`, for the ends of open lines: `"butt"` (default) stops at the end point, `"round"` adds a half circle and `"square"` adds half the width.
- `join`, for corners: `"miter"` (default) is sharp, `"round"` is rounded and `"bevel"` is cut off. Miters longer than `miterLimit` (default 10) times the width are beveled.
- `fillRule`, for shapes that overlap themselves: `"nonzero"` (default) fills everything inside any outline unless an inner outline goes the other way round, and `"evenodd"` makes every nested outline a hole.

```ts
// A five-pointed star. With "evenodd" its middle is empty.
image.drawPolygon({
  points: [
    [50, 5],
    [79, 95],
    [2, 40],
    [98, 40],
    [21, 95],
  ],
  fill: "gold",
  stroke: "black",
  strokeWidth: 2,
  join: "round",
});

// A ring
image.drawPath({
  path: "M 10 50 A 40 40 0 1 0 90 50 A 40 40 0 1 0 10 50 Z M 30 50 A 20 20 0 1 0 70 50 A 20 20 0 1 0 30 50 Z",
  fill: "#2a9d8f",
  fillRule: "evenodd",
});
```

`drawPath` reads every SVG path command (`M L H V C S Q T A Z`, absolute and relative), or a list of commands like `{ type: "M", x, y }`, `{ type: "L", x, y }`, `{ type: "Q", x1, y1, x, y }`, `{ type: "C", x1, y1, x2, y2, x, y }` and `{ type: "Z" }`.

## Flood fill

`floodFill` fills the area around a point like a paint bucket: every pixel connected to it (up, down, left or right) whose color is within `tolerance` of its color.

```ts
image.floodFill({ x: 10, y: 10, color: "#ffcc00", tolerance: 0.1 });
```

`tolerance` goes from 0 (only the exact color, the default) to 1 (everything). It's the biggest difference in any channel, as a fraction of 255, with alpha premultiplied, so every fully transparent pixel matches every other. The fill is drawn over the pixels, so a semi-transparent color blends with them, and it can be a gradient. A point outside the image fills nothing.

## Drawing from other plugins

The rasterizer the methods use is exported, so other plugins can draw their own shapes, like the glyphs of a font:

| Export            | What it does                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| `parseSvgPath`    | Parses SVG path data into absolute `M`, `L`, `Q`, `C` and `Z` commands                                          |
| `flattenPath`     | Turns a path into polylines, with curves split into lines within `tolerance` pixels and an optional `transform` |
| `strokePolylines` | Turns polylines into the outlines of strokes, with `width`, `cap`, `join` and `miterLimit`                      |
| `rasterize`       | Works out each pixel's coverage of polylines, row by row, with a fill rule                                      |
| `fillPolylines`   | Fills polylines on an image with a color or gradient                                                            |
| `fillPath`        | Flattens and fills a path on an image                                                                           |
| `strokePath`      | Flattens and strokes a path on an image                                                                         |
| `drawShape`       | Fills and then strokes polylines, like the drawing methods, with `fill`, `stroke`, `strokeWidth` and `join`     |
| `PaintSchema`     | The zod schema of a color or gradient, to validate options that take one                                        |

Path commands use the same objects as opentype.js, so a glyph's `path.commands` can be drawn as they are. Transforms are `[a, b, c, d, e, f]` matrices, like CSS's `matrix()`.

```ts
import { fillPath } from "@jimp/plugin-draw";

const glyph = font.charToGlyph("g");
const scale = 48 / font.unitsPerEm;

// Font units have y pointing up, so flip them
fillPath(image, glyph.path.commands, "black", {
  transform: [scale, 0, 0, -scale, x, baseline],
});
```

To fill many shapes as one, like the glyphs of a line of text, flatten them all and fill them in one call: where they overlap, their edges blend correctly.

```ts
import { fillPolylines, flattenPath } from "@jimp/plugin-draw";

fillPolylines(
  image,
  glyphs.flatMap((glyph) =>
    flattenPath(glyph.commands, { transform: glyph.transform }),
  ),
  "black",
);
```

`rasterize` gives coverage instead of drawing it, to draw somewhere else, like a mask:

```ts
import { rasterize } from "@jimp/plugin-draw";

const mask = new Float32Array(width * height);

rasterize(
  polylines,
  { width, height, fillRule: "nonzero" },
  (y, x0, x1, coverage) => {
    mask.set(coverage.subarray(x0, x1), y * width + x0);
  },
);
```

Coverage is exact: each pixel's is the area of it inside the shape, worked out from the edges crossing it (the same method as FreeType and font-rs), not sampled.
