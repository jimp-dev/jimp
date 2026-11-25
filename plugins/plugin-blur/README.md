<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/plugin-blur</h1>
  <p>Blur, sharpen or denoise an image.</p>
</div>

- [blur](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#blur): a fast blur that looks like a Gaussian blur but is much quicker
- [gaussian](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#gaussian): a true Gaussian blur
- [sharpen](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#sharpen): an unsharp mask, the inverse of `gaussian`
- [median](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#median): a median filter, for specks and salt-and-pepper noise
- [bilateral](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#bilateral): an edge-preserving smoothing filter, for grain and JPEG noise in photos

```ts
import { Jimp } from "jimp";

const image = await Jimp.read("test/image.png");

image.sharpen({ amount: 1, radius: 1, threshold: 2 });
```

`sharpen` gives the same result as ImageMagick's `-unsharp 0x{radius}+{amount}+{threshold}`, with ImageMagick's threshold given as a fraction: `2 * threshold / 255`.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
