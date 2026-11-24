<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-morphology</h1>
  <p>Erode, dilate, open and close an image.</p>
</div>

Morphological operations, useful for cleaning up scans, masks and thresholded
images: removing specks, filling small holes, and thickening or thinning
lines.

- [erode](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#erode)
- [dilate](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#dilate)
- [open](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#open)
- [close](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#close)

## Usage

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("scan.png");

// Each pixel becomes the darkest pixel within 2 pixels of it
image.erode({ radius: 2 });

// Each pixel becomes the brightest pixel within 3 pixels of it
image.dilate({ radius: 3, shape: "disk" });

// Remove bright specks smaller than the neighbourhood
image.open({ radius: 1 });

// Fill dark holes smaller than the neighbourhood
image.close({ radius: 1 });
```

| Method   | Does              | Effect                                                    |
| -------- | ----------------- | --------------------------------------------------------- |
| `erode`  | min of neighbours | Dark areas grow, bright details thinner than it disappear |
| `dilate` | max of neighbours | Bright areas grow, dark details thinner than it disappear |
| `open`   | `erode`, `dilate` | Removes bright specks, keeps larger bright shapes' size   |
| `close`  | `dilate`, `erode` | Fills dark holes and gaps, keeps larger shapes' size      |

Bright grows with `dilate`. For dark ink on a white page, `erode` thickens
the ink and `dilate` thins it, `close` removes dark specks, and `open` fills
gaps in the ink.

### Options

- `radius`: how far the neighbourhood reaches from each pixel, in pixels.
  It's rounded to a whole number, and 0 or less leaves the image unchanged.
- `shape`: `"square"` (default) is the (2 × radius + 1) square around the
  pixel. `"disk"` is the pixels within `radius` of it, which gives rounder
  results.

### How it works

- Each channel, alpha included, is processed on its own, like OpenCV's
  `erode` and `dilate` on a color image. On a greyscale or black and white
  image this is the usual morphology. On a color image the result can mix
  channels from different neighbours. On an image with transparency, opaque
  shapes grow with `dilate` and shrink with `erode`.
- The neighbourhood is clipped to the image: pixels near an edge only look at
  the pixels inside it, and never wrap around to the other side.
- A square costs the same for any radius. A disk costs more as the radius
  grows, so prefer a square for large radii.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
