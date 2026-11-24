# Benchmarks

Compare @jimp/jpeg-js with jpeg-js 0.4.4 (a dev dependency). Build first with
`pnpm build`. The results are in the [README](../README.md#benchmarks).

- `node bench/speed.mjs photo.jpg ...` measures decoding, and encoding at
  quality 75 and 100: the median time and the peak memory, each in a fresh
  process.
- `node bench/quality.mjs photo.ppm ...` encodes lossless images with both at
  several qualities, decodes them with libjpeg-turbo's `djpeg` (which must be
  on the `PATH`) and reports how much smaller @jimp/jpeg-js's files are at the
  same SSIM and PSNR. Convert the images to binary PPM first, e.g. with
  `magick photo.png photo.ppm`. The README's numbers use kodim01, 03, 05, 13,
  15, 20 and 23 from the [Kodak set](https://r0k.us/graphics/kodak/), and
  Jimp's `dice.png` and `rgb.tiff`.
