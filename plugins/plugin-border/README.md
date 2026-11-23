<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-border</h1>
  <p>Rounded corners, borders and box shadows.</p>
</div>

These work like CSS `border-radius`, `border` and `box-shadow`. The plugin is included in `jimp`.

- [roundCorners](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#roundcorners)
- [border](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#border)
- [boxShadow](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#boxshadow)

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

// Make the corners transparent. The image keeps its size.
image.roundCorners({ radius: 20 });

// Or give each corner its own radius. Corners left out stay square.
image.roundCorners({ radius: { topLeft: 40, bottomRight: 40 } });
```

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.

## Borders

`border` draws the border outside the image: the image grows by `width` on every side, and none of it is covered. `color` is a hex number (`0xRRGGBBAA`) or a CSS color, and defaults to black.

To get a rounded border, pass `radius` to `border` rather than calling `roundCorners` first. `radius` is the border's outer radius. The image's corners are rounded to fit inside it, with a radius `width` smaller, like CSS.

```ts
image.border({ width: 10, color: "#ffffff", radius: 30 });
```

The border is only drawn around the image, so transparent parts of the image stay transparent.

## Box shadows

`boxShadow` draws a shadow under the image. The image grows to fit the shadow, and the original image is drawn over it unchanged.

| Option   | Default      | Description                                                                  |
| -------- | ------------ | ---------------------------------------------------------------------------- |
| `x`      | `0`          | Moves the shadow right. Negative moves it left.                              |
| `y`      | `4`          | Moves the shadow down. Negative moves it up.                                 |
| `blur`   | `12`         | The blur radius, like CSS. The shadow fades out over about this many pixels. |
| `spread` | `0`          | Grows the shadow on every side. Negative shrinks it.                         |
| `color`  | `0x00000080` | Hex number or CSS color. Its alpha is the shadow's opacity.                  |
| `radius` | `0`          | The shadow's corner radius. Use the radius you rounded the image with.       |

```ts
image
  .roundCorners({ radius: 20 })
  .boxShadow({ y: 8, blur: 16, radius: 20, color: "rgba(0, 0, 0, 0.5)" });
```

Like CSS, the shadow has the shape of the image's box, not of its opaque pixels. Unlike CSS, it's drawn under the whole box, so it shows through transparent parts of the image. For a shadow shaped like the image's opaque pixels, use [`@jimp/plugin-shadow`](../plugin-shadow).
