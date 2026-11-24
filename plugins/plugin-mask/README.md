<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-mask</h1>
  <p>mask an image with another image.</p>
</div>

Masks this image with another image. Each pixel's alpha is multiplied by the mask pixel's grey value and by the mask pixel's alpha (both out of 255), and the result is rounded.

- A white, opaque mask pixel leaves the image pixel as it is. A black or fully transparent one makes it fully transparent.
- Grey mask pixels are used as they are: a mask value of 128 on an opaque image gives an alpha of 128.
- Colour mask pixels are turned into grey first, the way GIMP converts an sRGB image to greyscale: the luminance of the linear-light colour, encoded back to sRGB. Pure red counts as 130, green as 220 and blue as 70.
- The mask is placed with its top left corner at `x`, `y`. Parts of the mask outside the image are ignored, and parts of the image the mask doesn't cover are left unchanged.

GIMP stores layer masks as linear light, so a mask that looks 50% grey in GIMP keeps about 22% of the layer, while jimp keeps 50%. To match GIMP, convert the mask's grey values from sRGB to linear first.

- [mask](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#mask)

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
