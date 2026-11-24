<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-dither</h1>
  <p>Apply a dither effect to an image.</p>
</div>

> Dither - is an intentionally applied form of noise used to randomize quantization error, preventing large-scale patterns such as color banding in images. Dither is routinely used in processing of both digital audio and video data, and is often one of the last stages of mastering audio to a CD.

- [dither](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#dither)

## Usage

### Default: subtle RGB565 dither

With no options, `dither` adds a 4×4 ordered pattern of 1–16 to each colour
channel, so there's less banding if the image is later stored as 16-bit
RGB565. It doesn't reduce the number of colours, and the change is barely
visible.

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("photo.png");

image.dither();
```

### Visible dithering

Pass a `type` to reduce the image to a `palette` and dither it, which gives
the dot or noise pattern most people mean by dithering:

```ts
// Black and white with error diffusion
image.dither({ type: "floyd-steinberg" });

// Black and white with the high-contrast look of early Macs
image.dither({ type: "atkinson" });

// An 8×8 ordered (crosshatch) pattern with 4 levels per channel (64 colours)
image.dither({ type: "bayer8", palette: 4 });

// 16-bit colour that survives conversion to RGB565 unchanged
image.dither({ type: "floyd-steinberg", palette: "rgb565" });
```

`type` is one of:

| `type`              | Pattern                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `"rgb565"`          | The default above. Takes no `palette`.                                   |
| `"floyd-steinberg"` | Error diffusion: each pixel's rounding error is passed to neighbours.    |
| `"atkinson"`        | Error diffusion that passes on only 6/8 of the error, for more contrast. |
| `"bayer4"`          | Ordered dither with a 4×4 Bayer matrix.                                  |
| `"bayer8"`          | Ordered dither with an 8×8 Bayer matrix, for smoother gradients.         |

`palette` is one of:

| `palette`        | Colours                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `"bw"` (default) | Black and white, from the Rec. 709 luminance.                         |
| `"rgb565"`       | 32 levels of red and blue and 64 of green, as an RGB565 screen shows. |
| `2`–`256`        | That many evenly spaced levels per channel (`2` gives 8 colours).     |

Only red, green and blue change. Alpha is left alone, fully transparent
pixels aren't touched, and error diffusion doesn't pass error on to them.

### Dithering to a palette from the image

`dither` uses fixed palettes. To dither to the colours that best fit the
image, use [`quantize`](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#quantize)
with an error diffusion `imageQuantization`:

```ts
image.quantize({ colors: 16, imageQuantization: "floyd-steinberg" });

// The two greys that best fit the image, rather than pure black and white
image.greyscale().quantize({ colors: 2, imageQuantization: "floyd-steinberg" });
```

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
