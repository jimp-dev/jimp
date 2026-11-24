<div align="center">
  <img width="140" alt=""
    src="https://raw.githubusercontent.com/jimp-dev/jimp/main/.github/assets/jimpy.png">
  <h1>@jimp/pngjs</h1>
  <p>A PNG encoder and decoder in pure JavaScript, for Node.js and browsers.</p>
</div>

- Decodes every PNG: all bit depths (1, 2, 4, 8, 16), colour types, interlacing and transparency, checked pixel for pixel against libpng on [PngSuite](http://www.schaik.com/pngsuite/)
- Encodes to the smallest lossless format by default, including palettes and 1, 2 and 4-bit grayscale
- Decodes APNG animations
- Reads and writes metadata: text, pHYs, gamma, sRGB, ICC profiles and EXIF
- Sync, with no Node.js polyfills in browsers
- A drop-in replacement for [pngjs](https://github.com/pngjs/pngjs), with its bugs fixed, and faster

## Based on pngjs

This package is a fork of [pngjs](https://github.com/pngjs/pngjs) 7.0.0 by
Luke Page and the pngjs contributors, which is in turn based on
[node-pngjs](https://github.com/niegowski/node-pngjs) by Kuba Niegowski. It
was rewritten in TypeScript, but keeps pngjs's API, and its encoder writes the
same bytes for the same settings. pngjs's MIT license and copyright notices
are in [LICENSE](./LICENSE).

pngjs hasn't had a release since 2023. This fork fixes the bugs in its issue
tracker ([see below](#fixed-from-pngjs)) and is maintained as part of
[Jimp](https://github.com/jimp-dev/jimp).

## Install

```sh
npm install @jimp/pngjs
```

## Usage

```js
import { decode, encode } from "@jimp/pngjs";

const image = decode(fs.readFileSync("in.png"));
// { width, height, data, depth, colorType, interlace, gamma, text, ... }

// Invert the colours
for (let i = 0; i < image.data.length; i += 4) {
  image.data[i] = 255 - image.data[i];
  image.data[i + 1] = 255 - image.data[i + 1];
  image.data[i + 2] = 255 - image.data[i + 2];
}

fs.writeFileSync("out.png", encode(image));
```

Both work on bytes: a `Uint8Array` (or `Buffer`) or an `ArrayBuffer` in, a
`Uint8Array` out (a `Buffer` in Node.js). In a browser:

```js
const response = await fetch("image.png");
const image = decode(await response.arrayBuffer());
```

### `decode(data, options?)`

Decodes a PNG to RGBA pixels, row by row, 8 bits per sample. Returns:

| Property           | Description                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `width`, `height`  | The size in pixels                                                                              |
| `data`             | The pixels as R, G, B, A samples: a `Uint8Array`, or a `Uint16Array` with `outputDepth: 16`     |
| `depth`            | The file's bit depth: 1, 2, 4, 8 or 16                                                          |
| `colorType`        | The file's colour type, a `ColorType`                                                           |
| `interlace`        | Whether the file is interlaced                                                                  |
| `palette`          | The palette of palette images, as `[r, g, b, a]` entries                                        |
| `transparentColor` | The tRNS colour of grayscale and colour images, at the file's bit depth                         |
| `gamma`            | The gAMA chunk's gamma, e.g. `0.45455`                                                          |
| `srgb`             | The sRGB chunk's rendering intent                                                               |
| `iccProfile`       | The iCCP chunk: `{ name, data }`, with the profile uncompressed                                 |
| `physical`         | The pHYs chunk: `{ x, y, unit }`, pixels per unit, with `unit` `"meter"` or `"unknown"`         |
| `text`             | The tEXt, zTXt and iTXt chunks: `{ keyword, text, compressed?, language?, translatedKeyword? }` |
| `exif`             | The eXIf chunk's EXIF data                                                                      |

Options:

- `checkCRC` (default `true`): check each chunk's CRC. A wrong CRC in a chunk
  the image needs throws, while metadata chunks with one are skipped.
- `outputDepth` (default `8`): `16` decodes to 16-bit samples in a
  `Uint16Array`, which keeps the precision of 16-bit images.

Errors throw an `Error` that says what's wrong, e.g. `Invalid file signature:
not a PNG file` or `Not enough image data: expected 4128 bytes, got 1000`.
Like browsers, the decoder doesn't mind data after the end of the file, a
missing IEND chunk, a wrong zlib checksum or broken metadata chunks.

### `encode(image, options?)`

Encodes `{ width, height, data }`, with `data` as RGBA samples: 8 bits each in
a `Uint8Array` (or `Buffer`), or 16 bits each in a `Uint16Array`.

By default it writes the smallest format that keeps every pixel as it is:

| Image                               | Written as                                          |
| ----------------------------------- | --------------------------------------------------- |
| Every pixel opaque and gray         | Grayscale, at 1, 2, 4 or 8 bits if the levels allow |
| 256 colours or fewer                | A palette, at 1, 2, 4 or 8 bits                     |
| Every pixel opaque                  | RGB                                                 |
| Every pixel gray, some transparent  | Gray and alpha                                      |
| Anything else                       | RGBA                                                |
| 16-bit data that doesn't fit 8 bits | The same, at 16 bits (no palette)                   |

| Option                                                    | Default   | Description                                                                                                                                                                                    |
| --------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colorType`                                               | smallest  | A `ColorType`. Converting colour to gray uses the mean of R, G and B.                                                                                                                          |
| `bitDepth`                                                | smallest  | 1, 2, 4, 8 or 16, if the colour type allows it                                                                                                                                                 |
| `filterType`                                              | `-1`      | `-1` (`FilterType.AUTO`) picks the best filter for each line. A filter type 0-4, or a list of them to pick from. Palette and low bit depth images default to `0`, as filters rarely help them. |
| `deflateLevel`                                            | `9`       | zlib's compression level, 0-9                                                                                                                                                                  |
| `deflateStrategy`                                         | `3`       | zlib's strategy. 3 (run-length) is fast. 0 or 1 are a little smaller and much slower.                                                                                                          |
| `interlace`                                               | `false`   | Write an Adam7 interlaced PNG                                                                                                                                                                  |
| `background`                                              | white     | `{ red, green, blue }` to blend transparent pixels with when the colour type has no alpha                                                                                                      |
| `idatChunkSize`                                           | one chunk | Split the image data into IDAT chunks of at most this many bytes                                                                                                                               |
| `gamma`, `srgb`, `iccProfile`, `physical`, `text`, `exif` |           | Metadata to write, as `decode` returns it                                                                                                                                                      |

### `decodeFrames(data, options?)`

Decodes every frame of an animated PNG (APNG). Each frame is the whole image
at that point of the animation, with the frames before it drawn underneath as
the animation says. Returns `{ width, height, frames: [{ data, delay }], plays }`,
with `delay` in milliseconds and `plays` the number of times the animation
plays, 0 for forever. A PNG that isn't animated has one frame and no `plays`.

Takes `decode`'s options, and `maxFrames` to stop early. `decode` returns the
image viewers without APNG support show.

### `readHeader(data)`

Reads the IHDR chunk: `{ width, height, depth, colorType, interlace }`, without
decoding anything else.

### `adjustGamma(image, displayGamma = 2.2)`

Applies the image's `gamma` to its pixels for a display with the given gamma,
and sets `gamma` to 0. For 16-bit images, use it on the `outputDepth: 16`
pixels, which keeps the precision rounding to 8 bits first would lose.

## The pngjs API

Everything pngjs exports works the same way, so you can replace

```js
const { PNG } = require("pngjs");
```

with

```js
const { PNG } = require("@jimp/pngjs");
```

`@types/pngjs` isn't needed: the types are included.

```js
// Sync
const png = PNG.sync.read(buffer, { checkCRC, skipRescale, keepIndexed });
const file = PNG.sync.write(png, { colorType, bitDepth, filterType, ... });

// Streams
fs.createReadStream("in.png")
  .pipe(new PNG({ filterType: 4 }))
  .on("parsed", function () {
    // this.width, this.height, this.data, this.gamma, ...
    this.pack().pipe(fs.createWriteStream("out.png"));
  });

new PNG().parse(buffer, (error, png) => {});

PNG.bitblt(src, dst, srcX, srcY, width, height, deltaX, deltaY);
PNG.adjustGamma(png);
```

The options, events and properties are documented in
[pngjs's README](https://github.com/pngjs/pngjs#readme). Additions:

- `colorType: 3` writes a palette, and `bitDepth` can be 1, 2 or 4 for
  palette and grayscale output.
- `keepIndexed: true` decodes palette images to one palette index per pixel.
- `filterType` takes a list of filter types, as pngjs's README says it does.
- `idatChunkSize` splits the image data into several IDAT chunks.
- Parsed images also have `palette`, `transColor`, `iccProfile`, `physical`
  and `text`.
- `PNG` emits `finish` and `close` once parsed, so `stream.pipeline` works,
  and `for await (const chunk of png.pack())` reads the packed PNG.

Differences you might notice:

- Pixels made transparent by a tRNS colour keep their colour, like in libpng
  and browsers. pngjs made them transparent black.
- Converting colour to gray rounds the mean of R, G and B. pngjs truncated it.
- Events are always emitted asynchronously, `metadata` too.
- `pack()` emits the PNG as one `data` event, unless you pass a
  `deflateFactory`.
- Errors are always `Error` objects. pngjs sometimes emitted strings.
- In browsers `data` is a `Uint8Array`, as there's no `Buffer`, and `PNG` is
  an event emitter with `pipe()` rather than a Node.js stream.

## Browsers

In Node.js the package compresses with the built-in `node:zlib`. Its
`browser` export condition, which bundlers use when they build for browsers,
swaps that for [pako](https://github.com/nodeca/pako), a port of zlib, so the
output is the same byte for byte. There's nothing to polyfill or configure.

Bundled and minified, `decode` alone is 40 KB (14 KB gzipped), and the whole
package is 70 KB (23 KB gzipped). pngjs's browser build is 205 KB (62 KB
gzipped).

We picked pako over [fflate](https://github.com/101arrowz/fflate), which is
smaller, because fflate has no run-length (`Z_RLE`) strategy. That's the
default of pngjs and Jimp, and with fflate encoding was several times slower
and the files a little bigger.

## Fixed from pngjs

Every open issue and pull request on [pngjs](https://github.com/pngjs/pngjs/issues)
as of November 2026. Most fixes have a test named after the issue in
[src/issues.test.ts](./src/issues.test.ts) or
[src/issues.node.test.ts](./src/issues.node.test.ts).

| Issue                                             | Problem                                            | Status                                                                              |
| ------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [#9](https://github.com/pngjs/pngjs/issues/9)     | 16-bit gamma correction off by 1                   | Fixed: `adjustGamma` works on 16-bit data                                           |
| [#10](https://github.com/pngjs/pngjs/issues/10)   | 16-bit gamma off by 16                             | Obsolete: an old test setting, see #9                                               |
| [#54](https://github.com/pngjs/pngjs/issues/54)   | BGRA/ARGB to PNG                                   | Usage question                                                                      |
| [#64](https://github.com/pngjs/pngjs/issues/64)   | `pack()` isn't a real Readable                     | Improved: `for await` works. It's still a classic stream                            |
| [#81](https://github.com/pngjs/pngjs/issues/81)   | Grayscale from RGB data                            | Usage (`inputColorType: 0`). RGB to gray now rounds                                 |
| [#90](https://github.com/pngjs/pngjs/issues/90)   | Palette images                                     | Added: palette writing and `keepIndexed`                                            |
| [#101](https://github.com/pngjs/pngjs/issues/101) | No `close` event, `stream.pipeline` never finishes | Fixed                                                                               |
| [#107](https://github.com/pngjs/pngjs/issues/107) | 24/32-bit support                                  | Usage: that's 8-bit RGB/RGBA, supported                                             |
| [#115](https://github.com/pngjs/pngjs/issues/115) | Writing metadata                                   | Added: text chunks, pHYs, gamma, sRGB, iCCP, eXIf                                   |
| [#122](https://github.com/pngjs/pngjs/issues/122) | "Invalid file signature"                           | Not a bug: the files were JPEGs. The error says "not a PNG file"                    |
| [#128](https://github.com/pngjs/pngjs/issues/128) | Fetch and web streams                              | `decode` takes the `ArrayBuffer` from `response.arrayBuffer()`                      |
| [#136](https://github.com/pngjs/pngjs/issues/136) | "incorrect data check"                             | Fixed: a wrong zlib checksum is ignored, sync and async                             |
| [#146](https://github.com/pngjs/pngjs/issues/146) | Colours differ from Chrome                         | Not a bug: the file has a Display P3 profile, now in `iccProfile`                   |
| [#178](https://github.com/pngjs/pngjs/issues/178) | Custom gamma                                       | Added: `adjustGamma`'s `displayGamma`                                               |
| [#209](https://github.com/pngjs/pngjs/issues/209) | "Unexpected end of input"                          | Can't reproduce: the file was cut off. Cut-off files now say so                     |
| [#219](https://github.com/pngjs/pngjs/issues/219) | Resizing                                           | Out of scope, see [Jimp](https://github.com/jimp-dev/jimp)                          |
| [#247](https://github.com/pngjs/pngjs/issues/247) | Streaming pixel rows                               | Not planned                                                                         |
| [#252](https://github.com/pngjs/pngjs/issues/252) | Packing twice writes broken files                  | Fixed                                                                               |
| [#281](https://github.com/pngjs/pngjs/issues/281) | Cropping                                           | Usage: `bitblt` into a smaller PNG                                                  |
| [#282](https://github.com/pngjs/pngjs/issues/282) | `this` in `parsed`                                 | Usage: arrow functions                                                              |
| [#283](https://github.com/pngjs/pngjs/issues/283) | Colour type options                                | Usage question                                                                      |
| [#284](https://github.com/pngjs/pngjs/issues/284) | A weird issue                                      | Usage: wrong `require` path                                                         |
| [#285](https://github.com/pngjs/pngjs/issues/285) | `filterType: 0` with transparent pixels            | Fixed in pngjs 2018, has a test                                                     |
| [#286](https://github.com/pngjs/pngjs/issues/286) | Large images                                       | Fixed: memory is only allocated as the data proves it's needed. Tested at 6000x4000 |
| [#287](https://github.com/pngjs/pngjs/issues/287) | `bitblt` in the README                             | Fixed: the instance method is in the types                                          |
| [#288](https://github.com/pngjs/pngjs/issues/288) | Browser and Node.js entry points                   | Done: `browser` export condition                                                    |
| [#295](https://github.com/pngjs/pngjs/issues/295) | Babel and the browser build                        | Gone with the browserify build                                                      |
| [#298](https://github.com/pngjs/pngjs/issues/298) | "read requests waiting on finished stream"         | Fixed: a missing IEND chunk is fine if the image is complete                        |
| [#329](https://github.com/pngjs/pngjs/issues/329) | `this.on is not a function`                        | Fixed: no zlib internals are used                                                   |
| [#356](https://github.com/pngjs/pngjs/issues/356) | An API without streams                             | Added: `decode` and `encode`                                                        |
| [#360](https://github.com/pngjs/pngjs/issues/360) | Writing grayscale                                  | Usage (option spelling and byte order). Grayscale writing has tests                 |
| [#380](https://github.com/pngjs/pngjs/issues/380) | Memory leak                                        | Fixed: a `PNG` schedules nothing until it's used                                    |
| [#381](https://github.com/pngjs/pngjs/issues/381) | File permissions in the package                    | Not applicable to this package                                                      |
| [#382](https://github.com/pngjs/pngjs/issues/382) | Base64                                             | Usage: `PNG.sync.write(png).toString("base64")`                                     |
| [#383](https://github.com/pngjs/pngjs/issues/383) | pHYs                                               | Added, read and written                                                             |
| [#386](https://github.com/pngjs/pngjs/issues/386) | Losing colours                                     | Like #146: the ICC profile is in `iccProfile`                                       |
| [#389](https://github.com/pngjs/pngjs/issues/389) | Accessing the palette                              | Added: `palette`                                                                    |
| [#390](https://github.com/pngjs/pngjs/issues/390) | IEND bytes                                         | Not a bug: they are IEND. Has a test                                                |
| [#392](https://github.com/pngjs/pngjs/issues/392) | "pin pngjs to v2.3.0" on Node.js 24                | Fixed: zlib comes from the right build, no feature detection                        |
| [#394](https://github.com/pngjs/pngjs/issues/394) | Huge allocations from a small file                 | Fixed: sizes are checked, and allocated only once the data is there                 |

| Pull request                                    | Change                 | Status                                                  |
| ----------------------------------------------- | ---------------------- | ------------------------------------------------------- |
| [#225](https://github.com/pngjs/pngjs/pull/225) | Writing palette images | Reimplemented, with `keepIndexed`                       |
| [#334](https://github.com/pngjs/pngjs/pull/334) | CRC cleanup            | Not needed: native `zlib.crc32` where available         |
| [#384](https://github.com/pngjs/pngjs/pull/384) | Reading pHYs           | Reimplemented, with writing                             |
| [#385](https://github.com/pngjs/pngjs/pull/385) | Several IDAT chunks    | Reimplemented as `idatChunkSize`                        |
| [#387](https://github.com/pngjs/pngjs/pull/387) | Native zlib            | Reimplemented: native zlib in Node.js, pako in browsers |
| [#395](https://github.com/pngjs/pngjs/pull/395) | Next-tick retention    | Reimplemented: no ticks until data arrives              |

Bugs without an issue, some found in forks of pngjs:

- Async errors (like a bad filter byte) crashed the process instead of
  emitting `error`
- A short zlib stream returned uninitialised memory as pixels
- Image data that was too short decoded to a black image instead of an error
- 16-bit input ignored a `Buffer`'s offset, reading the wrong memory
- `inputHasAlpha: false` shifted the pixels
- `filterType` lists threw, though the README documents them
- gAMA was floored instead of rounded on write (0.45455 became 0.45454)
- `new PNG({ bitDepth: 16 })` allocated half the memory it needed
- `bitblt` accepted negative coordinates
- `PNG.sync.write` added its defaults to the options object you passed
- Out-of-range palette indices threw (now opaque black, like libpng)
- A CRC error in a metadata chunk failed the whole image
- APNG files couldn't be read in Jimp, and interlaced output wasn't
  supported

## Conformance and testing

- **[PngSuite](http://www.schaik.com/pngsuite/)**: all 162 valid images decode
  to exactly the pixels libpng does, at 8 and 16 bits, and all 14 corrupt ones
  throw an `Error`. The reference pixels come from netpbm's `pngtopam`,
  checked against ImageMagick, see
  [scripts/generate-pngsuite-reference.mjs](./scripts/generate-pngsuite-reference.mjs).
  Each image also round-trips through `encode`.
- **pngjs**: the encoder writes the same bytes as pngjs 7.0.0 for the same
  settings, pngjs decodes what it writes, and decoded pixels match except for
  the differences above.
- **APNG**: frames match ffmpeg's decoder.
- **Fuzzing**: tens of thousands of randomly broken PngSuite images, from a
  fixed seed, must decode or throw an `Error`, within a second.

Each runs with both zlib backends.

## Benchmarks

Median of 7 runs on an Apple M5 with Node.js 24, from `pnpm bench`, against
pngjs 7.0.0. "Browser" is each package's browser build, run in Node.js.
Encoding uses level 9 and strategy 3, which are both packages' defaults.

| Image                       | Decode: pngjs | Decode: this | Browser decode: pngjs | Browser decode: this |
| --------------------------- | ------------: | -----------: | --------------------: | -------------------: |
| Photo, 555x680 RGBA         |        5.7 ms |       3.6 ms |               10.7 ms |               7.8 ms |
| Dice, 800x600 RGBA          |        7.7 ms |       2.9 ms |               13.6 ms |               5.2 ms |
| Font atlas, 4093x146        |        5.2 ms |       0.9 ms |               11.4 ms |               2.9 ms |
| Photo tiled, 2220x2720 RGBA |      173.1 ms |     118.2 ms |              311.8 ms |             213.2 ms |

| Image                       |       Encode: pngjs | Encode: this, same settings | `encode()`, smallest format | Browser encode: pngjs | Browser encode: this |
| --------------------------- | ------------------: | --------------------------: | --------------------------: | --------------------: | -------------------: |
| Photo, 555x680 RGBA         |   23.5 ms, 494.7 KB |           18.2 ms, 494.7 KB |           17.1 ms, 415.6 KB |               32.0 ms |              28.3 ms |
| Dice, 800x600 RGBA          |   17.6 ms, 232.9 KB |           11.7 ms, 232.9 KB |           11.7 ms, 232.9 KB |               23.8 ms |              17.7 ms |
| Font atlas, 4093x146        |    17.8 ms, 90.6 KB |            11.8 ms, 90.6 KB |             8.1 ms, 46.9 KB |               22.9 ms |              16.4 ms |
| Photo tiled, 2220x2720 RGBA | 330.5 ms, 7855.8 KB |         252.8 ms, 7855.8 KB |         233.2 ms, 6598.8 KB |              473.0 ms |             403.1 ms |

## License

MIT. See [LICENSE](./LICENSE) for pngjs's and node-pngjs's copyright notices.
PngSuite's images are by Willem van Schaik, see
[test/pngsuite/PngSuite.LICENSE](./test/pngsuite/PngSuite.LICENSE).
