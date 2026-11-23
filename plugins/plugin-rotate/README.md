<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-rotate</h1>
  <p>Rotate an image.</p>
</div>

Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.

- [rotate](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#rotate)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.

## Modes

```ts
import { Jimp, ResizeStrategy } from "jimp";

const image = await Jimp.read("test/image.png");

image.rotate(30); // nearest pixel, resized to fit
image.rotate({ deg: 30, mode: false }); // nearest pixel, same size
image.rotate({ deg: 30, mode: ResizeStrategy.BILINEAR }); // bilinear, resized to fit
```

| `mode`                                              | Size           | Sampling                            |
| --------------------------------------------------- | -------------- | ----------------------------------- |
| `true` (default), `ResizeStrategy.NEAREST_NEIGHBOR` | resized to fit | nearest pixel: fast, jagged edges   |
| `false`                                             | stays the same | nearest pixel                       |
| any other `ResizeStrategy`                          | resized to fit | that filter, with antialiased edges |

With a filter, each pixel of the result is mapped back onto the source and the source pixels around that point are weighted by the filter's kernel (`BILINEAR`, `BICUBIC`, `HERMITE`, `BEZIER`, `LANCZOS`, `LANCZOS2` or `MITCHELL`, see [plugin-resize](../plugin-resize/README.md)). RGB is premultiplied by alpha, so transparent pixels don't darken the edges. Outside the image is the `background` colour, transparent by default, so the edges of the image are antialiased against it. `BILINEAR` is the smoothest and fastest, `LANCZOS` the sharpest with a little ringing next to hard edges.

Rotations by a multiple of 90 degrees just move pixels and are exact, whatever the mode.

Filtered rotation isn't slower than the default (median of 7–9 runs, best of 3–5 processes, 30°, random RGBA, Node 24, Apple M5):

| Image     | default | `BILINEAR` | `BICUBIC` | `LANCZOS` | `LANCZOS2` | `MITCHELL` |
| --------- | ------- | ---------- | --------- | --------- | ---------- | ---------- |
| 640×480   | 45 ms   | 23 ms      | 33 ms     | 42 ms     | 27 ms      | 27 ms      |
| 2000×1500 | 401 ms  | 212 ms     | 275 ms    | 289 ms    | 262 ms     | 252 ms     |
