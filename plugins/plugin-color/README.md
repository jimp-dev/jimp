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

`convolution` and `convolute` don't normalize the kernel. Pass a `divisor` (like ImageMagick's `-define convolve:scale` or the CSS `feConvolveMatrix` divisor) to write kernels with integer weights, and a `bias` to shift results that can be negative into the visible range:

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

See [Getting Started](https://jimp-dev.github.io/jimp/guides/getting-started/) to read an image, change it and save the result with `write` or `getBuffer`.
