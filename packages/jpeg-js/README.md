<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/jpeg-js</h1>
  <p>A maintained fork of jpeg-js: JPEG encoder and decoder in pure JavaScript.</p>
</div>

## Based on jpeg-js / pdf.js / as3corelib

This package is a fork of [jpeg-js](https://github.com/jpeg-js/jpeg-js) by
Eugene Ware and contributors (BSD 3-Clause). Its decoder comes from
[jpgjs](https://github.com/notmasteryet/jpgjs) by notmasteryet, which became
the JPEG decoder of [pdf.js](https://github.com/mozilla/pdf.js) (Apache 2.0).
Its encoder is the JPGEncoder of Adobe's as3corelib (BSD 3-Clause), ported to
JavaScript by Andreas Ritter. The entropy decoding, inverse DCT, upsampling
and colour conversion are ports of
[libjpeg-turbo](https://github.com/libjpeg-turbo/libjpeg-turbo), so decoded
pixels match it exactly: this software is based in part on the work of the
Independent JPEG Group. See [LICENSE](./LICENSE), [NOTICE](./NOTICE) and
[README.ijg](./README.ijg).

## Why

jpeg-js hasn't had a release since 2022. It crashes with `TypeError`s on
malformed files, decodes colours a few levels off from other software,
allocates hundreds of megabytes for an ordinary photo, and its encoder writes
large files. @jimp/jpeg-js keeps its API and fixes all of that:

- **Exact:** decoded pixels are identical to libjpeg-turbo's (what Chrome,
  Firefox, Pillow, sharp and ImageMagick use) for every JPEG in a corpus of
  158, from baseline to progressive, every chroma subsampling, CMYK, YCCK,
  12-bit and arithmetic-coded.
- **Robust:** malformed input only ever throws a `JpegError`, never hangs, and
  can't make the decoder allocate more than `maxMemoryUsageInMB`. The decoder
  is fuzzed in its tests.
- **Small files:** 4:2:0 chroma subsampling, optimized Huffman tables and
  progressive encoding make files about 20% smaller than jpeg-js's at the
  same SSIM.
- **Fast and lean:** about twice as fast as jpeg-js, with a third of its peak
  memory when decoding.
- **Anywhere:** ESM and CommonJS, TypeScript types, and no dependencies. It
  works in browsers without a `Buffer` polyfill.

## Install

```sh
npm install @jimp/jpeg-js
```

## Usage

```ts
import { readFileSync, writeFileSync } from "node:fs";
import { decodeJpeg, encodeJpeg } from "@jimp/jpeg-js";

// { width, height, data: Uint8Array of RGBA pixels, exifBuffer?, comments? }
const image = decodeJpeg(readFileSync("photo.jpg"));

// RGBA (4 bytes per pixel), RGB (3) or greyscale (1) pixels
const jpeg = encodeJpeg(image, { quality: 80, progressive: true });

writeFileSync("small.jpg", jpeg);
```

### As a drop-in replacement for jpeg-js

`decode` and `encode` take the same arguments as jpeg-js's and return the
same objects, with `Buffer`s in Node.js:

```js
const jpeg = require("@jimp/jpeg-js");

const raw = jpeg.decode(readFileSync("photo.jpg"), { useTArray: true });
const { data } = jpeg.encode(raw, 50);
```

Pixels decode to the same as libjpeg-turbo rather than jpeg-js's, which were
a few levels off, and the encoder writes smaller files: see
[Differences from jpeg-js](#differences-from-jpeg-js).

## API

### `decodeJpeg(data, options?)`

Decodes a JPEG from a `Uint8Array` (or `Buffer`), `ArrayBuffer`, other typed
array, `DataView` or array of bytes. Returns
`{ width, height, data, exifBuffer?, comments? }`, where `data` is a
`Uint8Array` of RGBA pixels, row by row.

| Option               | Default | Description                                                                                                                                                                                   |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formatAsRGBA`       | `true`  | RGBA pixels (alpha is always 255); `false` for RGB.                                                                                                                                           |
| `colorTransform`     | auto    | Whether the data is YCbCr (or YCCK) to convert to RGB (or CMYK). By default it's picked like libjpeg does, from the JFIF and Adobe markers and the component IDs.                             |
| `tolerantDecoding`   | `true`  | Recover from corrupt data like libjpeg does: junk between segments, a marker that lost its 0xFF, wrong segment lengths, bad Huffman codes, misplaced restart markers. `false` throws instead. |
| `allowTruncated`     | `false` | Decode a JPEG whose image data was cut off, with the rest grey (or unrefined, if progressive), like browsers show it. Otherwise it throws. A missing EOI marker is always fine.               |
| `maxResolutionInMP`  | `100`   | Throw a `JpegLimitError` for larger images, in megapixels.                                                                                                                                    |
| `maxMemoryUsageInMB` | `512`   | Throw a `JpegLimitError` if decoding would take more memory than this, including the pixels.                                                                                                  |
| `tables`             |         | The DQT and DHT tables of an "abbreviated" JPEG that leaves them out (e.g. a TIFF's JPEGTables), as a JPEG of only SOI, tables and EOI.                                                       |

The decoder doesn't rotate images by their EXIF orientation; read it from
`exifBuffer` if you need it.

### `encodeJpeg(image, options?)`

Encodes `{ width, height, data }`, where `data` is RGBA, RGB or greyscale
pixels (told apart by its length), and returns a `Uint8Array`. Greyscale
input makes a one-component JPEG. Throws a `TypeError` or `RangeError` for
input that can't be encoded.

| Option              | Default                                    | Description                                                                                                                                         |
| ------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `quality`           | `75`                                       | 1 to 100. Scales the quantization tables of the JPEG standard like libjpeg.                                                                         |
| `chromaSubsampling` | `"4:2:0"` below quality 90, else `"4:4:4"` | `"4:4:4"`, `"4:2:2"` or `"4:2:0"`: how much to reduce the resolution of the colour channels.                                                        |
| `optimizeHuffman`   | `true`                                     | Huffman tables built for the image instead of the standard's examples, like libjpeg's `optimize_coding`: 5-15% smaller, with the same pixels.       |
| `progressive`       | `false`                                    | A progressive JPEG with libjpeg's default scans, shown at low quality first while it loads. A few percent smaller, but slower to encode and decode. |
| `comments`          |                                            | Strings to write in COM segments.                                                                                                                   |
| `exif`              |                                            | EXIF data for an APP1 segment. "Exif\0" is added if it doesn't start with "Exif", so a decoded `exifBuffer` can be passed back.                     |

Every file has a JFIF header.

### `decode(data, options?)` and `encode(image, quality?)`

jpeg-js's API. `decode` takes the options of `decodeJpeg` plus `useTArray`,
and returns the pixels as a `Buffer` unless `useTArray` is `true` (or there's
no `Buffer`, as in browsers). `encode` takes `comments` and `exifBuffer` on
the image, a quality that defaults to 50, and returns
`{ data, width, height }`. The default export is `{ decode, encode }`.

### Errors

Everything the decoder throws extends `JpegError`:

- `JpegFormatError`: not a JPEG, or corrupt or truncated beyond recovery;
- `JpegUnsupportedError`: a lossless or hierarchical JPEG, or sample
  precision other than 8 or 12 bits;
- `JpegLimitError`: over `maxResolutionInMP` or `maxMemoryUsageInMB`. The
  messages are jpeg-js's, e.g. `maxResolutionInMP limit exceeded by 3MP`.

## Differences from jpeg-js

### Decoding

The decoder is rebuilt on pdf.js's marker parser, with libjpeg-turbo's
Huffman, arithmetic and progressive decoding, islow IDCT, block smoothing,
"fancy" upsampling and colour conversion. jpeg-js upsampled chroma by
repeating pixels and used a less exact IDCT, so its colours were up to tens of
levels off along edges. Sequential JPEGs are decoded a row of MCUs at a time
into one buffer per component, where jpeg-js allocated a typed array for each
8x8 block.

### Encoding

The encoder subsamples chroma, optimizes its Huffman tables, can write
progressive JPEGs, accepts RGB and greyscale input, repeats the last row and
column of the image to fill edge blocks, and writes into a `Uint8Array`
instead of an array of numbers.

### jpeg-js issues

Every open issue on jpeg-js as of November 2026:

| Issue                                                    | Status                                                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [#3](https://github.com/jpeg-js/jpeg-js/issues/3)        | Done: `encodeJpeg` takes RGBA, RGB or greyscale pixels.                                                                         |
| [#12](https://github.com/jpeg-js/jpeg-js/issues/12)      | Done: `progressive: true`.                                                                                                      |
| [#17](https://github.com/jpeg-js/jpeg-js/issues/17)      | Fixed: fancy upsampling, identical to libjpeg-turbo.                                                                            |
| [#21](https://github.com/jpeg-js/jpeg-js/issues/21)      | Fixed: restart intervals that end part-way through a scan, extra restart markers and resynchronization on corrupt data.         |
| [#27](https://github.com/jpeg-js/jpeg-js/issues/27)      | Not applicable (project governance).                                                                                            |
| [#30](https://github.com/jpeg-js/jpeg-js/issues/30)      | Done: the parser is pdf.js's current one, with libjpeg-turbo's decoding pipeline.                                               |
| [#31](https://github.com/jpeg-js/jpeg-js/issues/31)      | Done: `chromaSubsampling`, 4:2:0 by default below quality 90.                                                                   |
| [#37](https://github.com/jpeg-js/jpeg-js/issues/37)      | Fixed: the encoder validates its input, and the decoder rejects a file too small for the image it claims before allocating it.  |
| [#42](https://github.com/jpeg-js/jpeg-js/issues/42)      | Done: `JpegError` and its subclasses.                                                                                           |
| [#43](https://github.com/jpeg-js/jpeg-js/issues/43)      | Partly: JPEG-in-TIFF works with `tables` (the JPEGTables tag). Old-style JPEG (OJPEG) isn't supported.                          |
| [#63](https://github.com/jpeg-js/jpeg-js/issues/63)      | Fixed: SOS before SOF throws a `JpegFormatError`.                                                                               |
| [#70](https://github.com/jpeg-js/jpeg-js/issues/70)      | Partly: decoding takes about a third of the memory. There's no option to decode into a buffer you provide.                      |
| [#77](https://github.com/jpeg-js/jpeg-js/issues/77)      | Fixed: decoded pixels are identical to libjpeg-turbo's.                                                                         |
| [#81](https://github.com/jpeg-js/jpeg-js/issues/81)      | Fixed: a progressive JPEG cut off between scans decodes, smoothed like libjpeg-turbo does.                                      |
| [#83](https://github.com/jpeg-js/jpeg-js/issues/83)      | Done: ESM, CommonJS and browser builds, with types.                                                                             |
| [#85](https://github.com/jpeg-js/jpeg-js/issues/85)      | Done: the `tables` option.                                                                                                      |
| [#94](https://github.com/jpeg-js/jpeg-js/issues/94)      | Fixed: SOS before SOF throws a `JpegFormatError`.                                                                               |
| [#95](https://github.com/jpeg-js/jpeg-js/issues/95)      | Fixed: an unknown component in SOS throws a `JpegFormatError`.                                                                  |
| [#96](https://github.com/jpeg-js/jpeg-js/issues/96)      | Fixed: a missing quantization table throws a `JpegFormatError`.                                                                 |
| [#97](https://github.com/jpeg-js/jpeg-js/issues/97)      | Fixed: a missing Huffman table throws a `JpegFormatError` (in sequential JPEGs, the standard tables are used, like libjpeg).    |
| [#107](https://github.com/jpeg-js/jpeg-js/issues/107)    | Fixed in jpeg-js 0.4.4; sampling factors are validated here too.                                                                |
| [#109](https://github.com/jpeg-js/jpeg-js/issues/109)    | Couldn't reproduce: the attached file decodes. Junk where a marker should be is skipped.                                        |
| [#112](https://github.com/jpeg-js/jpeg-js/issues/112)    | Fixed: throws a `JpegFormatError`.                                                                                              |
| [#113](https://github.com/jpeg-js/jpeg-js/issues/113)    | Not a codec bug: EXIF orientation isn't applied by the decoder. Jimp applies it, once. Pass `exifBuffer` back to keep it.       |
| [#115](https://github.com/jpeg-js/jpeg-js/issues/115)    | Fixed: the colour space is picked like libjpeg, so an Adobe transform of 0 means RGB. An explicit `colorTransform` always wins. |
| [#117](https://github.com/jpeg-js/jpeg-js/issues/117)    | Fixed: extra restart markers are skipped.                                                                                       |
| [Jimp #153](https://github.com/jimp-dev/jimp/issues/153) | Fixed: decoding a 21 MP photo peaks at 336 MB instead of 957 MB, and a 3.3 MP one at 89 MB instead of 231 MB.                   |

## Conformance

The tests decode a corpus of 159 JPEGs and compare them with libjpeg-turbo
3.2's djpeg, with its default islow IDCT and fancy upsampling (the references
were made with SIMD disabled; its NEON build gives the same output for every
file): libjpeg-turbo's test images, jpeg-js's fixtures, JPEGs from
pdf.js's test files, the images attached to jpeg-js issues, and generated ones
covering 4:4:4, 4:2:2, 4:2:0, 4:4:0, 4:1:1, 4:1:0 and mixed sampling,
baseline, progressive and arithmetic coding, restart intervals, greyscale,
RGB, CMYK, YCCK, 12-bit samples, 16-bit quantization tables, non-interleaved
scans, sizes from 1x1 that don't fill whole MCUs, and progressive JPEGs cut
off after a scan. The tolerance is 0: all 158 are identical to djpeg's output,
except for a lossless JPEG, which is rejected with a `JpegUnsupportedError`.
See
[test/corpus](./test/corpus/README.md).

## Benchmarks

On an Apple Silicon Mac with Node.js 24, against jpeg-js 0.4.4, with
`bench/speed.mjs` and `bench/quality.mjs` (see [bench/](./bench/README.md)).
Times are the median of 3 to 5 runs; memory is the peak resident set size
minus that of an idle Node.js process. The photos are from Jimp's tests; the
21 MP one is a 3x enlargement of the 2376x1408 one.

### Decoding

| Image                         | jpeg-js        | @jimp/jpeg-js  |
| ----------------------------- | -------------- | -------------- |
| 640x426, 4:4:4                | 10 ms, 65 MB   | 3.3 ms, 27 MB  |
| 2376x1408, 4:2:0              | 57 ms, 231 MB  | 26 ms, 89 MB   |
| 2376x1408, 4:2:0, progressive | 70 ms, 231 MB  | 46 ms, 112 MB  |
| 10000x783, 4:4:4              | 379 ms, 468 MB | 210 ms, 183 MB |
| 7128x4224 (21 MP), 4:2:0      | 421 ms, 957 MB | 225 ms, 336 MB |

### Encoding

Encoding the decoded image at quality 75 and 100, with the default options
(memory includes decoding the input):

| Image             | jpeg-js, q75            | @jimp/jpeg-js, q75      | jpeg-js, q100            | @jimp/jpeg-js, q100     |
| ----------------- | ----------------------- | ----------------------- | ------------------------ | ----------------------- |
| 640x426           | 15 ms, 113 MB, 52 KB    | 4 ms, 24 MB, 36 KB      | 17 ms, 141 MB, 165 KB    | 7 ms, 29 MB, 143 KB     |
| 2376x1408         | 59 ms, 168 MB, 246 KB   | 36 ms, 44 MB, 189 KB    | 78 ms, 234 MB, 892 KB    | 57 ms, 66 MB, 732 KB    |
| 10000x783         | 259 ms, 261 MB, 1749 KB | 121 ms, 113 MB, 1440 KB | 587 ms, 580 MB, 10697 KB | 332 ms, 199 MB, 9790 KB |
| 7128x4224 (21 MP) | 440 ms, 344 MB, 1338 KB | 328 ms, 195 MB, 817 KB  | 578 ms, 549 MB, 5048 KB  | 421 ms, 251 MB, 4144 KB |

### File size at equal quality

Nine lossless photos (seven from the Kodak set, and two from Jimp's tests)
were encoded by both, decoded with libjpeg-turbo, and compared with the
original. For each quality of jpeg-js, the table gives how much smaller
@jimp/jpeg-js's file is at the same SSIM (on luma) or PSNR (on RGB),
interpolated between its own qualities. 4:2:0 subsampling costs little SSIM
but some PSNR, which is why the two differ below quality 90.

| jpeg-js quality | Same SSIM | Same SSIM, progressive | Same PSNR | Same PSNR, progressive |
| --------------- | --------- | ---------------------- | --------- | ---------------------- |
| 50              | -20.4%    | -20.6%                 | -8.8%     | -9.8%                  |
| 75              | -18.5%    | -20.4%                 | -3.9%     | -7.0%                  |
| 85              | -18.6%    | -21.7%                 | -4.5%     | -8.2%                  |
| 90              | -3.6%     | -7.2%                  | -3.1%     | -6.8%                  |
| 95              | -4.6%     | -9.1%                  | -4.9%     | -9.4%                  |
| 100             |           |                        | -12.2%    | -16.4%                 |

At the same quality setting, quality 100 files are 11% smaller (3.5 MB
instead of 4.0 MB for the nine) with the same PSNR and SSIM.

## License

BSD 3-Clause AND Apache 2.0 AND IJG: see [LICENSE](./LICENSE) for which
files are under which license.
