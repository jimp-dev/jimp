<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-rotate</h1>
  <p>Rotate, skew and transform an image.</p>
</div>

Rotates the image counter-clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.

The rotation takes the nearest pixel, which keeps hard edges. Pass a `ResizeStrategy` as `mode` to interpolate the pixels instead, for smooth edges and lines:

```ts
import { Jimp, ResizeStrategy } from "jimp";

const image = await Jimp.read("test/image.png");

image.rotate({ deg: 30, mode: ResizeStrategy.BILINEAR });
```

## Skew

`skew` slants the image by a number of degrees along the x and/or y axis, like CSS's `skew(x, y)`. A positive `x` slants vertical lines like `\`, and a positive `y` moves the right side of the image down.

```ts
image.skew({ x: 20 });
image.skew({ x: 10, y: -15, mode: ResizeStrategy.BILINEAR });
```

## Affine transforms

`affine` applies any 2D affine transform: a mix of scaling, rotating, skewing, flipping and translating. The matrix is `[a, b, c, d, e, f]`, in the same order as CSS's `matrix(a, b, c, d, e, f)`:

```
x' = a * x + c * y + e
y' = b * x + d * y + f
```

Like CSS, the origin is the centre of the image and y points down. The matrix has to be invertible (`a * d - b * c` can't be 0), otherwise it throws.

```ts
// skew along the x axis, like CSS's matrix(1, 0, 0.5, 1, 0, 0)
image.affine({ matrix: [1, 0, 0.5, 1, 0, 0] });
// squash vertically and flip horizontally, with smooth edges
image.affine({ matrix: [-1, 0, 0, 0.5, 0, 0], mode: ResizeStrategy.BILINEAR });
// move the image 10px right, keeping its size
image.affine({ matrix: [1, 0, 0, 1, 10, 0], fit: false });
```

`skew` and `affine` share these options:

- `mode`: the nearest pixel is taken by default. A `ResizeStrategy` interpolates the pixels, like `rotate`. Transforms that land every pixel on another pixel (flips, right angle rotations, whole pixel moves) stay exact.
- `fit`: `true` (the default) resizes the canvas to fit the transformed image, so `e` and `f` have no effect. `false` keeps the width and height of the image and crops whatever moves outside it.

Like `rotate`, space that the image doesn't cover is filled with the image's `background` colour (transparent by default).

- [rotate](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#rotate)
- [skew](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#skew)
- [affine](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#affine)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
