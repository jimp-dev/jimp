<div align="center">
  <img width="200" height="200"
    src="https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png">
  <h1>@jimp/plugin-color</h1>
  <p>Adjust the colors of an image.</p>
</div>

- [color](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#color)
- [brightness](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#brightness)
- [contrast](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#contrast)
- [posterize](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#posterize)
- [greyscale](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#greyscale)
- [opacity](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#opacity)
- [sepia](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#sepia)
- [fade](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#fade)
- [convolution](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#convolution)
- [opaque](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#opaque)
- [pixelate](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#pixelate)
- [convolute](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#convolute)
- [normalize](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#normalize)
- [invert](https://jimp-dev.github.io/jimp/api/jimp/classes/jimp/#invert)

`convolution` only changes the color channels. `convolute` convolves alpha too, unless you pass `preserveAlpha: true` (like the CSS `feConvolveMatrix`). Without it, kernels whose weights sum to 0, like edge detection, make the image transparent. Neither method normalizes the kernel. Pass a `divisor` (like ImageMagick's `-define convolve:scale` or the CSS `feConvolveMatrix` divisor) to write kernels with integer weights, and a `bias` to shift results that can be negative into the visible range:

```ts
image.convolution({
  kernel: [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ],
  divisor: 16,
});
```

Both methods lay the kernel out like the image: `kernel[row][col]` weights the pixel `col - originX` to the right and `row - originY` below, where the origin is `floor((size - 1) / 2)` along each axis. Kernels can be any size, including even-sized and non-square ones (a 4×4 kernel covers offsets −1 to 2), but every row must be the same length. The kernel isn't flipped, so strictly this is correlation. That matches ImageMagick's `-convolve` and `-morphology Correlate`, GIMP's convolution matrix and Matlab's `imfilter`, which also use the same origin. For a true convolution (ImageMagick's `-morphology Convolve`, Matlab's `conv2`), reverse the order of the rows and of each row.

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
